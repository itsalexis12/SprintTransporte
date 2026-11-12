from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
import uuid

class Parada(BaseModel):
    id: str = Field(default_factory=lambda: f"pue-{uuid.uuid4().hex[:8]}")
    nombre: str
    colonia: str
    municipio: str = "Puebla"
    latitud: float
    longitud: float
    rutas: List[str] = []
    activa: bool = True
    creado_en: datetime = Field(default_factory=datetime.utcnow)
