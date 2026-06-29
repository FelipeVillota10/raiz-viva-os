import math
from .EcoAventuraRepository import EcoAventuraRepository

PAGE_SIZE = 9


class EcoAventuraService:

    @staticmethod
    def listar_activas(query_params: dict):
        filtros = {}

        try:
            if query_params.get('precio_min'):
                filtros['precio_min'] = float(query_params['precio_min'])
            if query_params.get('precio_max'):
                filtros['precio_max'] = float(query_params['precio_max'])
            if query_params.get('duracion_min'):
                filtros['duracion_min'] = int(query_params['duracion_min'])
            if query_params.get('duracion_max'):
                filtros['duracion_max'] = int(query_params['duracion_max'])
        except (ValueError, TypeError):
            pass

        if query_params.get('dificultad'):
            filtros['dificultad'] = query_params['dificultad']
        if query_params.get('ubicacion'):
            filtros['ubicacion'] = query_params['ubicacion']

        page = max(1, int(query_params.get('page', 1)))
        page_size = int(query_params.get('page_size', PAGE_SIZE))

        qs = EcoAventuraRepository.obtener_activas_con_filtros(filtros)
        total = qs.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1

        offset = (page - 1) * page_size
        resultados = qs[offset: offset + page_size]

        return {
            'count': total,
            'total_pages': total_pages,
            'page': page,
            'page_size': page_size,
            'results': resultados,
        }

    @staticmethod
    def listar_todas():
        return EcoAventuraRepository.obtener_todas()

    @staticmethod
    def listar_por_cliente(id_cliente: int):
        return EcoAventuraRepository.obtener_por_cliente(id_cliente)

    @staticmethod
    def obtener(id: int):
        return EcoAventuraRepository.obtener_por_id(id)

    @staticmethod
    def crear(data: dict):
        return EcoAventuraRepository.crear(data)

    @staticmethod
    def actualizar(id: int, data: dict):
        instancia = EcoAventuraRepository.obtener_por_id(id)
        if not instancia:
            return None
        return EcoAventuraRepository.actualizar(instancia, data)

    @staticmethod
    def toggle_activo(id: int):
        instancia = EcoAventuraRepository.obtener_por_id(id)
        if not instancia:
            return None
        instancia.activo = not instancia.activo
        instancia.save()
        return instancia

    @staticmethod
    def obtener_itinerario(ecoaventura_id: int):
        return EcoAventuraRepository.obtener_itinerario(ecoaventura_id)

    @staticmethod
    def guardar_itinerario(ecoaventura_id: int, data: dict):
        ecoaventura = EcoAventuraRepository.obtener_por_id(ecoaventura_id)
        if not ecoaventura:
            return None
        return EcoAventuraRepository.guardar_itinerario(ecoaventura, data)
