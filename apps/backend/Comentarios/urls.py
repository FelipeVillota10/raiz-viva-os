from django.urls import path

from .ComentarioController import (
    ComentarioController,
    ComentarioTendenciaController
)

urlpatterns = [

    path(
        '',
        ComentarioController.as_view(),
        name='comentarios'
    ),

    path(
        'tendencias/',
        ComentarioTendenciaController.as_view(),
        name='comentarios-tendencias'
    ),

    path(
        '<int:id_comentario>/',
        ComentarioController.as_view(),
        name='comentario-update'
    ),

]