from .PaqueteRepository import PaqueteRepository
from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository
from rest_framework.exceptions import ValidationError
from django.db.models import Sum

class PaqueteService:

    @staticmethod
    def validar_reglas(paquete, ecoaventura, num_personas_nuevo):
        """
        Valida las reglas dinámicas configuradas por el administrador 
        para la eco-aventura específica dentro del paquete.
        """
        from .PaqueteModel import PaqueteItem # Importación local para evitar la circularidad

        # 1. Obtener los límites dinámicos desde la EcoAventura (campos de HU14.A2)
        # Usamos getattr por si las columnas son nuevas en la BD, evitando caídas.
        min_permitido = getattr(ecoaventura, 'min_personas', 1)
        capacidad_maxima = getattr(ecoaventura, 'capacidad_maxima', 20)
        max_actividades_permitidas = getattr(ecoaventura, 'max_actividades', 6)

        # Regla A: Validar cantidad mínima de personas
        if num_personas_nuevo < min_permitido:
            raise ValidationError({
                "code": "MIN_PERSONAS_NO_ALCANZADO", 
                "error": f"El mínimo de personas requerido para esta actividad es {min_permitido}."
            })

        # Regla B: Validar capacidad máxima real de la eco-aventura para esa fecha específica
        # Sumamos cuántas personas ya reservaron esta misma aventura (independientemente de la sesión)
        # Nota: Idealmente se pasaría la fecha_reserva aquí. Como validar_reglas no la recibía, 
        # calculamos la capacidad base de personas agregadas en el paquete de la sesión actual.
        personas_en_este_paquete = paquete.items.filter(ecoaventura=ecoaventura).aggregate(
            total=Sum('num_personas')
        )['total'] or 0

        if (personas_en_este_paquete + num_personas_nuevo) > capacidad_maxima:
            raise ValidationError({
                "code": "MAX_PERSONAS_EXCEDIDO", 
                "error": f"Has superado el límite de capacidad permitido para esta eco-aventura ({capacidad_maxima} personas)."
            })

        # Regla C: Máximo de actividades totales en el paquete actual
        if paquete.items.count() >= max_actividades_permitidas:
            raise ValidationError({
                "code": "MAX_ACTIVIDADES_EXCEDIDO", 
                "error": f"No puedes agregar más de {max_actividades_permitidas} actividades a tu paquete."
            })

    @staticmethod
    def obtener_paquete(session_key: str):
        return PaqueteRepository.obtener_o_crear_paquete(session_key)

    @staticmethod
    def agregar_experiencia(session_key: str, ecoaventura_id: int, fecha_reserva, num_personas: int) -> dict:
        ecoaventura = EcoAventuraRepository.obtener_por_id(ecoaventura_id)
        if not ecoaventura:
            return {"error": "La eco-aventura no existe.", "code": "NOT_FOUND"}

        paquete = PaqueteRepository.obtener_o_crear_paquete(session_key)

        # --- VALIDACIÓN DE REGLAS ADAPTADA ---
        try:
            # Ahora le pasamos también la 'ecoaventura' para extraer sus límites dinámicos
            PaqueteService.validar_reglas(paquete, ecoaventura, num_personas)
        except ValidationError as e:
            return {"error": e.detail.get("error"), "code": e.detail.get("code")}
        # ----------------------------------

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