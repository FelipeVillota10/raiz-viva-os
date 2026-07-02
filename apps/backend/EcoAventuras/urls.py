from django.urls import path
from .EcoAventuraController import (
    ecoaventuras,
    ecoaventuras_admin,
    ecoaventuras_mine,
    ecoaventura_detalle,
    ecoaventura_itinerario,
    upload_eco_image,
)

urlpatterns = [
    path('', ecoaventuras, name='ecoaventuras'),
    path('admin/', ecoaventuras_admin, name='ecoaventuras_admin'),
    path('mine/', ecoaventuras_mine, name='ecoaventuras_mine'),
    path('upload-image/', upload_eco_image, name='upload_eco_image'),
    path('<int:id>/', ecoaventura_detalle, name='ecoaventura_detalle'),
    path('<int:id>/itinerario/', ecoaventura_itinerario, name='ecoaventura_itinerario'),
]
