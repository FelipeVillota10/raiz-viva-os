from rest_framework import serializers
from .CategoriaModel import CategoriaModel

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaModel
        fields = ['id', 'nombre', 'descripcion', 'tipo']