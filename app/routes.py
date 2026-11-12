import json
from fastapi import APIRouter, HTTPException
from app.models import Parada
from app.database import redis_client

router = APIRouter(prefix="/paradas", tags=["Paradas"])

@router.post("")
def crear_parada(parada: Parada):
    clave = f"parada:{parada.id}"

    if redis_client.exists(clave):
        raise HTTPException(status_code=409, detail="La parada ya existe")

    redis_client.set(clave, parada.model_dump_json())
    return {"mensaje": "Parada creada", "id": parada.id}

@router.get("")
def listar_paradas():
    claves = redis_client.scan_iter(match="parada:*")
    paradas = []

    for clave in claves:
        paradas.append(json.loads(redis_client.get(clave)))

    return {"total": len(paradas), "paradas": paradas}

@router.get("/{parada_id}")
def obtener_parada(parada_id: str):
    clave = f"parada:{parada_id}"
    datos = redis_client.get(clave)

    if not datos:
        raise HTTPException(status_code=404, detail="Parada no encontrada")

    return json.loads(datos)

@router.put("/{parada_id}")
def actualizar_parada(parada_id: str, parada: Parada):
    clave = f"parada:{parada_id}"

    if not redis_client.exists(clave):
        raise HTTPException(status_code=404, detail="Parada no encontrada")

    parada.id = parada_id
    redis_client.set(clave, parada.model_dump_json())

    return {"mensaje": "Parada actualizada", "parada": parada}

@router.delete("/{parada_id}")
def eliminar_parada(parada_id: str):
    clave = f"parada:{parada_id}"

    if not redis_client.exists(clave):
        raise HTTPException(status_code=404, detail="Parada no encontrada")

    redis_client.delete(clave)

    return {"mensaje": "Parada eliminada", "id": parada_id}
