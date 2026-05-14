from django.db import models

class PagoModel(models.Model):
    
    id_pago = models.AutoField(primary_key=True)
    id_estado = models.ForeignKey('Estados.EstadoModel', on_delete=models.PROTECT, db_column='id_estado')
    id_metodo_pago = models.ForeignKey('MetodoPago.MetodoPagoModel', on_delete=models.PROTECT, db_column='id_metodo_pago')
    id_cliente = models.ForeignKey('Clientes.ClienteModel', on_delete=models.PROTECT, db_column='id_cliente')
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    moneda = models.CharField(max_length=10, default='COP')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_confirmacion = models.DateTimeField(blank=True, null=True)
    referencia = models.CharField(max_length=100, unique=True)
    


    class Meta:
        db_table = 'pagos'
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'

    def __str__(self):
        return f'Pago de {self.referencia} el {self.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S")} por {self.monto} {self.moneda}'