from django.db import models
from django.contrib.auth.models import User
from Monedas.MonedaModel import MonedaModel
from Estados.EstadoModel import EstadoModel


class ClienteModel(models.Model):
    id_cliente    = models.AutoField(primary_key=True)
    usuario       = models.OneToOneField(
                      User,
                      on_delete=models.CASCADE,
                      db_column='id_usuario',
                      related_name='cliente'
                    )
    estado        = models.ForeignKey(
                      EstadoModel,
                      on_delete=models.DO_NOTHING,
                      db_column='id_estado',
                      null=True,
                      blank=True
                    )
    tipo_moneda   = models.ForeignKey(
                      MonedaModel,
                      on_delete=models.DO_NOTHING,
                      db_column='id_tipo_moneda',
                      null=True,
                      blank=True
                    )
    nombre        = models.CharField(max_length=255)
    telefono      = models.CharField(max_length=50, null=True, blank=True)
    reputacion    = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    es_actor      = models.BooleanField(default=False)
    es_lider      = models.BooleanField(default=False)
    es_turista    = models.BooleanField(default=False)
    es_admin      = models.BooleanField(default=False)
    descripcion   = models.CharField(max_length=250, null=True, blank=True)
    foto_perfil   = models.ImageField(upload_to='perfiles/', null=True, blank=True)
    foto_portada  = models.ImageField(upload_to='portadas/', null=True, blank=True)
    activo        = models.BooleanField(default=True)
 
    class Meta:
        managed = True
        db_table = 'clientes'
 
    def __str__(self):
        return self.nombre