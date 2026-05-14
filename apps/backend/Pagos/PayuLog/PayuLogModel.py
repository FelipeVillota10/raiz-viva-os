import django.db.models as models

class PayuLogModel(models.Model):

    TIPO_LOG_CHOICES = [
        ('REQUEST', 'Request'),
        ('RESPONSE', 'Response'),
        ('ERROR', 'Error'),
        ('WEBHOOK', 'webhook')
    ]

    id_log = models.AutoField(primary_key=True)
    id_pago = models.ForeignKey('Pago.PagoModel', on_delete=models.PROTECT, db_column='id_pago')
    tipo = models.CharField(max_length=20, null=False, choices=TIPO_LOG_CHOICES)
    payload = models.JSONField(null=False)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payu_logs'
        verbose_name = 'Payu Log'
        verbose_name_plural = 'Payu Logs'

    def __str__(self):
        return f'Log de Pago {self.id_pago} el {self.fecha.strftime("%Y-%m-%d %H:%M:%S")}'