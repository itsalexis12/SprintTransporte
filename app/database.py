import os
import redis
from dotenv import load_dotenv

# Carga las variables de entorno desde el archivo .env
load_dotenv()

# Inicializa la conexión con Redis Cloud usando la URL configurada
redis_client = redis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True
)

# Verifica que la conexión con la base de datos esté activa
def probar_conexion():
    return redis_client.ping()
