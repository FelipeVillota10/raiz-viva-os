from django.utils import timezone
from .TransaccionPayuModel  import TransaccionPayuModel

class TransaccionPayuRepository:

    @staticmethod
    def crear(data:dict) -> TransaccionPayuModel:
        return TransaccionPayuModel.objects.create(**data)
    
    @staticmethod
    def listar_por_pago(id_pago: int):
        return TransaccionPayuModel.objects.filter(id_pago_id=id_pago).order_by('fecha_transaccion')
           