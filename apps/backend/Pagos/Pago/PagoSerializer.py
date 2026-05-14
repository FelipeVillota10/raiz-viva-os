from rest_framework import serializers
from .PagoModel import PagoModel

class PagoSerializer(serializers.ModelSerializer):

    class Meta:
        model = PagoModel
        fields = '__all__'
        read_only_fields = ['referencia', 'fecha_creacion', 'fecha_confirmacion']

class IniciarPagoSerializer(serializers.Serializer):
    # Lo que el front manda para poder inicializar el pago
    id_metodo_pago = serializers.IntegerField()
    monto = serializers.DecimalField(max_digits=10, decimal_places=2)
    moneda = serializers.CharField(default='COP')
    email_comprador = serializers.EmailField()
    nombre_comprador = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(max_length=255)
    codigo_cupon = serializers.CharField(max_length=50, required=False, allow_blank=True)

