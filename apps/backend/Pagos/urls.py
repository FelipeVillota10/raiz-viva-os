from django.urls import path

from Pagos.Pago.PagoController import (
    IniciarPagoController,
    RespuestaMercadoPagoController,
    WebhookMercadoPagoController,
)

urlpatterns = [
    path('iniciar/', IniciarPagoController.as_view(), name='pagos-iniciar'),
    path('iniciar', IniciarPagoController.as_view(), name='pagos-iniciar-noslash'),
    path('webhook/', WebhookMercadoPagoController.as_view(), name='pagos-webhook'),
    path('webhook', WebhookMercadoPagoController.as_view(), name='pagos-webhook-noslash'),
    path('respuesta/', RespuestaMercadoPagoController.as_view(), name='pagos-respuesta'),
    path('respuesta', RespuestaMercadoPagoController.as_view(), name='pagos-respuesta-noslash'),
]
