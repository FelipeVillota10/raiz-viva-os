from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .MonedaService import MonedaService
from .MonedaSerializer import MonedaSerializer

class MonedaController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = MonedaService()

    def get(self, request):
        try:
            monedas = self.service.listar_monedas_activas()
            serializer = MonedaSerializer(monedas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
