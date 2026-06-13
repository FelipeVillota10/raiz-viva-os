from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .CategoriaEventoService import CategoriaEventoService
from .CategoriaEventoSerializer import CategoriaEventoSerializer

class CategoriaEventoController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = CategoriaEventoService()

    def get(self, request, pk=None):
        if pk:
            categoria = self.service.obtener_categoria(pk)
            if not categoria:
                return Response({"error": "Categoría no encontrada."}, status=status.HTTP_404_NOT_FOUND)
            serializer = CategoriaEventoSerializer(categoria)
        else:
            categorias = self.service.listar_categorias()
            serializer = CategoriaEventoSerializer(categorias, many=True)
        return Response(serializer.data)