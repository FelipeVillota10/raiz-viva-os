from django.urls import path
from .AprobacionController import (
    SolicitudesController,
    SolicitudDetalleController,
    SolicitudActualizarController,
    DashboardLiderController,
)

urlpatterns = [
    path('solicitudes/', SolicitudesController.as_view(), name='listar_solicitudes'),
    path('solicitudes/<int:pk>/', SolicitudDetalleController.as_view(), name='obtener_solicitud'),
    path('solicitudes/<int:pk>/actualizar/', SolicitudActualizarController.as_view(), name='actualizar_solicitud'),
    path('lider/dashboard/', DashboardLiderController.as_view(), name='dashboard_lider'),
]