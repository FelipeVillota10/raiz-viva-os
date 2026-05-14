from django.db import models

class MetodoPagoModel(models.Model):
    id_metodo_pago = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True, null=False)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'metodos_pago'
        verbose_name = 'Metodo de Pago'
        verbose_name_plural = 'Metodos de Pago'

    def __str__(self):
        return self.nombre
    