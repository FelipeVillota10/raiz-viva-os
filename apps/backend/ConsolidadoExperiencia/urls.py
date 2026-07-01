from django.urls import path
from .ConsolidadoExperienciaController import ConfirmarPagoPaqueteView

urlpatterns = [
    path("paquete/pagar/", ConfirmarPagoPaqueteView.as_view(), name="paquete-pagar"),
]
