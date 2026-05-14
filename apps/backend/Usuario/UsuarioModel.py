from django.db import models
from Estados.EstadoModel import EstadoModel


class UsuarioModel(models.Model):
    id_usuario  = models.AutoField(primary_key=True)
    estado      = models.ForeignKey(
                    EstadoModel,
                    on_delete=models.DO_NOTHING,
                    db_column='id_estado'
                  )
    nombre      = models.CharField(max_length=255)
    email       = models.CharField(max_length=255)
    telefono    = models.CharField(max_length=50, null=True, blank=True)
    contrasena  = models.CharField(max_length=255, db_column='contraseña')
 
    class Meta:
        managed  = False
        db_table = 'usuarios'
 
    def __str__(self):
        return self.nombre
 