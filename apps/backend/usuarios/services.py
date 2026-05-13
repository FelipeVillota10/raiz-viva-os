import logging

from django.conf import settings
from django.core.mail import send_mail
from typing import Optional

logger = logging.getLogger(__name__)


def _send_mail_safe(subject: str, message: str, recipient_list: list[str]) -> None:

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info("Correo enviado (o impreso en consola) a %s — %s", recipient_list, subject)
    except Exception as exc:
        logger.warning(
            "No se pudo enviar correo a %s (%s): %s",
            recipient_list,
            subject,
            exc,
            exc_info=settings.DEBUG,
        )


class EmailService:
    @staticmethod
    def send_solicitud_recibida(
        cliente_email: str,
        cliente_nombre: str,
        territorio: Optional[str],
        es_turista: bool = False,
    ):
        if es_turista:
            subject = 'Bienvenido a Raíz Viva'
            message = f'''
¡Hola {cliente_nombre}!

Tu registro como turista en Raíz Viva se completó correctamente.

Ya puedes iniciar sesión en la aplicación con el correo electrónico con el que te registraste y tu contraseña.

¡Gracias por unirte a la red!

Atentamente,
El equipo de Raíz Viva
            '''
        else:
            subject = 'Solicitud de Registro - Raíz Viva'
            message = f'''
¡Hola {cliente_nombre}!

Tu solicitud de registro como Actor Territorial ha sido recibida exitosamente.

Detalles de tu solicitud:
- Territorio: {territorio or 'No especificado'}

Tu solicitud está pendiente de aprobación. El líder territorial de tu territorio la revisará en las próximas horas.

¡Gracias por ser parte de Raíz Viva!

Atentamente,
El equipo de Raíz Viva
            '''
        _send_mail_safe(subject, message.strip(), [cliente_email])

    @staticmethod
    def send_notificacion_lider(lider_email: str, lider_nombre: str, actor_nombre: str, territorio: str):
        subject = 'Nueva Solicitud de Registro - Raíz Viva'
        message = f'''
¡Hola {lider_nombre}!

Se ha recibido una nueva solicitud de registro en tu territorio.

Detalles del solicitante:
- Nombre: {actor_nombre}
- Territorio: {territorio}

Por favor ingresa al panel del líder territorial para revisar y procesar esta solicitud.

Atentamente,
El equipo de Raíz Viva
        '''
        _send_mail_safe(subject, message.strip(), [lider_email])

    @staticmethod
    def send_solicitud_aprobada(cliente_email: str, cliente_nombre: str):
        subject = '¡Solicitud Aprobada! - Raíz Viva'
        message = f'''
¡Hola {cliente_nombre}!

Tu solicitud de registro ha sido APROBADA por el líder territorial.

¡Bienvenido a Raíz Viva!

Atentamente,
El equipo de Raíz Viva
        '''
        _send_mail_safe(subject, message.strip(), [cliente_email])

    @staticmethod
    def send_solicitud_rechazada(cliente_email: str, cliente_nombre: str, observaciones: Optional[str]):
        subject = 'Solicitud Rechazada - Raíz Viva'
        message = f'''
¡Hola {cliente_nombre}!

Tu solicitud de registro ha sido RECHAZADA por el líder territorial.

Observaciones: {observaciones or 'Sin observaciones'}

Puedes volver a intentarlo contactando al líder territorial.

Atentamente,
El equipo de Raíz Viva
        '''
        _send_mail_safe(subject, message.strip(), [cliente_email])
