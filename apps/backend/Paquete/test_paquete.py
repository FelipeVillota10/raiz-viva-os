"""
Pruebas unitarias - Módulo Paquete
HU: Gestión de paquetes de eco-aventuras
Cubre: PaqueteService, PaqueteRepository, PaqueteController (views)
"""

from unittest.mock import MagicMock, patch
from django.test import TestCase
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status
import uuid


# ─────────────────────────────────────────────
# 1. TESTS DE SERVICIO (PaqueteService)
# ─────────────────────────────────────────────

class TestPaqueteServiceAgregarExperiencia(TestCase):
    """Pruebas para PaqueteService.agregar_experiencia"""

    def setUp(self):
        self.session_key = str(uuid.uuid4())
        self.fecha_reserva = "2025-08-15"

    @patch("Paquete.PaqueteService.EcoAventuraRepository.obtener_por_id")
    def test_agregar_experiencia_ecoaventura_no_existe(self, mock_obtener):
        """Debe retornar error NOT_FOUND si la eco-aventura no existe."""
        from Paquete.PaqueteService import PaqueteService
        mock_obtener.return_value = None

        result = PaqueteService.agregar_experiencia(self.session_key, 999, self.fecha_reserva, 2)

        self.assertIn("error", result)
        self.assertEqual(result["code"], "NOT_FOUND")

    @patch("Paquete.PaqueteService.PaqueteRepository.item_duplicado_existe")
    @patch("Paquete.PaqueteService.PaqueteService.validar_reglas")
    @patch("Paquete.PaqueteService.PaqueteRepository.obtener_o_crear_paquete")
    @patch("Paquete.PaqueteService.EcoAventuraRepository.obtener_por_id")
    def test_agregar_experiencia_duplicada(self, mock_eco, mock_paquete, mock_validar, mock_dup):
        """Debe retornar error DUPLICATE si el item ya existe con la misma configuración."""
        from Paquete.PaqueteService import PaqueteService
        mock_eco.return_value = MagicMock()
        mock_paquete.return_value = MagicMock()
        mock_validar.return_value = None
        mock_dup.return_value = True

        result = PaqueteService.agregar_experiencia(self.session_key, 1, self.fecha_reserva, 2)

        self.assertIn("error", result)
        self.assertEqual(result["code"], "DUPLICATE")

    @patch("Paquete.PaqueteService.PaqueteRepository.agregar_item")
    @patch("Paquete.PaqueteService.PaqueteRepository.item_duplicado_existe")
    @patch("Paquete.PaqueteService.PaqueteService.validar_reglas")
    @patch("Paquete.PaqueteService.PaqueteRepository.obtener_o_crear_paquete")
    @patch("Paquete.PaqueteService.EcoAventuraRepository.obtener_por_id")
    def test_agregar_experiencia_exitoso(self, mock_eco, mock_paquete, mock_validar, mock_dup, mock_agregar):
        """Debe retornar success=True con el item_id al agregar correctamente."""
        from Paquete.PaqueteService import PaqueteService
        mock_eco.return_value = MagicMock()
        mock_paquete.return_value = MagicMock()
        mock_validar.return_value = None
        mock_dup.return_value = False
        item_mock = MagicMock()
        item_mock.id = 42
        mock_agregar.return_value = item_mock

        result = PaqueteService.agregar_experiencia(self.session_key, 1, self.fecha_reserva, 2)

        self.assertTrue(result["success"])
        self.assertEqual(result["item_id"], 42)

    @patch("Paquete.PaqueteService.PaqueteRepository.eliminar_item")
    def test_eliminar_experiencia_no_encontrada(self, mock_eliminar):
        """Debe retornar error NOT_FOUND si el item no existe."""
        from Paquete.PaqueteService import PaqueteService
        mock_eliminar.return_value = False

        result = PaqueteService.eliminar_experiencia(self.session_key, 999)

        self.assertIn("error", result)
        self.assertEqual(result["code"], "NOT_FOUND")

    @patch("Paquete.PaqueteService.PaqueteRepository.eliminar_item")
    def test_eliminar_experiencia_exitoso(self, mock_eliminar):
        """Debe retornar success=True al eliminar un item existente."""
        from Paquete.PaqueteService import PaqueteService
        mock_eliminar.return_value = True

        result = PaqueteService.eliminar_experiencia(self.session_key, 1)

        self.assertTrue(result["success"])

    @patch("Paquete.PaqueteService.PaqueteRepository.vaciar_paquete")
    def test_vaciar_paquete(self, mock_vaciar):
        """Debe retornar success=True al vaciar el paquete."""
        from Paquete.PaqueteService import PaqueteService
        mock_vaciar.return_value = None

        result = PaqueteService.vaciar_paquete(self.session_key)

        self.assertTrue(result["success"])
        mock_vaciar.assert_called_once_with(self.session_key)


class TestPaqueteServiceValidarReglas(TestCase):
    """Pruebas para PaqueteService.validar_reglas"""

    def _make_paquete(self, num_items=0, tiene_item_existente=False):
        paquete = MagicMock()
        paquete.items.count.return_value = num_items
        if tiene_item_existente:
            item_existente = MagicMock()
            item_existente.num_personas = 2
            paquete.items.filter.return_value.first.return_value = item_existente
            paquete.items.filter.return_value.exists.return_value = True
        else:
            paquete.items.filter.return_value.first.return_value = None
            paquete.items.filter.return_value.exists.return_value = False
        return paquete

    @patch("Paquete.PaqueteService.PaqueteItem")
    @patch("Paquete.PaqueteService.PaqueteRepository.obtener_reglas_operativas")
    def test_validar_min_personas(self, mock_reglas, mock_item_model):
        """Debe lanzar ValidationError si num_personas < min_personas global."""
        from Paquete.PaqueteService import PaqueteService
        from rest_framework.exceptions import ValidationError

        mock_reglas.return_value = {"min_personas": 3, "max_actividades": 6}
        ecoaventura = MagicMock()
        ecoaventura.capacidad_maxima = 20
        mock_item_model.objects.filter.return_value.aggregate.return_value = {"total": 0}

        paquete = self._make_paquete()

        with self.assertRaises(ValidationError) as ctx:
            PaqueteService.validar_reglas(paquete, ecoaventura, num_personas_nuevo=1, fecha_reserva="2025-08-15")

        self.assertEqual(ctx.exception.detail["code"], "MIN_PERSONAS_NO_ALCANZADO")

    @patch("Paquete.PaqueteService.PaqueteItem")
    @patch("Paquete.PaqueteService.PaqueteRepository.obtener_reglas_operativas")
    def test_validar_capacidad_excedida(self, mock_reglas, mock_item_model):
        """Debe lanzar ValidationError si la capacidad de la actividad es superada."""
        from Paquete.PaqueteService import PaqueteService
        from rest_framework.exceptions import ValidationError

        mock_reglas.return_value = {"min_personas": 1, "max_actividades": 6}
        ecoaventura = MagicMock()
        ecoaventura.capacidad_maxima = 5
        mock_item_model.objects.filter.return_value.aggregate.return_value = {"total": 4}

        paquete = self._make_paquete()

        with self.assertRaises(ValidationError) as ctx:
            PaqueteService.validar_reglas(paquete, ecoaventura, num_personas_nuevo=3, fecha_reserva="2025-08-15")

        self.assertEqual(ctx.exception.detail["code"], "MAX_PERSONAS_EXCEDIDO")

    @patch("Paquete.PaqueteService.PaqueteItem")
    @patch("Paquete.PaqueteService.PaqueteRepository.obtener_reglas_operativas")
    def test_validar_max_actividades_excedido(self, mock_reglas, mock_item_model):
        """Debe lanzar ValidationError si se supera el máximo de actividades."""
        from Paquete.PaqueteService import PaqueteService
        from rest_framework.exceptions import ValidationError

        mock_reglas.return_value = {"min_personas": 1, "max_actividades": 2}
        ecoaventura = MagicMock()
        ecoaventura.capacidad_maxima = 20
        mock_item_model.objects.filter.return_value.aggregate.return_value = {"total": 0}

        paquete = self._make_paquete(num_items=2, tiene_item_existente=False)

        with self.assertRaises(ValidationError) as ctx:
            PaqueteService.validar_reglas(paquete, ecoaventura, num_personas_nuevo=2, fecha_reserva="2025-08-15")

        self.assertEqual(ctx.exception.detail["code"], "MAX_ACTIVIDADES_EXCEDIDO")


# ─────────────────────────────────────────────
# 2. TESTS DE REPOSITORIO (PaqueteRepository)
# ─────────────────────────────────────────────

class TestPaqueteRepository(TestCase):
    """Pruebas para PaqueteRepository"""

    @patch("Paquete.PaqueteRepository.Paquete.objects.get_or_create")
    def test_obtener_o_crear_paquete(self, mock_get_or_create):
        """Debe retornar un paquete existente o crear uno nuevo."""
        from Paquete.PaqueteRepository import PaqueteRepository
        paquete_mock = MagicMock()
        mock_get_or_create.return_value = (paquete_mock, True)

        result = PaqueteRepository.obtener_o_crear_paquete("session-abc")

        self.assertEqual(result, paquete_mock)
        mock_get_or_create.assert_called_once_with(session_key="session-abc")

    @patch("Paquete.PaqueteRepository.PaqueteItem.objects.filter")
    def test_item_duplicado_existe_true(self, mock_filter):
        """Debe retornar True si existe un item con la misma configuración."""
        from Paquete.PaqueteRepository import PaqueteRepository
        mock_filter.return_value.exists.return_value = True

        result = PaqueteRepository.item_duplicado_existe(MagicMock(), 1, "2025-08-15", 2)

        self.assertTrue(result)

    @patch("Paquete.PaqueteRepository.PaqueteItem.objects.filter")
    def test_item_duplicado_existe_false(self, mock_filter):
        """Debe retornar False si no existe el item duplicado."""
        from Paquete.PaqueteRepository import PaqueteRepository
        mock_filter.return_value.exists.return_value = False

        result = PaqueteRepository.item_duplicado_existe(MagicMock(), 1, "2025-08-15", 2)

        self.assertFalse(result)

    @patch("Paquete.PaqueteRepository.PaqueteItem.objects.filter")
    def test_eliminar_item_exitoso(self, mock_filter):
        """Debe retornar True si el item fue eliminado correctamente."""
        from Paquete.PaqueteRepository import PaqueteRepository
        mock_filter.return_value.delete.return_value = (1, {})

        result = PaqueteRepository.eliminar_item(item_id=1, session_key="session-abc")

        self.assertTrue(result)

    @patch("Paquete.PaqueteRepository.PaqueteItem.objects.filter")
    def test_eliminar_item_no_encontrado(self, mock_filter):
        """Debe retornar False si el item no existe."""
        from Paquete.PaqueteRepository import PaqueteRepository
        mock_filter.return_value.delete.return_value = (0, {})

        result = PaqueteRepository.eliminar_item(item_id=999, session_key="session-abc")

        self.assertFalse(result)

    @patch("Paquete.PaqueteRepository.ReglasConfig")
    def test_obtener_reglas_sin_config(self, mock_model):
        """Debe retornar valores por defecto si no hay ReglasConfig en BD."""
        from Paquete.PaqueteRepository import PaqueteRepository
        mock_model.objects.first.return_value = None

        result = PaqueteRepository.obtener_reglas_operativas()

        self.assertEqual(result["min_personas"], 1)
        self.assertEqual(result["max_actividades"], 6)

    @patch("Paquete.PaqueteRepository.ReglasConfig")
    def test_obtener_reglas_con_config(self, mock_model):
        """Debe retornar los valores reales de ReglasConfig si existen."""
        from Paquete.PaqueteRepository import PaqueteRepository
        config = MagicMock()
        config.min_personas = 2
        config.max_personas = 15
        config.max_actividades = 4
        config.fechas_bloqueadas = ["2025-12-25"]
        mock_model.objects.first.return_value = config

        result = PaqueteRepository.obtener_reglas_operativas()

        self.assertEqual(result["min_personas"], 2)
        self.assertEqual(result["max_actividades"], 4)
        self.assertIn("2025-12-25", result["fechas_bloqueadas"])


# ─────────────────────────────────────────────
# 3. TESTS DE CONTROLADOR (PaqueteController)
# ─────────────────────────────────────────────

class TestPaqueteController(APITestCase):
    """Pruebas de integración para los endpoints del Paquete"""

    def setUp(self):
        self.factory = APIRequestFactory()

    @patch("Paquete.PaqueteController.PaqueteRepository.obtener_o_crear_paquete")
    @patch("Paquete.PaqueteController.PaqueteSerializer")
    def test_get_paquete_retorna_200(self, mock_serializer, mock_repo):
        """GET /paquete/ debe retornar 200 con los datos del paquete."""
        from Paquete.PaqueteController import PaqueteView
        mock_repo.return_value = MagicMock()
        mock_serializer.return_value.data = {"id": 1, "items": [], "total": 0}

        request = self.factory.get("/paquete/")
        request.session = {"paquete_session_key": "test-session"}

        response = PaqueteView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("Paquete.PaqueteController.PaqueteService.agregar_experiencia")
    def test_post_agregar_sin_ecoaventura_id(self, mock_agregar):
        """POST sin ecoaventura_id debe retornar 400."""
        from Paquete.PaqueteController import AgregarExperienciaView

        request = self.factory.post("/paquete/agregar/", data={}, format="json")
        request.session = {"paquete_session_key": "test-session"}
        request.data = {}

        response = AgregarExperienciaView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "MISSING_FIELD")

    @patch("Paquete.PaqueteController.PaqueteService.agregar_experiencia")
    def test_post_agregar_num_personas_invalido(self, mock_agregar):
        """POST con num_personas=0 debe retornar 400."""
        from Paquete.PaqueteController import AgregarExperienciaView

        request = self.factory.post(
    "/paquete/agregar/",
    {
        "ecoaventura_id": 1,
        "fecha_reserva": "2025-08-15",
        "num_personas": 0
    },
    format="json"
)
        request.session = {"paquete_session_key": "test-session"}

        response = AgregarExperienciaView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "INVALID_FIELD")

    @patch("Paquete.PaqueteController.PaqueteRepository.obtener_o_crear_paquete")
    @patch("Paquete.PaqueteController.PaqueteSerializer")
    @patch("Paquete.PaqueteController.PaqueteService.agregar_experiencia")
    def test_post_agregar_exitoso(self, mock_agregar, mock_serializer, mock_repo):
        """POST con datos válidos debe retornar 201."""
        from Paquete.PaqueteController import AgregarExperienciaView
        mock_agregar.return_value = {"success": True, "item_id": 5}
        mock_repo.return_value = MagicMock()
        mock_serializer.return_value.data = {"id": 1, "items": [{"id": 5}], "total": 100}

        request = self.factory.post(
    "/paquete/agregar/",
    {
        "ecoaventura_id": 1,
        "fecha_reserva": "2025-08-15",
        "num_personas": 2
    },
    format="json"
)
        request.session = {"paquete_session_key": "test-session"}

        response = AgregarExperienciaView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @patch("Paquete.PaqueteController.PaqueteService.eliminar_experiencia")
    def test_delete_item_no_encontrado(self, mock_eliminar):
        """DELETE de un item inexistente debe retornar 404."""
        from Paquete.PaqueteController import EliminarItemView
        mock_eliminar.return_value = {"error": "El item no existe", "code": "NOT_FOUND"}

        request = self.factory.delete("/paquete/item/999/")
        request.session = {"paquete_session_key": "test-session"}

        response = EliminarItemView.as_view()(request, item_id=999)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("Paquete.PaqueteController.PaqueteRepository.obtener_o_crear_paquete")
    @patch("Paquete.PaqueteController.PaqueteSerializer")
    @patch("Paquete.PaqueteController.PaqueteService.eliminar_experiencia")
    def test_delete_item_exitoso(self, mock_eliminar, mock_serializer, mock_repo):
        """DELETE de un item existente debe retornar 200."""
        from Paquete.PaqueteController import EliminarItemView
        mock_eliminar.return_value = {"success": True}
        mock_repo.return_value = MagicMock()
        mock_serializer.return_value.data = {"id": 1, "items": [], "total": 0}

        request = self.factory.delete("/paquete/item/1/")
        request.session = {"paquete_session_key": "test-session"}

        response = EliminarItemView.as_view()(request, item_id=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
