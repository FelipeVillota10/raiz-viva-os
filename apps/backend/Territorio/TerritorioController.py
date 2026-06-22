from rest_framework.views import APIView
from rest_framework.response import Response
from .TerritorioService import TerritorioService
from .TerritorioSerializer import TerritorioSerializer

class TerritorioController(APIView):
    def get(self, request):
        service = TerritorioService()
        territorios = service.obtener_todos()
        serializer = TerritorioSerializer(territorios, many=True)
        return Response(serializer.data)
