import hashlib
import uuid
from decimal import Decimal
from django.conf import settings
from .PagoRepository import PagoRepository

class PagoService:

    # Firma para payu
    @staticmethod
    def _firma_salida(referencia: str, valor: str, moneda: str) -> str:
        cadena = (
            f"{settings.PAYU_API_KEY}~"
            f"{settings.PAYU_MERCHANT_ID}~"
            f"{referencia}~"
            f"{valor}~"
            f"{moneda}"
        )
        return hashlib.md5(cadena.encode()).hexdigest()

    @staticmethod
    def _firma_entrada(referencia: str, valor: str, moneda: str, state_pol: str) -> str:
        cadena = (
            f"{settings.PAYU_API_KEY}~"
            f"{settings.PAYU_MERCHANT_ID}~"
            f"{referencia}~"
            f"{valor}~"
            f"{moneda}~"
            f"{state_pol}"
        )
        return hashlib.md5(cadena.encode()).hexdigest()

    # Aplicar cupón 
    @staticmethod
    def _aplicar_cupon(monto: Decimal, codigo_cupon: str):
        cupon = CuponRepository.obtener_valido(codigo_cupon)
        if cupon.veces_usado >= cupon.usos:
            raise ValueError("Cupón agotado")
        if cupon.tipo == 'porcentaje':
            descuento = monto * (Decimal(cupon.usos) / 100)  # usos = % en este caso
        else:
            descuento = Decimal(cupon.usos)
        return max(monto - descuento, Decimal('0')), cupon

    #Web checkout genera los datos para redirigir a payu
    # Iniciar pago 
    @staticmethod
    def iniciar_pago(data: dict) -> dict:
        monto  = Decimal(str(data['monto']))
        moneda = data.get('moneda', 'COP')
        cupon  = None

        # Aplicar cupón si viene
        if data.get('codigo_cupon'):
            monto, cupon = PagoService._aplicar_cupon(monto, data['codigo_cupon'])

        referencia = f"REF-{uuid.uuid4().hex[:10].upper()}"
        valor_str  = f"{float(monto):.1f}"
        firma      = PagoService._firma_salida(referencia, valor_str, moneda)

        # ID de estado PENDING (ajusta el id según la tabla)
        ESTADO_PENDING = 1

        pago = PagoRepository.crear({
            'id_estado_id':      ESTADO_PENDING,
            'id_metodo_pago_id': data['id_metodo_pago'],
            'monto':             monto,
            'moneda':            moneda,
            'referencia':        referencia,
        })

        # Vincular cupón al pago si se usó
        if cupon:
            from .PagoModel import Cupon as CuponModel
            CuponModel.objects.filter(id_cupon=cupon.id_cupon).update(
                id_pago_id=pago.id_pago
            )
            CuponRepository.incrementar_uso(cupon.id_cupon)

        # Log del request
        PayuLogRepository.registrar(pago.id_pago, 'REQUEST', {
            'referencia': referencia,
            'monto':      valor_str,
            'moneda':     moneda,
        })

        # Datos que recibe el frontend para redirigir a PayU
        return {
            'payu_url':          settings.PAYU_URL,
            'merchantId':        settings.PAYU_MERCHANT_ID,
            'accountId':         settings.PAYU_ACCOUNT_ID,
            'description':       data['descripcion'],
            'referenceCode':     referencia,
            'amount':            valor_str,
            'currency':          moneda,
            'signature':         firma,
            'buyerEmail':        data['email_comprador'],
            'buyerFullName':     data['nombre_comprador'],
            'responseUrl':       settings.PAYU_RESPONSE_URL,
            'confirmationUrl':   settings.PAYU_CONFIRMATION_URL,
            'test':              settings.PAYU_TEST,
        }

    # Webhook de confirmación
    @staticmethod
    def confirmar_pago(post_data: dict):
        referencia     = post_data.get('reference_sale')
        valor          = post_data.get('value')
        moneda         = post_data.get('currency')
        state_pol      = post_data.get('state_pol')
        firma_recibida = post_data.get('sign')
        transaction_id = post_data.get('transaction_id')

        # Validar firma
        valor_redondeado = f"{round(float(valor), 1)}"
        firma_esperada   = PagoService._firma_entrada(referencia, valor_redondeado, moneda, state_pol)
        if firma_recibida != firma_esperada:
            raise ValueError("Firma inválida")

        # Mapeo state_pol → id_estado de la tabla estados
        ESTADOS = {'4': 2, '6': 3, '5': 4}   # 2=APPROVED, 3=DECLINED, 4=EXPIRED
        estado_id = ESTADOS.get(state_pol, 1)

        pago = PagoRepository.confirmar(referencia, estado_id)

        if state_pol == '4':  # 4 = APPROVED en PayU
            PagoService._procesar_pago_aprobado(pago)

        # Guardar transacción
        TransaccionRepository.crear({
            'id_pago_id':           pago.id_pago,
            'payu_transaccion_id':  transaction_id,
            'reference_code':       referencia,
            'codigo_respuesta':     post_data.get('response_code_pol'),
            'mensaje_respuesta':    post_data.get('response_message_pol'),
            'firma':                firma_recibida,
            'estado_payu':          post_data.get('state_pol'),
            'raw_response':         post_data,
        })

        # Log webhook
        PayuLogRepository.registrar(pago.id_pago, 'WEBHOOK', post_data)

        return pago