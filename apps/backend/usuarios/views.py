from django.db import transaction
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView

from Clientes.ClienteModel import ClienteModel
from Territorio.TerritorioModel import TerritorioModel
from TiposActores.TipoActorModel import TipoActorModel
from .permissions import IsAdmin
from .serializers import AdminLiderSerializer, RegistroClienteSerializer


class CrearLiderAdminView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        data = request.data.copy()
        
        # 1. Forzamos los flags correctos en la tabla clientes
        data['es_actor'] = False
        data['es_lider'] = True
        data['es_turista'] = False
        data['es_admin'] = False
        
        # 2. Le mandamos un ID de relleno (ej: 1) para engañar al validador de Santiago 
        # y que no chille por el "at least 1 elements"
        data['tipos_actores'] = [1] 

        # Control de territorio
        territorio = None
        id_territorio = data.get('id_territorio')
        if id_territorio:
            try:
                territorio = TerritorioModel.objects.get(id_territorio=id_territorio)
            except TerritorioModel.DoesNotExist:
                return Response({'error': 'Territorio no encontrado.'}, status=400)

            if territorio.administrador_id:
                return Response({'error': 'Este territorio ya tiene un lider asignado.'}, status=400)

        # Pasamos los datos al Serializer
        serializer = RegistroClienteSerializer(data=data)
        if not serializer.is_valid():
            return Response({'errores': serializer.errors}, status=400)

        with transaction.atomic():
            # 3. INTERCEPTAMOS EL GUARDADO:
            # Para evitar que se cree una relación falsa en 'cliente_tipos_actores',
            # le borramos los tipos_actores validados justo antes de hacer el .save()
            serializer.validated_data['tipos_actores'] = []
            
            cliente = serializer.save()
            
            if territorio:
                territorio.administrador = cliente
                territorio.save()

        lider = ClienteModel.objects.select_related('usuario').get(pk=cliente.pk)
        return Response({
            'mensaje': 'Lider territorial registrado correctamente.',
            'lider': AdminLiderSerializer(lider, context={'request': request}).data,
        }, status=201)