from django.db import models


class TransaccionMPModel(models.Model):
    id_transaccion = models.AutoField(primary_key=True)
    id_pago = models.ForeignKey(
        'Pagos.PagoModel',
        on_delete=models.PROTECT,
        db_column='id_pago',
    )
    mp_payment_id = models.CharField(max_length=100, unique=True)
    mp_status = models.CharField(max_length=50)
    mp_payment_type = models.CharField(max_length=50, blank=True, null=True)
    raw_response = models.JSONField()
    fecha_transaccion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transacciones_mp'
        verbose_name = 'Transaccion MercadoPago'
        verbose_name_plural = 'Transacciones MercadoPago'
