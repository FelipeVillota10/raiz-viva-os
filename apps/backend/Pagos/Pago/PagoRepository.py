from django.utils import timezone
from .PagoModel import PagoModel


class PagoRepository:

    @staticmethod
    def crear(data: dict) -> PagoModel:
        return PagoModel.objects.create(**data)

    @staticmethod
    def obtener_pago_por_id(id_pago) -> PagoModel:
        try:
            return PagoModel.objects.get(id_pago=id_pago)
        except PagoModel.DoesNotExist:
            return None

    @staticmethod
    def obtener_por_referencia(referencia: str) -> PagoModel:
        return PagoModel.objects.get(referencia=referencia)

    @staticmethod
    def obtener_por_preference_id(preference_id: str) -> PagoModel:
        try:
            return PagoModel.objects.get(preference_id=preference_id)
        except PagoModel.DoesNotExist:
            return None

    @staticmethod
    def actualizar(referencia: str, data: dict) -> PagoModel:
        PagoModel.objects.filter(referencia=referencia).update(**data)
        return PagoRepository.obtener_por_referencia(referencia)

    @staticmethod
    def confirmar(referencia: str, estado_id: int, mp_payment_id: str = None) -> PagoModel:
        data = {
            'estado': estado_id,
            'fecha_confirmacion': timezone.now(),
        }
        if mp_payment_id:
            data['mp_payment_id'] = mp_payment_id
        return PagoRepository.actualizar(referencia, data)
