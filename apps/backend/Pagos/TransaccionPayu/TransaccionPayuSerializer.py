from rest_framework import serializers
from .TransaccionPayuModel import TransaccionPayuModel

class TransaccionPayuSerializer(serializers.ModelSerializer):

    class Meta:
        model = TransaccionPayuModel
        fields = '__all__'