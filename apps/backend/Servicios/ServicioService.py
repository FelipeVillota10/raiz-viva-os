from .ServicioRepository import ServicioRepository
from Clientes.ClienteModel import ClienteModel


class ServicioService:
    def __init__(self):
        self.repository = ServicioRepository()

    def listar_servicios(self):
        return self.repository.get_all()

    def get_servicio(self, pk):
        return self.repository.get_by_id(pk)

    def get_cliente_servicios(self, cliente_id):
        return self.repository.get_cliente_servicios(cliente_id)

    def agregar_servicio_a_cliente(self, cliente_id, servicio_id, precio_acordado=None):
        cliente = ClienteModel.objects.get(pk=cliente_id)
        return self.repository.create_cliente_servicio(
            cliente_id=cliente.id_cliente,
            servicio_id=servicio_id,
            precio_acordado=precio_acordado
        )

    def quitar_servicio_de_cliente(self, cliente_id, servicio_id):
        return self.repository.delete_cliente_servicio(cliente_id, servicio_id)