from .TransaccionMPRepository import TransaccionMPRepository


class TransaccionMPService:

    @staticmethod
    def listar_por_pago(id_pago: int):
        return TransaccionMPRepository.listar_por_pago(id_pago)
