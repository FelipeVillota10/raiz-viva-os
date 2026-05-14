from .MetodoPagoRepository import MetodoPagoRepository

class MetodoPagoService:

    @staticmethod
    def listar():
        return MetodoPagoRepository.listar()

    @staticmethod
    def obtener(id_metodo_pago: int):
        return MetodoPagoRepository.obtener_por_id(id_metodo_pago)