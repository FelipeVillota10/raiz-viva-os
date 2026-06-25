from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .DetalleEventoService import DetalleEventoService
from .DetalleEventoSerializer import DetalleEventoSerializer

class DetalleEventoController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = DetalleEventoService()

    def get(self, request, pk=None):
        if pk:
            detalle = self.service.obtener_detalle(pk)
            if not detalle:
                return Response({"error": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
            serializer = DetalleEventoSerializer(detalle)
            return Response(serializer.data)
            
        id_evento = request.query_params.get('id_evento')
        id_colaboradores = request.query_params.get('id_colaboradores')
        estado = request.query_params.get('estado')
        detalles = self.service.listar_detalles(id_evento=id_evento, id_colaboradores=id_colaboradores, estado=estado)
        serializer = DetalleEventoSerializer(detalles, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Permite recibir tanto un objeto individual como una lista para inserción masiva
        data = request.data
        is_many = isinstance(data, list)
        
        try:
            if is_many:
                resultados = []
                for item in data:
                    detalle = self.service.crear_detalle(item.copy())
                    resultados.append(detalle)
                serializer = DetalleEventoSerializer(resultados, many=True)
            else:
                detalle = self.service.crear_detalle(data.copy())
                serializer = DetalleEventoSerializer(detalle)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        try:
            accion = request.data.get('accion')
            if accion == 'aprobar':
                detalle = self.service.actualizar_estado(pk, 'aprobado')
            elif accion == 'rechazar':
                detalle = self.service.actualizar_estado(pk, 'rechazado')
            else:
                return Response({"error": "Accion no valida"}, status=status.HTTP_400_BAD_REQUEST)
                
            if not detalle:
                return Response({"error": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
                
            serializer = DetalleEventoSerializer(detalle)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
