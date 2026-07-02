from rest_framework import serializers
from .ConsolidadoExperienciaModel import ConsolidadoExperienciaModel
from Paquete.PaqueteSerializer import PaqueteSerializer


class ConfirmarPagoPaqueteSerializer(serializers.Serializer):
    """Valida el body del POST que confirma el pago de un paquete."""
    paquete_id = serializers.IntegerField(min_value=1)


class ConsolidadoExperienciaSerializer(serializers.ModelSerializer):
    """Representa el registro ya guardado en consolidado_experiencias."""
    paquete = PaqueteSerializer(read_only=True)

    class Meta:
        model = ConsolidadoExperienciaModel
        fields = [
            "id_consolidado_exp",
            "cliente",
            "paquete",
            "monto_pagado",
            "fecha_participacion",
        ]
        read_only_fields = fields
