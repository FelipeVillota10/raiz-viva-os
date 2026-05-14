from rest_framework import serializers
from .PayuLogModel import PayuLogModel

class PayuLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = PayuLogModel
        fields = '__all__'
