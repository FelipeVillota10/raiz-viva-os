from rest_framework.views import APIView
from rest_framework.response import Response
from .PayuLogService import PayuLogService
from .PayuLogSerializer import PayuLogSerializer

class PayuLogController(APIView):

    def get(self, request, id_pago):
        logs = PayuLogService.listar_por_pago(id_pago)
        return Response(PayuLogSerializer(logs, many=True).data)