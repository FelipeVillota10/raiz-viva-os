from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .ComentarioService import ComentarioService
from .ComentarioSerializer import ComentarioSerializer


class ComentarioController(APIView):

    permission_classes = []

    def get(self, request, id_comentario=None):

        service = ComentarioService()

        try:

            if id_comentario:

                comentario = (
                    service.obtener_comentario_por_id(
                        id_comentario
                    )
                )

                serializer = ComentarioSerializer(
                    comentario
                )

                return Response(
                    serializer.data
                )

            filtros = {
                'categoria': request.GET.get('categoria'),
                'estado': request.GET.get('estado'),
                'prioridad': request.GET.get('prioridad'),
            }

            comentarios = service.listar_comentarios(
                filtros
            )

            serializer = ComentarioSerializer(
                comentarios,
                many=True
            )

            return Response(
                serializer.data
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request):

        serializer = ComentarioSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        service = ComentarioService()

        comentario = service.crear_comentario(
            serializer.validated_data
        )

        response_serializer = ComentarioSerializer(
            comentario
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

    def patch(self, request, id_comentario):

        service = ComentarioService()

        try:

            comentario = (
                service.obtener_comentario_por_id(
                    id_comentario
                )
            )

            serializer = ComentarioSerializer(
                comentario,
                data=request.data,
                partial=True
            )

            serializer.is_valid(
                raise_exception=True
            )

            comentario_actualizado = (
                service.clasificar_comentario(
                    id_comentario,
                    serializer.validated_data
                )
            )

            response_serializer = (
                ComentarioSerializer(
                    comentario_actualizado
                )
            )

            return Response(
                response_serializer.data
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, id_comentario):

        service = ComentarioService()

        try:

            service.eliminar_comentario(
                id_comentario
            )

            return Response(
                {
                    "message":
                    "Comentario eliminado correctamente"
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_404_NOT_FOUND
            )


class ComentarioTendenciaController(APIView):

    permission_classes = []

    def get(self, request):

        service = ComentarioService()

        tendencias = (
            service.obtener_tendencias()
        )

        return Response(
            tendencias,
            status=status.HTTP_200_OK
        )