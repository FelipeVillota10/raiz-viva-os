from django.db import models
from Usuario.UsuarioModel import UsuarioModel 
from Clientes.ClienteModel import ClienteModel
from Territorio.TerritorioModel import TerritorioModel      

class EventoModel(models.Model):
    id_evento      = models.AutoField(primary_key=True)
    territorio     = models.ForeignKey(
                       TerritorioModel,
                       on_delete=models.DO_NOTHING,
                       db_column='id_territorio'
                     )
    actor_principal = models.ForeignKey(
                        ClienteModel,
                        on_delete=models.DO_NOTHING,
                        db_column='id_actor_principal',
                        related_name='eventos_como_actor'
                      )
    nombre         = models.CharField(max_length=255)
    costo_evento   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    capacidad      = models.IntegerField(null=True, blank=True)
    fecha_inicio   = models.DateTimeField(null=True, blank=True)
    fecha_fin      = models.DateTimeField(null=True, blank=True)
 
    class Meta:
        managed  = False
        db_table = 'eventos'
 
    def __str__(self):
        return self.nombre