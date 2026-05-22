from django.urls import path
from Pagos.Pago.PagoController import (
    IniciarPagoController,
    WebhookMercadoPagoController,
    RespuestaMercadoPagoController,
    ComprobantePagoView,
)
from Pagos.TransaccionMP.TransaccionMPController import TransaccionMPController
from Pagos.Cupon.CuponController import CuponController
from Pagos.PagoLog.PagoLogController import PagoLogController

urlpatterns = [
    path('iniciar/', IniciarPagoController.as_view()),
    path('webhook/', WebhookMercadoPagoController.as_view()),
    path('respuesta/', RespuestaMercadoPagoController.as_view()),
    path('<int:id_pago>/transacciones/', TransaccionMPController.as_view()),
    path('<int:id_pago>/logs/', PagoLogController.as_view()),
    path('cupones/', CuponController.as_view()),
    path('<str:referencia>/comprobante/', ComprobantePagoView.as_view()),
]
