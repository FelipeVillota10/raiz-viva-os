from rest_framework.views import APIView
from rest_framework.response import Response
from .TransaccionMPService import TransaccionMPService
from .TransaccionMPSerializer import TransaccionMPSerializer


class TransaccionMPController(APIView):

    def get(self, request, id_pago):
        transacciones = TransaccionMPService.listar_por_pago(id_pago)
        return Response(TransaccionMPSerializer(transacciones, many=True).data)
