from django.db import models


class PagoModel(models.Model):

    ESTADO_CHOICES = [
        ('PENDING', 'PENDING'),
        ('APPROVED', 'APPROVED'),
        ('DECLINED', 'DECLINED'),
        ('EXPIRED', 'EXPIRED'),
    ]

    id_pago = models.AutoField(primary_key=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDING')
    metodo_pago = models.CharField(max_length=50, null=True, blank=True)
    id_cliente = models.IntegerField(null=True, blank=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    moneda = models.CharField(max_length=10, default='COP')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_confirmacion = models.DateTimeField(blank=True, null=True)
    referencia = models.CharField(max_length=100, unique=True)
    preference_id = models.CharField(max_length=100, blank=True, null=True)
    mp_payment_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'pagos'
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'

    def __str__(self):
        return f'Pago de {self.referencia} el {self.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S")} por {self.monto} {self.moneda}'
