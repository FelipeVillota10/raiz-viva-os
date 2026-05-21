from django.utils import timezone
from django.db.models import Count
from .AprobacionModel import AprobacionModel, EstadoAprobacion
from .AprobacionRepository import AprobacionRepository
from Clientes.ClienteModel import ClienteModel
from usuarios.EmailService import EmailService


class AprobacionService:
    def __init__(self):
        self.repository = AprobacionRepository()

    def get_solicitudes_by_lider(self, cliente, estado=None):
        solicitudes = self.repository.filter_by_lider_with_relations(cliente)
        if estado:
            solicitudes = solicitudes.filter(estado_resultado=estado)
        return solicitudes

    def get_solicitud(self, pk):
        return self.repository.get_with_relations(pk)

    def actualizar_solicitud(self, pk, cliente, estado, observaciones):
        aprobacion = AprobacionModel.objects.get(pk=pk, id_lider=cliente)

        aprobacion.estado_resultado = estado
        if observaciones:
            aprobacion.observaciones = observaciones

        if estado == EstadoAprobacion.APROBADO:
            aprobacion.id_actor.es_actor = True
            aprobacion.id_actor.activo = True
            aprobacion.id_actor.save()
            EmailService.send_solicitud_aprobada(
                cliente_email=aprobacion.id_actor.usuario.email,
                cliente_nombre=aprobacion.id_actor.nombre,
            )
            aprobacion.fecha_respuesta = timezone.now()
        elif estado == EstadoAprobacion.RECHAZADO:
            EmailService.send_solicitud_rechazada(
                cliente_email=aprobacion.id_actor.usuario.email,
                cliente_nombre=aprobacion.id_actor.nombre,
                observaciones=observaciones,
            )
            aprobacion.fecha_respuesta = timezone.now()

        aprobacion.save()
        return aprobacion

    def get_dashboard(self, cliente):
        total = self.repository.count_by_lider(cliente)
        por_estado = self.repository.annotate_by_estado(cliente)
        resumen = {item['estado_resultado']: item['c'] for item in por_estado}

        return {
            'total': total,
            'en_revision': resumen.get('EN_REVISION', 0),
            'aprobados': resumen.get('APROBADO', 0),
            'rechazados': resumen.get('RECHAZADO', 0),
        }