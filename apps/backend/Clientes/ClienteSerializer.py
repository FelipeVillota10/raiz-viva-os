from rest_framework import serializers
from django.contrib.auth.models import User
from .ClienteModel import ClienteModel
from Estados.EstadoModel import EstadoModel
from Monedas.MonedaModel import MonedaModel
from Servicios.ServicioModel import ClienteServicioModel
from Aprobaciones.AprobacionModel import AprobacionModel


class ClienteSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    tipos_actores = serializers.SerializerMethodField()
    territorio_nombre = serializers.CharField(source='estado.nombre_estado', read_only=True, allow_null=True)
    moneda_nombre = serializers.CharField(source='tipo_moneda.nombre', read_only=True, allow_null=True)
    servicio = serializers.SerializerMethodField()
    estado_aprobacion = serializers.SerializerMethodField()
    observaciones = serializers.SerializerMethodField()
    foto_perfil_url = serializers.SerializerMethodField()
    foto_portada_url = serializers.SerializerMethodField()

    class Meta:
        model = ClienteModel
        fields = [
            'id_cliente', 'nombre', 'telefono', 'usuario_username', 'usuario_email',
            'usuario_nombre', 'reputacion', 'es_actor', 'es_lider', 'es_turista',
            'territorio_nombre', 'moneda_nombre', 'tipos_actores', 'servicio',
            'descripcion', 'foto_perfil', 'foto_portada', 'foto_perfil_url', 'foto_portada_url',
            'activo', 'estado_aprobacion', 'observaciones'
        ]

    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}".strip() or obj.usuario.username

    def get_tipos_actores(self, obj):
        return [{'id': ct.id_tipo.id, 'nombre_tipo': ct.id_tipo.nombre_tipo}
                for ct in obj.tipos_actores.all()]

    def get_servicio(self, obj):
        cliente_servicios = ClienteServicioModel.objects.filter(cliente=obj).select_related('servicio')
        return ', '.join([cs.servicio.nombre for cs in cliente_servicios]) if cliente_servicios else ''

    def get_estado_aprobacion(self, obj):
        aprobacion = AprobacionModel.objects.filter(id_actor=obj).order_by('-fecha_solicitud').first()
        return aprobacion.estado_resultado if aprobacion else None

    def get_observaciones(self, obj):
        aprobacion = AprobacionModel.objects.filter(id_actor=obj).order_by('-fecha_solicitud').first()
        return aprobacion.observaciones if aprobacion else None

    def get_foto_perfil_url(self, obj):
        if obj.foto_perfil:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto_perfil.url)
            return obj.foto_perfil.url
        return None

    def get_foto_portada_url(self, obj):
        if obj.foto_portada:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto_portada.url)
            return obj.foto_portada.url
        return None
