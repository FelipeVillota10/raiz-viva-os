from django.urls import path
from . import views

urlpatterns = [
    path('tipos-actores/', views.listar_tipos_actores, name='listar_tipos_actores'),
    path('territorios/', views.listar_territorios, name='listar_territorios'),
    path('monedass/', views.listar_monedass, name='listar_monedass'),
    path('registro/cliente/', views.registro_cliente, name='registro_cliente'),
    path('clientes/<int:pk>/', views.obtener_cliente, name='obtener_cliente'),
    path('auth/me/', views.perfil_usuario, name='perfil_usuario'),
    path('solicitudes/', views.listar_solicitudes, name='listar_solicitudes'),
    path('solicitudes/<int:pk>/', views.obtener_solicitud, name='obtener_solicitud'),
    path('solicitudes/<int:pk>/actualizar/', views.actualizar_solicitud, name='actualizar_solicitud'),
    path('lider/dashboard/', views.dashboard_lider, name='dashboard_lider'),
]