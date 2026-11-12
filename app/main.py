from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routes import router
from app.database import probar_conexion

app = FastAPI(
    title="Rutas Puebla",
    description="CRUD de paradas de transporte público en Puebla con Redis Cloud",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(router)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def inicio():
    return FileResponse("static/index.html")

@app.get("/estado")
def estado():
    return {
        "proyecto": "Rutas Puebla",
        "redis_conectado": probar_conexion()
    }
