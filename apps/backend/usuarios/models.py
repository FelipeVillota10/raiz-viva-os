from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator
from django.core.exceptions import ValidationError


class EstadoAprobacion(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    APROBADO = 'APROBADO', 'Aprobado'
    RECHAZADO = 'RECHAZADO', 'Rechazado'


class Moneda(models.Model):
    nombre = models.CharField(max_length=50)
    simbolo = models.CharField(max_length=5)

    class Meta:
        db_table = 'moneda'

    def __str__(self):
        return f"{self.nombre} ({self.simbolo})"


class Territorio(models.Model):
    nombre_territorio = models.CharField(max_length=100)
    region = models.CharField(max_length=50)

    class Meta:
        db_table = 'territorio'

    def __str__(self):
        return self.nombre_territorio


class Cliente(models.Model):
    id_usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cliente')
    id_tipo_moneda = models.ForeignKey(Moneda, on_delete=models.CASCADE, related_name='clientes', null=True, blank=True)
    id_territorio = models.ForeignKey(Territorio, on_delete=models.SET_NULL, null=True, blank=True, related_name='clientes')
    servicio = models.TextField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    reputacion = models.DecimalField(max_digits=3, decimal_places=2, validators=[MaxValueValidator(5)], default=0)
    es_actor = models.BooleanField(default=False)
    es_lider = models.BooleanField(default=False)
    es_turista = models.BooleanField(default=False)

    class Meta:
        db_table = 'cliente'

    def clean(self):
        count_true = sum([self.es_actor, self.es_lider, self.es_turista])
        if count_true > 1:
            raise ValidationError("Solo un tipo de cliente puede ser verdadero (actor, líder o turista).")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.id_usuario.username} ({self.es_actor}, {self.es_lider}, {self.es_turista})"


class TiposActores(models.Model):
    nombre_tipo = models.CharField(max_length=50)

    class Meta:
        db_table = 'tipos_actores'
        verbose_name = 'Tipo de Actor'
        verbose_name_plural = 'Tipos de Actores'

    def __str__(self):
        return self.nombre_tipo


class ClienteTiposActores(models.Model):
    id_actor = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='tipos_actores')
    id_tipo = models.ForeignKey(TiposActores, on_delete=models.CASCADE, related_name='clientes')
    fecha_asignacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cliente_tipos_actores'
        unique_together = ('id_actor', 'id_tipo')

    def __str__(self):
        return f"{self.id_actor} - {self.id_tipo}"


class Aprobaciones(models.Model):
    id_actor = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='solicitudes_recibidas')
    id_lider = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='solicitudes_emitidas')
    estado_resultado = models.CharField(
        max_length=20,
        choices=EstadoAprobacion.choices,
        default=EstadoAprobacion.PENDIENTE
    )
    observaciones = models.TextField(blank=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_respuesta = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'aprobaciones'
        verbose_name = 'Aprobación'
        verbose_name_plural = 'Aprobaciones'
        ordering = ['-fecha_solicitud']
        unique_together = ['id_actor', 'id_lider']

    def __str__(self):
        return f"Aprobación {self.id_actor} -> {self.id_lider} ({self.estado_resultado})"


def crear_tipos_actores_default():
    tipos_data = [
        {'nombre_tipo': 'productor'},
        {'nombre_tipo': 'caminante'},
        {'nombre_tipo': 'custodio'},
        {'nombre_tipo': 'facilitador'},
        {'nombre_tipo': 'anfitrion'},
        {'nombre_tipo': 'turista'},
    ]
    for tipo_data in tipos_data:
        TiposActores.objects.get_or_create(nombre_tipo=tipo_data['nombre_tipo'], defaults=tipo_data)