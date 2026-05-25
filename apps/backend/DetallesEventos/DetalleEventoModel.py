from django.db import models
from Eventos.EventoModel import EventoModel

class DetalleEventoModel(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    id_evento = models.ForeignKey(
        EventoModel,
        on_delete=models.CASCADE,
        db_column='id_evento'
    )
    distribucion_pago = models.TextField(blank=True, null=True)
    es_local = models.BooleanField(default=True)
    colaboradores = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'detalles_eventos'
        verbose_name = 'Detalle de Evento'

    def __str__(self):
        return f"Detalle evento {self.id_evento}"