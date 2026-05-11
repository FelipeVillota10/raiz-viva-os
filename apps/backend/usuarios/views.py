from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import TiposActores, Cliente, Aprobaciones, Territorio, Moneda
from .serializers import (
    RegistroClienteSerializer,
    TiposActoresSerializer,
    ClienteSerializer,
    AprobacionesSerializer,
    AprobarRechazarSerializer,
    TerritorioSerializer,
    MonedaSerializer,
)


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
def listar_monedas(request):
    monedas = Moneda.objects.all()
    serializer = MonedaSerializer(monedas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def registro_cliente(request):
    serializer = RegistroClienteSerializer(data=request.data)

    if serializer.is_valid():
        cliente = serializer.save()

        try:
            send_mail(
                subject='Solicitud de Registro - Raíz Viva',
                message=f'''
¡Hola {cliente.id_usuario.first_name}!

Tu solicitud de registro como Actor Territorial ha sido recibida exitosamente.

Detalles de tu solicitud:
- Nombre: {cliente.id_usuario.get_full_name()}
- Email: {cliente.id_usuario.email}
- Territorio: {cliente.id_territorio.nombre_territorio if cliente.id_territorio else 'No especificado'}
- Roles seleccionados: {', '.join([t.nombre_tipo.capitalize() for t in cliente.tipos_actores.all()])}

Tu solicitud está pendiente de aprobación. El líder territorial de tu territorio la revisará en las próximas horas.

¡Gracias por ser parte de Raíz Viva!

Atentamente,
El equipo de Raíz Viva
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[cliente.id_usuario.email],
                fail_silently=True,
            )
        except Exception:
            pass

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

    serializer = AprobarRechazarSerializer(data=request.data)
    if serializer.is_valid():
        aprobacion.estado_resultado = 'APROBADO'
        aprobacion.observaciones = serializer.validated_data.get('observaciones', '')
        aprobacion.fecha_respuesta = timezone.now()
        aprobacion.save()

        try:
            send_mail(
                subject='¡Solicitud Aprobada! - Raíz Viva',
                message=f'''
¡Hola {aprobacion.id_actor.id_usuario.first_name}!

Tu solicitud de registro ha sido APROBADA por el líder territorial.

¡Bienvenido a Raíz Viva!

Atentamente,
El equipo de Raíz Viva
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[aprobacion.id_actor.id_usuario.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(AprobacionesSerializer(aprobacion).data)

    return Response({'errores': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@api_view(['PATCH'])
def rechazar_solicitud(request, pk):
    try:
        aprobacion = Aprobaciones.objects.get(pk=pk)
    except Aprobaciones.DoesNotExist:
        return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if aprobacion.estado_resultado != 'PENDIENTE':
        return Response({'error': 'Esta solicitud ya fue procesada'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = AprobarRechazarSerializer(data=request.data)
    if serializer.is_valid():
        aprobacion.estado_resultado = 'RECHAZADO'
        aprobacion.observaciones = serializer.validated_data.get('observaciones', '')
        aprobacion.fecha_respuesta = timezone.now()
        aprobacion.save()

        try:
            send_mail(
                subject='Solicitud Rechazada - Raíz Viva',
                message=f'''
¡Hola {aprobacion.id_actor.id_usuario.first_name}!

Tu solicitud de registro ha sido RECHAZADA por el líder territorial.

Observaciones: {aprobacion.observaciones or 'Sin observaciones'}

Puedes volver a intentarlo contactando al líder territorial.

Atentamente,
El equipo de Raíz Viva
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[aprobacion.id_actor.id_usuario.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(AprobacionesSerializer(aprobacion).data)

    return Response({'errores': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)