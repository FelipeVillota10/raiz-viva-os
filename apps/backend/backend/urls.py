from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from Growth.GrowthController import GrowthController
from Eventos.EventoController import EventoController

def home(request):
    return JsonResponse({
        "status": "ok",
        "message": "Backend Raíz Viva OS está corriendo correctamente"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('usuarios.urls')),
    path('api/', include('Aprobaciones.urls')),
    path('api/', include('Servicios.urls')),
    path('api/growth/', GrowthController.as_view(), name='growth'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/eventos/', EventoController.as_view(), name='eventos'),
    path('eventos/<int:pk>/', EventoController.as_view(), name='eventos-detail-update-delete'),
    path('', home, name='home'),
]# En tu urls.py (ejemplo)
from django.urls import path


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)