from django.urls import path
from .EventoController import EventoController

urlpatterns = [
    path('eventos/', EventoController.as_view(), name='eventos'),
    path('eventos', EventoController.as_view(), name='eventos-noslash'),
    path('eventos/<int:pk>/', EventoController.as_view(), name='eventos-detail-update-delete'),
    path('eventos/<int:pk>', EventoController.as_view(), name='eventos-detail-update-delete-noslash'),
]