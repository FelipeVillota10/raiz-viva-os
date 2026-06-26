from rest_framework import serializers


class IniciarPagoSerializer(serializers.Serializer):
    monto = serializers.DecimalField(max_digits=12, decimal_places=2)
    moneda = serializers.CharField(default='COP', required=False, allow_blank=True)
    email_comprador = serializers.EmailField()
    nombre_comprador = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(max_length=255, required=False, allow_blank=True)
    codigo_cupon = serializers.CharField(max_length=50, required=False, allow_blank=True)
    id_cliente = serializers.IntegerField(required=False, allow_null=True)
    id_evento = serializers.IntegerField(required=False, allow_null=True)
    frontend_base_url = serializers.URLField(required=False, allow_blank=True)
