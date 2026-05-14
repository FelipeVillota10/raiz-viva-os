import django.db.models as models

class TransaccionPayuModel(models.Model):

    id_transaccion = models.AutoField(primary_key=True)
    id_pago = models.ForeignKey('Pago.PagoModel', on_delete=models.PROTECT, db_column='id_pago')
    payu_transaccion_id = models.CharField(max_length=100, unique=True, null=False)
    reference_code = models.CharField(max_length=100, unique=True, null=False)
    codigo_respuesta = models.CharField(max_length=50, null=False)
    mensaje_respuesta = models.TextField(blank=True, null=False)
    firma = models.TextField(null=False)
    estado_payu = models.CharField(max_length=50, blank=True, null=False)
    raw_response = models.JSONField(blank=True, null=False)
    fecha_transaccion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transacciones_payu'
        verbose_name = 'Transaccion Payu'
        verbose_name_plural = 'Transacciones Payu'