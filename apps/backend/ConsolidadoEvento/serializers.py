from rest_framework import serializers
from .ConsolidadoEventoModel import ConsolidadoEventoModel

class ConsolidadoEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsolidadoEventoModel
        fields = '__all__'
