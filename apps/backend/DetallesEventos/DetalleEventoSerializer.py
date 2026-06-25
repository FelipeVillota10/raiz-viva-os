from rest_framework import serializers
from DetallesEventos.DetalleEventoModel import DetalleEventoModel



class DetalleEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleEventoModel
        fields = ['id_detalle', 'id_evento', 'distribucion_pago', 'id_estado', 'id_colaboradores']