from django.core.exceptions import ObjectDoesNotExist

from .ComentarioRepository import ComentarioRepository


class ComentarioService:

    def __init__(self):

        self.repository = ComentarioRepository()

    def crear_comentario(self, data):

        return self.repository.crear_comentario(
            data
        )

    def listar_comentarios(self, filtros=None):

        return self.repository.obtener_comentarios(
            filtros
        )

    def obtener_comentario_por_id(
        self,
        id_comentario
    ):

        try:

            return self.repository.obtener_por_id(
                id_comentario
            )

        except ObjectDoesNotExist:

            raise Exception(
                'Comentario no encontrado'
            )

    def clasificar_comentario(
        self,
        id_comentario,
        data
    ):

        comentario = self.obtener_comentario_por_id(
            id_comentario
        )

        return self.repository.actualizar_comentario(
            comentario,
            data
        )

    def eliminar_comentario(
        self,
        id_comentario
    ):

        comentario = self.obtener_comentario_por_id(
            id_comentario
        )

        self.repository.eliminar_comentario(
            comentario
        )

    def obtener_tendencias(self):

        return self.repository.obtener_tendencias()