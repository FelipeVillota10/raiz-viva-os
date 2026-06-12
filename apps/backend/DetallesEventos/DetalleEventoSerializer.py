from rest_framework import serializers
from DetallesEventos.DetalleEventoModel import DetalleEventoModel



class DetalleEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleEventoModel
        fields = ['id_detalle', 'distribucion_pago', 'es_local', 'colaboradores']