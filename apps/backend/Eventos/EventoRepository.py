from .EventoModel import EventoModel

class EventoRepository:
    @staticmethod
    def get_all():
        return EventoModel.objects.all()

    @staticmethod
    def get_by_id(evento_id):
        return EventoModel.objects.filter(id_evento=evento_id).first()

    @staticmethod
    def create(data):
        return EventoModel.objects.create(**data)