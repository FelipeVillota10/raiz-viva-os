from .ConsolidadoEventoModel import ConsolidadoEventoModel

class ConsolidadoEventoRepository:
    @staticmethod
    def get_all():
        return ConsolidadoEventoModel.objects.all()

    @staticmethod
    def get_by_id(id_consolidado):
        try:
            return ConsolidadoEventoModel.objects.get(id_consolidado_ev=id_consolidado)
        except ConsolidadoEventoModel.DoesNotExist:
            return None

    @staticmethod
    def create(data):
        consolidado = ConsolidadoEventoModel(**data)
        consolidado.save()
        return consolidado

    @staticmethod
    def update(id_consolidado, data):
        consolidado = ConsolidadoEventoRepository.get_by_id(id_consolidado)
        if consolidado:
            was_paid = consolidado.pagado
            
            for key, value in data.items():
                setattr(consolidado, key, value)
                
            from django.db.models import F
            # Si el pago acaba de ser completado
            if not was_paid and consolidado.pagado:
                if consolidado.evento and consolidado.cantidad_tickets:
                    consolidado.evento.capacidad = F('capacidad') - consolidado.cantidad_tickets
                    consolidado.evento.save()
                    
                    # Generar los tiquetes correspondientes
                    from Tiquetes.TiqueteModel import Tiquete
                    from Estados.EstadoModel import EstadoModel
                    from Eventos.EventoModel import EventoModel as PluralEventoModel
                    import uuid
                    from django.utils import timezone
                    from datetime import timedelta
                    
                    try:
                        estado_activo = EstadoModel.objects.get(id=9)
                    except EstadoModel.DoesNotExist:
                        estado_activo = EstadoModel.objects.first()
                        
                    try:
                        evento_plural = PluralEventoModel.objects.get(id_evento=consolidado.evento.id_evento)
                    except PluralEventoModel.DoesNotExist:
                        evento_plural = consolidado.evento
                        
                    for _ in range(consolidado.cantidad_tickets):
                        Tiquete.objects.create(
                            id_cliente=consolidado.cliente,
                            id_estado=estado_activo,
                            id_evento=evento_plural,
                            codigo=str(uuid.uuid4()).upper()[:12],
                            fecha_vencimiento=timezone.now() + timedelta(days=30)
                        )
                    
            consolidado.save()
        return consolidado

    @staticmethod
    def delete(id_consolidado):
        consolidado = ConsolidadoEventoRepository.get_by_id(id_consolidado)
        if consolidado:
            consolidado.delete()
            return True
        return False
