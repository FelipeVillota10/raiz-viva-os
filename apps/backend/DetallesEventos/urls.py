from django.urls import path
from .DetalleEventoController import DetalleEventoController

urlpatterns = [
    path('', DetalleEventoController.as_view(), name='detalle-evento-list'),
    path('<int:pk>/', DetalleEventoController.as_view(), name='detalle-evento-detail'),
]
