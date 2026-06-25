from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .TiqueteSerializer import TiqueteSerializer
from .TiqueteService import TiqueteService

class TiqueteController(viewsets.ViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TiqueteService()

    def list(self, request):
        id_cliente = request.query_params.get('cliente')
        if id_cliente:
            tiquetes = self.service.get_tiquetes_by_cliente(id_cliente)
        else:
            tiquetes = self.service.get_all_tiquetes()
        serializer = TiqueteSerializer(tiquetes, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        tiquete = self.service.get_tiquete_by_id(pk)
        if tiquete:
            serializer = TiqueteSerializer(tiquete)
            return Response(serializer.data)
        return Response({"error": "Tiquete no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        # Allow creating standard tiquetes via API
        # Or automatically generate them using the service
        accion = request.data.get('accion')
        
        if accion == 'generar':
            id_cliente = request.data.get('id_cliente')
            id_evento = request.data.get('id_evento')
            id_experiencia = request.data.get('id_experiencia')
            
            if not id_cliente:
                return Response({"error": "id_cliente es requerido"}, status=status.HTTP_400_BAD_REQUEST)
                
            try:
                tiquete = self.service.generate_tiquete(id_cliente, id_evento, id_experiencia)
                serializer = TiqueteSerializer(tiquete)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Standard creation if all fields passed
        serializer = TiqueteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        tiquete = self.service.update_tiquete(pk, request.data)
        if tiquete:
            serializer = TiqueteSerializer(tiquete)
            return Response(serializer.data)
        return Response({"error": "Tiquete no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        success = self.service.delete_tiquete(pk)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Tiquete no encontrado"}, status=status.HTTP_404_NOT_FOUND)
