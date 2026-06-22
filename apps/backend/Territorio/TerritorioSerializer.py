from rest_framework import serializers
from .TerritorioModel import TerritorioModel

class TerritorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerritorioModel
        fields = ['id_territorio', 'nombre_territorio', 'region']
