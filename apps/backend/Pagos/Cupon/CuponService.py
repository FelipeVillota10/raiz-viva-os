from .CuponRepository import CuponRepository
from .CuponSerializer import CuponSerializer

class CuponService:

    @staticmethod
    def validar_cupon(codigo: str):
        cupon = CuponRepository.obtener_valido(codigo)
        if cupon.veces_usado >= cupon.usos:
            raise ValueError("Cupón agotado")
        return cupon