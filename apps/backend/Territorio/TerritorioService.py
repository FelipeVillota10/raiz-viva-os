from .TerritorioModel import TerritorioModel

class TerritorioService:
    def obtener_todos(self):
        return TerritorioModel.objects.all()
