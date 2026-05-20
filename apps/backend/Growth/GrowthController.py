from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .GrowthService import GrowthService
from .GrowthSerializer import GrowthSerializer

class GrowthController(APIView):
    #permission_classes = [IsAuthenticated]
    permission_classes = []

    def get(self, request):
        service = GrowthService()
        metrics = service.get_dashboard_metrics()
        serializer = GrowthSerializer(metrics)
        return Response(serializer.data)