import re
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from Clientes.ClienteModel import ClienteModel
from TiposActores.TipoActorModel import TipoActorModel
from TiposActores.ClienteTiposActoresModel import ClienteTiposActoresModel
from Territorio.TerritorioModel import TerritorioModel
from Estados.EstadoModel import EstadoModel
from Monedas.MonedaModel import MonedaModel
from Servicios.ServicioModel import ClienteServicioModel
from Aprobaciones.AprobacionModel import AprobacionModel


class TiposActoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoActorModel
        fields = ['id', 'nombre_tipo', 'descripcion']


class TerritorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerritorioModel
        fields = ['id_territorio', 'nombre_territorio', 'region']


class MonedaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonedaModel
        fields = ['id', 'nombre', 'simbolo']


class ClienteSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    nombre_completo = serializers.CharField(source='nombre', read_only=True)
    tipos_actores = serializers.SerializerMethodField()
    territorio_nombre = serializers.SerializerMethodField()
    territorio_id = serializers.SerializerMethodField()
    moneda_nombre = serializers.CharField(source='tipo_moneda.nombre', read_only=True, allow_null=True)
    servicio = serializers.SerializerMethodField()
    estado_aprobacion = serializers.SerializerMethodField()
    observaciones = serializers.SerializerMethodField()
    foto_perfil_url = serializers.SerializerMethodField()
    foto_portada_url = serializers.SerializerMethodField()
    activo = serializers.SerializerMethodField()

    class Meta:
        model = ClienteModel
        fields = [
            'id_cliente', 'nombre', 'nombre_completo', 'telefono', 'usuario_username', 'usuario_email',
            'usuario_nombre', 'reputacion', 'es_actor', 'es_lider', 'es_turista', 'es_admin',
            'territorio_nombre', 'territorio_id', 'moneda_nombre', 'tipos_actores', 'servicio',
            'descripcion', 'foto_perfil', 'foto_portada', 'foto_perfil_url', 'foto_portada_url',
            'activo', 'estado_aprobacion', 'observaciones'
        ]

    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}".strip() or obj.usuario.username

    def get_tipos_actores(self, obj):
        return [{'id': ct.id_tipo.id, 'nombre_tipo': ct.id_tipo.nombre_tipo}
                for ct in obj.tipos_actores.all()]

    def get_territorio_nombre(self, obj):
        from Territorio.TerritorioModel import TerritorioModel
        if obj.es_lider:
            territorio = TerritorioModel.objects.filter(administrador=obj).first()
            return territorio.nombre_territorio if territorio else None
        aprobacion = AprobacionModel.objects.filter(id_actor=obj, estado_resultado='APROBADO').order_by('-fecha_solicitud').first()
        if aprobacion:
            territorio = TerritorioModel.objects.filter(administrador=aprobacion.id_lider).first()
            return territorio.nombre_territorio if territorio else None
        return None

    def get_territorio_id(self, obj):
        from Territorio.TerritorioModel import TerritorioModel
        if obj.es_lider:
            territorio = TerritorioModel.objects.filter(administrador=obj).first()
            return territorio.id_territorio if territorio else None
        return None

    def get_servicio(self, obj):
        cliente_servicios = ClienteServicioModel.objects.filter(cliente=obj).select_related('servicio')
        return ', '.join([cs.servicio.nombre for cs in cliente_servicios]) if cliente_servicios else ''

    def get_estado_aprobacion(self, obj):
        aprobacion = AprobacionModel.objects.filter(id_actor=obj).order_by('-fecha_solicitud').first()
        return aprobacion.estado_resultado if aprobacion else None

    def get_observaciones(self, obj):
        aprobacion = AprobacionModel.objects.filter(id_actor=obj).order_by('-fecha_solicitud').first()
        return aprobacion.observaciones if aprobacion else None

    def _build_media_url(self, obj, field_name):
        file_field = getattr(obj, field_name, None)
        if not file_field:
            return None
        
        from django.conf import settings
        media_url = settings.MEDIA_URL.rstrip('/')
        file_path = file_field.name
        
        if media_url.startswith('http'):
            return f"{media_url}/{file_path}"
        
        url = f"{media_url}/{file_path}"
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_foto_perfil_url(self, obj):
        return self._build_media_url(obj, 'foto_perfil')

    def get_foto_portada_url(self, obj):
        return self._build_media_url(obj, 'foto_portada')

    def get_activo(self, obj):
        return obj.estado.nombre_estado == 'activo' if obj.estado else False


class RegistroClienteSerializer(serializers.Serializer):
    nombre_completo = serializers.CharField(min_length=5, max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    telefono = serializers.CharField(min_length=7, max_length=20)
    id_territorio = serializers.IntegerField(required=False, allow_null=True)
    id_tipo_moneda = serializers.IntegerField(required=False, allow_null=True)
    tipos_actores = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    servicios = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    es_actor = serializers.BooleanField(default=False)
    es_lider = serializers.BooleanField(default=False)
    es_turista = serializers.BooleanField(default=False)
    es_admin = serializers.BooleanField(default=False)
    activo = serializers.BooleanField(default=True)

    def validate_nombre_completo(self, value):
        if any(char.isdigit() for char in value):
            raise ValidationError("El nombre completo no puede contener numeros.")
        palabras = value.strip().split()
        if len(palabras) < 2:
            raise ValidationError("El nombre completo debe tener al menos 2 palabras.")
        return value

    def validate_password(self, value):
        if not any(char.isupper() for char in value):
            raise ValidationError("La contrasena debe contener al menos una mayuscula.")
        if not any(char.isdigit() for char in value):
            raise ValidationError("La contrasena debe contener al menos un numero.")
        return value

    def validate_telefono(self, value):
        solo_numeros = re.sub(r'[^\d]', '', value)
        if len(solo_numeros) < 7 or len(solo_numeros) > 15:
            raise ValidationError("El telefono debe tener entre 7 y 15 digitos.")
        if not solo_numeros.isdigit():
            raise ValidationError("El telefono solo puede contener numeros.")
        return value

    def validate_tipos_actores(self, value):
        if not value:
            return value
        turista_selected = TipoActorModel.objects.filter(id__in=value, nombre_tipo='turista').exists()
        otros_roles_selected = TipoActorModel.objects.filter(id__in=value).exclude(nombre_tipo='turista').exists()
        if turista_selected and otros_roles_selected:
            raise ValidationError("El turista solo puede seleccionar el rol de turista.")
        tipos_validos = TipoActorModel.objects.filter(id__in=value)
        if tipos_validos.count() != len(value):
            raise ValidationError("Uno o mas roles seleccionados no son validos.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("Este correo electronico ya esta registrado.")
        if User.objects.filter(username=value).exists():
            raise ValidationError("Este correo ya esta siendo usado como nombre de usuario.")
        return value

    def validate(self, attrs):
        es_actor = attrs.get('es_actor', False)
        es_lider = attrs.get('es_lider', False)
        es_turista = attrs.get('es_turista', False)
        es_admin = attrs.get('es_admin', False)
        count_true = sum([es_actor, es_lider, es_turista, es_admin])
        if count_true > 1:
            raise ValidationError("Solo un tipo de cliente puede ser verdadero (actor, lider, turista o admin).")
        if es_actor and not attrs.get('id_territorio'):
            raise ValidationError("Los actores territoriales deben seleccionar un territorio.")
        if not es_lider and not attrs.get('tipos_actores'):
            raise ValidationError("Debe seleccionar al menos un rol.")
        return attrs

    def create(self, validated_data):
        tipos_ids = validated_data.pop('tipos_actores', [])
        nombre_completo = validated_data.pop('nombre_completo')
        partes_nombre = nombre_completo.split(' ', 1)
        first_name = partes_nombre[0]
        last_name = partes_nombre[1] if len(partes_nombre) > 1 else ''
        username = validated_data['email'].split('@')[0]
        counter = 1
        base_username = username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )

        territorio = None
        if validated_data.get('id_territorio'):
            try:
                territorio = TerritorioModel.objects.get(id_territorio=validated_data['id_territorio'])
            except TerritorioModel.DoesNotExist:
                pass

        tipo_moneda = None
        if validated_data.get('id_tipo_moneda'):
            try:
                tipo_moneda = MonedaModel.objects.get(id=validated_data['id_tipo_moneda'])
            except MonedaModel.DoesNotExist:
                pass

        if validated_data.get('es_actor', False):
            estado_obj = EstadoModel.objects.get(nombre_estado='en_revision')
        else:
            estado_obj = EstadoModel.objects.get(nombre_estado='activo')

        cliente = ClienteModel.objects.create(
            usuario=user,
            nombre=nombre_completo,
            telefono=validated_data.get('telefono', ''),
            estado=territorio.estado if territorio else estado_obj,
            tipo_moneda=tipo_moneda,
            es_actor=validated_data.get('es_actor', False),
            es_lider=validated_data.get('es_lider', False),
            es_turista=validated_data.get('es_turista', False),
            es_admin=validated_data.get('es_admin', False),
        )

        for tipo_id in tipos_ids:
            tipo = TipoActorModel.objects.get(id=tipo_id)
            ClienteTiposActoresModel.objects.create(id_actor=cliente, id_tipo=tipo)

        return cliente


class AdminTerritorioSerializer(serializers.ModelSerializer):
    estado_nombre = serializers.CharField(source='estado.nombre_estado', read_only=True)
    administrador_nombre = serializers.CharField(source='administrador.nombre', read_only=True)
    administrador_id = serializers.IntegerField(source='administrador.id_cliente', read_only=True)
    administrador_activo = serializers.SerializerMethodField()
    id_estado = serializers.IntegerField(source='estado.id', required=False)
    id_administrador = serializers.IntegerField(write_only=True, required=False)

    def get_administrador_activo(self, obj):
        admin = obj.administrador
        return admin.estado.nombre_estado == 'activo' if admin and admin.estado else False

    class Meta:
        model = TerritorioModel
        fields = [
            'id_territorio',
            'nombre_territorio',
            'region',
            'estado_nombre',
            'id_estado',
            'id_administrador',
            'administrador_nombre',
            'administrador_id',
            'administrador_activo',
        ]


class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoModel
        fields = ['id', 'nombre_estado']


class AdminLiderSerializer(serializers.ModelSerializer):
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    foto_perfil_url = serializers.SerializerMethodField()
    territorio_nombre = serializers.SerializerMethodField()
    territorio_id = serializers.SerializerMethodField()
    activo = serializers.SerializerMethodField()

    class Meta:
        model = ClienteModel
        fields = [
            'id_cliente', 'nombre', 'telefono', 'usuario_email',
            'activo', 'foto_perfil_url', 'territorio_nombre', 'territorio_id',
        ]

    def get_foto_perfil_url(self, obj):
        if not obj.foto_perfil:
            return None
        from django.conf import settings
        media_url = settings.MEDIA_URL.rstrip('/')
        file_path = obj.foto_perfil.name
        if media_url.startswith('http'):
            return f"{media_url}/{file_path}"
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f"{media_url}/{file_path}")
        return f"{media_url}/{file_path}"

    def get_territorio_nombre(self, obj):
        from Territorio.TerritorioModel import TerritorioModel
        territorio = TerritorioModel.objects.filter(administrador=obj).first()
        return territorio.nombre_territorio if territorio else None

    def get_territorio_id(self, obj):
        from Territorio.TerritorioModel import TerritorioModel
        territorio = TerritorioModel.objects.filter(administrador=obj).first()
        return territorio.id_territorio if territorio else None

    def get_activo(self, obj):
        return obj.estado.nombre_estado == 'activo' if obj.estado else False
