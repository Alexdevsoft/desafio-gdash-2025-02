import os
import json
import time
import requests
import pika

# --- 1. CONFIGURAÇÕES DA APLICAÇÃO ---
# Coordenadas e API do Open-Meteo
# EX: latitude e longitude para Berlim
LATITUDE = os.getenv("OPENMETEO_LAT", "52.52")
LONGITUDE = os.getenv("OPENMETEO_LON", "13.41")
WEATHER_API_URL = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation_probability&forecast_hours=1"

# Configurações do RabbitMQ (usando variáveis do docker-compose)
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
QUEUE_NAME = "weather_logs_queue" # Nome da fila que o Worker Go irá escutar

# --- 2. FUNÇÕES DO PRODUTOR ---

def connect_rabbitmq():
    """Tenta estabelecer a conexão com o RabbitMQ."""
    print(f"Tentando conectar ao RabbitMQ em {RABBITMQ_HOST}:{RABBITMQ_PORT}...")
    
    # Adicionando um mecanismo de retry básico, pois o RabbitMQ pode demorar a subir no Docker
    for i in range(10):
        try:
            # Usando as credenciais padrão do docker-compose
            credentials = pika.PlainCredentials('user', 'password')
            parameters = pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=credentials,
                retry_delay=5,
                connection_attempts=3
            )
            connection = pika.BlockingConnection(parameters)
            print("Conexão com RabbitMQ estabelecida com sucesso.")
            return connection
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Tentativa {i+1} falhou. Erro: {e}")
            time.sleep(5)
    
    raise ConnectionError("Falha ao conectar-se ao RabbitMQ após múltiplas tentativas.")


def fetch_weather_data():
    """Busca os dados de clima na API Open-Meteo."""
    print("Buscando dados de clima...")
    try:
        response = requests.get(WEATHER_API_URL, timeout=10)
        response.raise_for_status() # Lança exceção para status codes HTTP ruins
        
        data = response.json()
        
        # Extrair e normalizar os dados para o formato que será enviado (o contrato)
        current = data.get('current', {})
        hourly = data.get('hourly', {})

        normalized_data = {
            "timestamp": current.get('time'),
            "latitude": data.get('latitude'),
            "longitude": data.get('longitude'),
            "temperature_c": current.get('temperature_2m'),
            "humidity_percent": current.get('relative_humidity_2m'),
            "wind_speed_kmh": current.get('wind_speed_10m'),
            "weather_code": current.get('weather_code'),
            # Pega a probabilidade de chuva da primeira hora do 'hourly'
            "precipitation_probability": hourly.get('precipitation_probability', [0])[0] 
        }

        print("Dados de clima coletados e normalizados.")
        return normalized_data

    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dados de clima: {e}")
        return None


def send_to_queue(channel, data):
    """Envia os dados normalizados para o RabbitMQ."""
    
    # Declara a fila. Garante que a fila exista.
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    
    message_body = json.dumps(data)
    
    channel.basic_publish(
        exchange='', # Usando a exchange default
        routing_key=QUEUE_NAME,
        body=message_body,
        properties=pika.BasicProperties(
            delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE # Torna a mensagem persistente
        )
    )
    print(f" [x] Dados enviados para a fila '{QUEUE_NAME}': {message_body[:80]}...")


# --- 3. LOOP PRINCIPAL ---

def main():
    connection = None
    try:
        # 1. Conecta ao RabbitMQ
        connection = connect_rabbitmq()
        channel = connection.channel()

        while True:
            # 2. Busca os dados de clima
            weather_data = fetch_weather_data()
            
            if weather_data:
                # 3. Envia para a fila
                send_to_queue(channel, weather_data)
            
            # CRON/INTERVALO: O desafio pede periodicamente (ex: a cada 1 hora). 
            # Para testes rápidos, usaremos 30 segundos (30). Para produção, mude para 3600.
            interval = 30 
            print(f"Aguardando {interval} segundos para próxima coleta...")
            time.sleep(interval)

    except (ConnectionError, Exception) as e:
        print(f"Erro fatal na execução principal: {e}")
    finally:
        if connection and connection.is_open:
            print("Fechando conexão com RabbitMQ.")
            connection.close()

if __name__ == "__main__":
    main()