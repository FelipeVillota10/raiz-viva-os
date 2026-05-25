from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from Eventos.EventoService import EventoService
from Eventos.EventoSerializer import EventoSerializer

class EventoController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EventoService()

    def get(self, request):
        eventos = self.service.listar_eventos()
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            imagen = request.FILES.get('imagen', None)
            nuevo_evento = self.service.crear_evento(request.data.copy(), imagen)
            serializer = EventoSerializer(nuevo_evento)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)