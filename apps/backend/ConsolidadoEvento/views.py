from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .serializers import ConsolidadoEventoSerializer
from .services import ConsolidadoEventoService

class ConsolidadoEventoViewSet(viewsets.ViewSet):
    def list(self, request):
        consolidados = ConsolidadoEventoService.list_consolidados()
        serializer = ConsolidadoEventoSerializer(consolidados, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        consolidado = ConsolidadoEventoService.get_consolidado(pk)
        if consolidado:
            serializer = ConsolidadoEventoSerializer(consolidado)
            return Response(serializer.data)
        return Response({"error": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = ConsolidadoEventoSerializer(data=request.data)
        if serializer.is_valid():
            consolidado = ConsolidadoEventoService.create_consolidado(serializer.validated_data)
            return Response(ConsolidadoEventoSerializer(consolidado).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        consolidado = ConsolidadoEventoService.update_consolidado(pk, request.data)
        if consolidado:
            return Response(ConsolidadoEventoSerializer(consolidado).data)
        return Response({"error": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        if ConsolidadoEventoService.delete_consolidado(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
