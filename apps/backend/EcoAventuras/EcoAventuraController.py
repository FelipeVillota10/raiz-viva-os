from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.conf import settings

from .EcoAventuraService import EcoAventuraService
from .EcoAventuraSerializer import (
    EcoAventuraListSerializer,
    EcoAventuraDetailSerializer,
    EcoAventuraWriteSerializer,
    EcoAventuraItinerarioSerializer,
)


@api_view(['GET', 'POST'])
def ecoaventuras(request):
    if request.method == 'GET':
        paginado = EcoAventuraService.listar_activas(request.query_params)
        serializer = EcoAventuraListSerializer(paginado['results'], many=True)
        return Response({
            'count': paginado['count'],
            'total_pages': paginado['total_pages'],
            'page': paginado['page'],
            'page_size': paginado['page_size'],
            'results': serializer.data,
        })

    # POST — crear nueva eco-aventura
    serializer = EcoAventuraWriteSerializer(data=request.data)
    if serializer.is_valid():
        nueva = EcoAventuraService.crear(serializer.validated_data)
        return Response(
            EcoAventuraDetailSerializer(nueva).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def ecoaventuras_admin(request):
    todas = EcoAventuraService.listar_todas()
    serializer = EcoAventuraDetailSerializer(todas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ecoaventuras_mine(request):
    """Retorna las eco-aventuras creadas por el actor autenticado."""
    # Intentar obtener el id_cliente del usuario autenticado
    try:
        cliente = getattr(request.user, 'cliente', None)
        if not cliente:
            return Response({'detail': 'Perfil de cliente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        id_cliente = getattr(cliente, 'id_cliente', None)
        if not id_cliente:
            return Response({'detail': 'Cliente inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        propias = EcoAventuraService.listar_por_cliente(id_cliente)
        serializer = EcoAventuraDetailSerializer(propias, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'detail': 'Error al obtener eco-aventuras del usuario.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_eco_image(request):
    """Sube una imagen para eco-aventura y devuelve la URL pública."""
    if 'imagen' not in request.FILES:
        return Response({'error': 'Archivo no proporcionado. Use el campo "imagen".'}, status=status.HTTP_400_BAD_REQUEST)
    imagen = request.FILES['imagen']
    try:
        path = default_storage.save(f'ecoaventuras/{imagen.name}', imagen)
        url = request.build_absolute_uri(settings.MEDIA_URL + path)
        return Response({'url': url}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': 'Error al guardar la imagen.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'PATCH'])
def ecoaventura_detalle(request, id):
    if request.method == 'GET':
        eco = EcoAventuraService.obtener(id)
        if not eco:
            return Response({'error': 'Eco-aventura no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(EcoAventuraDetailSerializer(eco).data)

    if request.method == 'PUT':
        eco = EcoAventuraService.obtener(id)
        if not eco:
            return Response({'error': 'Eco-aventura no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EcoAventuraWriteSerializer(eco, data=request.data)
        if serializer.is_valid():
            actualizada = EcoAventuraService.actualizar(id, serializer.validated_data)
            return Response(EcoAventuraDetailSerializer(actualizada).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PATCH — actualización parcial (toggle activo u otros campos)
    eco = EcoAventuraService.obtener(id)
    if not eco:
        return Response({'error': 'Eco-aventura no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    if 'toggle_activo' in request.data:
        eco = EcoAventuraService.toggle_activo(id)
        return Response(EcoAventuraDetailSerializer(eco).data)

    serializer = EcoAventuraWriteSerializer(eco, data=request.data, partial=True)
    if serializer.is_valid():
        actualizada = EcoAventuraService.actualizar(id, serializer.validated_data)
        return Response(EcoAventuraDetailSerializer(actualizada).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def ecoaventura_itinerario(request, id):
    if request.method == 'GET':
        itinerario = EcoAventuraService.obtener_itinerario(id)
        if not itinerario:
            return Response({'itinerario': None})
        return Response(EcoAventuraItinerarioSerializer(itinerario).data)

    # POST — crear o actualizar itinerario
    serializer = EcoAventuraItinerarioSerializer(data=request.data)
    if serializer.is_valid():
        itinerario = EcoAventuraService.guardar_itinerario(id, serializer.validated_data)
        if not itinerario:
            return Response({'error': 'Eco-aventura no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(EcoAventuraItinerarioSerializer(itinerario).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
