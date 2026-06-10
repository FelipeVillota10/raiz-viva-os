from django.urls import path
from .views import ClienteListView

urlpatterns = [
    path('clientes/', ClienteListView.as_view(), name='listar_clientes'),
]

