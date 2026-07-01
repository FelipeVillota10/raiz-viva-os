from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from Paquete.PaqueteModel import Paquete
from .ConsolidadoExperienciaModel import ConsolidadoExperienciaModel
from .ConsolidadoExperienciaSerializer import (
    ConfirmarPagoPaqueteSerializer,
    ConsolidadoExperienciaSerializer,
)


class ConfirmarPagoPaqueteView(APIView):
    """
    Confirma el pago de un paquete completo.

    Toma el cliente desde el JWT del usuario autenticado, el paquete_id
    del body, y calcula el monto a partir de los items del paquete en NEON
    (nunca se confía en un monto enviado por el cliente). Guarda un único
    registro limpio en consolidado_experiencias con la fecha del servidor.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConfirmarPagoPaqueteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paquete_id = serializer.validated_data["paquete_id"]

        # usuario=request.user evita que un turista consolide el pago de un
        # paquete ajeno enviando un paquete_id que no le pertenece (IDOR).
        paquete = get_object_or_404(Paquete, id=paquete_id, usuario=request.user)

        if not paquete.items.exists():
            return Response(
                {"error": "El paquete no tiene experiencias para pagar.", "code": "EMPTY_PACKAGE"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cliente = getattr(request.user, "cliente", None)
        if cliente is None:
            return Response(
                {"error": "El usuario autenticado no tiene un perfil de cliente asociado.", "code": "NO_CLIENTE"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        consolidado = ConsolidadoExperienciaModel.objects.create(
            cliente=cliente,
            paquete=paquete,
            monto_pagado=paquete.calcular_total(),
            fecha_participacion=timezone.now(),
        )

        return Response(
            ConsolidadoExperienciaSerializer(consolidado).data,
            status=status.HTTP_201_CREATED,
        )
