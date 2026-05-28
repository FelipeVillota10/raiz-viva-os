from rest_framework import serializers
from .ComentarioModel import ComentarioModel

class ComentarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = ComentarioModel
        fields = '__all__'