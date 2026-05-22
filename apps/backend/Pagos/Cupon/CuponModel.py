from django.db import models


class CuponModel(models.Model):

    id_cupon = models.AutoField(primary_key=True)
    codigo = models.CharField(max_length=50, unique=True)
    tipo = models.CharField(max_length=50)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    usos = models.IntegerField(default=1)
    veces_usado = models.IntegerField(default=0)

    class Meta:
        db_table = 'cupones'
        verbose_name = 'Cupon'
        verbose_name_plural = 'Cupones'

    def __str__(self):
        return f'Cupon {self.codigo} - {self.valor} {self.tipo}'
