from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'usuarios'

    def ready(self):
        import os
        if os.environ.get('RUN_MAIN', False) or os.environ.get('DJANGO_AUTORELOAD', False):
            from .models import crear_tipos_actores_default
            crear_tipos_actores_default()