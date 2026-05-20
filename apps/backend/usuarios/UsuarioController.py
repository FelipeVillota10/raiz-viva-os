from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import AccessToken
from .services import UsuarioService
from .serializers import (
    RegistroClienteSerializer,
    TiposActoresSerializer,
    ClienteSerializer,
    TerritorioSerializer,
    MonedaSerializer,
)
from Aprobaciones.AprobacionSerializer import AprobacionesSerializer
from Clientes.ClienteModel import ClienteModel


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get('username', '')
        password = attrs.get('password', '')

        service = UsuarioService()
        cliente, error = service.authenticate(username, password)

        if error:
            raise ValidationError({'detail': error})

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(cliente.usuario)

        if cliente:
            refresh['es_actor'] = cliente.es_actor
            refresh['es_lider'] = cliente.es_lider
            refresh['es_turista'] = cliente.es_turista
            refresh['nombre_completo'] = cliente.nombre
            refresh['territorio'] = cliente.estado.nombre_estado if cliente.estado else None

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    class Meta:
        model = ClienteModel
        fields = ()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class PerfilUsuarioController(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token no proporcionado'}, status=401)

        token = auth_header.split(' ')[1]
        try:
            access = AccessToken(token)
            user_id = access['user_id']
        except Exception:
            return Response({'error': 'Token invalido o expirado'}, status=401)

        service = UsuarioService()
        cliente = service.get_perfil(user_id)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)


class TiposActoresController(APIView):
    def get(self, request):
        service = UsuarioService()
        tipos = service.listar_tipos_actores()
        serializer = TiposActoresSerializer(tipos, many=True)
        return Response(serializer.data)


class TerritoriosController(APIView):
    def get(self, request):
        service = UsuarioService()
        territorios = service.listar_territorios()
        serializer = TerritorioSerializer(territorios, many=True)
        return Response(serializer.data)


class MonedasController(APIView):
    def get(self, request):
        service = UsuarioService()
        monedas = service.listar_monedas()
        serializer = MonedaSerializer(monedas, many=True)
        return Response(serializer.data)


class RegistroClienteController(APIView):
    def post(self, request):
        serializer = RegistroClienteSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({'errores': serializer.errors}, status=400)

        service = UsuarioService()
        cliente = service.register_cliente(serializer.validated_data)
        service.send_registration_notifications(cliente)

        if cliente.es_turista:
            mensaje = 'Registro completado. Ya puedes iniciar sesion con tu correo y contrasena.'
            correo_txt = f'Te enviamos un correo de bienvenida a {cliente.usuario.email}.'
        else:
            mensaje = 'Solicitud Enviada con Exito, en proximas horas su solicitud de registro sera atendida'
            correo_txt = f'Se ha enviado informacion a su correo electronico {cliente.usuario.email}'

        return Response({
            'mensaje': mensaje,
            'correo': correo_txt,
            'cliente': ClienteSerializer(cliente).data
        }, status=201)


class ClienteController(APIView):
    def get(self, request, pk):
        service = UsuarioService()
        try:
            cliente = service.get_cliente(pk)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)

        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)