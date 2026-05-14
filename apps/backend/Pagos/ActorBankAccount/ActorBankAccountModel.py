import django.db.models as models

class ActorBankAccountModel(models.Model):

    id = models.AutoField(primary_key=True)
    actor_id = models.ForeignKey('Actor.ActorModel', on_delete=models.PROTECT, db_column='id_actor')
    bank_name = models.CharField(max_length=150, null=False)
    account_type = models.CharField(max_length=50, null=False)
    account_number = models.CharField(max_length=100, null=False)
    country = models.CharField(max_length=100, null=False)
    is_primary = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    

    class Meta:
        db_table = 'actor_bank_account'
        verbose_name = 'Actor Bank Account'
        verbose_name_plural = 'Actor Bank Accounts'

    def __str__(self):
        return f'{self.bank_name} - {self.account_number} ({self.account_type})'