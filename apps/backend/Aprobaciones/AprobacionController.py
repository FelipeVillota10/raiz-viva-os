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

        estado = request.data.get('estado_resultado')
        observaciones = request.data.get('observaciones', '')

        if estado not in ['EN_REVISION', 'APROBADO', 'RECHAZADO']:
            return Response({'error': 'Estado invalido'}, status=400)

        service = AprobacionService()
        try:
            aprobacion = service.actualizar_solicitud(pk, cliente, estado, observaciones)
        except AprobacionModel.DoesNotExist:
            return Response({'error': 'Solicitud no encontrada'}, status=404)

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