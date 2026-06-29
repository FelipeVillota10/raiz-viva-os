from django.db import models
from Clientes.ClienteModel import ClienteModel
from Evento.EventoModel import EventoModel

class ConsolidadoEventoModel(models.Model):
    id_consolidado_ev   = models.AutoField(primary_key=True)
    cliente             = models.ForeignKey(
                            ClienteModel,
                            on_delete=models.DO_NOTHING,
                            db_column='id_cliente'
                          )
    evento              = models.ForeignKey(
                            EventoModel,
                            on_delete=models.DO_NOTHING,
                            db_column='id_evento'
                          )
    monto_pagado        = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fecha_participacion = models.DateTimeField(null=True, blank=True)
    cantidad_tickets    = models.IntegerField(null=True, blank=True)
    pagado              = models.BooleanField(default=False, null=True, blank=True)
 
    class Meta:
        managed  = False
        db_table = 'consolidado_eventos'
 
    def __str__(self):
        return f'Consolidado evento {self.id_consolidado_ev}'