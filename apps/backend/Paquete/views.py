from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

from apps.backend.Paquete.services import PaqueteService
from .PaqueteSerializer import PaqueteSerializer

class PaqueteDetailView(APIView):
    paquete_service = PaqueteService()

    def get(self, request):
        session_key = request.session.session_key
        if not session_key:
            # Retorna una estructura de paquete vacía si no hay session_key
            return Response({
                "id": None,
                "session_key": None,
                "items": [],
                "total": 0,
                "num_items": 0,
                "creado_en": None,
                "actualizado_en": None
            }, status=status.HTTP_200_OK)
        try:
            paquete = self.paquete_service.obtener_paquete_por_session_key(session_key)
            serializer = PaqueteSerializer(paquete)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error al obtener paquete: {e}")
            return Response({"error": "No se pudo cargar el paquete."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        session_key = request.session.session_key
        if not session_key:
            return Response(status=status.HTTP_204_NO_CONTENT)
        try:
            self.paquete_service.vaciar_paquete(session_key)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error al vaciar paquete: {e}")
            return Response({"error": "No se pudo vaciar el paquete."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaqueteAgregarView(APIView):
    paquete_service = PaqueteService()

    def post(self, request):
        session_key = request.session.session_key
        if not session_key:
            request.session.save()
            session_key = request.session.session_key

        ecoaventura_id = request.data.get('ecoaventura_id')
        fecha_reserva = request.data.get('fecha_reserva')
        num_personas = request.data.get('num_personas')

        # Validaciones básicas de entrada
        if not ecoaventura_id:
            return Response({"error": "ecoaventura_id es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)
        if not fecha_reserva:
            return Response({"error": "fecha_reserva es obligatoria."}, status=status.HTTP_400_BAD_REQUEST)
        if not num_personas or num_personas <= 0:
            return Response({"error": "num_personas debe ser un número positivo."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            num_personas = int(num_personas)
        except (ValueError, TypeError):
            return Response({"error": "num_personas debe ser un número entero válido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            paquete = self.paquete_service.agregar_experiencia_a_paquete(
                session_key, ecoaventura_id, fecha_reserva, num_personas
            )
            serializer = PaqueteSerializer(paquete)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            # Manejo de errores específicos de validación del servicio
            if isinstance(e.detail, dict) and "code" in e.detail:
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            elif isinstance(e.detail, list) and e.detail:
                return Response({"error": e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error inesperado en PaqueteAgregarView: {e}")
            return Response({"error": "Ocurrió un error inesperado al agregar la experiencia."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaqueteItemDetailView(APIView):
    paquete_service = PaqueteService()

    def delete(self, request, item_id):
        session_key = request.session.session_key
        if not session_key:
            return Response({"error": "No hay sesión activa."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            paquete = self.paquete_service.eliminar_item_de_paquete(session_key, item_id)
            serializer = PaqueteSerializer(paquete)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error al eliminar item del paquete: {e}")
            return Response({"error": "No se pudo eliminar el item del paquete."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)