from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .PaqueteService import PaqueteService
from .PaqueteSerializer import PaqueteSerializer
from .PaqueteRepository import PaqueteRepository
import uuid


def get_or_create_session_key(request) -> str:
    session_key = request.session.get("paquete_session_key")
    if not session_key:
        session_key = str(uuid.uuid4())
        request.session["paquete_session_key"] = session_key
        request.session.modified = True
    return session_key


class PaqueteView(APIView):
    def get(self, request):
        session_key = get_or_create_session_key(request)
        paquete = PaqueteRepository.obtener_o_crear_paquete(session_key)
        return Response(PaqueteSerializer(paquete).data)

    def delete(self, request):
        session_key = get_or_create_session_key(request)
        result = PaqueteService.vaciar_paquete(session_key)
        return Response(result)


class AgregarExperienciaView(APIView):
    def post(self, request):
        session_key = get_or_create_session_key(request)
        ecoaventura_id = request.data.get("ecoaventura_id")
        fecha_reserva = request.data.get("fecha_reserva")
        num_personas = request.data.get("num_personas", 1)

        if not ecoaventura_id:
            return Response({"error": "ecoaventura_id es requerido.", "code": "MISSING_FIELD"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            num_personas = int(num_personas)
            if num_personas < 1:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "num_personas debe ser un número positivo.", "code": "INVALID_FIELD"}, status=status.HTTP_400_BAD_REQUEST)

        result = PaqueteService.agregar_experiencia(session_key, ecoaventura_id, fecha_reserva, num_personas)

        if "error" in result:
            http_status = status.HTTP_409_CONFLICT if result["code"] == "DUPLICATE" else status.HTTP_404_NOT_FOUND
            return Response(result, status=http_status)

        paquete = PaqueteRepository.obtener_o_crear_paquete(session_key)
        return Response(PaqueteSerializer(paquete).data, status=status.HTTP_201_CREATED)


class EliminarItemView(APIView):
    def delete(self, request, item_id):
        session_key = get_or_create_session_key(request)
        result = PaqueteService.eliminar_experiencia(session_key, item_id)

        if "error" in result:
            return Response(result, status=status.HTTP_404_NOT_FOUND)

        paquete = PaqueteRepository.obtener_o_crear_paquete(session_key)
        return Response(PaqueteSerializer(paquete).data)


class AsociarUsuarioView(APIView):
    """
    HU16.2: asocia el paquete de la sesión actual al turista autenticado.
    Requiere un JWT válido (login de Célula 1). Se llama al proceder al
    checkout, una vez que el usuario inició sesión, para que la reserva
    quede ligada al usuario en NEON antes del pago (Célula 4).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_key = get_or_create_session_key(request)
        paquete = PaqueteService.asociar_usuario(session_key, request.user)
        return Response(PaqueteSerializer(paquete).data, status=status.HTTP_200_OK)