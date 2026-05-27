from django.db import models
from Territorio.TerritorioModel import TerritorioModel

class ExperienciaModel(models.Model):
    id_experiencia = models.AutoField(primary_key=True)
    territorio     = models.ForeignKey(
                       TerritorioModel,
                       on_delete=models.DO_NOTHING,
                       db_column='id_territorio'
                     )
    costo_total    = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
 
    class Meta:
        managed  = False
        db_table = 'experiencias'
 
    def __str__(self):
        return f'Experiencia {self.id_experiencia}'