from django.urls import path
from Pagos.Pago.PagoController import IniciarPagoController, ConfirmacionPayUController, RespuestaPayUController
from Pagos.TransaccionPayu.TransaccionPayuController import TransaccionPayuController
from Pagos.ActorBankAccount.ActorBankAccountController import ActorBankAccountController
from Pagos.MetodoPago.MetodoPagoController import MetodoPagoController
from Pagos.Cupon.CuponController import CuponController
from Pagos.Pago.PagoController import ComprobantePagoView

urlpatterns = [
    # Flujo PayU
    path('iniciar/',IniciarPagoController.as_view()),
    path('confirmacion/',ConfirmacionPayUController.as_view()),
    path('respuesta/',RespuestaPayUController.as_view()),

    # Transacciones
    path('<int:id_pago>/transacciones/', TransaccionPayuController.as_view()),

    # Métodos de pago
    path('metodos/', MetodoPagoController.as_view()),

    # Cupones
    path('cupones/', CuponController.as_view()),

    # Cuentas bancarias
    path('cuentas/', ActorBankAccountController.as_view()),
    path('cuentas/<int:id_actor>/', ActorBankAccountController.as_view()),
    path('cuentas/<int:id_actor>/comprobante/', ComprobantePagoView.as_view()),
]