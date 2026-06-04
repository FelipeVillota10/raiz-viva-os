from django.urls import path
from .EcoAventuraController import (
    ecoaventuras,
    ecoaventuras_admin,
    ecoaventura_detalle,
    ecoaventura_itinerario,
)

urlpatterns = [
    path('', ecoaventuras, name='ecoaventuras'),
    path('admin/', ecoaventuras_admin, name='ecoaventuras_admin'),
    path('<int:id>/', ecoaventura_detalle, name='ecoaventura_detalle'),
    path('<int:id>/itinerario/', ecoaventura_itinerario, name='ecoaventura_itinerario'),
]
