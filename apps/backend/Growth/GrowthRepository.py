from django.db.models import Sum
from django.utils import timezone
from django.contrib.auth.models import User


class GrowthRepository:

    def get_usuarios_activos(self):
        return User.objects.count()

    def get_actores_activos(self):
        from Clientes.ClienteModel import ClienteModel
        return ClienteModel.objects.filter(es_actor=True).count()

    def get_eventos_realizados(self):
        from Evento.EventoModel import EventoModel
        return EventoModel.objects.filter(fecha_fin__lt=timezone.now()).count()

    def get_ventas_totales(self):
        from ConsolidadoEvento.ConsolidadoEventoModel import ConsolidadoEventoModel
        from ConsolidadoExperiencia.ConsolidadoExperienciaModel import ConsolidadoExperienciaModel

        ventas_eventos = ConsolidadoEventoModel.objects.aggregate(
            total=Sum('monto_pagado')
        )['total'] or 0

        ventas_experiencias = ConsolidadoExperienciaModel.objects.aggregate(
            total=Sum('monto_pagado')
        )['total'] or 0

        return ventas_eventos + ventas_experiencias

    def get_ventas_actores_locales(self):
        from ConsolidadoEvento.ConsolidadoEventoModel import ConsolidadoEventoModel
        from DetallesEventos.DetalleEventoModel import DetalleEventoModel

        eventos_con_colaborador = DetalleEventoModel.objects.filter(
            colaboradores__isnull=False 
        ).values_list('id_evento_id', flat=True)

        ventas = ConsolidadoEventoModel.objects.filter(
            evento__in=eventos_con_colaborador  
        ).aggregate(total=Sum('monto_pagado'))['total'] or 0

        return ventas

    def get_ventas_por_territorio(self):
        from ConsolidadoEvento.ConsolidadoEventoModel import ConsolidadoEventoModel
        from Territorio.TerritorioModel import TerritorioModel
        from Evento.EventoModel import EventoModel

        territorios = TerritorioModel.objects.all()
        resultado = []

        for territorio in territorios:
            # Primero obtenemos los IDs de eventos de ese territorio
            eventos_ids = EventoModel.objects.filter(
                territorio=territorio.id_territorio
            ).values_list('id_evento', flat=True)

            # Luego sumamos los consolidados de esos eventos
            total = ConsolidadoEventoModel.objects.filter(
                evento_id__in=eventos_ids
            ).aggregate(total=Sum('monto_pagado'))['total'] or 0

            resultado.append({
                'id': territorio.id_territorio,
                'nombre': territorio.nombre_territorio,
                'region': territorio.region or '—',
                'total': float(total),
            })

        resultado.sort(key=lambda x: x['total'], reverse=True)
        return resultado