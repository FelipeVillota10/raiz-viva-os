from .CategoriaEventoModel import CategoriaEventoModel

class CategoriaEventoRepository:
    def listar_categorias(self):
        return CategoriaEventoModel.objects.all()

    def obtener_por_id(self, pk):
        try:
            return CategoriaEventoModel.objects.get(pk=pk)
        except CategoriaEventoModel.DoesNotExist:
            return None