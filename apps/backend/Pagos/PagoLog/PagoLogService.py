from .PagoLogRepository import PagoLogRepository


class PagoLogService:

    @staticmethod
    def listar_por_pago(id_pago: int):
        return PagoLogRepository.listar_por_pago(id_pago)
