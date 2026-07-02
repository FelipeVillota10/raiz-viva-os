from django.db import models
from Evento.EventoModel import EventoModel

class DetalleEventoModel(models.Model):
    id_detalle          = models.AutoField(primary_key=True)
    evento              = models.OneToOneField(
                            EventoModel,
                            on_delete=models.DO_NOTHING,
                            db_column='id_evento',
                            related_name='detalle'
                          )
    distribucion_pago   = models.TextField(null=True, blank=True)
    es_local            = models.BooleanField(default=False)
    colaboradores       = models.IntegerField(null=True, blank=True, db_column='id_colaboradores')
 
    class Meta:
        managed  = False
        db_table = 'detalles_eventos'
 
    def __str__(self):
        return f'Detalle evento {self.evento_id}'