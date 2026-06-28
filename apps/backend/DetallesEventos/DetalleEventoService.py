from .DetalleEventoRepository import DetalleEventoRepository
from Estados.EstadoModel import EstadoModel

class DetalleEventoService:
    def __init__(self):
        self.repository = DetalleEventoRepository()

    def _get_estado_id(self, nombre):
        estado = EstadoModel.objects.filter(nombre_estado__iexact=nombre).first()
        if not estado:
            raise ValueError(f"Estado '{nombre}' no encontrado.")
        return estado.pk

    def listar_detalles(self, id_evento=None, id_colaboradores=None, estado=None):
        filters = {}
        if id_evento:
            filters['id_evento_id'] = id_evento
        if id_colaboradores:
            filters['id_colaboradores_id'] = id_colaboradores
        if estado:
            filters['id_estado_id'] = self._get_estado_id(estado)
        return self.repository.get_all(filters)

    def obtener_detalle(self, id_detalle):
        return self.repository.get_by_id(id_detalle)

    def crear_detalle(self, data):
        if hasattr(data, 'dict'):
            data = data.dict()
            
        id_evento = data.pop('id_evento', None)
        id_colaboradores = data.pop('id_colaboradores', None)
        
        if id_evento:
            from Eventos.EventoModel import EventoModel
            data['id_evento'] = EventoModel.objects.get(pk=int(id_evento))
            
        if id_colaboradores:
            from Clientes.ClienteModel import ClienteModel
            data['id_colaboradores'] = ClienteModel.objects.get(pk=int(id_colaboradores))

        # Default estado a "en_revision"
        data['id_estado_id'] = self._get_estado_id('en_revision')
        
        return self.repository.create(data)

    def actualizar_estado(self, id_detalle, estado_nombre):
        detalle = self.repository.get_by_id(id_detalle)
        if not detalle:
            return None
        return self.repository.update(detalle, {'id_estado_id': self._get_estado_id(estado_nombre)})
