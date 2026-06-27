from .repositories import ConsolidadoEventoRepository

class ConsolidadoEventoService:
    @staticmethod
    def list_consolidados():
        return ConsolidadoEventoRepository.get_all()

    @staticmethod
    def get_consolidado(id_consolidado):
        return ConsolidadoEventoRepository.get_by_id(id_consolidado)

    @staticmethod
    def create_consolidado(data):
        return ConsolidadoEventoRepository.create(data)

    @staticmethod
    def update_consolidado(id_consolidado, data):
        return ConsolidadoEventoRepository.update(id_consolidado, data)

    @staticmethod
    def delete_consolidado(id_consolidado):
        return ConsolidadoEventoRepository.delete(id_consolidado)
