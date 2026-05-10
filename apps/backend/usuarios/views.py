from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Role
from .serializers import (
    RegistroActorTerritorialSerializer,
    RoleSerializer,
    ActorTerritorialSerializer,
    SolicitudRegistroSerializer
)


@api_view(['GET'])
def listar_roles(request):
    roles = Role.objects.all()
    serializer = RoleSerializer(roles, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def registro_actor_territorial(request):
    serializer = RegistroActorTerritorialSerializer(data=request.data)

    if serializer.is_valid():
        actor = serializer.save()

        try:
            send_mail(
                subject='Solicitud de Registro - Raíz Viva',
                message=f'''
¡Hola {actor.usuario.first_name}!

Tu solicitud de registro como Actor Territorial ha sido recibida exitosamente.

Detalles de tu solicitud:
- Nombre: {actor.usuario.get_full_name()}
- Email: {actor.usuario.email}
- Sector: {actor.get_sector_display()}
- Roles seleccionados: {', '.join([r.nombre.capitalize() for r in actor.roles.all()])}

Tu solicitud está pendiente de aprobación. El líder territorial de tu territorio la revisará en las próximas horas.

¡Gracias por ser parte de Raíz Viva!

Atentamente,
El equipo de Raíz Viva
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[actor.usuario.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            'mensaje': 'Solicitud Enviada con Éxito, en próximas horas su solicitud de registro será atendida',
            'correo': f'Se ha enviado información a su correo electrónico {actor.usuario.email}',
            'actor': ActorTerritorialSerializer(actor).data
        }, status=status.HTTP_201_CREATED)

    return Response({
        'errores': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def obtener_actor(request, pk):
    try:
        actor = ActorTerritorial.objects.get(pk=pk)
    except ActorTerritorial.DoesNotExist:
        return Response({'error': 'Actor no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ActorTerritorialSerializer(actor)
    return Response(serializer.data)