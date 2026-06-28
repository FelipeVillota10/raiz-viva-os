from DetallesEventos.DetalleEventoModel import DetalleEventoModel

class DetalleEventoRepository:
    def get_all(self, filters=None):
        queryset = DetalleEventoModel.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return queryset

    def get_by_id(self, id_detalle):
        return DetalleEventoModel.objects.filter(pk=id_detalle).first()

    def create(self, data):
        return DetalleEventoModel.objects.create(**data)

    def update(self, instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, instance):
        instance.delete()
