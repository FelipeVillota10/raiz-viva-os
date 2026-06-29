from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsolidadoEventoViewSet

router = DefaultRouter()
router.register(r'', ConsolidadoEventoViewSet, basename='consolidado-evento')

urlpatterns = [
    path('', include(router.urls)),
]
