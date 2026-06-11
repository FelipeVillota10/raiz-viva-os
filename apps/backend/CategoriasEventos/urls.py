from django.urls import path
from .CategoriaEventoController import CategoriaEventoController

urlpatterns = [
    path('categorias-eventos/', CategoriaEventoController.as_view(), name='categorias-eventos'),
    path('categorias-eventos/<int:pk>/', CategoriaEventoController.as_view(), name='categorias-eventos-detail'),
]