# CategoriasEventos/CategoriaEventoModel.py
from django.db import models

class CategoriaEventoModel(models.Model):
    
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'categorias_eventos'
        verbose_name = 'Categoria de Evento'

    def __str__(self):
        return self.nombre