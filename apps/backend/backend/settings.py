"""
Django settings for backend project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fr7m8^$tta$*r7fmhd=4per$&xs!#r))_-6u!$55nt+!a#!=(n')

DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = ['.vercel.app', 'localhost', '127.0.0.1'] if not DEBUG else ['*']


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'storages',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'Estados',
    'Clientes',
    'Productos',
    'Eventos',
    'DetallesEventos',
    'Categorias',
    'CategoriasEventos',
    'Evento',
    'Experiencia',
    'Territorio',
    'TiposActores',
    'Monedas',
    'Growth',
    'ConsolidadoEvento',
    'ConsolidadoExperiencia',
    'DetalleEvento',
    'EcoAventuras',
    'Servicios',
    'Aprobaciones',
    'usuarios',
    'Comentarios',
    'Paquete',
    'Pagos',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


#DATABASE_URL = os.environ.get('DATABASE_URL')
#if not DATABASE_URL:
#    raise Exception(
#        "DATABASE_URL no esta definida. "
#        "Copia .env.example a .env y configura tu conexion."
#    )

DATABASES = {
    #'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=False)

    'default': dj_database_url.config(
       default='postgresql://neondb_owner:npg_h6lqt9OTDgyQ@ep-red-feather-amf5zv7i-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
        conn_max_age=600,
        ssl_require=False
    
    
    #'default': dj_database_url.config(
    #    default='sqlite:///db.sqlite3',
    #   conn_max_age=600,
    #    ssl_require=False
    )
}


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


STATIC_URL = 'static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

r2_public_url = os.environ.get('R2_PUBLIC_URL', '')
r2_domain = r2_public_url.split('//')[-1] if '://' in r2_public_url else r2_public_url

if os.environ.get("R2_ACCESS_KEY_ID") and os.environ.get("R2_BUCKET_NAME"):
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {
                "access_key": os.environ.get("R2_ACCESS_KEY_ID"),
                "secret_key": os.environ.get("R2_SECRET_ACCESS_KEY"),
                "bucket_name": os.environ.get("R2_BUCKET_NAME"),
                "endpoint_url": os.environ.get("R2_ENDPOINT_URL"),
                "region_name": "auto",
                "signature_version": "s3v4",
                "custom_domain": r2_domain,
                "default_acl": "public-read",
            },
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }

if r2_domain:
    MEDIA_URL = f"https://{r2_domain}/"
else:
    MEDIA_URL = '/media/'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend' if os.environ.get('EMAIL_HOST_PASSWORD') else 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('EMAIL_FROM', 'Raiz Viva <noreply@raizviva.com>')


MP_DEFAULT_BACKEND_URL = 'https://raiz-viva-backend.vercel.app'
MP_DEFAULT_FRONTEND_URL = 'https://raiz-viva-frontend.vercel.app'

MERCADOPAGO = {
    'ACCESS_TOKEN': os.environ.get('MP_ACCESS_TOKEN', ''),
    'PUBLIC_KEY': os.environ.get('MP_PUBLIC_KEY', ''),
    'WEBHOOK_SECRET': os.environ.get('MP_WEBHOOK_SECRET', ''),
    'NOTIFICATION_URL': os.environ.get('MP_NOTIFICATION_URL', f'{MP_DEFAULT_BACKEND_URL}/api/pagos/webhook/'),
    'SUCCESS_URL': os.environ.get('MP_SUCCESS_URL', f'{MP_DEFAULT_FRONTEND_URL}/pagos/reserva/0/confirmacion?status=approved'),
    'FAILURE_URL': os.environ.get('MP_FAILURE_URL', f'{MP_DEFAULT_FRONTEND_URL}/pagos/reserva/0/confirmacion?status=rejected'),
    'PENDING_URL': os.environ.get('MP_PENDING_URL', f'{MP_DEFAULT_FRONTEND_URL}/pagos/reserva/0/confirmacion?status=pending'),
    'FRONTEND_BASE_URL': os.environ.get('MP_FRONTEND_BASE_URL', MP_DEFAULT_FRONTEND_URL),
}


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_ALL_ORIGINS = DEBUG

SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
CORS_ALLOW_CREDENTIALS = True   #necesario para que fetch con credentials:"include" funcione
