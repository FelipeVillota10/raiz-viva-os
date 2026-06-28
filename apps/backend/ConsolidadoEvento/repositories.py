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
                    
            consolidado.save()
        return consolidado

    @staticmethod
    def delete(id_consolidado):
        consolidado = ConsolidadoEventoRepository.get_by_id(id_consolidado)
        if consolidado:
            consolidado.delete()
            return True
        return False
