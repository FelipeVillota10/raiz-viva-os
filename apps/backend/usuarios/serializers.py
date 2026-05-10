import re
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .models import Role, ActorTerritorial, SolicitudRegistro


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'nombre', 'icono', 'descripcion', 'es_turista']


class RegistroActorTerritorialSerializer(serializers.Serializer):
    nombre_completo = serializers.CharField(min_length=5, max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    servicios = serializers.CharField(max_length=500, required=False, allow_blank=True)
    sector = serializers.ChoiceField(choices=[('ejemplo', 'Ejemplo')], default='ejemplo')
    moneda = serializers.ChoiceField(choices=ActorTerritorial.MONEDA_CHOICES, default='COP')
    telefono = serializers.CharField(min_length=7, max_length=20)
    roles = serializers.ListField(child=serializers.IntegerField(), min_length=1)

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

    def validate_roles(self, value):
        if not value:
            raise ValidationError("Debe seleccionar al menos un rol.")
        turista_selected = Role.objects.filter(id__in=value, es_turista=True).exists()
        otros_roles_selected = Role.objects.filter(id__in=value, es_turista=False).exists()
        if turista_selected and otros_roles_selected:
            raise ValidationError("El turista solo puede seleccionar el rol de turista.")
        roles_validos = Role.objects.filter(id__in=value)
        if roles_validos.count() != len(value):
            raise ValidationError("Uno o más roles seleccionados no son válidos.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("Este correo electrónico ya está registrado.")
        if User.objects.filter(username=value).exists():
            raise ValidationError("Este correo ya está siendo usado como nombre de usuario.")
        return value

    def create(self, validated_data):
        roles_ids = validated_data.pop('roles')
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

        actor = ActorTerritorial.objects.create(
            usuario=user,
            servicios=validated_data.get('servicios', ''),
            sector=validated_data.get('sector', 'ejemplo'),
            moneda=validated_data.get('moneda', 'COP'),
            telefono=validated_data['telefono']
        )

        for rol_id in roles_ids:
            rol = Role.objects.get(id=rol_id)
            actor.roles.add(rol)

        SolicitudRegistro.objects.create(actor=actor)
        return actor


class ActorTerritorialSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    roles = RoleSerializer(many=True, read_only=True)

    class Meta:
        model = ActorTerritorial
        fields = [
            'id', 'usuario_username', 'usuario_email', 'usuario_nombre',
            'servicios', 'sector', 'moneda',
            'telefono', 'roles', 'fecha_registro'
        ]

    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}".strip() or obj.usuario.username


class SolicitudRegistroSerializer(serializers.ModelSerializer):
    actor_info = ActorTerritorialSerializer(source='actor', read_only=True)

    class Meta:
        model = SolicitudRegistro
        fields = ['id', 'actor_info', 'estado', 'fecha_solicitud', 'fecha_respuesta', 'notas']
        read_only_fields = ['fecha_solicitud', 'fecha_respuesta']