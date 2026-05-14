from rest_framework.views import APIView
from rest_framework.response import Response
from .PagoService import PagoService
from .PagoSerializer import (
    IniciarPagoSerializer, PagoSerializer,
)
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import io

class IniciarPagoController(APIView):
    def post(self, request):
        s = IniciarPagoSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)
        form_data = PagoService.iniciar_pago(s.validated_data)
        return Response(form_data, status=200)


class ConfirmacionPayUController(APIView):
    # Webhook que PayU llama para confirmar el pago
    def post(self, request):
        try:
            PagoService.confirmar_pago(request.POST.dict())
            return Response({'ok': True})
        except ValueError as e:
            return Response({'error': str(e)}, status=400)


class RespuestaPayUController(APIView):
    # PayU redirige al usuario aquí tras el pago
    def get(self, request):
        referencia = request.query_params.get('referenceCode')
        try:
            from .PagoRepository import PagoRepository
            pago = PagoRepository.obtener_por_referencia(referencia)
            return Response(PagoSerializer(pago).data)
        except Exception:
            return Response({'error': 'No encontrado'}, status=404)

class ComprobantePagoView(APIView):
    
    #GET /api/pagos/<referencia>/comprobante/
    #Descarga el PDF del comprobante
    
    def get(self, request, referencia):
        try:
            pago = PagoRepository.obtener_por_referencia(referencia)
        except Exception:
            return Response({'error': 'Pago no encontrado'}, status=404)

        # Solo si está aprobado
        if pago.id_estado_id != 2:  # 2 = APPROVED
            return Response({'error': 'El pago no está aprobado'}, status=400)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Encabezado
        p.setFont("Helvetica-Bold", 20)
        p.drawString(50, height - 60, "Comprobante de Pago")
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 90, "Raíz Viva")

        # Línea separadora
        p.line(50, height - 100, width - 50, height - 100)

        # Datos del pago
        y = height - 130
        campos = [
            ("Referencia:",       pago.referencia),
            ("Monto:",            f"${pago.monto} {pago.moneda}"),
            ("Fecha:",            pago.fecha_confirmacion.strftime("%d/%m/%Y %H:%M")),
            ("Estado:",           pago.id_estado.nombre_estado),
            ("Método de pago:",   pago.id_metodo_pago.nombre),
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
