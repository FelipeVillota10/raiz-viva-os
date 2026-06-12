from .PaqueteRepository import PaqueteRepository
from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository
from rest_framework.exceptions import ValidationError
from django.db.models import Sum
<<<<<<< HEAD

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
=======
class PaqueteService:

    @staticmethod
    def validar_reglas(paquete: Paquete, ecoaventura: EcoAventuraModel, num_personas_nuevo: int, fecha_reserva) -> None:
        """
        Valida las reglas dinámicas globales y límites de capacidad real 
        para la eco-aventura específica dentro del paquete.
        """
        from .PaqueteModel import PaqueteItem
        from .PaqueteRepository import PaqueteRepository

        # 1. SOLUCIÓN CRÍTICA: Obtener límites globales reales desde ReglasConfig (HU14.A2)
        reglas_globales = PaqueteRepository.obtener_reglas_operativas()
        min_personas_global = reglas_globales.get('min_personas', 1)
        max_actividades_global = reglas_globales.get('max_actividades', 6)
        
        # El límite de capacidad máxima por actividad sí es propio de cada EcoAventura
        capacidad_maxima_actividad = getattr(ecoaventura, 'capacidad_maxima', 20)

        # --- Regla A: Validar cantidad mínima de personas ---
        if num_personas_nuevo < min_personas_global:
            raise ValidationError({
                "code": "MIN_PERSONAS_NO_ALCANZADO", 
                "error": f"El mínimo de personas requerido de forma global para las actividades es {min_personas_global}."
            })

        # --- Regla B: SOLUCIÓN CRÍTICA (Cross-User): Validar capacidad real global para esa fecha ---
        # Sumamos cuántas personas han reservado esta aventura en TODO el sistema para ese día específico
        total_reservado_global = PaqueteItem.objects.filter(
            ecoaventura=ecoaventura,
            fecha_reserva=fecha_reserva
        ).aggregate(
            total=Sum('num_personas')
        )['total'] or 0

        # Si el ítem ya existía en este paquete para este día, restamos sus personas actuales para no duplicar el cálculo
        item_existente = paquete.items.filter(ecoaventura=ecoaventura, fecha_reserva=fecha_reserva).first()
        personas_anteriores_este_item = item_existente.num_personas if item_existente else 0
        capacidad_ocupada_otros = total_reservado_global - personas_anteriores_este_item

        if (capacidad_ocupada_otros + num_personas_nuevo) > capacidad_maxima_actividad:
            cupos_disponibles = capacidad_maxima_actividad - capacidad_ocupada_otros
            raise ValidationError({
                "code": "MAX_PERSONAS_EXCEDIDO", 
                "error": f"Has superado el límite de capacidad permitido para esta eco-aventura. Solo quedan {cupos_disponibles} cupos disponibles para la fecha {fecha_reserva}."
            })

        # --- Regla C: SOLUCIÓN CRÍTICA: Validar máximo de actividades sin bloquear actualizaciones ---
        # Solo verificamos el conteo si es una actividad totalmente nueva que no está en el paquete actual
        es_actividad_nueva = not paquete.items.filter(ecoaventura=ecoaventura, fecha_reserva=fecha_reserva).exists()

        if es_actividad_nueva and paquete.items.count() >= max_actividades_global:
            raise ValidationError({
                "code": "MAX_ACTIVIDADES_EXCEDIDO", 
                "error": f"No puedes agregar más de {max_actividades_global} actividades a tu paquete."
>>>>>>> fad75f42784b1fad0ebcaf7cfaaa3ceffa93388f
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
<<<<<<< HEAD
            # Ahora le pasamos también la 'ecoaventura' para extraer sus límites dinámicos
            PaqueteService.validar_reglas(paquete, ecoaventura, num_personas)
=======
            # Ahora le pasamos la fecha_reserva necesaria para validar de forma cross-user
            PaqueteService.validar_reglas(paquete, ecoaventura, num_personas, fecha_reserva)
>>>>>>> fad75f42784b1fad0ebcaf7cfaaa3ceffa93388f
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
