from django.db.models import Count
from Aprobaciones.AprobacionModel import AprobacionModel


class AprobacionRepository:
    def get_by_id(self, pk):
        return AprobacionModel.objects.get(pk=pk)

    def filter_by_lider(self, cliente):
        return AprobacionModel.objects.filter(id_lider=cliente)

    def get_with_relations(self, pk):
        return AprobacionModel.objects.select_related(
            'id_actor__usuario',
            'id_lider__usuario'
        ).prefetch_related('id_actor__tipos_actores__id_tipo').get(pk=pk)

    def filter_by_lider_with_relations(self, cliente):
        return AprobacionModel.objects.filter(
            id_lider=cliente
        ).select_related('id_actor__usuario', 'id_lider__usuario').prefetch_related(
            'id_actor__tipos_actores__id_tipo'
        )

    def count_by_lider(self, cliente):
        return AprobacionModel.objects.filter(id_lider=cliente).count()

    def annotate_by_estado(self, cliente):
        return AprobacionModel.objects.filter(
            id_lider=cliente
        ).values('estado_resultado').annotate(c=Count('id'))