from django.urls import path
from .EventoController import EventoDetalleController

urlpatterns = [
    path('<int:id_evento>/', EventoDetalleController.as_view()),
]
