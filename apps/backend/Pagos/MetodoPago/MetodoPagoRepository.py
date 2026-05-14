from .MetodoPagoModel import MetodoPago

class MetodoPagoRepository:

    @staticmethod
    def listar():
        return MetodoPago.objects.all()

    @staticmethod
    def obtener_por_id(id_metodo_pago: int) -> MetodoPago:
        return MetodoPago.objects.get(id_metodo_pago=id_metodo_pago)