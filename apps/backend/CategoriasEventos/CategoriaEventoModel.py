from django.db import models
from ..Eventos.EventoModel import EventoModel

class CategoriaEventoModel(models.Model):
    id_categoria = models.IntegerField()
    id_evento = models.ForeignKey(
        EventoModel,
        on_delete=models.CASCADE,
        db_column='id_evento'
    )
    fecha_asignacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categorias_eventos'
        verbose_name = 'Categoria de Evento'
        unique_together = ('id_categoria', 'id_evento')

    def __str__(self):
        return f"Categoria {self.id_categoria} - Evento {self.id_evento}"