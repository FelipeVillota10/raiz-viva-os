from django.urls import path
from .ServicioController import ServicioController, ClienteServicioController

urlpatterns = [
    path('servicios/', ServicioController.as_view(), name='listar_servicios'),
    path('clientes/<int:cliente_id>/servicios/', ClienteServicioController.as_view(), name='cliente_servicios'),
]