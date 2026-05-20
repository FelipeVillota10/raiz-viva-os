from django.db import models
from Estados.EstadoModel import EstadoModel
from Clientes.ClienteModel import ClienteModel

class TerritorioModel(models.Model):
    id_territorio    = models.AutoField(primary_key=True)
    estado           = models.ForeignKey(
                         EstadoModel,
                         on_delete=models.DO_NOTHING,
                         db_column='id_estado'
                       )
    administrador    = models.ForeignKey(
                         ClienteModel,
                         on_delete=models.DO_NOTHING,
                         db_column='id_administrador',
                         related_name='territorios_administrados'
                       )
    nombre_territorio = models.CharField(max_length=255)
    region            = models.CharField(max_length=255, null=True, blank=True)
 
    class Meta:
        managed = False
        db_table = 'territorios'
 
    def __str__(self):
        return self.nombre_territorio