from .EcoAventuraModel import EcoAventuraModel, EcoAventuraItinerario


class EcoAventuraRepository:

    @staticmethod
    def obtener_activas_con_filtros(filtros: dict):
        qs = EcoAventuraModel.objects.filter(activo=True)

        if filtros.get('precio_min') is not None:
            qs = qs.filter(precio__gte=filtros['precio_min'])
        if filtros.get('precio_max') is not None:
            qs = qs.filter(precio__lte=filtros['precio_max'])
        if filtros.get('dificultad'):
            qs = qs.filter(dificultad=filtros['dificultad'].upper())
        if filtros.get('ubicacion'):
            qs = qs.filter(ubicacion__icontains=filtros['ubicacion'])
        if filtros.get('duracion_min') is not None:
            qs = qs.filter(duracion__gte=filtros['duracion_min'])
        if filtros.get('duracion_max') is not None:
            qs = qs.filter(duracion__lte=filtros['duracion_max'])

        return qs.order_by('id')

    @staticmethod
    def obtener_todas():
        return EcoAventuraModel.objects.all().order_by('id')

    @staticmethod
    def obtener_por_id(id):
        return EcoAventuraModel.objects.filter(id=id).first()

    @staticmethod
    def crear(data: dict):
        return EcoAventuraModel.objects.create(**data)

    @staticmethod
    def actualizar(instancia: EcoAventuraModel, data: dict):
        for campo, valor in data.items():
            setattr(instancia, campo, valor)
        instancia.save()
        return instancia

    @staticmethod
    def inactivar(instancia: EcoAventuraModel):
        instancia.activo = False
        instancia.save()

    @staticmethod
    def obtener_itinerario(ecoaventura_id: int):
        return EcoAventuraItinerario.objects.filter(ecoaventura_id=ecoaventura_id).first()

    @staticmethod
    def guardar_itinerario(ecoaventura: EcoAventuraModel, data: dict):
        itinerario, _ = EcoAventuraItinerario.objects.update_or_create(
            ecoaventura=ecoaventura,
            defaults=data,
        )
        return itinerario
