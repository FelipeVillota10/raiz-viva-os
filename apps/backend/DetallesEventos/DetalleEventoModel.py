from django.db import models
from Eventos.EventoModel import EventoModel

class DetalleEventoModel(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    id_evento = models.ForeignKey(
        EventoModel,
        on_delete=models.CASCADE,
        db_column='id_evento'
    )
    distribucion_pago = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    id_estado = models.ForeignKey(
        'Estados.EstadoModel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_estado'
    )
    
    id_colaboradores = models.ForeignKey(
        'Clientes.ClienteModel',
        on_delete=models.CASCADE,
        db_column='id_colaboradores',
        limit_choices_to={'es_actor': True},
        related_name='detalles_eventos_colaborador',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'detalles_eventos'
        verbose_name = 'Detalle de Evento'

    def __str__(self):
        return f"Detalle evento {self.id_evento}"
