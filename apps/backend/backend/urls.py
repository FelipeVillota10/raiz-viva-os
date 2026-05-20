from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from Growth.GrowthController import GrowthController

def home(request):
    return JsonResponse({
        "status": "ok",
        "message": "Backend Raiz Viva OS esta corriendo correctamente"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('usuarios.urls')),
    path('api/', include('Aprobaciones.urls')),
    path('api/', include('Servicios.urls')),
    path('api/growth/', GrowthController.as_view(), name='growth'),
    path('', home, name='home'),
]