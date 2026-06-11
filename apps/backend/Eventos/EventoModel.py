# EventoModel.py
import uuid
import os

from django.db import models
from Estados.EstadoModel import EstadoModel
from CategoriasEventos.CategoriaEventoModel import CategoriaEventoModel


def ruta_imagen_evento(instance, filename):
    ext = filename.split('.')[-1]
    nombre = f"{uuid.uuid4().hex}.{ext}"
    return f"eventos/{nombre}"


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

    id_categoria = models.ForeignKey(
        CategoriaEventoModel,  # ← string, sin import directo
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_categoria'
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