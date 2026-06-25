from django.db import models
from Clientes.ClienteModel import ClienteModel
from Estados.EstadoModel import EstadoModel
from Eventos.EventoModel import EventoModel
from Experiencia.ExperienciaModel import ExperienciaModel

class Tiquete(models.Model):
    id_tiquete = models.AutoField(primary_key=True)
    id_cliente = models.ForeignKey(ClienteModel, on_delete=models.CASCADE, db_column='id_cliente')
    id_estado = models.ForeignKey(EstadoModel, on_delete=models.CASCADE, db_column='id_estado')
    id_evento = models.ForeignKey(EventoModel, null=True, blank=True, on_delete=models.SET_NULL, db_column='id_evento')
    id_experiencia = models.ForeignKey(ExperienciaModel, null=True, blank=True, on_delete=models.SET_NULL, db_column='id_experiencia')
    codigo = models.CharField(max_length=50, unique=True)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    fecha_vencimiento = models.DateTimeField()

    class Meta:
        db_table = 'tiquetes'
        managed = False  # Let's set to False if the table already exists, or True if we need to migrate. User said "te dejo como se encuentra en la db", so it exists!

    def __str__(self):
        return self.codigo
