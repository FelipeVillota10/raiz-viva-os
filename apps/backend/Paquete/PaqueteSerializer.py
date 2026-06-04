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

    class Meta:
        model = Paquete
        fields = ["id", "session_key", "items", "total", "num_items", "creado_en", "actualizado_en"]

    def get_total(self, obj):
        return obj.calcular_total()

    def get_num_items(self, obj):
        return obj.items.count()