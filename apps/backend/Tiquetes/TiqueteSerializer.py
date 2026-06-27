from rest_framework import serializers
from .TiqueteModel import Tiquete

class TiqueteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tiquete
        fields = '__all__'
