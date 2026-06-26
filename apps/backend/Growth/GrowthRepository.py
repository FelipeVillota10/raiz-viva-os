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
            id_colaboradores__isnull=False
        ).values_list('id_evento', flat=True)

        ventas = ConsolidadoEventoModel.objects.filter(
            id_evento__in=eventos_con_colaborador
        ).aggregate(total=Sum('monto_pagado'))['total'] or 0

        return ventas