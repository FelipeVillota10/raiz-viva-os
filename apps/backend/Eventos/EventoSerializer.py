from rest_framework import serializers
from .EventoModel import EventoModel
from DetallesEventos.DetalleEventoSerializer import DetalleEventoSerializer
from Productos.ProductoSerializer import ProductoSerializer



class EventoSerializer(serializers.ModelSerializer):
    
    detalle = DetalleEventoSerializer(
        source='detalleeventomodel_set',
        many=True,
        read_only=True
    )
    productos = ProductoSerializer(
        source='productomodel_set',
        many=True,
        read_only=True
    )
    
    class Meta:
        model = EventoModel
        fields = [
            'id_evento', 'nombre', 'descripcion', 'costo_evento',
            'capacidad', 'fecha_inicio', 'fecha_fin', 'es_gratuito',
            'id_estado', 'id_territorio', 'id_actor_principal',
            'imagen', 'detalle', 'productos'
            
        ]

    def validate_imagen(self, value):
        if value:
            # Validar tamaño máx 5MB
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("La imagen no puede superar los 5MB.")
            # Validar formato
            if not value.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                raise serializers.ValidationError("Solo se permiten imágenes JPG o PNG.")
        return value