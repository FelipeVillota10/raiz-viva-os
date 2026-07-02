from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .ConsolidadoExperienciaController import ConfirmarPagoPaqueteView, ConsolidadoExperienciaViewSet

router = DefaultRouter()
router.register(r'consolidado_experiencias', ConsolidadoExperienciaViewSet, basename='consolidado-experiencia')

urlpatterns = [
    path("paquete/pagar/", ConfirmarPagoPaqueteView.as_view(), name="paquete-pagar"),
    path("", include(router.urls)),
]
