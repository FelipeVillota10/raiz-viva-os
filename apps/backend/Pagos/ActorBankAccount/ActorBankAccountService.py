from .ActorBankAccountRepository import ActorBankAccountRepository

class ActorBankAccountService:

    @staticmethod
    def listar_cuentas(id_actor: int):
        return ActorBankAccountRepository.obtener_por_actor(id_actor)

    @staticmethod
    def registrar_cuenta(data: dict):
        return ActorBankAccountRepository.crear(data)