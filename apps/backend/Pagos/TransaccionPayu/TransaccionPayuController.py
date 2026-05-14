from rest_framework.views import APIView
from rest_framework.response import Response
from .TransaccionPayuService import TransaccionPayuService
from .TransaccionPayuSerializer import TransaccionPayuSerializer

class TransaccionPayuController(APIView):

    def get(self, request, id_pago):
        transacciones = TransaccionPayuService.listar_por_pago(id_pago)
        return Response(TransaccionPayuSerializer(transacciones, many=True).data)