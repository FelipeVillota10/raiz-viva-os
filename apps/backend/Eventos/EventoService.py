from .EventoRepository import EventoRepository

class EventoService:
    def __init__(self):
        self.repository = EventoRepository()

    def listar_eventos(self):
        return self.repository.get_all()
    

    def obtener_evento(self, evento_id):
        return self.repository.get_by_id(evento_id)

    def crear_evento(self, data, imagen=None):
        if hasattr(data, 'dict'):
            data = data.dict()

        id_categoria = data.get('id_categoria')

        # Limpiar campos que no pertenecen al modelo
        for campo in ['imagen', 'ubicacion_nombre', 'ubicacion_direccion']:
            data.pop(campo, None)

        data['es_gratuito'] = str(data.get('es_gratuito', 'false')).lower() == 'true'
        if data['es_gratuito']:
            data['costo_evento'] = 0

        for campo in ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'capacidad']:
            if not data.get(campo):
                raise ValueError(f"El campo '{campo}' es obligatorio.")

        if int(data.get('capacidad', 0)) <= 0:
            raise ValueError("La capacidad debe ser mayor a 0.")

        data['id_estado_id'] = self._get_id_estado('Borrador')

        if id_categoria:
            from CategoriasEventos.CategoriaEventoModel import CategoriaEventoModel
            data['id_categoria'] = CategoriaEventoModel.objects.get(pk=int(id_categoria))

        # ← imagen se pasa directo, no dentro del dict
        if imagen:
            data['imagen'] = imagen

        return self.repository.create(data)

    def actualizar_evento(self, evento_id, data, imagen=None):
        evento = self.repository.get_by_id(evento_id)
        if not evento:
            return None

        if hasattr(data, 'dict'):
            data = data.dict()

        id_categoria = data.get('id_categoria')  # ← captura antes de limpiar

        for campo in ['imagen', 'ubicacion_nombre', 'ubicacion_direccion', 'id_estado_id']:
            data.pop(campo, None)

        if 'es_gratuito' in data:
            data['es_gratuito'] = str(data['es_gratuito']).lower() == 'true'

        if not data.get('es_gratuito', getattr(evento, 'es_gratuito', False)):
            costo = float(data.get('costo_evento', 0))
            if costo <= 0:
                raise ValueError("El costo debe ser mayor a 0 si el evento no es gratuito.")
        else:
            data['costo_evento'] = 0

        if 'capacidad' in data and int(data['capacidad']) <= 0:
            raise ValueError("La capacidad debe ser mayor a 0.")

        if imagen:
            data['imagen'] = imagen

        # ← asigna instancia real de categoría
        if id_categoria:
            from CategoriasEventos.CategoriaEventoModel import CategoriaEventoModel
            data['id_categoria'] = CategoriaEventoModel.objects.get(pk=int(id_categoria))

        return self.repository.update(evento, data)

    def inactivar_evento(self, evento_id):
        evento = self.repository.get_by_id(evento_id)
        if not evento:
            return None
        return self.repository.update(evento, {'id_estado_id': self._get_id_estado('Inactivo')})

    def _get_id_estado(self, nombre):
        from Estados.EstadoModel import EstadoModel
        estado = EstadoModel.objects.filter(nombre_estado__iexact=nombre).first()
        if not estado:
            raise ValueError(f"Estado '{nombre}' no encontrado en la base de datos.")
        return estado.pk
    
    def publicar_evento(self, evento_id):
        evento = self.repository.get_by_id(evento_id)
        if not evento:
            return None
        return self.repository.update(evento, {'id_estado_id': self._get_id_estado('En revisión')})