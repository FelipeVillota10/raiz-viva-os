from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Count
from .models import TiposActores, Cliente, Aprobaciones, Territorio, Moneda
from .serializers import (
    RegistroClienteSerializer,
    TiposActoresSerializer,
    ClienteSerializer,
    AprobacionesSerializer,
    TerritorioSerializer,
    MonedaSerializer,
)
from .services import EmailService


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        from django.contrib.auth.models import User

        username = attrs.get('username', '')
        password = attrs.get('password', '')

        if '@' in username:
            user_obj = User.objects.filter(email=username).first()
            if user_obj:
                username = user_obj.username

        user = User.objects.filter(username=username).first()
        if not user:
            raise ValidationError({
                'detail': 'No active account found with the given credentials'
            })

        if not user.check_password(password):
            raise ValidationError({
                'detail': 'No active account found with the given credentials'
            })

        if not user.is_active:
            raise ValidationError({
                'detail': 'No active account found with the given credentials'
            })

        self.user = user

        cliente = Cliente.objects.filter(id_usuario=user).first()
        if cliente:
            if not cliente.es_actor and not cliente.es_turista and not cliente.es_lider:
                raise ValidationError({
                    'detail': 'Tu solicitud está pendiente de aprobación. El líder territorial la revisará pronto.'
                })

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        if cliente:
            refresh['es_actor'] = cliente.es_actor
            refresh['es_lider'] = cliente.es_lider
            refresh['es_turista'] = cliente.es_turista
            refresh['nombre_completo'] = cliente.nombre_completo
            refresh['territorio'] = cliente.id_territorio.nombre_territorio if cliente.id_territorio else None

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    class Meta:
        model = Cliente
        fields = ()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
def perfil_usuario(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no proporcionado'}, status=401)
    token = auth_header.split(' ')[1]

    from rest_framework_simplejwt.tokens import AccessToken

    try:
        access = AccessToken(token)
        user_id = access['user_id']
        cliente = Cliente.objects.select_related(
            'id_usuario', 'id_territorio', 'id_tipo_moneda'
        ).prefetch_related('tipos_actores__id_tipo').get(id_usuario_id=user_id)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)
    except Exception:
        return Response({'error': 'Token inválido o expirado'}, status=401)


@api_view(['GET'])
def listar_tipos_actores(request):
    tipos = TiposActores.objects.all()
    serializer = TiposActoresSerializer(tipos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def listar_territorios(request):
    territorios = Territorio.objects.all()
    serializer = TerritorioSerializer(territorios, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def listar_monedass(request):
    monedas = Moneda.objects.all()
    serializer = MonedaSerializer(monedas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def registro_cliente(request):
    serializer = RegistroClienteSerializer(data=request.data)

    if serializer.is_valid():
        cliente = serializer.save()

        territorio_nombre = cliente.id_territorio.nombre_territorio if cliente.id_territorio else None

        EmailService.send_solicitud_recibida(
            cliente_email=cliente.id_usuario.email,
            cliente_nombre=cliente.nombre_completo,
            territorio=territorio_nombre,
        )

        if cliente.id_territorio:
            lider = Cliente.objects.filter(
                id_territorio=cliente.id_territorio,
                es_lider=True
            ).first()

            if lider:
                Aprobaciones.objects.create(
                    id_actor=cliente,
                    id_lider=lider,
                    estado_resultado='PENDIENTE',
                )
                EmailService.send_notificacion_lider(
                    lider_email=lider.id_usuario.email,
                    lider_nombre=lider.nombre_completo,
                    actor_nombre=cliente.nombre_completo,
                    territorio=territorio_nombre or '',
                )

        return Response({
            'mensaje': 'Solicitud Enviada con Éxito, en próximas horas su solicitud de registro será atendida',
            'correo': f'Se ha enviado información a su correo electrónico {cliente.id_usuario.email}',
            'cliente': ClienteSerializer(cliente).data
        }, status=status.HTTP_201_CREATED)

    return Response({
        'errores': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def obtener_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClienteSerializer(cliente)
    return Response(serializer.data)


@api_view(['GET'])
def listar_solicitudes(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no proporcionado'}, status=401)
    token = auth_header.split(' ')[1]

    from rest_framework_simplejwt.tokens import AccessToken
    try:
        access = AccessToken(token)
        user_id = access['user_id']
        cliente = Cliente.objects.get(id_usuario_id=user_id)
    except Exception:
        return Response({'error': 'Token inválido'}, status=401)

    solicitudes = Aprobaciones.objects.filter(
        id_lider=cliente
    ).select_related('id_actor__id_usuario', 'id_lider__id_usuario').prefetch_related('id_actor__tipos_actores__id_tipo')

    estado = request.GET.get('estado')
    if estado:
        solicitudes = solicitudes.filter(estado_resultado=estado)

    serializer = AprobacionesSerializer(solicitudes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def obtener_solicitud(request, pk):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no proporcionado'}, status=401)

    try:
        aprobacion = Aprobaciones.objects.select_related(
            'id_actor__id_usuario',
            'id_lider__id_usuario'
        ).prefetch_related('id_actor__tipos_actores__id_tipo').get(pk=pk)
    except Aprobaciones.DoesNotExist:
        return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AprobacionesSerializer(aprobacion)
    return Response(serializer.data)


@api_view(['PATCH'])
def actualizar_solicitud(request, pk):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no proporcionado'}, status=401)

    from rest_framework_simplejwt.tokens import AccessToken
    try:
        access = AccessToken(auth_header.split(' ')[1])
        user_id = access['user_id']
        cliente = Cliente.objects.get(id_usuario_id=user_id)
    except Exception:
        return Response({'error': 'Token inválido'}, status=401)

    try:
        aprobacion = Aprobaciones.objects.get(pk=pk, id_lider=cliente)
    except Aprobaciones.DoesNotExist:
        return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    estado = request.data.get('estado_resultado')
    observaciones = request.data.get('observaciones', '')

    if estado not in ['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO']:
        return Response({'error': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)

    aprobacion.estado_resultado = estado
    if observaciones:
        aprobacion.observaciones = observaciones

    if estado == 'APROBADO':
        aprobacion.id_actor.es_actor = True
        aprobacion.id_actor.save()
        EmailService.send_solicitud_aprobada(
            cliente_email=aprobacion.id_actor.id_usuario.email,
            cliente_nombre=aprobacion.id_actor.nombre_completo,
        )
        aprobacion.fecha_respuesta = timezone.now()
    elif estado == 'RECHAZADO':
        EmailService.send_solicitud_rechazada(
            cliente_email=aprobacion.id_actor.id_usuario.email,
            cliente_nombre=aprobacion.id_actor.nombre_completo,
            observaciones=observaciones,
        )
        aprobacion.fecha_respuesta = timezone.now()

    aprobacion.save()
    return Response(AprobacionesSerializer(aprobacion).data)


@api_view(['GET'])
def dashboard_lider(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no proporcionado'}, status=401)

    from rest_framework_simplejwt.tokens import AccessToken
    try:
        access = AccessToken(auth_header.split(' ')[1])
        user_id = access['user_id']
        cliente = Cliente.objects.get(id_usuario_id=user_id)
    except Exception:
        return Response({'error': 'Token inválido'}, status=401)

    total = Aprobaciones.objects.filter(id_lider=cliente).count()
    por_estado = Aprobaciones.objects.filter(id_lider=cliente).values('estado_resultado').annotate(c=Count('id'))
    resumen = {item['estado_resultado']: item['c'] for item in por_estado}

    return Response({
        'total': total,
        'pendientes': resumen.get('PENDIENTE', 0),
        'en_revision': resumen.get('EN_REVISION', 0),
        'aprobados': resumen.get('APROBADO', 0),
        'rechazados': resumen.get('RECHAZADO', 0),
    })


@api_view(['GET'])
def listar_solicitudes_pendientes(request):
    solicitudes = Aprobaciones.objects.filter(estado_resultado='PENDIENTE')
    serializer = AprobacionesSerializer(solicitudes, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@api_view(['PATCH'])
def aprobar_solicitud(request, pk):
    try:
        aprobacion = Aprobaciones.objects.get(pk=pk)
    except Aprobaciones.DoesNotExist:
        return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if aprobacion.estado_resultado != 'PENDIENTE':
        return Response({'error': 'Esta solicitud ya fue procesada'}, status=status.HTTP_400_BAD_REQUEST)

    aprobacion.estado_resultado = 'APROBADO'
    aprobacion.observaciones = request.data.get('observaciones', '')
    aprobacion.fecha_respuesta = timezone.now()
    aprobacion.save()

    aprobacion.id_actor.es_actor = True
    aprobacion.id_actor.save()

    EmailService.send_solicitud_aprobada(
        cliente_email=aprobacion.id_actor.id_usuario.email,
        cliente_nombre=aprobacion.id_actor.nombre_completo,
    )

    return Response(AprobacionesSerializer(aprobacion).data)


@api_view(['POST'])
@api_view(['PATCH'])
def rechazar_solicitud(request, pk):
    try:
        aprobacion = Aprobaciones.objects.get(pk=pk)
    except Aprobaciones.DoesNotExist:
        return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if aprobacion.estado_resultado != 'PENDIENTE':
        return Response({'error': 'Esta solicitud ya fue procesada'}, status=status.HTTP_400_BAD_REQUEST)

    aprobacion.estado_resultado = 'RECHAZADO'
    aprobacion.observaciones = request.data.get('observaciones', '')
    aprobacion.fecha_respuesta = timezone.now()
    aprobacion.save()

    EmailService.send_solicitud_rechazada(
        cliente_email=aprobacion.id_actor.id_usuario.email,
        cliente_nombre=aprobacion.id_actor.nombre_completo,
        observaciones=aprobacion.observaciones,
    )

    return Response(AprobacionesSerializer(aprobacion).data)