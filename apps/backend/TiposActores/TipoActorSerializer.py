from rest_framework import serializers
from .TipoActorModel import TipoActorModel

class TipoActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoActorModel
        fields = ['id', 'nombre_tipo', 'descripcion']