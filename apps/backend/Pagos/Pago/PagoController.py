import hashlib
import hmac
import logging
import re
import time
from decimal import Decimal, InvalidOperation
from typing import Any, Dict
from urllib.parse import parse_qs, urlparse

from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .PagoSerializer import IniciarPagoSerializer
from .PagoService import PagoService

logger = logging.getLogger(__name__)


class IniciarPagoController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def _enrich_from_event(self, request) -> Dict[str, Any]:
        data = request.data.copy()
        id_evento = data.get('id_evento')

        if not id_evento:
            referer = request.headers.get('referer', '') or request.headers.get('referrer', '')
            match = re.search(r'/pagos/reserva/(\d+)', referer)
            if match:
                id_evento = match.group(1)
                data['id_evento'] = id_evento

        if not id_evento:
            return data

        try:
            from Eventos.EventoModel import EventoModel
            evento = EventoModel.objects.filter(id_evento=id_evento).first()
        except Exception:
            logger.exception('pagos.iniciar.event_lookup_error', extra={'id_evento': id_evento})
            return data

        if not evento:
            return data

        if not data.get('descripcion'):
            data['descripcion'] = evento.nombre

        try:
            monto = Decimal(str(data.get('monto', '0') or '0'))
        except (InvalidOperation, TypeError, ValueError):
            monto = Decimal('0')

        if monto <= 0:
            data['monto'] = str(evento.costo_evento or '0')

        return data

    def post(self, request):
        serializer = IniciarPagoSerializer(data=self._enrich_from_event(request))
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        try:
            result = PagoService.iniciar_pago(serializer.validated_data)
            return Response(result, status=200)
        except ValueError as exc:
            logger.warning('pagos.iniciar.validation_error', extra={'error': str(exc)})
            return Response({'error': str(exc)}, status=400)
        except Exception:
            logger.exception('pagos.iniciar.unexpected_error')
            return Response({'error': 'Error interno iniciando pago'}, status=500)


class WebhookMercadoPagoController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def _validar_firma(self, request) -> bool:
        if settings.DEBUG:
            return True

        secret = settings.MERCADOPAGO.get('WEBHOOK_SECRET', '')
        if not secret:
            return True

        signature = request.headers.get('x-signature', '')
        request_id = request.headers.get('x-request-id', '')

        parts: Dict[str, str] = {}
        for part in signature.split(','):
            if '=' in part:
                key, value = part.split('=', 1)
                parts[key.strip()] = value.strip()

        ts = parts.get('ts', '')
        v1 = parts.get('v1', '')

        if not ts or not v1 or not request_id:
            logger.error('mercadopago.webhook.signature.invalid.missing_headers')
            return False

        try:
            if abs(time.time() - int(ts)) > 60:
                logger.error('mercadopago.webhook.signature.invalid.expired', extra={'ts': ts})
                return False
        except ValueError:
            logger.error('mercadopago.webhook.signature.invalid.timestamp', extra={'ts': ts})
            return False

        payload = request.body.decode('utf-8') if request.method == 'POST' else request.META.get('QUERY_STRING', '')
        message = f'{request_id}|{ts}|{payload}'
        computed = hmac.new(secret.encode('utf-8'), message.encode('utf-8'), hashlib.sha256).hexdigest()

        if not hmac.compare_digest(computed, v1):
            logger.error('mercadopago.webhook.signature.invalid.hmac')
            return False

        return True

    def _extract(self, request) -> tuple[Any, Any]:
        topic = request.data.get('type') if hasattr(request, 'data') else None
        topic = topic or request.query_params.get('topic') or request.query_params.get('type')

        resource_id = None
        data = request.data.get('data') if hasattr(request, 'data') and isinstance(request.data, dict) else None
        if isinstance(data, dict):
            resource_id = data.get('id')
        resource_id = resource_id or request.query_params.get('data.id') or request.query_params.get('id')
        return topic, resource_id

    def post(self, request):
        if not self._validar_firma(request):
            return Response({'error': 'Firma inválida'}, status=403)

        topic, resource_id = self._extract(request)
        payload = request.data if isinstance(request.data, dict) else {'raw': str(request.data)}
        PagoService.log_webhook(topic, resource_id, payload, dict(request.query_params))

        if topic == 'payment' and resource_id:
            try:
                sdk = PagoService._get_sdk()
                payment_info = sdk.payment().get(resource_id)
                if payment_info.get('status') in (200, 201):
                    resp = payment_info.get('response', {})
                    ref = resp.get('external_reference')
                    mp_status = resp.get('status')
                    transaction_amount = resp.get('transaction_amount')
                    if ref and mp_status:
                        monto = Decimal(str(transaction_amount)) if transaction_amount is not None else None
                        PagoService.procesar_confirmacion_pago(ref, mp_status, monto)
            except Exception as e:
                logger.exception(f"Error procesando webhook de MercadoPago para resource {resource_id}: {e}")

        return Response({'ok': True}, status=200)

    def get(self, request):
        if not self._validar_firma(request):
            return Response({'error': 'Firma inválida'}, status=403)

        topic, resource_id = self._extract(request)
        PagoService.log_webhook(topic, resource_id, {}, dict(request.query_params))
        
        if topic == 'payment' and resource_id:
            try:
                sdk = PagoService._get_sdk()
                payment_info = sdk.payment().get(resource_id)
                if payment_info.get('status') in (200, 201):
                    resp = payment_info.get('response', {})
                    ref = resp.get('external_reference')
                    mp_status = resp.get('status')
                    transaction_amount = resp.get('transaction_amount')
                    if ref and mp_status:
                        monto = Decimal(str(transaction_amount)) if transaction_amount is not None else None
                        PagoService.procesar_confirmacion_pago(ref, mp_status, monto)
            except Exception as e:
                logger.exception(f"Error procesando webhook de MercadoPago para resource {resource_id}: {e}")

        return Response({'ok': True}, status=200)


class RespuestaMercadoPagoController(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        referer_params: Dict[str, list[str]] = {}
        referer = request.headers.get('referer', '') or request.headers.get('referrer', '')
        if referer:
            referer_params = parse_qs(urlparse(referer).query)

        def first_from_referer(key: str):
            values = referer_params.get(key) or []
            return values[0] if values else None

        referencia = (
            request.query_params.get('external_reference')
            or request.query_params.get('referencia')
            or first_from_referer('external_reference')
            or first_from_referer('referencia')
        )
        status = (
            request.query_params.get('status')
            or request.query_params.get('collection_status')
            or first_from_referer('status')
            or first_from_referer('collection_status')
            or 'pending'
        )

        if not referencia:
            return Response({'error': 'Referencia no proporcionada'}, status=400)

        estado_map = {
            'approved': 2,
            'rejected': 3,
            'cancelled': 4,
            'expired': 4,
            'pending': 1,
            'in_process': 1,
        }
        estado = estado_map.get(status, 1)

        if referencia:
            PagoService.procesar_confirmacion_pago(referencia, status)

        monto_str = '0.00'
        id_cliente = None
        
        if referencia and referencia.startswith('CONF-'):
            try:
                parts = referencia.split('-')
                if len(parts) >= 2:
                    id_consolidado = int(parts[1])
                    from ConsolidadoEvento.ConsolidadoEventoModel import ConsolidadoEventoModel
                    consolidado = ConsolidadoEventoModel.objects.filter(id_consolidado_ev=id_consolidado).first()
                    if consolidado:
                        if consolidado.pagado:
                            estado = 2
                        monto_str = str(consolidado.monto_pagado or '0.00')
                        id_cliente = consolidado.cliente_id
            except Exception:
                pass

        return Response({
            'id_pago': 0,
            'estado': estado,
            'id_cliente': id_cliente,
            'monto': monto_str,
            'moneda': 'COP',
            'fecha_creacion': None,
            'fecha_confirmacion': None,
            'referencia': referencia,
            'preference_id': None,
            'mp_payment_id': request.query_params.get('payment_id') or request.query_params.get('collection_id'),
            'mp_status': status,
        }, status=200)

