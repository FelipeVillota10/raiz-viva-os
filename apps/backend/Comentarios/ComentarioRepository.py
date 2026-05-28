from django.db.models import Count

from .ComentarioModel import ComentarioModel


class ComentarioRepository:

    def crear_comentario(self, data):

        return ComentarioModel.objects.create(
            **data
        )

    def obtener_comentarios(self, filtros=None):

        comentarios = ComentarioModel.objects.all()

        if filtros:

            if filtros.get('categoria'):

                comentarios = comentarios.filter(
                    categoria=filtros['categoria']
                )

            if filtros.get('estado'):

                comentarios = comentarios.filter(
                    estado=filtros['estado']
                )

            if filtros.get('prioridad'):

                comentarios = comentarios.filter(
                    prioridad=filtros['prioridad']
                )

        return comentarios

    def obtener_por_id(self, id_comentario):

        return ComentarioModel.objects.get(
            id=id_comentario
        )

    def actualizar_comentario(self, comentario, data):

        for key, value in data.items():

            setattr(
                comentario,
                key,
                value
            )

        comentario.save()

        return comentario

    def eliminar_comentario(self, comentario):

        comentario.delete()

    def obtener_tendencias(self):

        total_comentarios = (
            ComentarioModel.objects.count()
        )

        comentarios_por_categoria = (
            ComentarioModel.objects
            .values('categoria')
            .annotate(total=Count('categoria'))
            .order_by('-total')
        )

        comentarios_por_estado = (
            ComentarioModel.objects
            .values('estado')
            .annotate(total=Count('estado'))
            .order_by('-total')
        )

        prioridades_altas = (
            ComentarioModel.objects.filter(
                prioridad__gte=4
            ).count()
        )

        return {
            "total_comentarios":
                total_comentarios,

            "por_categoria":
                list(comentarios_por_categoria),

            "por_estado":
                list(comentarios_por_estado),

            "prioridades_altas":
                prioridades_altas
        }