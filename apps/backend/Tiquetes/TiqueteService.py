import uuid
from datetime import timedelta
from django.utils import timezone
from .TiqueteRepository import TiqueteRepository
from Estados.EstadoModel import EstadoModel

class TiqueteService:
    def __init__(self):
        self.repository = TiqueteRepository()

    def get_all_tiquetes(self):
        return self.repository.get_all()

    def get_tiquete_by_id(self, id_tiquete):
        return self.repository.get_by_id(id_tiquete)

    def get_tiquetes_by_cliente(self, id_cliente):
        return self.repository.get_by_cliente(id_cliente)

    def generate_tiquete(self, id_cliente, id_evento=None, id_experiencia=None):
        # 1. Validaciones de Evento si aplica
        if id_evento:
            from Eventos.EventoModel import EventoModel
            from django.db.models import F
            
            try:
                evento = EventoModel.objects.get(id_evento=id_evento)
            except EventoModel.DoesNotExist:
                raise Exception("El evento no existe")
                
            # Validar si no hay cupos
            if evento.capacidad <= 0:
                raise Exception("No hay cupos disponibles para este evento")
                
            # Validar si es gratis y ya tiene un tiquete
            is_free = evento.es_gratuito or float(evento.costo_evento or 0) == 0
            if is_free:
                ya_tiene = self.repository.get_all().filter(id_cliente_id=id_cliente, id_evento_id=id_evento).exists()
                if ya_tiene:
                    raise Exception("Solo se permite un cupo por usuario para eventos gratuitos")
                    
            # Descontar la capacidad
            evento.capacidad = F('capacidad') - 1
            evento.save()

        # Generate a unique code
        codigo = str(uuid.uuid4()).upper()[:12]
        
        # Default expiration date (e.g. 1 day from now, or let's say 30 days)
        fecha_vencimiento = timezone.now() + timedelta(days=30)
        
        # Default status (activo - ID 9)
        try:
            estado_activo = EstadoModel.objects.get(id=9) 
        except EstadoModel.DoesNotExist:
            estado_activo = EstadoModel.objects.first()

        data = {
            'id_cliente_id': id_cliente,
            'id_estado': estado_activo,
            'id_evento_id': id_evento,
            'id_experiencia_id': id_experiencia,
            'codigo': codigo,
            'fecha_vencimiento': fecha_vencimiento
        }
        tiquete = self.repository.create(data)
        
        # Se podría retornar la data junto con un string para generar el QR
        return tiquete

    def update_tiquete(self, id_tiquete, data):
        return self.repository.update(id_tiquete, data)

    def delete_tiquete(self, id_tiquete):
        return self.repository.delete(id_tiquete)
