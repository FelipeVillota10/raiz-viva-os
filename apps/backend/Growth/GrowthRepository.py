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
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COALESCE(SUM(ce.monto_pagado), 0)
                FROM consolidado_eventos ce
                INNER JOIN detalles_eventos de ON de.id_evento = ce.id_evento
                WHERE de.es_local = TRUE
            """)
            return cursor.fetchone()[0]