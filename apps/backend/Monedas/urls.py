from django.urls import path
from .MonedaController import MonedaController

urlpatterns = [
    path('monedas/', MonedaController.as_view(), name='monedas'),
]
