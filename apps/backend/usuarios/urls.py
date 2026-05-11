from django.urls import path
from . import views

urlpatterns = [
    path('tipos-actores/', views.listar_tipos_actores, name='listar_tipos_actores'),
    path('territorios/', views.listar_territorios, name='listar_territorios'),
    path('monedas/', views.listar_monedas, name='listar_monedas'),
    path('registro/cliente/', views.registro_cliente, name='registro_cliente'),
    path('clientes/<int:pk>/', views.obtener_cliente, name='obtener_cliente'),
    path('solicitudes/pendientes/', views.listar_solicitudes_pendientes, name='listar_solicitudes_pendientes'),
    path('solicitudes/<int:pk>/aprobar/', views.aprobar_solicitud, name='aprobar_solicitud'),
    path('solicitudes/<int:pk>/rechazar/', views.rechazar_solicitud, name='rechazar_solicitud'),
]