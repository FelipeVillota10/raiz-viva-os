import logging
import uuid
from decimal import Decimal
from typing import Any, Dict, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


class PagoService:
    """Stateless MercadoPago payment service.

    This service intentionally does not create or update local payment rows.
    MercadoPago is the source of truth; local observability is done through logs.
    """

    @staticmethod
    def _get_sdk():
        try:
            import mercadopago
        except ImportError as exc:
            raise RuntimeError(
                "mercadopago package is not installed. Install backend requirements."
            ) from exc

        access_token = settings.MERCADOPAGO.get('ACCESS_TOKEN', '')
        if not access_token:
            raise ValueError('MP_ACCESS_TOKEN no está configurado')
        return mercadopago.SDK(access_token)

    @staticmethod
    def _build_back_urls(data: Dict[str, Any]) -> Dict[str, str]:
        mp_settings = getattr(settings, 'MERCADOPAGO', {})
        back_urls = {
            'success': mp_settings.get('SUCCESS_URL', ''),
            'failure': mp_settings.get('FAILURE_URL', ''),
            'pending': mp_settings.get('PENDING_URL', ''),
        }

        id_evento = data.get('id_evento')
        frontend_base = data.get('frontend_base_url', '') or mp_settings.get('FRONTEND_BASE_URL', '')
        if frontend_base and id_evento:
            frontend_base = frontend_base.rstrip('/')
            base_path = f'{frontend_base}/pagos/reserva/{id_evento}/confirmacion'
            back_urls = {
                'success': f'{base_path}?status=approved',
                'failure': f'{base_path}?status=rejected',
                'pending': f'{base_path}?status=pending',
            }

        return {k: v for k, v in back_urls.items() if v}

    @staticmethod
    def iniciar_pago(data: Dict[str, Any]) -> Dict[str, Optional[str]]:
        monto = Decimal(str(data['monto']))
        if monto < 0:
            raise ValueError('El monto no puede ser negativo')

        moneda = (data.get('moneda') or 'COP').upper()
        referencia = f"REF-{uuid.uuid4().hex[:10].upper()}"

        preference_data: Dict[str, Any] = {
            'items': [
                {
                    'title': data.get('descripcion') or 'Reserva Raíz Viva',
                    'quantity': 1,
                    'unit_price': float(monto),
                    'currency_id': moneda,
                }
            ],
            'payer': {
                'email': data['email_comprador'],
                'name': data['nombre_comprador'],
            },
            'external_reference': referencia,
        }

        back_urls = PagoService._build_back_urls(data)
        if back_urls:
            preference_data['back_urls'] = back_urls
            if back_urls.get('success'):
                preference_data['auto_return'] = 'approved'

        notification_url = settings.MERCADOPAGO.get('NOTIFICATION_URL', '')
        if notification_url:
            preference_data['notification_url'] = notification_url

        logger.info(
            'mercadopago.preference.create.request',
            extra={
                'referencia': referencia,
                'monto': str(monto),
                'moneda': moneda,
                'id_evento': data.get('id_evento'),
                'notification_url_configured': bool(notification_url),
            },
        )

        sdk = PagoService._get_sdk()
        result = sdk.preference().create(preference_data)

        if result.get('status') not in (200, 201):
            logger.error(
                'mercadopago.preference.create.error',
                extra={'referencia': referencia, 'mp_result': result},
            )
            raise ValueError(f'Error creando preferencia MercadoPago: {result}')

        preference = result.get('response', {})
        logger.info(
            'mercadopago.preference.create.response',
            extra={
                'referencia': referencia,
                'preference_id': preference.get('id'),
                'has_init_point': bool(preference.get('init_point')),
                'has_sandbox_init_point': bool(preference.get('sandbox_init_point')),
            },
        )

        return {
            'preference_id': preference.get('id'),
            'init_point': preference.get('init_point'),
            'sandbox_init_point': preference.get('sandbox_init_point'),
            'referencia': referencia,
        }

    @staticmethod
    def log_webhook(topic: Optional[str], resource_id: Optional[str], payload: Dict[str, Any], query_params: Dict[str, Any]) -> None:
        logger.info(
            'mercadopago.webhook.received',
            extra={
                'topic': topic,
                'resource_id': resource_id,
                'payload': payload,
                'query_params': query_params,
            },
        )
