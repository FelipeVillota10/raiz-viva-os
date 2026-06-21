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
    # FIX (sincronizacion con Neon): la columna 'descripcion' es varchar NOT NULL
    # en la BD (modeloraizviva.json). El default='' evita que el INSERT del ORM
    # envie NULL y dispare un IntegrityError. La columna ya existe en Neon,
    # no se requiere migracion.
    descripcion   = models.CharField(max_length=250, null=True, blank=True, default='')
    foto_perfil   = models.ImageField(upload_to='perfiles/', null=True, blank=True)
    foto_portada  = models.ImageField(upload_to='portadas/', null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    # FIX (sincronizacion con Neon): la columna 'servicio' es text NOT NULL en la BD
    # y no existia en el modelo. Declararla aqui permite que el ORM la incluya en
    # el INSERT con default='', evitando la violacion de NOT NULL. NO requiere
    # migracion porque la columna ya existe fisicamente en Neon.
    servicio = models.TextField(default='', blank=True)
    # FIX (sincronizacion con Neon): la columna 'id_territorio' existe en la BD como
    # integer nullable con FK a territorios.id_territorio. El modelo no la conocia,
    # por lo que el INSERT la dejaba NULL (no rompia, pero se perdia la referencia
    # directa). Nullable, no obliga a setearla.
    id_territorio = models.IntegerField(null=True, blank=True)
    # FIX (sincronizacion con Neon): la columna 'nombre_mostrar' existe en la BD
    # como varchar nullable. Solo se declara para que el modelo refleje la realidad
    # de la tabla. Nullable, no rompe el INSERT.
    nombre_mostrar = models.CharField(max_length=255, null=True, blank=True, default='')

    class Meta:
        managed = True
        db_table = 'clientes'
 
    def __str__(self):
        return self.nombre