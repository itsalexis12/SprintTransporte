from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routes import router
from app.database import probar_conexion

# Inicializa la aplicación principal de FastAPI
app = FastAPI(
    title="Rutas Puebla",
    description="CRUD de paradas de transporte público en Puebla con Redis Cloud",
    version="1.1.0"
)

# Configura CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Registra las rutas del CRUD de paradas y monta los archivos estáticos
app.include_router(router)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Carga la interfaz web principal
@app.get("/")
def inicio():
    return FileResponse("static/index.html")

# Endpoint para verificar el estado de la API y la conexión con Redis
@app.get("/estado")
def estado():
    return {
        "proyecto": "Rutas Puebla",
        "redis_conectado": probar_conexion()
    }
