import re
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Moneda, Territorio, TiposActores, Cliente, ClienteTiposActores, Aprobaciones


class MonedaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Moneda
        fields = ['id', 'nombre', 'simbolo']


class TerritorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Territorio
        fields = ['id', 'nombre_territorio', 'region']


class TiposActoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposActores
        fields = ['id', 'nombre_tipo']


class ClienteSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='id_usuario.username', read_only=True)
    usuario_email = serializers.EmailField(source='id_usuario.email', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    tipos_actores = serializers.SerializerMethodField()
    territorio_nombre = serializers.CharField(source='id_territorio.nombre_territorio', read_only=True, allow_null=True)
    moneda_nombre = serializers.CharField(source='id_tipo_moneda.nombre', read_only=True, allow_null=True)
    territorio_id = serializers.IntegerField(source='id_territorio.id', read_only=True, allow_null=True)

    class Meta:
        model = Cliente
        fields = [
            'id', 'nombre_completo', 'telefono', 'usuario_username', 'usuario_email', 'usuario_nombre',
            'servicio', 'reputacion', 'es_actor', 'es_lider', 'es_turista',
            'territorio_nombre', 'territorio_id', 'moneda_nombre', 'tipos_actores'
        ]

    def get_usuario_nombre(self, obj):
        return f"{obj.id_usuario.first_name} {obj.id_usuario.last_name}".strip() or obj.id_usuario.username

    def get_tipos_actores(self, obj):
        return [{'id': ct.id_tipo.id, 'nombre_tipo': ct.id_tipo.nombre_tipo}
                for ct in obj.tipos_actores.all()]


class RegistroClienteSerializer(serializers.Serializer):
    nombre_completo = serializers.CharField(min_length=5, max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    servicio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    id_territorio = serializers.IntegerField(required=False, allow_null=True)
    id_tipo_moneda = serializers.IntegerField(required=False, allow_null=True)
    telefono = serializers.CharField(min_length=7, max_length=20)
    tipos_actores = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    es_actor = serializers.BooleanField(default=False)
    es_lider = serializers.BooleanField(default=False)
    es_turista = serializers.BooleanField(default=False)

    def validate_nombre_completo(self, value):
        if any(char.isdigit() for char in value):
            raise ValidationError("El nombre completo no puede contener números.")
        palabras = value.strip().split()
        if len(palabras) < 2:
            raise ValidationError("El nombre completo debe tener al menos 2 palabras.")
        return value

    def validate_password(self, value):
        if not any(char.isupper() for char in value):
            raise ValidationError("La contraseña debe contener al menos una mayúscula.")
        if not any(char.isdigit() for char in value):
            raise ValidationError("La contraseña debe contener al menos un número.")
        return value

    def validate_telefono(self, value):
        solo_numeros = re.sub(r'[^\d]', '', value)
        if len(solo_numeros) < 7 or len(solo_numeros) > 15:
            raise ValidationError("El teléfono debe tener entre 7 y 15 dígitos.")
        if not solo_numeros.isdigit():
            raise ValidationError("El teléfono solo puede contener números.")
        return value

    def validate_tipos_actores(self, value):
        if not value:
            raise ValidationError("Debe seleccionar al menos un rol.")
        turista_selected = TiposActores.objects.filter(id__in=value, nombre_tipo='turista').exists()
        otros_roles_selected = TiposActores.objects.filter(id__in=value).exclude(nombre_tipo='turista').exists()
        if turista_selected and otros_roles_selected:
            raise ValidationError("El turista solo puede seleccionar el rol de turista.")
        tipos_validos = TiposActores.objects.filter(id__in=value)
        if tipos_validos.count() != len(value):
            raise ValidationError("Uno o más roles seleccionados no son válidos.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("Este correo electrónico ya está registrado.")
        if User.objects.filter(username=value).exists():
            raise ValidationError("Este correo ya está siendo usado como nombre de usuario.")
        return value

    def validate(self, attrs):
        es_actor = attrs.get('es_actor', False)
        es_lider = attrs.get('es_lider', False)
        es_turista = attrs.get('es_turista', False)
        count_true = sum([es_actor, es_lider, es_turista])
        if count_true > 1:
            raise ValidationError("Solo un tipo de cliente puede ser verdadero (actor, líder o turista).")
        return attrs

    def create(self, validated_data):
        tipos_ids = validated_data.pop('tipos_actores')
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
                territorio = Territorio.objects.get(id=validated_data['id_territorio'])
            except Territorio.DoesNotExist:
                pass

        tipo_moneda = None
        if validated_data.get('id_tipo_moneda'):
            try:
                tipo_moneda = Moneda.objects.get(id=validated_data['id_tipo_moneda'])
            except Moneda.DoesNotExist:
                pass

        cliente = Cliente.objects.create(
            id_usuario=user,
            nombre_completo=nombre_completo,
            servicio=validated_data.get('servicio', ''),
            id_territorio=territorio,
            id_tipo_moneda=tipo_moneda,
            telefono=validated_data['telefono'],
            es_actor=validated_data.get('es_actor', False),
            es_lider=validated_data.get('es_lider', False),
            es_turista=validated_data.get('es_turista', False),
        )

        for tipo_id in tipos_ids:
            tipo = TiposActores.objects.get(id=tipo_id)
            ClienteTiposActores.objects.create(id_actor=cliente, id_tipo=tipo)

        return cliente


class AprobacionesSerializer(serializers.ModelSerializer):
    actor_info = ClienteSerializer(source='id_actor', read_only=True)
    lider_info = ClienteSerializer(source='id_lider', read_only=True)

    class Meta:
        model = Aprobaciones
        fields = ['id', 'actor_info', 'lider_info', 'estado_resultado', 'observaciones', 'fecha_solicitud', 'fecha_respuesta']
        read_only_fields = ['fecha_solicitud', 'fecha_respuesta']


class AprobarRechazarSerializer(serializers.Serializer):
    observaciones = serializers.CharField(required=False, allow_blank=True, max_length=500)