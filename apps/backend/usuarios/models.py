from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Role(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    icono = models.CharField(max_length=50)
    descripcion = models.TextField()
    es_turista = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['id']

    def __str__(self):
        return self.nombre


class ActorTerritorial(models.Model):
    NIVEL_FORMACION_CHOICES = [
        ('basica', 'Básica'),
        ('media', 'Media'),
        ('tecnica', 'Técnica'),
        ('universitaria', 'Universitaria'),
        ('posgrado', 'Posgrado'),
    ]

    SECTOR_CHOICES = [
        ('agro', 'Agro'),
        ('turismo', 'Turismo'),
        ('artesanias', 'Artesanías'),
        ('gastronomia', 'Gastronomía'),
        ('transporte', 'Transporte'),
        ('educacion', 'Educación'),
        ('otro', 'Otro'),
    ]

    MONEDA_CHOICES = [
        ('COP', 'Peso Colombiano (COP)'),
        ('USD', 'Dólar Americano (USD)'),
        ('EUR', 'Euro (EUR)'),
    ]

    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='actor_territorial')
    nivel_formacion = models.CharField(max_length=20, choices=NIVEL_FORMACION_CHOICES)
    servicios = models.TextField(blank=True)
    sector = models.CharField(max_length=20, choices=SECTOR_CHOICES)
    moneda = models.CharField(max_length=10, choices=MONEDA_CHOICES, default='COP')
    telefono = models.CharField(max_length=20)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    roles = models.ManyToManyField(Role, through='ActorRol', related_name='actores')
    fecha_registro = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = 'Actor Territorial'
        verbose_name_plural = 'Actores Territoriales'

    def __str__(self):
        return f"{self.usuario.get_full_name() or self.usuario.username}"


class ActorRol(models.Model):
    actor = models.ForeignKey(ActorTerritorial, on_delete=models.CASCADE)
    rol = models.ForeignKey(Role, on_delete=models.CASCADE)
    fecha_asignacion = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('actor', 'rol')

    def __str__(self):
        return f"{self.actor} - {self.rol}"


class SolicitudRegistro(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]

    actor = models.ForeignKey(ActorTerritorial, on_delete=models.CASCADE, related_name='solicitudes')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fecha_solicitud = models.DateTimeField(default=timezone.now)
    notas = models.TextField(blank=True)
    fecha_respuesta = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Solicitud de Registro'
        verbose_name_plural = 'Solicitudes de Registro'
        ordering = ['-fecha_solicitud']

    def __str__(self):
        return f"Solicitud {self.id} - {self.actor} ({self.estado})"


def crear_roles_default():
    roles_data = [
        {'nombre': 'productor', 'icono': 'seed', 'descripcion': 'Suministro de productos locales y artesanales', 'es_turista': False},
        {'nombre': 'caminante', 'icono': 'hiking', 'descripcion': 'Guía de rutas e intérprete de saberes', 'es_turista': False},
        {'nombre': 'custodio', 'icono': 'shield', 'descripcion': 'Protección de biodiversidad y patrimonio', 'es_turista': False},
        {'nombre': 'facilitador', 'icono': 'users', 'descripcion': 'Tallerista y gestor de experiencias', 'es_turista': False},
        {'nombre': 'anfitrion', 'icono': 'home', 'descripcion': 'Gestor de alojamiento, gastronomía y transporte', 'es_turista': False},
        {'nombre': 'turista', 'icono': 'compass', 'descripcion': 'Visitante de experiencias', 'es_turista': True},
    ]
    for rol_data in roles_data:
        Role.objects.get_or_create(nombre=rol_data['nombre'], defaults=rol_data)