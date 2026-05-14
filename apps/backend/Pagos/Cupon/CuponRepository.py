from django.utils import timezone
from .CuponModel import CuponModel

class CuponRepository:

    @staticmethod
    def crear(data:dict) -> CuponModel:
        return CuponModel.objects.create(**data)
        
    @staticmethod
    def obtener_por_codigo(codigo: str) -> CuponModel:
        return CuponModel.objects.select_related('id_pago').get(codigo=codigo)

    @staticmethod
    def es_disponible(codigo: str) -> bool:
        cupon = CuponRepository.obtener_por_codigo(codigo)
        if not cupon:
            return False
        
        hoy = timezone.now().date()
        return (
            cupon.fecha_inicio.date() <= hoy <= cupon.fecha_fin.date() and
            cupon.veces_usado < cupon.usos
        )
    
    @staticmethod
    def obtener_valido(codigo: str) -> CuponModel:
        from django.utils import timezone
        hoy = timezone.now().date()
        return CuponModel.objects.filter(
            codigo=codigo,
            fecha_inicio__lte=hoy,
            fecha_fin__gte=hoy,
            veces_usado__lt=models.F('usos')
        ).first()

    @staticmethod
    def incrementar_uso(id_cupon: int):
        CuponModel.objects.filter(id_cupon=id_cupon).update(
            veces_usado=models.F('veces_usado') + 1
        )