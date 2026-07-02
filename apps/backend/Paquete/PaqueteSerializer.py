from rest_framework import serializers
from .PaqueteModel import Paquete, PaqueteItem
from EcoAventuras.EcoAventuraModel import EcoAventuraModel


class EcoAventuraResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcoAventuraModel
        fields = ["id", "nombre", "descripcion", "precio", "imagen_url", "duracion", "ubicacion"]


class PaqueteItemSerializer(serializers.ModelSerializer):
    ecoaventura = EcoAventuraResumenSerializer(read_only=True)
    ecoaventura_id = serializers.PrimaryKeyRelatedField(
        queryset=EcoAventuraModel.objects.all(), source="ecoaventura", write_only=True
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = PaqueteItem
        fields = ["id", "ecoaventura", "ecoaventura_id", "cantidad", "fecha_reserva", "num_personas", "subtotal", "agregado_en"]

    def get_subtotal(self, obj):
        return obj.subtotal()


class PaqueteSerializer(serializers.ModelSerializer):
    items = PaqueteItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    num_items = serializers.SerializerMethodField()
    # HU16.2: datos del turista autenticado dueño del paquete. Quedan disponibles
    # como datos estructurados para que Célula 4 (pagos) los consuma junto al total.
    usuario_id = serializers.IntegerField(read_only=True)
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Paquete
        fields = [
            "id", "session_key", "items", "total", "num_items",
            "usuario_id", "usuario_nombre", "creado_en", "actualizado_en",
        ]

    def get_total(self, obj):
        return obj.calcular_total()

    def get_num_items(self, obj):
        return obj.items.count()

    def get_usuario_nombre(self, obj):
        if not obj.usuario:
            return None
        return obj.usuario.get_full_name() or obj.usuario.username