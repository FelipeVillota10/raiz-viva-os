from django.db import models

class CategoriaModel(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=50) # Ejemplo: 'Evento', 'Cliente', 'Servicio'

    class Meta:
        db_table = 'categorias'
        verbose_name = 'Categoria'

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"