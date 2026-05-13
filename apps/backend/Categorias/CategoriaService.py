from .CategoriaRepository import CategoriaRepository

class CategoriaService:
    def __init__(self):
        self.repository = CategoriaRepository()

    def listar_categorias(self, tipo=None):
        if tipo:
            return self.repository.get_by_tipo(tipo)
        return self.repository.get_all()
