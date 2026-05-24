from datetime import datetime

from .EventoModel import EventoModel
from Territorio.TerritorioModel import TerritorioModel
from Clientes.ClienteModel import ClienteModel
from Usuario.UsuarioModel import UsuarioModel


def _build_mock_objects():
    usuario = UsuarioModel(id_usuario=1, nombre='Carlos Montealegre', email='carlos@raizviva.co', telefono='3001234567')
    cliente = ClienteModel(id_cliente=1, nombre='Carlos Montealegre', reputacion=4.8, es_actor=True, es_lider=True, es_turista=False)
    cliente.usuario = usuario
    territorio = TerritorioModel(id_territorio=1, nombre_territorio='Ecoaldea Amanecer', region='Caribe')
    territorio.administrador = cliente
    territorio.estado_id = 1
    cliente.tipo_moneda_id = 1

    eventos = {}
    mock_data = [
        {
            'id_evento': 1,
            'nombre': 'Ceremonia de Medicina Ancestral',
            'costo_evento': 150000.00,
            'capacidad': 20,
            'fecha_inicio': datetime(2026, 6, 15, 8, 0),
            'fecha_fin': datetime(2026, 6, 15, 18, 0),
        },
        {
            'id_evento': 2,
            'nombre': 'Taller de Permacultura Regenerativa',
            'costo_evento': 80000.00,
            'capacidad': 35,
            'fecha_inicio': datetime(2026, 7, 1, 9, 0),
            'fecha_fin': datetime(2026, 7, 3, 17, 0),
        },
    ]

    for d in mock_data:
        ev = EventoModel(
            id_evento=d['id_evento'],
            nombre=d['nombre'],
            costo_evento=d['costo_evento'],
            capacidad=d['capacidad'],
            fecha_inicio=d['fecha_inicio'],
            fecha_fin=d['fecha_fin'],
        )
        ev.territorio = territorio
        ev.actor_principal = cliente
        eventos[d['id_evento']] = ev

    return eventos


_MOCK_EVENTOS = _build_mock_objects()


class EventoRepository:

    @staticmethod
    def obtener_por_id(id_evento) -> EventoModel:
        return _MOCK_EVENTOS.get(id_evento)
