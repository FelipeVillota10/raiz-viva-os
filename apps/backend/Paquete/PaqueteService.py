from .PaqueteRepository import PaqueteRepository
from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository


class PaqueteService:

    @staticmethod
    def obtener_paquete(session_key: str):
        return PaqueteRepository.obtener_o_crear_paquete(session_key)

    @staticmethod
    def agregar_experiencia(session_key: str, ecoaventura_id: int, fecha_reserva, num_personas: int) -> dict:
        ecoaventura = EcoAventuraRepository.obtener_por_id(ecoaventura_id)
        if not ecoaventura:
            return {"error": "La eco-aventura no existe.", "code": "NOT_FOUND"}

        paquete = PaqueteRepository.obtener_o_crear_paquete(session_key)

        if PaqueteRepository.item_duplicado_existe(paquete, ecoaventura_id, fecha_reserva, num_personas):
            return {
                "error": "Esta experiencia ya fue agregada con la misma configuración.",
                "code": "DUPLICATE",
            }

        item = PaqueteRepository.agregar_item(paquete, ecoaventura, fecha_reserva, num_personas)
        return {"success": True, "item_id": item.id}

    @staticmethod
    def eliminar_experiencia(session_key: str, item_id: int) -> dict:
        eliminado = PaqueteRepository.eliminar_item(item_id, session_key)
        if not eliminado:
            return {"error": "El item no existe o no pertenece a tu paquete.", "code": "NOT_FOUND"}
        return {"success": True}

    @staticmethod
    def vaciar_paquete(session_key: str) -> dict:
        PaqueteRepository.vaciar_paquete(session_key)
        return {"success": True}