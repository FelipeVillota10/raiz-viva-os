from rest_framework import serializers
from django.contrib.auth.models import User
from .ClienteModel import ClienteModel
from Estados.EstadoModel import EstadoModel
from Monedas.MonedaModel import MonedaModel


class ClienteSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    tipos_actores = serializers.SerializerMethodField()
    territorio_nombre = serializers.CharField(source='estado.nombre_estado', read_only=True, allow_null=True)
    moneda_nombre = serializers.CharField(source='tipo_moneda.nombre', read_only=True, allow_null=True)

    class Meta:
        model = ClienteModel
        fields = [
            'id_cliente', 'nombre', 'telefono', 'usuario_username', 'usuario_email',
            'usuario_nombre', 'reputacion', 'es_actor', 'es_lider', 'es_turista',
            'territorio_nombre', 'moneda_nombre', 'tipos_actores'
        ]

    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}".strip() or obj.usuario.username

    def get_tipos_actores(self, obj):
        return [{'id': ct.id_tipo.id, 'nombre_tipo': ct.id_tipo.nombre_tipo}
                for ct in obj.tipos_actores.all()]