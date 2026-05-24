from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .EventoService import EventoService
from .EventoSerializer import EventoSerializer


class EventoDetalleController(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id_evento):
        try:
            evento = EventoService.obtener_evento(id_evento)
            return Response(EventoSerializer(evento).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=404)
