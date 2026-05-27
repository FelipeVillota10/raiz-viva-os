from Servicios.ServicioModel import ServicioModel, ClienteServicioModel


class ServicioRepository:
    def get_all(self):
        return ServicioModel.objects.all()

    def get_by_id(self, pk):
        return ServicioModel.objects.get(pk=pk)

    def get_cliente_servicios(self, cliente_id):
        return ClienteServicioModel.objects.filter(
            cliente_id=cliente_id
        ).select_related('servicio')

    def create_cliente_servicio(self, cliente_id, servicio_id, precio_acordado=None):
        return ClienteServicioModel.objects.create(
            cliente_id=cliente_id,
            servicio_id=servicio_id,
            precio_acordado=precio_acordado
        )

    def delete_cliente_servicio(self, cliente_id, servicio_id):
        return ClienteServicioModel.objects.filter(
            cliente_id=cliente_id,
            servicio_id=servicio_id
        ).delete()