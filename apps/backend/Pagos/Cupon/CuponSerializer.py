from rest_framework import serializers
from .CuponModel import CuponModel


class CuponSerializer(serializers.ModelSerializer):
    disponible = serializers.SerializerMethodField()

    class Meta:
        model = CuponModel
        fields = '__all__'

    def get_disponible(self, obj):
        from django.utils import timezone
        hoy = timezone.now().date()
        return (
            obj.fecha_inicio.date() <= hoy <= obj.fecha_fin.date()
            and obj.veces_usado < obj.usos
        )
