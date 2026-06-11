from .CategoriaEventoRepository import CategoriaEventoRepository

class CategoriaEventoService:
    def __init__(self):
        self.repository = CategoriaEventoRepository()

    def listar_categorias(self):
        return self.repository.listar_categorias()

    def obtener_categoria(self, pk):
        return self.repository.obtener_por_id(pk)