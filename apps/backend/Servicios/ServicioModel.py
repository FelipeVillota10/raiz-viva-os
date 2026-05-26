from django.db import models
from Clientes.ClienteModel import ClienteModel


class ServicioModel(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(null=True, blank=True)
    precio_base = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    unidad = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'servicios'

    def __str__(self):
        return self.nombre


class ClienteServicioModel(models.Model):
    cliente = models.ForeignKey(
        ClienteModel,
        on_delete=models.CASCADE,
        db_column='id_cliente',
        related_name='servicios'
    )
    servicio = models.ForeignKey(
        ServicioModel,
        on_delete=models.CASCADE,
        db_column='id_servicio',
        related_name='clientes'
    )
    precio_acordado = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fecha_asociacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'cliente_servicios'
        unique_together = ('cliente', 'servicio')

    def __str__(self):
        return f"{self.cliente.nombre} - {self.servicio.nombre}"