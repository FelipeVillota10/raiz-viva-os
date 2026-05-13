from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .CategoriaService import CategoriaService
from .CategoriaSerializer import CategoriaSerializer

class CategoriaController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = CategoriaService()

    def get(self, request):
        tipo = request.query_params.get('tipo')
        categorias = self.service.listar_categorias(tipo)
        serializer = CategoriaSerializer(categorias, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            nueva_categoria = self.service.crear_categoria(request.data)
            serializer = CategoriaSerializer(nueva_categoria)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)