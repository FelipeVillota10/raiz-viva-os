from .PagoLogModel import PagoLogModel


class PagoLogRepository:

    @staticmethod
    def registrar(id_pago: int, tipo: str, payload: dict):
        return PagoLogModel.objects.create(
            id_pago_id=id_pago,
            tipo=tipo,
            payload=payload,
        )

    @staticmethod
    def obtener_log_por_id(id_log) -> PagoLogModel:
        try:
            return PagoLogModel.objects.get(id_log=id_log)
        except PagoLogModel.DoesNotExist:
            return None

    @staticmethod
    def listar_por_pago(id_pago: int):
        return PagoLogModel.objects.filter(id_pago_id=id_pago).order_by('fecha')
