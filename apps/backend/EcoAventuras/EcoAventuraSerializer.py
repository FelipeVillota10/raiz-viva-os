from rest_framework import serializers
from .EcoAventuraModel import EcoAventuraModel, EcoAventuraItinerario


class EcoAventuraItinerarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcoAventuraItinerario
        exclude = ['ecoaventura']


class EcoAventuraListSerializer(serializers.ModelSerializer):
    """Serializer liviano para el catálogo del turista."""
    dificultad_display = serializers.CharField(source='get_dificultad_display', read_only=True)
    duracion_display = serializers.SerializerMethodField()

    class Meta:
        model = EcoAventuraModel
        fields = [
            'id', 'nombre', 'imagen_url', 'precio',
            'ubicacion', 'dificultad', 'dificultad_display',
            'duracion', 'duracion_display',
            'capacidad_maxima',
        ]

    def get_duracion_display(self, obj):
        if obj.duracion < 24:
            return f'{obj.duracion} hora{"s" if obj.duracion != 1 else ""}'
        dias = obj.duracion // 24
        return f'{dias} día{"s" if dias != 1 else ""}'


class EcoAventuraDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para el detalle, incluye itinerario."""
    dificultad_display = serializers.CharField(source='get_dificultad_display', read_only=True)
    duracion_display = serializers.SerializerMethodField()
    itinerario = EcoAventuraItinerarioSerializer(read_only=True)

    class Meta:
        model = EcoAventuraModel
        fields = '__all__'

    def get_duracion_display(self, obj):
        if obj.duracion < 24:
            return f'{obj.duracion} hora{"s" if obj.duracion != 1 else ""}'
        dias = obj.duracion // 24
        return f'{dias} día{"s" if dias != 1 else ""}'


class EcoAventuraWriteSerializer(serializers.ModelSerializer):
    """Serializer para crear y editar eco-aventuras."""

    class Meta:
        model = EcoAventuraModel
        fields = [
            'nombre', 'descripcion', 'ubicacion', 'dificultad',
            'duracion', 'capacidad_maxima', 'precio', 'imagen_url',
            'fecha_inicio', 'fecha_fin', 'activo', 'territorio',
        ]

    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError('El precio debe ser mayor a 0.')
        return value

    def validate_duracion(self, value):
        if value <= 0:
            raise serializers.ValidationError('La duración debe ser al menos 1 hora.')
        return value

    def validate_capacidad_maxima(self, value):
        if value <= 0:
            raise serializers.ValidationError('La capacidad máxima debe ser al menos 1.')
        return value

    def validate(self, data):
        if data.get('fecha_inicio') and data.get('fecha_fin'):
            if data['fecha_inicio'] > data['fecha_fin']:
                raise serializers.ValidationError('La fecha de inicio no puede ser posterior a la fecha de fin.')
        return data
