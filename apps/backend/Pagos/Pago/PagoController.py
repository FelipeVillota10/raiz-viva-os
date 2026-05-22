import hmac
import hashlib
import time

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.http import HttpResponse

from .PagoService import PagoService
from .PagoSerializer import IniciarPagoSerializer, PagoSerializer
from .PagoRepository import PagoRepository
from .PagoModel import PagoModel
from Pagos.PagoLog.PagoLogRepository import PagoLogRepository
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import io


class IniciarPagoController(APIView):

    def post(self, request):
        s = IniciarPagoSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)
        try:
            result = PagoService.iniciar_pago(s.validated_data)
            return Response(result, status=200)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)


class WebhookMercadoPagoController(APIView):
    permission_classes = [AllowAny]

    def _validar_firma(self, request):
        if settings.DEBUG:
            return True

        secret = settings.MERCADOPAGO.get('WEBHOOK_SECRET', '')
        if not secret:
            return True

        signature = request.headers.get('x-signature', '')
        request_id = request.headers.get('x-request-id', '')

        parts = {}
        for part in signature.split(','):
            if '=' in part:
                k, v = part.split('=', 1)
                parts[k.strip()] = v.strip()

        ts = parts.get('ts', '')
        v1 = parts.get('v1', '')

        if not ts or not v1 or not request_id:
            PagoLogRepository.registrar(None, 'ERROR', {
                'motivo': 'firma_webhook_invalida',
                'detalle': 'Faltan headers x-signature o x-request-id',
            })
            return False

        try:
            if abs(time.time() - int(ts)) > 60:
                PagoLogRepository.registrar(None, 'ERROR', {
                    'motivo': 'firma_webhook_invalida',
                    'detalle': f'Timestamp expirado ts={ts}',
                })
                return False
        except ValueError:
            PagoLogRepository.registrar(None, 'ERROR', {
                'motivo': 'firma_webhook_invalida',
                'detalle': f'Timestamp invalido ts={ts}',
            })
            return False

        if request.method == 'POST':
            payload = request.body.decode('utf-8')
        else:
            payload = request.META.get('QUERY_STRING', '')

        mensaje = f"{request_id}|{ts}|{payload}"
        computed = hmac.new(
            secret.encode('utf-8'),
            mensaje.encode('utf-8'),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(computed, v1):
            PagoLogRepository.registrar(None, 'ERROR', {
                'motivo': 'firma_webhook_invalida',
                'detalle': 'HMAC no coincide',
                'computed': computed,
            })
            return False

        return True

    def post(self, request):
        if not self._validar_firma(request):
            return Response({'error': 'Firma inválida'}, status=403)

        topic = request.data.get('type') or request.query_params.get('topic')
        resource_id = (
            request.data.get('data', {}).get('id')
            or request.query_params.get('id')
        )

        if not topic or not resource_id:
            return Response({'error': 'Parámetros inválidos'}, status=400)

        try:
            PagoService.confirmar_pago(topic, resource_id)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception:
            return Response({'error': 'Error interno'}, status=500)

        return Response({'ok': True}, status=200)

    def get(self, request):
        if not self._validar_firma(request):
            return Response({'error': 'Firma inválida'}, status=403)

        topic = request.query_params.get('topic')
        resource_id = request.query_params.get('data.id') or request.query_params.get('id')

        if not topic or not resource_id:
            return Response({'error': 'Parámetros inválidos'}, status=400)

        try:
            PagoService.confirmar_pago(topic, resource_id)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception:
            return Response({'error': 'Error interno'}, status=500)

        return Response({'ok': True}, status=200)


class RespuestaMercadoPagoController(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        referencia = request.query_params.get('external_reference')
        status = request.query_params.get('status')

        if not referencia:
            return Response({'error': 'Referencia no proporcionada'}, status=400)

        try:
            pago = PagoRepository.obtener_por_referencia(referencia)
            data = PagoSerializer(pago).data
            data['mp_status'] = status
            return Response(data)
        except Exception:
            return Response({'error': 'No encontrado'}, status=404)


class ComprobantePagoView(APIView):

    def get(self, request, referencia):
        try:
            pago = PagoRepository.obtener_por_referencia(referencia)
        except Exception:
            return Response({'error': 'Pago no encontrado'}, status=404)

        if pago.estado != 2:
            return Response({'error': 'El pago no está aprobado'}, status=400)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        p.setFont("Helvetica-Bold", 20)
        p.drawString(50, height - 60, "Comprobante de Pago")
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 90, "Raíz Viva")

        p.line(50, height - 100, width - 50, height - 100)

        y = height - 130
        estado_display = dict(PagoModel.ESTADO_CHOICES).get(pago.estado, 'Desconocido')
        campos = [
            ("Referencia:", pago.referencia),
            ("Monto:", f"${pago.monto} {pago.moneda}"),
            ("Fecha:", pago.fecha_confirmacion.strftime("%d/%m/%Y %H:%M")),
            ("Estado:", estado_display),
            ("ID Pago MP:", pago.mp_payment_id or 'N/A'),
        ]

        for label, valor in campos:
            p.setFont("Helvetica-Bold", 11)
            p.drawString(50, y, label)
            p.setFont("Helvetica", 11)
            p.drawString(200, y, str(valor))
            y -= 25

        p.showPage()
        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="comprobante_{referencia}.pdf"'
        return response
