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

    def _get_estado_borrador(self):
        from Estados.EstadoModel import EstadoModel
        estado = EstadoModel.objects.filter(nombre_estado='Borrador').first()
        return estado.id if estado else None