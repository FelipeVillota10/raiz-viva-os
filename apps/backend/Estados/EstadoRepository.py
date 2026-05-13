from .EstadoModel import EstadoModel

class EstadoRepository:
    @staticmethod
    def get_all():
        return EstadoModel.objects.all()

    @staticmethod
    def get_by_id(estado_id):
        return EstadoModel.objects.filter(id=estado_id).first()

    @staticmethod
    def create(data):
        return EstadoModel.objects.create(**data)

    @staticmethod
    def get_by_nombre(nombre):
        return EstadoModel.objects.filter(nombre_estado=nombre).first()