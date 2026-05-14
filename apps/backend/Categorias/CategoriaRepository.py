from .CategoriaModel import CategoriaModel

class CategoriaRepository:
    @staticmethod
    def get_all():
        return CategoriaModel.objects.all()

    @staticmethod
    def get_by_id(categoria_id):
        return CategoriaModel.objects.filter(id=categoria_id).first()

    @staticmethod
    def get_by_tipo(tipo):
        return CategoriaModel.objects.filter(tipo=tipo)

    @staticmethod
    def create(data):
        return CategoriaModel.objects.create(**data)