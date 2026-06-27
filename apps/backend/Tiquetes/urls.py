from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .TiqueteController import TiqueteController

router = DefaultRouter()
router.register(r'', TiqueteController, basename='tiquetes')

urlpatterns = [
    path('', include(router.urls)),
]
