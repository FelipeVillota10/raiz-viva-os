from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .TipoActorService import TipoActorService
from .TipoActorSerializer import TipoActorSerializer

class TipoActorController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TipoActorService()

    def get(self, request):
        tipos = self.service.obtener_catalogo_tipos()
        serializer = TipoActorSerializer(tipos, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            nuevo_tipo = self.service.registrar_tipo_actor(request.data)
            serializer = TipoActorSerializer(nuevo_tipo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)