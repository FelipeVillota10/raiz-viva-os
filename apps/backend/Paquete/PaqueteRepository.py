from .PaqueteModel import Paquete, PaqueteItem
from EcoAventuras.EcoAventuraModel import EcoAventuraModel

class PaqueteRepository:

    @staticmethod
    def obtener_o_crear_paquete(session_key: str) -> Paquete:
        paquete, _ = Paquete.objects.get_or_create(session_key=session_key)
        return paquete

    @staticmethod
    def asociar_usuario(session_key: str, user) -> Paquete:
        """
        HU16.2: asocia el paquete de la sesión actual al turista autenticado.
        Se invoca al proceder al checkout/pago, una vez que el usuario inició sesión.
        """
        paquete = PaqueteRepository.obtener_o_crear_paquete(session_key)
        paquete.usuario = user
        paquete.save(update_fields=["usuario", "actualizado_en"])
        return paquete

    @staticmethod
    def obtener_paquete(session_key: str):
        try:
            return Paquete.objects.prefetch_related("items__ecoaventura").get(session_key=session_key)
        except Paquete.DoesNotExist:
            return None

    @staticmethod
    def item_duplicado_existe(paquete: Paquete, ecoaventura_id: int, fecha_reserva, num_personas: int) -> bool:
        return PaqueteItem.objects.filter(
            paquete=paquete,
            ecoaventura_id=ecoaventura_id,
            fecha_reserva=fecha_reserva,
            num_personas=num_personas,
        ).exists()

    @staticmethod
    def agregar_item(paquete: Paquete, ecoaventura: EcoAventuraModel, fecha_reserva, num_personas: int) -> PaqueteItem:
        """
        Busca si el ítem ya existe por sus campos clave (paquete, aventura y fecha).
        Si existe, actualiza de forma segura el número de personas. Si no, lo crea.
        """
        # SOLUCIÓN CRÍTICA: num_personas removido de la búsqueda y asignado solo en defaults
        item, created = PaqueteItem.objects.update_or_create(
            paquete=paquete,
            ecoaventura=ecoaventura,
            fecha_reserva=fecha_reserva,
            defaults={
                'num_personas': num_personas
            }
        )
        return item

    @staticmethod
    def eliminar_item(item_id: int, session_key: str) -> bool:
        deleted, _ = PaqueteItem.objects.filter(
            id=item_id, paquete__session_key=session_key
        ).delete()
        return deleted > 0

    @staticmethod
    def vaciar_paquete(session_key: str) -> None:
        try:
            paquete = Paquete.objects.get(session_key=session_key)
            paquete.items.all().delete()
        except Paquete.DoesNotExist:
            pass

    @staticmethod
    def obtener_reglas_operativas() -> dict:
        """
        Retorna las configuraciones operativas globales registradas en el sistema.
        """
        from .PaqueteModel import ReglasConfig
        config = ReglasConfig.objects.first()
        if not config:
            # Valores por defecto de contingencia si el admin nunca ha guardado reglas
            return {
                "min_personas": 1,
                "max_personas": 20,
                "max_actividades": 6,
                "fechas_bloqueadas": []
            }
        return {
            "min_personas": config.min_personas,
            "max_personas": config.max_personas,
            "max_actividades": config.max_actividades,
            "fechas_bloqueadas": config.fechas_bloqueadas
        }
