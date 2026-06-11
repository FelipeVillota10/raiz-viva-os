from rest_framework.generics import ListAPIView
from .ClienteModel import ClienteModel
from .ClienteSerializer import ClienteSerializer

# Vista para listar todos los clientes
class ClienteListView(ListAPIView):
    queryset = ClienteModel.objects.all()
    serializer_class = ClienteSerializer
