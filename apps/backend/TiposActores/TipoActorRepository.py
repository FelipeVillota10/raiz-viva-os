from .TipoActorModel import TipoActorModel

class TipoActorRepository:
    @staticmethod
    def get_all():
        return TipoActorModel.objects.all()

    @staticmethod
    def get_by_id(tipo_id):
        return TipoActorModel.objects.filter(id=tipo_id).first()

    @staticmethod
    def create(data):
        return TipoActorModel.objects.create(**data)

    @staticmethod
    def update(tipo_id, data):
        TipoActorModel.objects.filter(id=tipo_id).update(**data)
        return TipoActorModel.objects.filter(id=tipo_id).first()