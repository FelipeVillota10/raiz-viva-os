from django.db.models import Sum
from django.utils import timezone
from rest_framework.exceptions import ValidationError

# Asumiendo que EcoAventuraModel está en apps/backend/EcoAventura/models.py
from EcoAventuras.EcoAventuraModel import EcoAventuraModel
# Asumiendo que Paquete y ItemPaquete están en apps/backend/Paquete/models.py
from .PaqueteModel import Paquete, PaqueteItem
from .PaqueteRepository import PaqueteRepository

class PaqueteService:
    def obtener_paquete_por_session_key(self, session_key: str) -> Paquete:
        """Obtiene o crea un paquete para una session_key dada."""
        return Paquete.objects.get_or_create(session_key=session_key)[0]

    def validar_disponibilidad(self, ecoaventura_id: int, fecha_reserva_str: str, num_personas: int) -> None:
        """
        Valida si hay disponibilidad para una ecoaventura en una fecha y cantidad de personas dadas.
        Lanza ValidationError si no hay disponibilidad o si los datos son inválidos.
        """
        try:
            ecoaventura = EcoAventuraModel.objects.get(id=ecoaventura_id)
        except EcoAventuraModel.DoesNotExist:
            raise ValidationError("EcoAventura no encontrada.")

        # Convertir la cadena de fecha a objeto date para comparación
        try:
            fecha_reserva = timezone.datetime.strptime(fecha_reserva_str, '%Y-%m-%d').date()
        except ValueError:
            raise ValidationError("Formato de fecha de reserva inválido. Use YYYY-MM-DD.")

        # Validar que la fecha no sea pasada
        if fecha_reserva < timezone.now().date():
            raise ValidationError("No se puede reservar una experiencia en una fecha pasada.")

        # Validar que la fecha esté dentro del rango activo de la ecoaventura
        if ecoaventura.fecha_inicio and fecha_reserva < ecoaventura.fecha_inicio:
            raise ValidationError("La fecha de reserva es anterior al inicio de la ecoaventura.")
        if ecoaventura.fecha_fin and fecha_reserva > ecoaventura.fecha_fin:
            raise ValidationError("La fecha de reserva es posterior al fin de la ecoaventura.")

        # --- NUEVAS REGLAS HU14.A2 ---
        reglas = PaqueteRepository.obtener_reglas_operativas()
        
        if num_personas < reglas["min_personas"]:
            raise ValidationError(f"El mínimo de personas para armar un paquete es {reglas['min_personas']}.")
        
        if num_personas > reglas["max_personas"]:
            raise ValidationError(f"El máximo de personas permitido por paquete es {reglas['max_personas']}.")

        if fecha_reserva_str in reglas["fechas_bloqueadas"]:
            raise ValidationError("Esta fecha está bloqueada por mantenimiento o festivos.")
        # -----------------------------

        # Sumar las reservas existentes para esta ecoaventura en esta fecha
        reservas_existentes = PaqueteItem.objects.filter(
            ecoaventura=ecoaventura,
            fecha_reserva=fecha_reserva
        ).aggregate(total_personas=Sum('num_personas'))['total_personas'] or 0

        if (reservas_existentes + num_personas) > ecoaventura.capacidad_maxima:
            raise ValidationError(f"No hay suficiente disponibilidad para {num_personas} personas en la fecha {fecha_reserva_str}. Capacidad restante: {ecoaventura.capacidad_maxima - reservas_existentes}.")

    def agregar_experiencia_a_paquete(self, session_key: str, ecoaventura_id: int, fecha_reserva: str, num_personas: int) -> Paquete:
        """
        Agrega una experiencia al paquete del usuario, validando disponibilidad y calculando el precio.
        """
        # 1. Validar disponibilidad (lanzará ValidationError si no está disponible)
        self.validar_disponibilidad(ecoaventura_id, fecha_reserva, num_personas)

        paquete = self.obtener_paquete_por_session_key(session_key)

        # Validar límite de actividades (HU14.A2)
        reglas = PaqueteRepository.obtener_reglas_operativas()
        if paquete.items.count() >= reglas["max_actividades"]:
            raise ValidationError(f"No puedes agregar más de {reglas['max_actividades']} actividades a tu paquete.")

        try:
            ecoaventura = EcoAventuraModel.objects.get(id=ecoaventura_id)
        except EcoAventuraModel.DoesNotExist:
            raise ValidationError("EcoAventura no encontrada.")

        # Verificar si ya existe un item con la misma ecoaventura, fecha y número de personas
        existing_item = PaqueteItem.objects.filter(
            paquete=paquete,
            ecoaventura=ecoaventura,
            fecha_reserva=fecha_reserva,
            num_personas=num_personas
        ).first()

        if existing_item:
            # Si existe, se considera un duplicado para esta configuración específica
            raise ValidationError({"error": "Ya agregaste esta experiencia con la misma configuración.", "code": "DUPLICATE"})

        PaqueteItem.objects.create(
            paquete=paquete,
            ecoaventura=ecoaventura,
            fecha_reserva=fecha_reserva,
            num_personas=num_personas,
            cantidad=1 
        )

        return paquete

    def eliminar_item_de_paquete(self, session_key: str, item_id: int) -> Paquete:
        paquete = self.obtener_paquete_por_session_key(session_key)
        try:
            item = PaqueteItem.objects.get(paquete=paquete, id=item_id)
            item.delete()
            # paquete.actualizar_totales() # Descomentar si el modelo tiene este método
            return paquete
        except PaqueteItem.DoesNotExist:
            raise ValidationError("Item del paquete no encontrado.")

    def vaciar_paquete(self, session_key: str) -> None:
        paquete = self.obtener_paquete_por_session_key(session_key)
        paquete.items.all().delete()
        # paquete.actualizar_totales() # Descomentar si el modelo tiene este método