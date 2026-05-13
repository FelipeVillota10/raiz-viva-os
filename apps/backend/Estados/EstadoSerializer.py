from rest_framework import serializers
from .EstadoModel import EstadoModel

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoModel
        fields = ['id', 'nombre_estado']