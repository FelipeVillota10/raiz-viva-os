from rest_framework.views import APIView
from rest_framework.response import Response
from .MetodoPagoService import MetodoPagoService
from .MetodoPagoSerializer import MetodoPagoSerializer

class MetodoPagoController(APIView):

    def get(self, request):
        metodos = MetodoPagoService.listar()
        return Response(MetodoPagoSerializer(metodos, many=True).data)