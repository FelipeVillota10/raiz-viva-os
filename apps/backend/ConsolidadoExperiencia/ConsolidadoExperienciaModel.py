from django.db import models
from Clientes.ClienteModel import ClienteModel
from Paquete.PaqueteModel import Paquete

class ConsolidadoExperienciaModel(models.Model):
    id_consolidado_exp  = models.AutoField(primary_key=True)
    cliente             = models.ForeignKey(
                            ClienteModel,
                            on_delete=models.DO_NOTHING,
                            db_column='id_cliente'
                          )
    # id_experiencia fue eliminada de Neon y reemplazada por paquete_id: el
    # consolidado ahora registra UN pago por paquete completo (que puede
    # agrupar varias ecoaventuras), no un pago por experiencia individual.
    paquete              = models.ForeignKey(
                            Paquete,
                            on_delete=models.DO_NOTHING,
                            db_column='paquete_id'
                          )
    monto_pagado        = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fecha_participacion = models.DateTimeField(null=True, blank=True)
 
    class Meta:
        managed  = False
        db_table = 'consolidado_experiencias'
 
    def __str__(self):
        return f'Consolidado experiencia {self.id_consolidado_exp}'