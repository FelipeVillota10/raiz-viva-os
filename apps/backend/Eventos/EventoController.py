from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from Eventos.EventoService import EventoService
from Eventos.EventoSerializer import EventoSerializer

class EventoController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EventoService()

    def get(self, request, pk=None):
        eventos = self.service.listar_eventos()
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data)

    def post(self, request, pk=None):
        try:
            imagen = request.FILES.get('imagen', None)
            nuevo_evento = self.service.crear_evento(request.data.copy(), imagen)
            serializer = EventoSerializer(nuevo_evento)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            print(f"❌ ValueError: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"❌ Exception: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        try:
            # Obtener la imagen si se envía en la actualización
            imagen = request.FILES.get('imagen', None)
            # El método update_evento debería manejar la lógica de actualización en el servicio
            # y el 'pk' es el id del evento a actualizar
            evento_actualizado = self.service.actualizar_evento(pk, request.data.copy(), imagen)
            if evento_actualizado:
                serializer = EventoSerializer(evento_actualizado)
                return Response(serializer.data)
            return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    