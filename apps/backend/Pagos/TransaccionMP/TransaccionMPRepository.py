from django.db import IntegrityError
from .TransaccionMPModel import TransaccionMPModel


class TransaccionMPRepository:

    @staticmethod
    def crear(data: dict) -> TransaccionMPModel:
        try:
            return TransaccionMPModel.objects.create(**data)
        except IntegrityError:
            existing = TransaccionMPModel.objects.filter(
                mp_payment_id=data.get('mp_payment_id')
            ).first()
            if existing:
                return existing
            raise

    @staticmethod
    def listar_por_pago(id_pago: int):
        return TransaccionMPModel.objects.filter(id_pago_id=id_pago).order_by('fecha_transaccion')
