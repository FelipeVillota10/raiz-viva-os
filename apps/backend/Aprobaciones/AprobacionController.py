from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken
from .AprobacionService import AprobacionService
from .AprobacionSerializer import AprobacionesSerializer
from Clientes.ClienteModel import ClienteModel
from Aprobaciones.AprobacionModel import AprobacionModel


class SolicitudesController(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token no proporcionado'}, status=401)

        token = auth_header.split(' ')[1]
        try:
            access = AccessToken(token)
            user_id = access['user_id']
            cliente = ClienteModel.objects.get(usuario_id=user_id)
        except Exception:
            return Response({'error': 'Token invalido'}, status=401)

        service = AprobacionService()
        estado = request.GET.get('estado')
        solicitudes = service.get_solicitudes_by_lider(cliente, estado)

        serializer = AprobacionesSerializer(solicitudes, many=True)
        return Response(serializer.data)


class SolicitudDetalleController(APIView):
    def get(self, request, pk):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token no proporcionado'}, status=401)

        service = AprobacionService()
        try:
            aprobacion = service.get_solicitud(pk)
        except AprobacionModel.DoesNotExist:
            return Response({'error': 'Solicitud no encontrada'}, status=404)

        serializer = AprobacionesSerializer(aprobacion)
        return Response(serializer.data)


class SolicitudActualizarController(APIView):
    def patch(self, request, pk):
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"PATCH request received: pk={pk}")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"request.data: {request.data}")
        
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token no proporcionado'}, status=401)

        token = auth_header.split(' ')[1]
        try:
            access = AccessToken(token)
            user_id = access['user_id']
            cliente = ClienteModel.objects.get(usuario_id=user_id)
        except Exception:
            return Response({'error': 'Token invalido'}, status=401)

        # Try to get estado from request.data, request.POST, or parsed JSON
        estado = request.data.get('estado') or request.data.get('estado_resultado')
        observaciones = request.data.get('observaciones', '') or request.POST.get('observaciones', '')
        
        logger.info(f"Parsed estado={estado}, observaciones={observaciones}")

        if not estado or estado not in ['EN_REVISION', 'APROBADO', 'RECHAZADO']:
            logger.error(f"Invalid or missing estado value: {estado}")
            return Response({'error': 'Estado invalido'}, status=400)

        service = AprobacionService()
        try:
            aprobacion = service.actualizar_solicitud(pk, cliente, estado, observaciones)
        except AprobacionModel.DoesNotExist:
            return Response({'error': 'Solicitud no encontrada'}, status=404)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f"Error updating solicitud {pk}: {str(e)}")
            return Response({'error': f'Error: {str(e)}'}, status=400)

        return Response(AprobacionesSerializer(aprobacion).data)


class DashboardLiderController(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token no proporcionado'}, status=401)

        token = auth_header.split(' ')[1]
        try:
            access = AccessToken(token)
            user_id = access['user_id']
            cliente = ClienteModel.objects.get(usuario_id=user_id)
        except Exception:
            return Response({'error': 'Token invalido'}, status=401)

        service = AprobacionService()
        dashboard = service.get_dashboard(cliente)
        return Response(dashboard)