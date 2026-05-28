"""
Django settings for backend project.
"""

import os
from pathlib import Path
import dj_database_url

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
    'Evento',
    'Experiencia',
    'Territorio',
    'TiposActores',
    'Monedas',
    'Growth',
    'ConsolidadoEvento',
    'ConsolidadoExperiencia',
    'DetalleEvento',
    'Servicios',
    'Aprobaciones',
    'usuarios',
    'Comentarios',
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


DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://postgres:root@localhost:5432/raiz_viva_dev',
        conn_max_age=600,
        ssl_require=False
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
                "custom_domain": os.environ.get("R2_PUBLIC_URL"),
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

r2_public_url = os.environ.get('R2_PUBLIC_URL')
if r2_public_url:
    MEDIA_URL = f"https://{r2_public_url}/"
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


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_ALL_ORIGINS = DEBUG