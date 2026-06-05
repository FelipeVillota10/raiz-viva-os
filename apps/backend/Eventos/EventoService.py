from .EventoRepository import EventoRepository

class EventoService:
    def __init__(self):
        self.repository = EventoRepository()

    def listar_eventos(self):
        return self.repository.get_all()

    def crear_evento(self, data, imagen=None):
        # 1. Convertir QueryDict a dict plano
        if hasattr(data, 'dict'):
            data = data.dict()

        # 2. Limpiar campos que no pertenecen al modelo
        for campo in ['imagen', 'ubicacion_nombre', 'ubicacion_direccion']:
            data.pop(campo, None)

        # 3. Normalizar booleano
        data['es_gratuito'] = str(data.get('es_gratuito', 'false')).lower() == 'true'
        if data['es_gratuito']:
            data['costo_evento'] = 0

        # 4. Validar campos obligatorios
        for campo in ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'capacidad']:
            if not data.get(campo):
                raise ValueError(f"El campo '{campo}' es obligatorio.")

        if int(data.get('capacidad', 0)) <= 0:
            raise ValueError("La capacidad debe ser mayor a 0.")

        """# 5. Imagen
        if imagen:
            data['imagen'] = imagen"""

        # 6. Estado inicial: Borrador
        data['id_estado_id'] = self._get_id_estado('Borrador')

        return self.repository.create(data)

    def actualizar_evento(self, evento_id, data, imagen=None):
        evento = self.repository.get_by_id(evento_id)
        if not evento:
            return None

        if hasattr(data, 'dict'):
            data = data.dict()

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