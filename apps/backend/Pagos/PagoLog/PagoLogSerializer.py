from rest_framework import serializers
from .PagoLogModel import PagoLogModel


class PagoLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = PagoLogModel
        fields = '__all__'
