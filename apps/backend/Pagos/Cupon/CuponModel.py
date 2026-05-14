import django.db.models as models

class CuponModel(models.Model):

    id_cupon = models.AutoField(primary_key=True)
    id_pago = models.ForeignKey('Pago.PagoModel', on_delete=models.PROTECT, db_column='id_pago')
    codigo = models.CharField(max_length=50, unique=True, null=False)
    tipo = models.CharField(max_length=50, null=False)
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    fecha_inicio = models.DateTimeField(null=False)
    fecha_fin = models.DateTimeField(null=False)
    usos = models.IntegerField(null=False, default=1)
    veces_usado = models.IntegerField(default=0)

    class Meta:
        db_table = 'cupones'
        verbose_name = 'Cupon'
        verbose_name_plural = 'Cupones'

    def __str__(self):
        return f'Cupon {self.codigo} - {self.valor} {self.tipo}'