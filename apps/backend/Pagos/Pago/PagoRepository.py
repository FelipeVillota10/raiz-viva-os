from django.utils import timezone
from .PagoModel import PagoModel

class PagoRepository:

    @staticmethod
    def crear(data:dict) -> PagoModel:
        return PagoModel.objects.create(**data)
        

    @staticmethod
    def obtener_pago_por_id(id_pago) -> PagoModel:
        try:
            return PagoModel.objects.select_related('id_estado', 'id_metodo_pago').get(id=id_pago)
        except PagoModel.DoesNotExist:
            return None
        
    @staticmethod
    def obtener_por_referencia(referencia: str) -> PagoModel:
        return PagoModel.objects.select_related('id_estado', 'id_metodo_pago').get(referencia=referencia)
    
    @staticmethod
    def actualizar(referencia: str, data: dict) -> PagoModel:
        PagoModel.objects.filter(referencia=referencia).update(**data)
        return PagoRepository.obtener_por_referencia(referencia)

    @staticmethod
    def confirmar(referencia: str, estado_id: int) -> PagoModel:
        return PagoRepository.actualizar(referencia, {
            'id_estado_id':      estado_id,
            'fecha_confirmacion': timezone.now(),
        })