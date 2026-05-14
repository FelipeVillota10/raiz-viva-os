from django.utils import timezone
from .PayuLogModel import PayuLogModel

class PayuLogRepository:

    @staticmethod
    def registrar(id_pago: int, tipo: str, payload: dict):
        return PayuLogModel.objects.create(
            id_pago_id=id_pago,
            tipo=tipo,
            payload=payload
        )
    
    @staticmethod
    def obtener_log_por_id(id_log) -> PayuLogModel:
        try:
            return PayuLogModel.objects.get(id_log=id_log)
        except PayuLogModel.DoesNotExist:
            return None
        
