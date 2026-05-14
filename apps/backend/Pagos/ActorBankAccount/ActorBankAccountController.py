from rest_framework.views import APIView
from rest_framework.response import Response
from .ActorBankAccountService import ActorBankAccountService
from .ActorBankAccountSerializer import ActorBankAccountSerializer

class ActorBankAccountController(APIView):

    def get(self, request, id_actor):
        cuentas = ActorBankAccountService.listar_cuentas(id_actor)
        return Response(ActorBankAccountSerializer(cuentas, many=True).data)

    def post(self, request):
        s = ActorBankAccountSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)
        cuenta = ActorBankAccountService.registrar_cuenta(s.validated_data)
        return Response(ActorBankAccountSerializer(cuenta).data, status=201)