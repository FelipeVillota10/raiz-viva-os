from rest_framework import serializers
from Aprobaciones.AprobacionModel import AprobacionModel
from Clientes.ClienteSerializer import ClienteSerializer


class AprobacionesSerializer(serializers.ModelSerializer):
    actor_info = ClienteSerializer(source='id_actor', read_only=True)
    lider_info = ClienteSerializer(source='id_lider', read_only=True)

    class Meta:
        model = AprobacionModel
        fields = ['id_aprobacion', 'actor_info', 'lider_info', 'estado_resultado', 'observaciones', 'fecha_solicitud', 'fecha_respuesta']
        read_only_fields = ['fecha_solicitud', 'fecha_respuesta']