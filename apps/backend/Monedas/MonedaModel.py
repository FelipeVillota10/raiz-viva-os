from django.db import models

class MonedaModel(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    simbolo = models.CharField(max_length=10) # Ej: '$', '€'

    class Meta:
        db_table = 'monedas'
        verbose_name = 'Moneda'
        verbose_name_plural = 'Monedas'

    def __str__(self):
        return f"{self.nombre} ({self.simbolo})"