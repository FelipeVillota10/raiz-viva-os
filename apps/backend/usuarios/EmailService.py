from django.core.mail import send_mail
from django.conf import settings


class EmailService:
    @staticmethod
    def send_solicitud_recibida(cliente_email, cliente_nombre, territorio, es_turista):
        if es_turista:
            subject = 'Bienvenido a Raíz Viva'
            message = (
                f'Hola {cliente_nombre},\n\n'
                f'Tu registro como turista ha sido completado exitosamente.\n\n'
                f'Ya puedes iniciar sesión en la plataforma.\n\n'
                f'Saludos,\n'
                f'Raíz Viva'
            )
        else:
            subject = 'Solicitud de Registro Recibida'
            message = (
                f'Hola {cliente_nombre},\n\n'
                f'Hemos recibido tu solicitud de registro.'
                f'Tu líder territorial la revisará pronto.\n\n'
                f'Saludos,\n'
                f'Raíz Viva'
            )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente_email],
            fail_silently=False,
        )

    @staticmethod
    def send_notificacion_lider(lider_email, lider_nombre, actor_nombre, territorio):
        subject = 'Nueva Solicitud de Registro'
        message = (
            f'Hola {lider_nombre},\n\n'
            f'Se ha recibido una nueva solicitud de registro en {territorio or "tu territorio"}:\n\n'
            f'Nombre: {actor_nombre}\n\n'
            f'Por favor, revisa la solicitud en la plataforma.\n\n'
            f'Saludos,\n'
            f'Raíz Viva'
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [lider_email],
            fail_silently=False,
        )

    @staticmethod
    def send_solicitud_aprobada(cliente_email, cliente_nombre):
        subject = '¡Tu Solicitud ha sido Aprobada!'
        message = (
            f'Hola {cliente_nombre},\n\n'
            f'¡Buenas noticias! Tu solicitud de registro ha sido aprobada.\n\n'
            f'Ahora puedes iniciar sesión y comenzar a participar.\n\n'
            f'Saludos,\n'
            f'Raíz Viva'
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente_email],
            fail_silently=False,
        )

    @staticmethod
    def send_solicitud_rechazada(cliente_email, cliente_nombre, observaciones):
        subject = 'Actualización de tu Solicitud'
        message = (
            f'Hola {cliente_nombre},\n\n'
            f'Tu solicitud de registro ha sido rechazada.\n\n'
            f'Observaciones: {observaciones or "Sin observaciones adicionales."}\n\n'
            f'Si tienes alguna pregunta, contacta a tu líder territorial.\n\n'
            f'Saludos,\n'
            f'Raíz Viva'
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente_email],
            fail_silently=False,
        )