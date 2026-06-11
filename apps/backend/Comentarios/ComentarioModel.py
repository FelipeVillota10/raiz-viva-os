from django.db import models
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator
)


class ComentarioModel(models.Model):

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('revision', 'Revision'),
        ('resuelto', 'Resuelto'),
        ('rechazado', 'Rechazado'),
    ]

    CATEGORIAS = [
        ('sugerencia', 'Sugerencia'),
        ('bug', 'Bug'),
        ('mejora', 'Mejora'),
        ('otro', 'Otro'),
    ]

    id = models.AutoField(
        primary_key=True
    )

    titulo = models.CharField(
        max_length=255
    )

    descripcion = models.TextField()

    categoria = models.CharField(
        max_length=100,
        choices=CATEGORIAS,
        default='sugerencia'
    )

    prioridad = models.IntegerField(
        default=1,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    visible_para = models.CharField(
        max_length=100,
        default='admin_growth'
    )

    estado = models.CharField(
        max_length=100,
        choices=ESTADOS,
        default='pendiente'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        db_table = 'comentarios'