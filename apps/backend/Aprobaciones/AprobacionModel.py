from django.db import models
from Clientes.ClienteModel import ClienteModel


class EstadoAprobacion(models.TextChoices):
    EN_REVISION = 'EN_REVISION', 'En Revision'
    APROBADO = 'APROBADO', 'Aprobado'
    RECHAZADO = 'RECHAZADO', 'Rechazado'


class AprobacionModel(models.Model):
    id_aprobacion = models.AutoField(primary_key=True)
    id_actor = models.ForeignKey(
        ClienteModel,
        on_delete=models.CASCADE,
        db_column='id_actor',
        related_name='solicitudes_recibidas'
    )
    id_lider = models.ForeignKey(
        ClienteModel,
        on_delete=models.CASCADE,
        db_column='id_lider',
        related_name='solicitudes_emitidas'
    )
    estado_resultado = models.CharField(
        max_length=20,
        choices=EstadoAprobacion.choices,
        default=EstadoAprobacion.EN_REVISION
    )
    observaciones = models.TextField(blank=True, null=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_respuesta = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = True
        db_table = 'aprobaciones'
        verbose_name = 'Aprobacion'
        verbose_name_plural = 'Aprobaciones'
        ordering = ['-fecha_solicitud']

    def __str__(self):
        return f"Aprobacion {self.id_actor.nombre} -> {self.id_lider.nombre} ({self.estado_resultado})"