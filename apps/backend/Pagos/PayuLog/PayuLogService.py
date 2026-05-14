from .PayuLogRepository import PayuLogRepository

class PayuLogService:

    @staticmethod
    def listar_por_pago(id_pago: int):
        return PayuLogRepository.listar_por_pago(id_pago)