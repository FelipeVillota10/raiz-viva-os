from .EventoRepository import EventoRepository


class EventoService:

    @staticmethod
    def obtener_evento(id_evento):
        evento = EventoRepository.obtener_por_id(id_evento)
        if not evento:
            raise ValueError("Evento no encontrado")
        return evento
