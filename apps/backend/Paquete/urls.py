from django.urls import path
from .PaqueteController import PaqueteView, AgregarExperienciaView, EliminarItemView

urlpatterns = [
    path("paquete/", PaqueteView.as_view(), name="paquete"),
    path("paquete/agregar/", AgregarExperienciaView.as_view(), name="paquete-agregar"),
    path("paquete/items/<int:item_id>/", EliminarItemView.as_view(), name="paquete-eliminar-item"),
]