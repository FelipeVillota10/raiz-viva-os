import uuid
import os


from django.db import models

from Estados.EstadoModel import EstadoModel



def ruta_imagen_evento(instance, filename):
    ext = filename.split('.')[-1]                    # extrae jpg o png
    nombre = f"{uuid.uuid4().hex}.{ext}"             # genera nombre único
    return f"eventos/{nombre}"                       # ruta final en R2


class EventoModel(models.Model):
    id_evento = models.AutoField(primary_key=True)
    id_actor_principal = models.IntegerField(null=True, blank=True)
    id_territorio = models.IntegerField(null=True, blank=True)

    id_estado = models.ForeignKey(
    EstadoModel,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    db_column='id_estado'
    )
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    costo_evento = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    capacidad = models.PositiveIntegerField()
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    es_gratuito = models.BooleanField(default=False)
    imagen = models.ImageField(upload_to=ruta_imagen_evento, blank=True, null=True)

    class Meta:
        db_table = 'eventos'
        verbose_name = 'Evento'

    def __str__(self):
        return f"{self.nombre}"