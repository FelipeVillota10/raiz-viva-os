from django.db import models
from Usuario.UsuarioModel import UsuarioModel
from Monedas.MonedaModel import MonedaModel

class ClienteModel(models.Model):
    id_cliente    = models.AutoField(primary_key=True)
    usuario       = models.ForeignKey(
                      UsuarioModel,
                      on_delete=models.DO_NOTHING,
                      db_column='id_usuario'
                    )
    tipo_moneda   = models.ForeignKey(
                      MonedaModel,
                      on_delete=models.DO_NOTHING,
                      db_column='id_tipo_moneda',
                      null=True,
                      blank=True
                    )
    nombre        = models.CharField(max_length=255)
    reputacion    = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    es_actor      = models.BooleanField(default=False)
    es_lider      = models.BooleanField(default=False)
    es_turista    = models.BooleanField(default=False)
 
    class Meta:
        managed  = False
        db_table = 'clientes'
 
    def __str__(self):
        return self.nombre