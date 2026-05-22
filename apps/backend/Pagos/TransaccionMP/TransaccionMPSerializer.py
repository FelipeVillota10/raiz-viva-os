from rest_framework import serializers
from .TransaccionMPModel import TransaccionMPModel


class TransaccionMPSerializer(serializers.ModelSerializer):

    class Meta:
        model = TransaccionMPModel
        fields = '__all__'
