from .PaqueteModel import Paquete, PaqueteItem
from EcoAventuras.EcoAventuraModel import EcoAventuraModel


class PaqueteRepository:

    @staticmethod
    def obtener_o_crear_paquete(session_key: str) -> Paquete:
        paquete, _ = Paquete.objects.get_or_create(session_key=session_key)
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
    def agregar_item(paquete, ecoaventura, fecha_reserva, num_personas):
        # update_or_create busca el registro con los campos especificados.
        # Si lo encuentra, actualiza los valores en 'defaults'.
        # Si no lo encuentra, crea un registro nuevo.
        item, created = PaqueteItem.objects.update_or_create(
            paquete=paquete,
            ecoaventura=ecoaventura,
            fecha_reserva=fecha_reserva,
            defaults={
                'num_personas': num_personas,
                # Si en el futuro requieres modificar 'cantidad', lo agregas aquí. 'cantidad': 1 
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
    def obtener_reglas_operativas():
        """
        Obtiene las reglas globales de armado de paquetes.
        Por ahora retorna un mock, pero debería consultar una tabla de Configuración.
        """
        return {
            "min_personas": 1,
            "max_personas": 20,
            "max_actividades": 6,
            "fechas_bloqueadas": []
        }