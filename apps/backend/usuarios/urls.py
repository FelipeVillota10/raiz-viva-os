from django.urls import path
from . import views

urlpatterns = [
    path('roles/', views.listar_roles, name='listar_roles'),
    path('registro/actor-territorial/', views.registro_actor_territorial, name='registro_actor_territorial'),
    path('actores/<int:pk>/', views.obtener_actor, name='obtener_actor'),
]