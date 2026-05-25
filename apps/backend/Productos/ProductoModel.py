from django.db import models
from Eventos.EventoModel import EventoModel

class ProductoModel(models.Model):
    id_producto = models.AutoField(primary_key=True)
    id_evento = models.ForeignKey(
        EventoModel,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column='id_evento'
    )
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()

    class Meta:
        db_table = 'productos'
        verbose_name = 'Producto'

    def __str__(self):
        return f"{self.nombre} (Evento {self.id_evento})"