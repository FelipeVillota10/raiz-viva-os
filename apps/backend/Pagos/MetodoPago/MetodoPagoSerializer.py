from rest_framework import serializers
from .MetodoPagoModel import MetodoPagoModel

class MetodoPagoSerializer(serializers.ModelSerializer):

    class Meta:
        model = MetodoPagoModel
        fields = '__all__'


