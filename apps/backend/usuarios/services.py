from django.core.mail import send_mail
from django.conf import settings
from typing import Optional


class EmailService:
    @staticmethod
    def send_solicitud_recibida(cliente_email: str, cliente_nombre: str, territorio: Optional[str]):
        send_mail(
            subject='Solicitud de Registro - Raíz Viva',
            message=f'''
¡Hola {cliente_nombre}!

Tu solicitud de registro como Actor Territorial ha sido recibida exitosamente.

Detalles de tu solicitud:
- Territorio: {territorio or 'No especificado'}

Tu solicitud está pendiente de aprobación. El líder territorial de tu territorio la revisará en las próximas horas.

¡Gracias por ser parte de Raíz Viva!

Atentamente,
El equipo de Raíz Viva
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[cliente_email],
            fail_silently=True,
        )

    @staticmethod
    def send_notificacion_lider(lider_email: str, lider_nombre: str, actor_nombre: str, territorio: str):
        send_mail(
            subject='Nueva Solicitud de Registro - Raíz Viva',
            message=f'''
¡Hola {lider_nombre}!

Se ha recibido una nueva solicitud de registro en tu territorio.

Detalles del solicitante:
- Nombre: {actor_nombre}
- Territorio: {territorio}

Por favor ingresa al panel del líder territorial para revisar y procesar esta solicitud.

Atentamente,
El equipo de Raíz Viva
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[lider_email],
            fail_silently=True,
        )

    @staticmethod
    def send_solicitud_aprobada(cliente_email: str, cliente_nombre: str):
        send_mail(
            subject='¡Solicitud Aprobada! - Raíz Viva',
            message=f'''
¡Hola {cliente_nombre}!

Tu solicitud de registro ha sido APROBADA por el líder territorial.

¡Bienvenido a Raíz Viva!

Atentamente,
El equipo de Raíz Viva
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[cliente_email],
            fail_silently=True,
        )

    @staticmethod
    def send_solicitud_rechazada(cliente_email: str, cliente_nombre: str, observaciones: Optional[str]):
        send_mail(
            subject='Solicitud Rechazada - Raíz Viva',
            message=f'''
¡Hola {cliente_nombre}!

Tu solicitud de registro ha sido RECHAZADA por el líder territorial.

Observaciones: {observaciones or 'Sin observaciones'}

Puedes volver a intentarlo contactando al líder territorial.

Atentamente,
El equipo de Raíz Viva
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[cliente_email],
            fail_silently=True,
        )