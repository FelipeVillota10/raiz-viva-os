from django.urls import path
from .TerritorioController import TerritorioController

urlpatterns = [
    path('territorios/', TerritorioController.as_view(), name='territorios_list'),
]
