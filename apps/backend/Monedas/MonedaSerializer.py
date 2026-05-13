from rest_framework import serializers
from .MonedaModel import MonedaModel

class MonedaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonedaModel
        fields = ['id', 'nombre', 'simbolo']