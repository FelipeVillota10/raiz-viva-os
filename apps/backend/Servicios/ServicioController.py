from rest_framework.response import Response
from rest_framework.views import APIView
from .ServicioService import ServicioService
from .ServicioModel import ServicioModel, ClienteServicioModel
from Clientes.ClienteModel import ClienteModel
from Clientes.ClienteSerializer import ClienteSerializer
from django.http import Http404


class ServicioController(APIView):
    def get(self, request):
        service = ServicioService()
        servicios = service.listar_servicios()
        data = [{'id': s.id, 'nombre': s.nombre, 'descripcion': s.descripcion, 'precio_base': s.precio_base, 'unidad': s.unidad} for s in servicios]
        return Response(data)


class ClienteServicioController(APIView):
    def get(self, request, cliente_id):
        service = ServicioService()
        cliente_servicios = service.get_cliente_servicios(cliente_id)
        data = []
        for cs in cliente_servicios:
            data.append({
                'id': cs.servicio.id,
                'nombre': cs.servicio.nombre,
                'precio_acordado': cs.precio_acordado,
                'fecha_asociacion': cs.fecha_asociacion
            })
        return Response(data)

    def post(self, request, cliente_id):
        servicio_id = request.data.get('servicio_id')
        precio_acordado = request.data.get('precio_acordado')

        if not servicio_id:
            return Response({'error': 'servicio_id es requerido'}, status=400)

        service = ServicioService()
        try:
            cs = service.agregar_servicio_a_cliente(cliente_id, servicio_id, precio_acordado)
            return Response({
                'mensaje': 'Servicio agregado al cliente',
                'cliente_servicio': {
                    'id': cs.servicio.id,
                    'nombre': cs.servicio.nombre,
                    'precio_acordado': cs.precio_acordado
                }
            }, status=201)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)
        except ServicioModel.DoesNotExist:
            return Response({'error': 'Servicio no encontrado'}, status=404)

    def delete(self, request, cliente_id):
        servicio_id = request.data.get('servicio_id')
        if not servicio_id:
            return Response({'error': 'servicio_id es requerido'}, status=400)

        service = ServicioService()
        service.quitar_servicio_de_cliente(cliente_id, servicio_id)
        return Response({'mensaje': 'Servicio eliminado del cliente'}, status=200)