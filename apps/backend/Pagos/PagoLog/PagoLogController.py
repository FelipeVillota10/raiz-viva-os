from rest_framework.views import APIView
from rest_framework.response import Response
from .PagoLogService import PagoLogService
from .PagoLogSerializer import PagoLogSerializer


class PagoLogController(APIView):

    def get(self, request, id_pago):
        logs = PagoLogService.listar_por_pago(id_pago)
        return Response(PagoLogSerializer(logs, many=True).data)
