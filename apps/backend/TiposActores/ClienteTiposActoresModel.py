from django.db import models
from Clientes.ClienteModel import ClienteModel


class ClienteTiposActoresModel(models.Model):
    id_actor = models.ForeignKey(
        ClienteModel,
        on_delete=models.CASCADE,
        db_column='id_actor',
        related_name='tipos_actores'
    )
    id_tipo = models.ForeignKey(
        'TiposActores.TipoActorModel',
        on_delete=models.CASCADE,
        db_column='id_tipo',
        related_name='clientes'
    )
    fecha_asignacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'cliente_tipos_actores'
        unique_together = ('id_actor', 'id_tipo')

    def __str__(self):
        return f"{self.id_actor.nombre} - {self.id_tipo.nombre_tipo}"