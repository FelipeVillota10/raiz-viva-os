from django.db import models
from Clientes.ClienteModel import ClienteModel
from Experiencia.ExperienciaModel import ExperienciaModel

class ConsolidadoExperienciaModel(models.Model):
    id_consolidado_exp  = models.AutoField(primary_key=True)
    cliente             = models.ForeignKey(
                            ClienteModel,
                            on_delete=models.DO_NOTHING,
                            db_column='id_cliente'
                          )
    experiencia         = models.ForeignKey(
                            ExperienciaModel,
                            on_delete=models.DO_NOTHING,
                            db_column='id_experiencia'
                          )
    monto_pagado        = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fecha_participacion = models.DateTimeField(null=True, blank=True)
 
    class Meta:
        managed  = False
        db_table = 'consolidado_experiencias'
 
    def __str__(self):
        return f'Consolidado experiencia {self.id_consolidado_exp}'