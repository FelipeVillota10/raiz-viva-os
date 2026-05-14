from rest_framework.views import APIView
from rest_framework.response import Response
from .CuponService import CuponService
from .CuponSerializer import CuponSerializer

class CuponController(APIView):

    def get(self, request):
        #Validar si un cupón es válido antes de pagar
        codigo = request.query_params.get('codigo')
        try:
            cupon = CuponService.validar_cupon(codigo)
            return Response(CuponSerializer(cupon).data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)