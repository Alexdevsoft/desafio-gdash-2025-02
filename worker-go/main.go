package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Constantes e Variáveis de Ambiente
const (
	QUEUE_NAME = "weather_logs_queue"
	// Endpoint onde a API NestJS receberá os dados.
	NESTJS_API_ENDPOINT = "/api/weather/logs" 
	MAX_RETRIES         = 5
	RETRY_DELAY         = 5 * time.Second
)

// Estrutura para os dados que vêm da fila (deve bater com o JSON do Python)
type WeatherLog struct {
	Timestamp               string  `json:"timestamp"`
	Latitude                float64 `json:"latitude"`
	Longitude               float64 `json:"longitude"`
	TemperatureC            float64 `json:"temperature_c"`
	HumidityPercent         float64 `json:"humidity_percent"`
	WindSpeedKmh            float64 `json:"wind_speed_kmh"`
	WeatherCode             int     `json:"weather_code"`
	PrecipitationProbability float64 `json:"precipitation_probability"`
	City 					string 	`json:"city"`
	Condition 				 string 	`json:"condition"`
}

// Configuração da conexão com o RabbitMQ
func getRabbitMQURL() string {
	user := os.Getenv("RABBITMQ_USER")
	if user == "" {
		user = "user" 
	}
	pass := os.Getenv("RABBITMQ_PASS")
	if pass == "" {
		pass = "password" 
	}
	host := os.Getenv("RABBITMQ_HOST")
	if host == "" {
		host = "rabbitmq" 
	}
	port := os.Getenv("RABBITMQ_PORT")
	if port == "" {
		port = "5672"
	}
	return fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)
}

// Função para tentar estabelecer a conexão com o RabbitMQ
func connectRabbitMQ() (*amqp.Connection, error) {
	url := getRabbitMQURL()
	for i := 0; i < 10; i++ {
		conn, err := amqp.Dial(url)
		if err == nil {
			return conn, nil
		}
		fmt.Printf("Tentativa %d: Falha ao conectar-se ao RabbitMQ: %v. Tentando novamente em %v...\n", i+1, err, 5*time.Second)
		time.Sleep(5 * time.Second)
	}
	return nil, fmt.Errorf("falha ao conectar-se ao RabbitMQ após múltiplas tentativas")
}

// Função para enviar os dados para a API NestJS
func sendToNestJS(log WeatherLog) error {
	apiURL := os.Getenv("NESTJS_API_URL") // Ex: http://api-nestjs:3000
	if apiURL == "" {
		apiURL = "http://api-nestjs:3000" // Fallback para desenvolvimento
	}
	
	fullURL := apiURL + NESTJS_API_ENDPOINT

	// Serializa a estrutura Go para JSON
	logJSON, err := json.Marshal(log)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	// Envia a requisição POST
	resp, err := http.Post(fullURL, "application/json", bytes.NewBuffer(logJSON))
	if err != nil {
		// Retorna erro para acionar o retry
		return fmt.Errorf("erro ao enviar requisição para NestJS: %w", err) 
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		// Retorna erro para acionar o retry
		return fmt.Errorf("API NestJS retornou status não-sucesso: %s. Body: %s", resp.Status, string(bodyBytes))
	}

	fmt.Printf("[SUCESSO] Log enviado para NestJS: %s\n", fullURL)
	return nil
}

// Função de Processamento da Mensagem (com Retry Básico)
func processMessage(delivery amqp.Delivery) {
	// 1. Deserialização/Validação
	var logData WeatherLog
	if err := json.Unmarshal(delivery.Body, &logData); err != nil {
		fmt.Printf("[ERRO CRÍTICO] Falha ao deserializar JSON: %v. Mensagem descartada (Nack/Rejeitada).\n", err)
		// Nack: Rejeita a mensagem. Requeue=false para evitar loop infinito com JSONs inválidos
		delivery.Nack(false, false) 
		return
	}

	// 2. Envio para a API NestJS com Retry
	for attempt := 1; attempt <= MAX_RETRIES; attempt++ {
		err := sendToNestJS(logData)
		if err == nil {
			// Sucesso: Acknowledge (ACK)
			delivery.Ack(false) 
			return
		}

		fmt.Printf("[ERRO/RETRY %d/%d] Falha no envio para NestJS: %v\n", attempt, MAX_RETRIES, err)
		if attempt < MAX_RETRIES {
			time.Sleep(RETRY_DELAY)
		}
	}

	// 3. Falha Após Todos os Retries
	fmt.Printf("[FALHA FINAL] Mensagem falhou após %d tentativas. Rejeitando (Nack/Requeue=false).\n", MAX_RETRIES)
	// Nack: Rejeita a mensagem. Requeue=false para evitar loop infinito de requisições falhando.
	delivery.Nack(false, false) 
}

func main() {
	conn, err := connectRabbitMQ()
	if err != nil {
		fmt.Printf("Erro fatal: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		fmt.Printf("Erro ao abrir canal: %v\n", err)
		os.Exit(1)
	}
	defer ch.Close()

	// Declara a fila (importante, mesmo que o produtor já o faça)
	q, err := ch.QueueDeclare(
		QUEUE_NAME, // name
		true,       // durable (persistente)
		false,      // delete when unused
		false,      // exclusive
		false,      // no-wait
		nil,        // arguments
	)
	if err != nil {
		fmt.Printf("Erro ao declarar fila: %v\n", err)
		os.Exit(1)
	}

	// Inicia o consumo da fila
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (desligamos, pois faremos o ACK/NACK manualmente)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		fmt.Printf("Erro ao registrar consumidor: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Worker Go iniciado com sucesso. Aguardando mensagens...")

	// Loop principal de consumo
	forever := make(chan bool)
	go func() {
		for d := range msgs {
			// Inicia o processamento da mensagem em uma goroutine separada
			go processMessage(d)
		}
	}()

	<-forever
}