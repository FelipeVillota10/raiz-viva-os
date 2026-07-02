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

        # Generar los tiquetes correspondientes a las ecoaventuras del paquete
        from Experiencia.ExperienciaModel import ExperienciaModel
        from Tiquetes.TiqueteModel import Tiquete
        from Estados.EstadoModel import EstadoModel
        import uuid
        from datetime import timedelta
        
        try:
            estado_activo = EstadoModel.objects.get(id=9)
        except EstadoModel.DoesNotExist:
            estado_activo = EstadoModel.objects.first()
            
        for item in paquete.items.all():
            # Crear un registro de ExperienciaModel para representar esta eco-aventura comprada
            experiencia = ExperienciaModel.objects.create(
                territorio=item.ecoaventura.territorio,
                costo_total=item.subtotal(),
                nombre=item.ecoaventura.nombre,
                descripcion=item.ecoaventura.descripcion
            )
            
            # Crear tiquetes individuales para cada persona/participante
            for _ in range(item.num_personas):
                Tiquete.objects.create(
                    id_cliente=cliente,
                    id_estado=estado_activo,
                    id_experiencia=experiencia,
                    codigo=str(uuid.uuid4()).upper()[:12],
                    fecha_vencimiento=timezone.now() + timedelta(days=30)
                )

        return Response(
            ConsolidadoExperienciaSerializer(consolidado).data,
            status=status.HTTP_201_CREATED,
        )


from rest_framework import viewsets
from rest_framework.permissions import AllowAny

class ConsolidadoExperienciaViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = ConsolidadoExperienciaModel.objects.all()
    serializer_class = ConsolidadoExperienciaSerializer
