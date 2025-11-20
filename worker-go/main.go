package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("Worker Go iniciado. Aguardando a conexão com RabbitMQ...")
    
	// Simples loop de espera para manter o container rodando
	for {
		// Substituiremos este código por código funcional de consumo de fila na próxima etapa
		time.Sleep(5 * time.Second)
        // Log para mostrar que o serviço está ativo
        fmt.Printf("[%s] Worker ativo e aguardando mensagens.\n", time.Now().Format("15:04:05")) 
	}
}