from django.db import models

class TipoActorModel(models.Model):
    nombre_tipo = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'tipos_actores'
        verbose_name = 'Tipo de Actor'
        verbose_name_plural = 'Tipos de Actores'

    def __str__(self):
        return self.nombre_tipo