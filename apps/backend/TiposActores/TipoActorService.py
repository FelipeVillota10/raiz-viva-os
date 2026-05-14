from .TipoActorRepository import TipoActorRepository

class TipoActorService:
    def __init__(self):
        self.repository = TipoActorRepository()

    def obtener_catalogo_tipos(self):
        return self.repository.get_all()
