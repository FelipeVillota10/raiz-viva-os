from django.db import models
from Clientes.ClienteModel import ClienteModel
from Territorio.TerritorioModel import TerritorioModel


class EcoAventuraModel(models.Model):

    DIFICULTAD_CHOICES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
    ]

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    ubicacion = models.CharField(max_length=200)
    dificultad = models.CharField(max_length=10, choices=DIFICULTAD_CHOICES, default='MEDIA')
    duracion = models.PositiveIntegerField(help_text='Duración en horas')
    capacidad_maxima = models.PositiveIntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    imagen_url = models.URLField(blank=True, null=True)

    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    activo = models.BooleanField(default=True)

    territorio = models.ForeignKey(
        TerritorioModel,
        on_delete=models.CASCADE,
        related_name='ecoaventuras'
    )

    creado_por = models.ForeignKey(
        ClienteModel,
        on_delete=models.SET_NULL,
        related_name='ecoaventuras',
        null=True,
        blank=True,
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'eco_aventuras'

    def __str__(self):
        return self.nombre


class EcoAventuraItinerario(models.Model):

    ecoaventura = models.OneToOneField(
        EcoAventuraModel,
        on_delete=models.CASCADE,
        related_name='itinerario'
    )
    cronograma = models.TextField(blank=True, default='')
    actividades = models.TextField(blank=True, default='')
    transporte = models.TextField(blank=True, default='')
    restricciones = models.TextField(blank=True, default='')
    recomendaciones = models.TextField(blank=True, default='')
    contactos = models.TextField(blank=True, default='')
    notas_especiales = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'eco_aventura_itinerarios'

    def __str__(self):
        return f'Itinerario de {self.ecoaventura.nombre}'
