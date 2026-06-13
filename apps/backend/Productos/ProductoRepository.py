#crea el repository de mi ProductoModel con los static de traer por id, traer todos, crear, actualizar e inactivar
from .ProductoModel import ProductoModel

class ProductoRepository:
    @staticmethod
    def get_all():
        return ProductoModel.objects.get_all()

    @staticmethod
    def get_by_id(producto_id):
        return ProductoModel.objects.get_by_id(producto_id)

    @staticmethod
    def get_by_id(producto_id):
        return ProductoModel.objects.filter(id_producto=producto_id).first()

    @staticmethod
    def create(data):
        return ProductoModel.objects.create(**data)

    @staticmethod
    def update(producto, data):
        for key, value in data.items():
            setattr(producto, key, value)
        producto.save()
        return producto