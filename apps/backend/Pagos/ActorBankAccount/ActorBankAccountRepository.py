from django.utils import timezone
from .ActorBankAccountModel import ActorBankAccountModel

class ActorBankAccountRepository:

    @staticmethod
    def crear(data:dict) -> ActorBankAccountModel:
        return ActorBankAccountModel.objects.create(**data)
        
    @staticmethod
    def obtener_por_actor(id_actor: int):
        return ActorBankAccountModel.objects.filter(id_actor_id=id_actor, activa=True)
    
    @staticmethod
    def obtener_por_id(id_actor_bank_account) -> ActorBankAccountModel:
        try:
            return ActorBankAccountModel.objects.get(id=id_actor_bank_account, activa=True)
        except ActorBankAccountModel.DoesNotExist:
            return None