from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
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
    AdminTerritorioSerializer,
    AdminLiderSerializer,
    EstadoSerializer,
)
from .permissions import IsAdmin
from django.contrib.auth.models import User
from Aprobaciones.AprobacionSerializer import AprobacionesSerializer
from Clientes.ClienteModel import ClienteModel
from Servicios.ServicioModel import ServicioModel, ClienteServicioModel
from Territorio.TerritorioModel import TerritorioModel
from Estados.EstadoModel import EstadoModel


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get('username', '')
        password = attrs.get('password', '')

        service = UsuarioService()
        cliente, error = service.authenticate(username, password)

        if error or not cliente:
            raise ValidationError({'detail': error or 'No se encontró un perfil asociado a esta cuenta'})

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(cliente.usuario)

        refresh['es_actor'] = cliente.es_actor
        refresh['es_lider'] = cliente.es_lider
        refresh['es_turista'] = cliente.es_turista
        refresh['es_admin'] = cliente.es_admin
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
    parser_classes = [JSONParser, MultiPartParser, FormParser]

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
        serializer = ClienteSerializer(cliente, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
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
        try:
            cliente = service.get_perfil(user_id)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=404)

        if 'descripcion' in request.data:
            descripcion = request.data['descripcion']
            if descripcion and len(descripcion) > 250:
                return Response({'error': 'La descripcion no puede exceder 250 caracteres'}, status=400)
            cliente.descripcion = descripcion if descripcion else None

        if 'nombre' in request.data:
            nombre = request.data['nombre']
            if nombre and len(nombre.strip()) >= 3:
                cliente.nombre = nombre.strip()

        if 'foto_perfil' in request.FILES:
            cliente.foto_perfil = request.FILES['foto_perfil']

        if 'foto_portada' in request.FILES:
            cliente.foto_portada = request.FILES['foto_portada']

        cliente.save()
        serializer = ClienteSerializer(cliente, context={'request': request})
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

        serializer = ClienteSerializer(cliente, context={'request': request})
        return Response(serializer.data)


class PerfilServiciosController(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_user_from_token(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            access = AccessToken(token)
            return access['user_id']
        except Exception:
            return None

    def get(self, request):
        user_id = self.get_user_from_token(request)
        if not user_id:
            return Response({'error': 'Token no proporcionado o invalido'}, status=401)

        try:
            cliente = ClienteModel.objects.get(usuario_id=user_id)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)

        servicios = ClienteServicioModel.objects.filter(cliente=cliente).select_related('servicio')
        data = [{
            'id': cs.id,
            'servicio_id': cs.servicio.id,
            'nombre': cs.servicio.nombre,
            'descripcion': cs.servicio.descripcion,
            'precio_acordado': cs.precio_acordado,
            'unidad': cs.servicio.unidad,
        } for cs in servicios]
        return Response(data)

    def post(self, request):
        user_id = self.get_user_from_token(request)
        if not user_id:
            return Response({'error': 'Token no proporcionado o invalido'}, status=401)

        try:
            cliente = ClienteModel.objects.get(usuario_id=user_id)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)

        servicio_id = request.data.get('servicio_id')
        precio_acordado = request.data.get('precio_acordado')

        if not servicio_id:
            return Response({'error': 'servicio_id es requerido'}, status=400)

        try:
            servicio = ServicioModel.objects.get(id=servicio_id)
        except ServicioModel.DoesNotExist:
            return Response({'error': 'Servicio no encontrado'}, status=404)

        if ClienteServicioModel.objects.filter(cliente=cliente, servicio=servicio).exists():
            return Response({'error': 'Ya tienes este servicio asignado'}, status=400)

        cs = ClienteServicioModel.objects.create(
            cliente=cliente,
            servicio=servicio,
            precio_acordado=precio_acordado
        )
        return Response({
            'id': cs.id,
            'servicio_id': cs.servicio.id,
            'nombre': cs.servicio.nombre,
            'precio_acordado': cs.precio_acordado,
        }, status=201)

    def patch(self, request, servicio_id):
        user_id = self.get_user_from_token(request)
        if not user_id:
            return Response({'error': 'Token no proporcionado o invalido'}, status=401)

        try:
            cliente = ClienteModel.objects.get(usuario_id=user_id)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)

        try:
            cs = ClienteServicioModel.objects.get(cliente=cliente, id=servicio_id)
        except ClienteServicioModel.DoesNotExist:
            return Response({'error': 'Servicio no encontrado'}, status=404)

        if 'precio_acordado' in request.data:
            cs.precio_acordado = request.data['precio_acordado']

        cs.save()
        return Response({
            'id': cs.id,
            'servicio_id': cs.servicio.id,
            'nombre': cs.servicio.nombre,
            'precio_acordado': cs.precio_acordado,
        })

    def delete(self, request, servicio_id):
        user_id = self.get_user_from_token(request)
        if not user_id:
            return Response({'error': 'Token no proporcionado o invalido'}, status=401)

        try:
            cliente = ClienteModel.objects.get(usuario_id=user_id)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=404)

        try:
            cs = ClienteServicioModel.objects.get(cliente=cliente, id=servicio_id)
        except ClienteServicioModel.DoesNotExist:
            return Response({'error': 'Servicio no encontrado'}, status=404)

        cs.delete()
        return Response({'mensaje': 'Servicio eliminado'}, status=200)


class AdminTerritoriosController(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, pk=None):
        if pk:
            try:
                territorio = TerritorioModel.objects.select_related(
                    'estado', 'administrador'
                ).get(id_territorio=pk)
            except TerritorioModel.DoesNotExist:
                return Response({'error': 'Territorio no encontrado'}, status=404)
            serializer = AdminTerritorioSerializer(territorio)
            return Response(serializer.data)

        territorios = TerritorioModel.objects.select_related(
            'estado', 'administrador'
        ).all()
        serializer = AdminTerritorioSerializer(territorios, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            territorio = TerritorioModel.objects.get(id_territorio=pk)
        except TerritorioModel.DoesNotExist:
            return Response({'error': 'Territorio no encontrado'}, status=404)

        if 'nombre_territorio' in request.data:
            nombre = request.data['nombre_territorio']
            if nombre and len(nombre.strip()) >= 2:
                territorio.nombre_territorio = nombre.strip()

        if 'region' in request.data:
            region = request.data['region']
            territorio.region = region if region else None

        if 'id_estado' in request.data:
            try:
                estado = EstadoModel.objects.get(id=request.data['id_estado'])
                territorio.estado = estado
            except EstadoModel.DoesNotExist:
                return Response({'error': 'Estado no encontrado'}, status=400)

        if 'administrador_activo' in request.data and territorio.administrador:
            activo = request.data['administrador_activo']
            if isinstance(activo, str):
                activo = activo.lower() in ('true', '1', 'yes')
            territorio.administrador.activo = bool(activo)
            territorio.administrador.save()

        territorio.save()
        serializer = AdminTerritorioSerializer(territorio)
        return Response(serializer.data)

    def post(self, request):
        nombre = request.data.get('nombre_territorio')
        region = request.data.get('region')
        id_administrador = request.data.get('id_administrador')

        if not nombre:
            return Response({'error': 'nombre_territorio es requerido'}, status=400)
        if not region:
            return Response({'error': 'region es requerido'}, status=400)
        if not id_administrador:
            return Response({'error': 'id_administrador es requerido'}, status=400)

        try:
            estado = EstadoModel.objects.get(nombre_estado='activo')
        except EstadoModel.DoesNotExist:
            return Response({'error': 'Estado activo no encontrado en el sistema'}, status=500)

        try:
            administrador = ClienteModel.objects.get(id_cliente=id_administrador)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Administrador no encontrado'}, status=400)

        if not administrador.es_lider:
            return Response({'error': 'El administrador debe ser un lider'}, status=400)

        if TerritorioModel.objects.filter(administrador=administrador).exists():
            return Response({'error': 'Este lider ya tiene un territorio asignado'}, status=400)

        territorio = TerritorioModel.objects.create(
            nombre_territorio=nombre.strip(),
            region=region.strip(),
            estado=estado,
            administrador=administrador,
        )

        serializer = AdminTerritorioSerializer(territorio)
        return Response(serializer.data, status=201)


class AdminLideresController(APIView):
    permission_classes = [IsAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, pk=None):
        if pk:
            try:
                lider = ClienteModel.objects.select_related('usuario').get(id_cliente=pk, es_lider=True)
            except ClienteModel.DoesNotExist:
                return Response({'error': 'Lider no encontrado'}, status=404)
            serializer = ClienteSerializer(lider, context={'request': request})
            return Response(serializer.data)

        lideres = ClienteModel.objects.filter(es_lider=True).select_related('usuario')
        if request.query_params.get('disponibles') == 'true':
            ids_con_territorio = TerritorioModel.objects.values_list('administrador_id', flat=True)
            lideres = lideres.exclude(id_cliente__in=ids_con_territorio)
        serializer = AdminLiderSerializer(lideres, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            lider = ClienteModel.objects.select_related('usuario').get(id_cliente=pk, es_lider=True)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Lider no encontrado'}, status=404)

        if 'nombre' in request.data:
            nombre = request.data['nombre']
            if nombre and len(nombre.strip()) >= 3:
                lider.nombre = nombre.strip()

        if 'telefono' in request.data:
            lider.telefono = request.data['telefono']

        if 'activo' in request.data:
            activo = request.data['activo']
            if isinstance(activo, str):
                activo = activo.lower() in ('true', '1', 'yes')
            lider.activo = bool(activo)

        if 'email' in request.data:
            email = request.data['email']
            if email:
                user = lider.usuario
                if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                    return Response({'error': 'Este correo ya esta siendo usado por otro usuario'}, status=400)
                user.email = email
                user.save()

        if 'foto_perfil' in request.FILES:
            lider.foto_perfil = request.FILES['foto_perfil']

        if 'territorio_id' in request.data:
            nuevo_territorio_id = request.data['territorio_id']
            territorio_actual = TerritorioModel.objects.filter(administrador=lider).first()

            if nuevo_territorio_id and nuevo_territorio_id != 'null' and nuevo_territorio_id != '':
                try:
                    nuevo_territorio_id = int(nuevo_territorio_id)
                except (ValueError, TypeError):
                    return Response({'error': 'territorio_id invalido'}, status=400)

                if territorio_actual and territorio_actual.id_territorio == nuevo_territorio_id:
                    pass
                else:
                    if territorio_actual:
                        territorio_actual.administrador = None
                        territorio_actual.save()

                    try:
                        nuevo_territorio = TerritorioModel.objects.get(id_territorio=nuevo_territorio_id)
                    except TerritorioModel.DoesNotExist:
                        return Response({'error': 'Territorio no encontrado'}, status=400)

                    if nuevo_territorio.administrador and nuevo_territorio.administrador != lider:
                        return Response({'error': 'Este territorio ya tiene un lider asignado'}, status=400)

                    nuevo_territorio.administrador = lider
                    nuevo_territorio.save()
            else:
                if territorio_actual:
                    territorio_actual.administrador = None
                    territorio_actual.save()

        lider.save()
        serializer = ClienteSerializer(lider, context={'request': request})
        return Response(serializer.data)


class EstadosController(APIView):
    def get(self, request):
        estados = EstadoModel.objects.all()
        serializer = EstadoSerializer(estados, many=True)
        return Response(serializer.data)


class ActoresLiderController(APIView):
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
        try:
            lider = service.get_perfil(user_id)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=404)

        if not lider.es_lider:
            return Response({'error': 'No tienes permisos de lider'}, status=403)

        actores = service.get_actores_by_lider(lider)
        return Response(actores)


class DeshabilitarActorController(APIView):
    def patch(self, request, actor_id):
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
        try:
            lider = service.get_perfil(user_id)
        except ClienteModel.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=404)

        if not lider.es_lider:
            return Response({'error': 'No tienes permisos de lider'}, status=403)

        accion = request.data.get('accion', 'deshabilitar')
        if accion == 'habilitar':
            success, message = service.habilitar_actor(actor_id, lider)
        else:
            success, message = service.deshabilitar_actor(actor_id, lider)

        if success:
            return Response({'mensaje': message}, status=200)
        else:
            return Response({'error': message}, status=400)