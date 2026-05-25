from django.urls import path
from .UsuarioController import (
    CustomTokenObtainPairView,
    PerfilUsuarioController,
    TiposActoresController,
    TerritoriosController,
    MonedasController,
    RegistroClienteController,
    ClienteController,
    PerfilServiciosController,
    AdminTerritoriosController,
)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/me/', PerfilUsuarioController.as_view(), name='perfil_usuario'),
    path('perfil/actualizar/', PerfilUsuarioController.as_view(), name='actualizar_perfil'),
    path('perfil/servicios/', PerfilServiciosController.as_view(), name='perfil_servicios'),
    path('perfil/servicios/<int:servicio_id>/', PerfilServiciosController.as_view(), name='perfil_servicio_detalle'),
    path('tipos-actores/', TiposActoresController.as_view(), name='listar_tipos_actores'),
    path('territorios/', TerritoriosController.as_view(), name='listar_territorios'),
    path('monedas/', MonedasController.as_view(), name='listar_monedas'),
    path('registro/cliente/', RegistroClienteController.as_view(), name='registro_cliente'),
    path('clientes/<int:pk>/', ClienteController.as_view(), name='obtener_cliente'),
    path('admin/territorios/', AdminTerritoriosController.as_view(), name='admin_territorios'),
    path('admin/territorios/<int:pk>/', AdminTerritoriosController.as_view(), name='admin_territorio_detalle'),
]