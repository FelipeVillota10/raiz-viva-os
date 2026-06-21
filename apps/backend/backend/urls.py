
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from Growth.GrowthController import GrowthController
from Comentarios.ComentarioController import ComentarioController
from Eventos.EventoController import EventoController


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
    path('api/comentarios/', include('Comentarios.urls')),
    path('api/', include('CategoriasEventos.urls')),
    path('api/', include('Eventos.urls')),
    path('api/', include('usuarios.urls')),
    path('api/growth/', GrowthController.as_view(), name='growth'),



     path('api/ecoaventuras/', include('EcoAventuras.urls')),
     path('api/', include('Paquete.urls')),
     path('api/', include('Monedas.urls')),
     path('api/', include('Territorio.urls')),

    # Ruta raíz (esto soluciona el 404)
    path('', home, name='home'),
    path('api/', include('Clientes.urls')),


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)