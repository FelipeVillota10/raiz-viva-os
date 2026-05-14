from .TransaccionPayuRepository import TransaccionPayuRepository

class TransaccionPayuService:

    @staticmethod
    def listar_por_pago(id_pago: int):
        return TransaccionPayuRepository.listar_por_pago(id_pago)