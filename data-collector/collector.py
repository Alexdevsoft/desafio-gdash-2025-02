import os
import json
import time
import requests
import pika

# Coordenadas e API do Open-Meteo
LATITUDE = os.environ.get("OPENMETEO_LAT", "52.52")
LONGITUDE = os.environ.get("OPENMETEO_LON", "13.41")
CITY = os.environ.get("OPENMETEO_CITY", "Berlin")
API_URL = "https://api.open-meteo.com/v1/forecast"

# Configurações do RabbitMQ
RABBITMQ_HOST = os.environ.get("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = os.environ.get("RABBITMQ_PORT", "5672")
RABBITMQ_USER = os.environ.get("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.environ.get("RABBITMQ_PASS", "password")
QUEUE_NAME = "weather_logs_queue"
INTERVAL_SECONDS = 30

# Mapeamento simplificado de WMO Weather Codes para strings legíveis
WMO_MAPPING = {
    0: "Céu Limpo",
    1: "Principalmente Limpo",
    2: "Parcialmente Nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Nevoeiro com Gelo",
    51: "Chuvisco Leve",
    53: "Chuvisco Moderado",
    55: "Chuvisco Forte",
    61: "Chuva Leve",
    63: "Chuva Moderada",
    65: "Chuva Forte",
    71: "Neve Leve",
    73: "Neve Moderada",
    75: "Neve Forte",
    95: "Tempestade",
}

def get_condition_text(code):
    """Converte o código WMO em um texto descritivo."""
    return WMO_MAPPING.get(code, "Desconhecida")

def publish_message(channel, message):
    """Publica uma mensagem no RabbitMQ."""
    channel.basic_publish(
        exchange='',
        routing_key=QUEUE_NAME,
        body=message,
        properties=pika.BasicProperties(
            delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
        ))
    print(f" [x] Dados enviados para a fila '{QUEUE_NAME}' | {CITY}")

def fetch_and_publish():
    """Busca os dados de clima e publica no RabbitMQ."""
    try:
        lat_float = float(LATITUDE)
        lon_float = float(LONGITUDE)
    except ValueError as e:
        print(f" [ERRO] Variáveis de Latitude/Longitude inválidas: {e}")
        return
    params = {
        "latitude": lat_float,
        "longitude": lon_float,
        "hourly": "temperature_2m,relative_humidity_2m,windspeed_10m,precipitation_probability",
        "forecast_hours": 1,
        "timezone": "auto"
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status() # Levanta HTTPError para códigos de status ruins (4xx ou 5xx)
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f" [ERRO] Falha ao conectar ou buscar dados da API Open-Meteo: {e}")
        return

    # Extração de dados da resposta
    hourly_data = data.get('hourly', {})
    if not hourly_data or not hourly_data.get('time') or len(hourly_data['time']) == 0:
        print(" [ERRO] Resposta da API Open-Meteo incompleta.")
        return

    # Mapeamento do log para a estrutura esperada pelo Worker Go
    try:
         log_data = {
         "timestamp": hourly_data.get('time', [''])[0],
         "latitude": data.get('latitude', lat_float),
         "longitude": data.get('longitude', lon_float),
         "temperature_c": hourly_data.get('temperature_2m', [None])[0],
         "humidity_percent": hourly_data.get('relative_humidity_2m', [None])[0],
         "wind_speed_kmh": hourly_data.get('wind_speed_10m', [None])[0],
         "weather_code": hourly_data.get('weather_code', [None])[0],
         "precipitation_probability": hourly_data.get('precipitation_probability', [None])[0],

         "city": CITY,
         "condition": get_condition_text(hourly_data.get('weather_code', [0])[0] if hourly_data.get('weather_code') else 0),
     }
    except (IndexError, KeyError) as e:
         print(f" [ERRO] Falha ao indexar os dados: {e}. Dados brutos: {json.dumps(data, indent=2)}")
         return
    
    # Validação mínima antes de enviar
    if log_data['timestamp'] is None or log_data['temperature_c'] is None:
        print(" [AVISO] Dados essenciais faltando, pulando publicação.")
        return

    # Conexão com RabbitMQ
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(RABBITMQ_HOST, int(RABBITMQ_PORT), '/', credentials)
    
    conn = None
    try:
        conn = pika.BlockingConnection(parameters)
        print(" [INFO] Conexão com RabbitMQ estabelecida com sucesso.")
        channel = conn.channel()

        # Garante que a fila existe
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        message = json.dumps(log_data)
        publish_message(channel, message)
        
    except pika.exceptions.AMQPConnectionError as e:
        print(f" [ERRO CRÍTICO] Falha na conexão AMQP: {e}. O Collector vai tentar novamente.")
    finally:
        if conn and conn.is_open:
            conn.close()

def main():
    print(f"Iniciando Coletor Python para {CITY}. Intervalo: {INTERVAL_SECONDS}s.")
    while True:
        fetch_and_publish()
        time.sleep(INTERVAL_SECONDS)

if __name__ == '__main__':
    main()