from django.db import models

class EstadoModel(models.Model):
    nombre_estado = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'estados'
        verbose_name = 'Estado'
        verbose_name_plural = 'Estados'

    def __str__(self):
        return self.nombre_estado