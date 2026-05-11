"""
Script para generar datos de simulación:
- 2 Territorios
- 2 Líderes Territoriales
- 3 Actores en solicitud (PENDIENTE)
- 2 Actores aprobados
- 1 Actor rechazado

Uso: python manage.py shell < apps/backend/scripts/simulate_data.py
"""

import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from usuarios.models import Territorio, Cliente, TiposActores, ClienteTiposActores, Aprobaciones, Moneda

# Crear monedas si no existen
monedas = {}
for m in [('Peso Colombiano', 'COP'), ('Euro', 'EUR'), ('Dólar Americano', 'USD')]:
    moneda, _ = Moneda.objects.get_or_create(nombre=m[0], defaults={'simbolo': m[1]})
    monedas[m[0]] = moneda
print(f'Monedass creadas: {list(moneda.nombre for moneda in monedas.values())}')

# Crear territorios si no existen
territorio1, _ = Territorio.objects.get_or_create(nombre_territorio='Valle del Cauca', defaults={'region': 'Cauca'})
territorio2, _ = Territorio.objects.get_or_create(nombre_territorio='Eje Cafetero', defaults={'region': 'Antioquia'})

# Crear tipos de actor si no existen
tipos = {}
for nombre in ['productor', 'caminante', 'custodio', 'facilitador', 'anfitrion']:
    t, _ = TiposActores.objects.get_or_create(nombre_tipo=nombre)
    tipos[nombre] = t

# --- LÍDERES ---
lider1_email = 'lider1@raizviva.com'
lider1_pass = 'Lider1234'
if not User.objects.filter(email=lider1_email).exists():
    user1 = User.objects.create_user(username='lider1', email=lider1_email, password=lider1_pass, first_name='María', last_name='García')
    cliente_lider1 = Cliente.objects.create(
        id_usuario=user1,
        nombre_completo='María García',
        id_territorio=territorio1,
        es_lider=True,
        telefono='3001234567',
    )
    print(f'Líder 1 creado: {lider1_email} / {lider1_pass}')
else:
    cliente_lider1 = Cliente.objects.get(id_usuario__email=lider1_email)
    print(f'Líder 1 ya existe: {lider1_email}')

lider2_email = 'lider2@raizviva.com'
lider2_pass = 'Lider1234'
if not User.objects.filter(email=lider2_email).exists():
    user2 = User.objects.create_user(username='lider2', email=lider2_email, password=lider2_pass, first_name='Carlos', last_name='Martínez')
    cliente_lider2 = Cliente.objects.create(
        id_usuario=user2,
        nombre_completo='Carlos Martínez',
        id_territorio=territorio2,
        es_lider=True,
        telefono='3109876543',
    )
    print(f'Líder 2 creado: {lider2_email} / {lider2_pass}')
else:
    cliente_lider2 = Cliente.objects.get(id_usuario__email=lider2_email)
    print(f'Líder 2 ya existe: {lider2_email}')

# --- ACTORES PENDIENTES (no aprobados aún) ---
actores_pendientes = [
    {'email': 'actor1@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Juan Pérez', 'territorio': territorio1, 'servicio': 'Venta de cafés orgánicos y artesanales de la región', 'tipos': ['productor']},
    {'email': 'actor2@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Ana López', 'territorio': territorio1, 'servicio': 'Guía de rutas ecoturísticas por senderos naturales', 'tipos': ['caminante']},
    {'email': 'actor3@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Roberto Díaz', 'territorio': territorio1, 'servicio': 'Hospedaje rural y experiencias gastronómicas con productos locales', 'tipos': ['anfitrion']},
    {'email': 'actor4@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Laura Castro', 'territorio': territorio2, 'servicio': 'Talleres de cerámica y arte con materiales reciclados', 'tipos': ['facilitador']},
    {'email': 'actor5@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Pedro Sánchez', 'territorio': territorio2, 'servicio': 'Protección y recorridos por la reserva natural', 'tipos': ['custodio']},
]

for actor_data in actores_pendientes:
    if not User.objects.filter(email=actor_data['email']).exists():
        user = User.objects.create_user(
            username=actor_data['email'].split('@')[0],
            email=actor_data['email'],
            password=actor_data['pass'],
            first_name=actor_data['nombre'].split()[0],
            last_name=' '.join(actor_data['nombre'].split()[1:])
        )
        cliente = Cliente.objects.create(
            id_usuario=user,
            nombre_completo=actor_data['nombre'],
            id_territorio=actor_data['territorio'],
            servicio=actor_data['servicio'],
            telefono='3150000000',
            es_actor=False,
            es_lider=False,
            es_turista=False,
        )
        for tipo_nombre in actor_data['tipos']:
            ClienteTiposActores.objects.create(id_actor=cliente, id_tipo=tipos[tipo_nombre])

        Aprobaciones.objects.create(
            id_actor=cliente,
            id_lider=cliente_lider1 if actor_data['territorio'] == territorio1 else cliente_lider2,
            estado_resultado='PENDIENTE',
        )
        print(f'Actor pendiente creado: {actor_data["email"]} / {actor_data["pass"]}')
    else:
        print(f'Actor pendiente ya existe: {actor_data["email"]}')

# --- ACTORES APROBADOS ---
actores_aprobados = [
    {'email': 'aprobado1@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Sofia Torres', 'territorio': territorio1, 'servicio': 'Comidas típicas del Valle con ingredientes orgánicos locales', 'tipos': ['anfitrion']},
    {'email': 'aprobado2@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Miguel Rojas', 'territorio': territorio2, 'servicio': 'Elaboración de mermeladas y dulces tradicionales', 'tipos': ['productor']},
]

for actor_data in actores_aprobados:
    if not User.objects.filter(email=actor_data['email']).exists():
        user = User.objects.create_user(
            username=actor_data['email'].split('@')[0],
            email=actor_data['email'],
            password=actor_data['pass'],
            first_name=actor_data['nombre'].split()[0],
            last_name=' '.join(actor_data['nombre'].split()[1:])
        )
        cliente = Cliente.objects.create(
            id_usuario=user,
            nombre_completo=actor_data['nombre'],
            id_territorio=actor_data['territorio'],
            servicio=actor_data['servicio'],
            telefono='3160000000',
            es_actor=True,
            es_lider=False,
            es_turista=False,
        )
        for tipo_nombre in actor_data['tipos']:
            ClienteTiposActores.objects.create(id_actor=cliente, id_tipo=tipos[tipo_nombre])

        Aprobaciones.objects.create(
            id_actor=cliente,
            id_lider=cliente_lider1 if actor_data['territorio'] == territorio1 else cliente_lider2,
            estado_resultado='APROBADO',
            observaciones='Solicitud aprobada. Bienvenido al ecosistema Raíz Viva.',
            fecha_respuesta=django.utils.timezone.now(),
        )
        print(f'Actor aprobado creado: {actor_data["email"]} / {actor_data["pass"]}')
    else:
        print(f'Actor aprobado ya existe: {actor_data["email"]}')

# --- ACTOR RECHAZADO ---
actor_rechazado_data = {'email': 'rechazado1@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Carlos Bermúdez', 'territorio': territorio1, 'servicio': 'Venta de artesanías y souvenir', 'tipos': ['productor']}

if not User.objects.filter(email=actor_rechazado_data['email']).exists():
    user = User.objects.create_user(
        username=actor_rechazado_data['email'].split('@')[0],
        email=actor_rechazado_data['email'],
        password=actor_rechazado_data['pass'],
        first_name=actor_rechazado_data['nombre'].split()[0],
        last_name=' '.join(actor_rechazado_data['nombre'].split()[1:])
    )
    cliente = Cliente.objects.create(
        id_usuario=user,
        nombre_completo=actor_rechazado_data['nombre'],
        id_territorio=actor_rechazado_data['territorio'],
        servicio=actor_rechazado_data['servicio'],
        telefono='3170000000',
        es_actor=False,
        es_lider=False,
        es_turista=False,
    )
    for tipo_nombre in actor_rechazado_data['tipos']:
        ClienteTiposActores.objects.create(id_actor=cliente, id_tipo=tipos[tipo_nombre])

    Aprobaciones.objects.create(
        id_actor=cliente,
        id_lider=cliente_lider1,
        estado_resultado='RECHAZADO',
        observaciones='La información del servicio no es suficiente. Por favor completa más detalles sobre tu oferta.',
        fecha_respuesta=django.utils.timezone.now(),
    )
    print(f'Actor rechazado creado: {actor_rechazado_data["email"]} / {actor_rechazado_data["pass"]}')
else:
    print(f'Actor rechazado ya existe: {actor_rechazado_data["email"]}')

# --- ACTOR EN REVISIÓN ---
actor_revision_data = {'email': 'revision1@raizviva.com', 'pass': 'Actor1234', 'nombre': 'Diana Ruiz', 'territorio': territorio1, 'servicio': 'Organización de eventos culturales y talleres comunitarios', 'tipos': ['facilitador', 'custodio']}

if not User.objects.filter(email=actor_revision_data['email']).exists():
    user = User.objects.create_user(
        username=actor_revision_data['email'].split('@')[0],
        email=actor_revision_data['email'],
        password=actor_revision_data['pass'],
        first_name=actor_revision_data['nombre'].split()[0],
        last_name=' '.join(actor_revision_data['nombre'].split()[1:])
    )
    cliente = Cliente.objects.create(
        id_usuario=user,
        nombre_completo=actor_revision_data['nombre'],
        id_territorio=actor_revision_data['territorio'],
        servicio=actor_revision_data['servicio'],
        telefono='3180000000',
        es_actor=False,
        es_lider=False,
        es_turista=False,
    )
    for tipo_nombre in actor_revision_data['tipos']:
        ClienteTiposActores.objects.create(id_actor=cliente, id_tipo=tipos[tipo_nombre])

    Aprobaciones.objects.create(
        id_actor=cliente,
        id_lider=cliente_lider1,
        estado_resultado='EN_REVISION',
        observaciones='Revisando documentación adicional.',
    )
    print(f'Actor en revisión creado: {actor_revision_data["email"]} / {actor_revision_data["pass"]}')
else:
    print(f'Actor en revisión ya existe: {actor_revision_data["email"]}')

print('\n=== Datos de simulación cargados ===')
print(f'Líder 1: {cliente_lider1.nombre_completo} ({cliente_lider1.id_territorio.nombre_territorio})')
print(f'Líder 2: {cliente_lider2.nombre_completo} ({cliente_lider2.id_territorio.nombre_territorio})')