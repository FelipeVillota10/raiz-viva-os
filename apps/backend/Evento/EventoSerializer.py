from rest_framework import serializers
from .EventoModel import EventoModel


class TerritorioSimpleSerializer(serializers.Serializer):
    id_territorio = serializers.IntegerField()
    nombre_territorio = serializers.CharField()
    region = serializers.CharField(allow_null=True)


class ActorSimpleSerializer(serializers.Serializer):
    id_cliente = serializers.IntegerField()
    nombre = serializers.CharField()
    email = serializers.CharField(source='usuario.email')


class EventoSerializer(serializers.ModelSerializer):
    territorio = TerritorioSimpleSerializer(read_only=True)
    actor_principal = ActorSimpleSerializer(read_only=True)

    class Meta:
        model = EventoModel
        fields = [
            'id_evento', 'nombre', 'costo_evento', 'capacidad',
            'fecha_inicio', 'fecha_fin', 'territorio', 'actor_principal',
        ]
