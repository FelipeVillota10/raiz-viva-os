import uuid
from decimal import Decimal

import mercadopago
from django.conf import settings

from .PagoRepository import PagoRepository
from Pagos.Cupon.CuponRepository import CuponRepository
from Pagos.TransaccionMP.TransaccionMPRepository import TransaccionMPRepository
from Pagos.PagoLog.PagoLogRepository import PagoLogRepository


class PagoService:

    @staticmethod
    def _get_sdk():
        return mercadopago.SDK(settings.MERCADOPAGO['ACCESS_TOKEN'])

    @staticmethod
    def _aplicar_cupon(monto: Decimal, codigo_cupon: str):
        cupon = CuponRepository.obtener_valido(codigo_cupon)
        if not cupon:
            raise ValueError("Cupón no válido o no encontrado")
        if cupon.veces_usado >= cupon.usos:
            raise ValueError("Cupón agotado")
        if cupon.tipo == 'porcentaje':
            descuento = monto * (Decimal(str(cupon.valor)) / 100)
        else:
            descuento = Decimal(str(cupon.valor))
        return max(monto - descuento, Decimal('0')), cupon

    @staticmethod
    def iniciar_pago(data: dict) -> dict:
        monto = Decimal(str(data['monto']))
        moneda = data.get('moneda', 'COP')
        cupon = None

        if data.get('codigo_cupon'):
            monto, cupon = PagoService._aplicar_cupon(monto, data['codigo_cupon'])

        referencia = f"REF-{uuid.uuid4().hex[:10].upper()}"

        pago = PagoRepository.crear({
            'estado': 1,
            'id_cliente': data.get('id_cliente'),
            'monto': monto,
            'moneda': moneda,
            'referencia': referencia,
        })

        if cupon:
            CuponRepository.incrementar_uso(cupon.id_cupon)

        sdk = PagoService._get_sdk()

        currency_id = moneda
        preference_data = {
            "items": [{
                "title": data['descripcion'],
                "quantity": 1,
                "unit_price": float(monto),
                "currency_id": currency_id,
            }],
            "payer": {
                "email": data['email_comprador'],
                "name": data['nombre_comprador'],
            },
            "external_reference": referencia,
            "back_urls": {
                "success": settings.MERCADOPAGO['SUCCESS_URL'],
                "failure": settings.MERCADOPAGO['FAILURE_URL'],
                "pending": settings.MERCADOPAGO['PENDING_URL'],
            },
            "auto_return": "approved",
        }

        notification_url = settings.MERCADOPAGO.get('NOTIFICATION_URL', '')
        if notification_url:
            preference_data["notification_url"] = notification_url

        PagoLogRepository.registrar(pago.id_pago, 'REQUEST', {
            'referencia': referencia,
            'monto': str(monto),
            'moneda': moneda,
            'preference_data': preference_data,
        })

        result = sdk.preference().create(preference_data)

        if result.get("status") not in (200, 201):
            PagoLogRepository.registrar(pago.id_pago, 'ERROR', {
                'error': result,
            })
            raise ValueError(f"Error creando preferencia MercadoPago: {result}")

        preference = result["response"]
        PagoRepository.actualizar(referencia, {
            'preference_id': preference['id'],
        })

        PagoLogRepository.registrar(pago.id_pago, 'RESPONSE', {
            'preference_id': preference['id'],
            'init_point': preference.get('init_point'),
        })

        return {
            'preference_id': preference['id'],
            'init_point': preference.get('init_point'),
            'sandbox_init_point': preference.get('sandbox_init_point'),
            'referencia': referencia,
        }

    @staticmethod
    def confirmar_pago(topic: str, resource_id: str):
        if topic not in ('payment', 'merchant_order'):
            return

        sdk = PagoService._get_sdk()

        if topic == 'payment':
            result = sdk.payment().get(resource_id)
        else:
            result = sdk.merchant_order().get(resource_id)

        if result.get("status") not in (200, 201):
            PagoLogRepository.registrar(None, 'ERROR', {
                'topic': topic,
                'resource_id': resource_id,
                'error': result,
            })
            raise ValueError(f"Error obteniendo {topic} de MercadoPago")

        data = result["response"]
        PagoLogRepository.registrar(None, 'WEBHOOK', {
            'topic': topic,
            'resource_id': resource_id,
            'data': data,
        })

        if topic == 'payment':
            PagoService._procesar_payment(data)
        elif topic == 'merchant_order':
            PagoService._procesar_merchant_order(data)

    @staticmethod
    def _procesar_payment(payment_data: dict):
        external_reference = payment_data.get('external_reference')
        if not external_reference:
            return

        try:
            pago = PagoRepository.obtener_por_referencia(external_reference)
        except Exception:
            return

        mp_status = payment_data.get('status', '')
        ESTADO_MAP = {
            'approved': 2,
            'rejected': 3,
            'cancelled': 4,
            'expired': 4,
        }
        estado_id = ESTADO_MAP.get(mp_status, 1)

        mp_payment_id = str(payment_data.get('id', ''))
        mp_payment_type = payment_data.get('payment_type', '')

        if estado_id != 1:
            PagoRepository.confirmar(external_reference, estado_id, mp_payment_id)

        TransaccionMPRepository.crear({
            'id_pago_id': pago.id_pago,
            'mp_payment_id': mp_payment_id,
            'mp_status': mp_status,
            'mp_payment_type': mp_payment_type,
            'raw_response': payment_data,
        })

    @staticmethod
    def _procesar_merchant_order(order_data: dict):
        external_reference = order_data.get('external_reference')
        if not external_reference:
            return

        try:
            pago = PagoRepository.obtener_por_referencia(external_reference)
        except Exception:
            return

        order_status = order_data.get('order_status', '')
        payments = order_data.get('payments', [])

        ESTADO_MAP = {
            'paid': 2,
            'payment_in_process': 1,
            'payment_required': 1,
            'cancelled': 4,
            'expired': 4,
        }
        estado_id = ESTADO_MAP.get(order_status, 1)

        if estado_id != 1 and estado_id != pago.estado:
            PagoRepository.confirmar(external_reference, estado_id)

        for p in payments:
            mp_payment_id = str(p.get('id', ''))
            if not mp_payment_id:
                continue
            TransaccionMPRepository.crear({
                'id_pago_id': pago.id_pago,
                'mp_payment_id': mp_payment_id,
                'mp_status': p.get('status', ''),
                'mp_payment_type': p.get('payment_type', ''),
                'raw_response': p,
            })
