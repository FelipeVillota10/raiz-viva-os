from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from Eventos.EventoService import EventoService
from Eventos.EventoSerializer import EventoSerializer

class EventoController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EventoService()

    def get(self, request, pk=None):  # ← solo una definición
        if pk:
            evento = self.service.obtener_evento(pk)
            if not evento:
                return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            serializer = EventoSerializer(evento, context={'request': request})
            return Response(serializer.data)
        
        estado = request.query_params.get('estado')
        territorio = request.query_params.get('territorio')
        actor = request.query_params.get('actor')
        eventos = self.service.listar_eventos(estado=estado, territorio=territorio, actor=actor)
        serializer = EventoSerializer(eventos, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pk=None):
        try:
            imagen = request.FILES.get('imagen', None)
            nuevo_evento = self.service.crear_evento(request.data.copy(), imagen)
            serializer = EventoSerializer(nuevo_evento, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        try:
            imagen = request.FILES.get('imagen', None)
            evento_actualizado = self.service.actualizar_evento(pk, request.data.copy(), imagen)
            if not evento_actualizado:
                return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            serializer = EventoSerializer(evento_actualizado, context={'request': request})
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        
        print("📦 request.data:", request.data)
        print("📦 Content-Type:", request.content_type)
        accion = request.data.get('accion')
        print("📦 accion:", accion)
        try:
            if accion == 'inactivar':
                evento = self.service.inactivar_evento(pk)
            elif accion == 'publicar':
                evento = self.service.publicar_evento(pk)
            elif accion == 'aprobar':
                evento = self.service.aprobar_evento(pk)
            elif accion == 'rechazar':
                evento = self.service.rechazar_evento(pk)
            elif accion == 'cancelar_envio':
                evento = self.service.cancelar_envio_evento(pk)
            else:
                return Response({"error": "Acción no válida."}, status=status.HTTP_400_BAD_REQUEST)

            if not evento:
                return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

            serializer = EventoSerializer(evento, context={'request': request})
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    