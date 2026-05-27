from .EventoRepository import EventoRepository

class EventoService:
    def __init__(self):
        self.repository = EventoRepository()

    def listar_eventos(self):
        return self.repository.get_all()

    def crear_evento(self, data, imagen=None):
        # Si es gratuito, forzar costo a 0
        if data.get('es_gratuito'):
            data['costo_evento'] = 0

        # La moneda NO se guarda — es configuración del cliente

        # Campos obligatorios según el mockup
        campos_obligatorios = ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'capacidad']
        for campo in campos_obligatorios:
            if not data.get(campo):
                raise ValueError(f"El campo '{campo}' es obligatorio.")

        # Validar capacidad positiva
        if int(data.get('capacidad', 0)) <= 0:
            raise ValueError("La capacidad debe ser mayor a 0.")

        # Adjuntar imagen si viene
        if imagen:
            data['imagen'] = imagen

        # Estado inicial siempre Borrador
        data['id_estado_id'] = self._get_estado_borrador()

        return self.repository.create(data)

    def actualizar_evento(self, evento_id, data, imagen=None):
        evento = self.repository.get_by_id(evento_id)
        if not evento:
            return None

        # Si es gratuito, forzar costo a 0
        if data.get('es_gratuito'):
            data['costo_evento'] = 0
        elif 'es_gratuito' in data and not data.get('es_gratuito'):
            # Si se cambia de gratuito a no gratuito, asegurarse de que el costo no sea 0
            if data.get('costo_evento') is None or float(data.get('costo_evento', 0)) <= 0:
                raise ValueError("El costo del evento debe ser mayor a 0 si no es gratuito.")

        # Validar capacidad positiva si se actualiza
        if 'capacidad' in data:
            if int(data.get('capacidad', 0)) <= 0:
                raise ValueError("La capacidad debe ser mayor a 0.")

        # Adjuntar imagen si viene
        if imagen:
            data['imagen'] = imagen
        elif 'imagen' in data and data['imagen'] is None:
            # Si se envía imagen=None explícitamente, se borra la imagen existente
            data['imagen'] = None

        # No se debería permitir cambiar el estado a 'Borrador' directamente desde aquí
        # si ya tiene otro estado, a menos que sea una lógica de negocio específica.
        # Por ahora, omitimos la actualización de id_estado_id aquí.
        if 'id_estado_id' in data:
            del data['id_estado_id'] # No permitir actualizar el estado directamente desde el payload de actualización

        return self.repository.update(evento, data)

    def _get_estado_borrador(self):
        from Estados.EstadoModel import EstadoModel
        estado = EstadoModel.objects.filter(nombre_estado='Borrador').first()
        return estado.id if estado else None