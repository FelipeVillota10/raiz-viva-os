from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .EstadoService import EstadoService
from .EstadoSerializer import EstadoSerializer

class EstadoController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EstadoService()

    def get(self, request):
        estados = self.service.listar_estados()
        serializer = EstadoSerializer(estados, many=True)
        return Response(serializer.data)