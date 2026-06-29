from rest_framework import serializers

class GrowthSerializer(serializers.Serializer):
    usuarios_activos       = serializers.IntegerField()
    actores_activos        = serializers.IntegerField()
    eventos_realizados     = serializers.IntegerField()
    ventas_totales         = serializers.DecimalField(max_digits=14, decimal_places=2)
    ventas_actores_locales = serializers.DecimalField(max_digits=14, decimal_places=2)
    ventas_por_territorio  = serializers.ListField(child=serializers.DictField())