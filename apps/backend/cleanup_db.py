import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute('DROP TABLE IF EXISTS detalles_eventos CASCADE;')
    cursor.execute("DELETE FROM django_migrations WHERE app = 'DetallesEventos';")
print("Cleaned up table and migrations.")
