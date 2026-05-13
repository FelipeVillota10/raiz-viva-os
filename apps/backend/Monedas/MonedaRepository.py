from .MonedaModel import MonedaModel

class MonedaRepository:
    @staticmethod
    def get_all():
        return MonedaModel.objects.all()

    @staticmethod
    def get_by_id(moneda_id):
        return MonedaModel.objects.filter(id=moneda_id).first()

    @staticmethod
    def create(data):
        return MonedaModel.objects.create(**data)

    @staticmethod
    def get_by_nombre(nombre):
        return MonedaModel.objects.filter(nombre=nombre).first()