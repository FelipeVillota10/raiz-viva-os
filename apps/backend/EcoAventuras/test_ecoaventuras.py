"""
Pruebas unitarias - Módulo EcoAventuras
HU: Gestión de eco-aventuras (listado, creación, actualización, itinerario)
Cubre: EcoAventuraService, EcoAventuraRepository, EcoAventuraController (views)
"""

from unittest.mock import MagicMock, patch
from django.test import TestCase
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status


# ─────────────────────────────────────────────
# 1. TESTS DE SERVICIO (EcoAventuraService)
# ─────────────────────────────────────────────

class TestEcoAventuraServiceListar(TestCase):
    """Pruebas para EcoAventuraService.listar_activas"""

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_activas_con_filtros")
    def test_listar_activas_sin_filtros(self, mock_repo):
        """Debe retornar la primera página con los campos de paginación."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        qs = MagicMock()
        qs.count.return_value = 3
        qs.__getitem__ = MagicMock(return_value=[])
        mock_repo.return_value = qs

        result = EcoAventuraService.listar_activas({})

        self.assertIn("count", result)
        self.assertIn("total_pages", result)
        self.assertIn("results", result)
        self.assertEqual(result["page"], 1)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_activas_con_filtros")
    def test_listar_activas_con_filtro_precio(self, mock_repo):
        """Debe pasar los filtros de precio correctamente al repositorio."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        qs = MagicMock()
        qs.count.return_value = 0
        qs.__getitem__ = MagicMock(return_value=[])
        mock_repo.return_value = qs

        EcoAventuraService.listar_activas({"precio_min": "50", "precio_max": "200"})

        filtros = mock_repo.call_args[0][0]
        self.assertEqual(filtros["precio_min"], 50.0)
        self.assertEqual(filtros["precio_max"], 200.0)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_activas_con_filtros")
    def test_listar_activas_filtros_invalidos_ignorados(self, mock_repo):
        """Filtros con valores no numéricos deben ignorarse sin lanzar error."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        qs = MagicMock()
        qs.count.return_value = 0
        qs.__getitem__ = MagicMock(return_value=[])
        mock_repo.return_value = qs

        result = EcoAventuraService.listar_activas({"precio_min": "abc", "duracion_min": "xyz"})

        self.assertIn("results", result)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_activas_con_filtros")
    def test_paginacion_correcta(self, mock_repo):
        """Debe calcular correctamente total_pages."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        qs = MagicMock()
        qs.count.return_value = 19  # 19 items / 9 por página = 3 páginas
        qs.__getitem__ = MagicMock(return_value=[])
        mock_repo.return_value = qs

        result = EcoAventuraService.listar_activas({"page": "2"})

        self.assertEqual(result["total_pages"], 3)
        self.assertEqual(result["page"], 2)


class TestEcoAventuraServiceCRUD(TestCase):
    """Pruebas para operaciones CRUD de EcoAventuraService"""

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_obtener_existente(self, mock_repo):
        """Debe retornar la instancia si existe."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        eco = MagicMock()
        eco.nombre = "Rafting Valle"
        mock_repo.return_value = eco

        result = EcoAventuraService.obtener(1)

        self.assertEqual(result.nombre, "Rafting Valle")

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_obtener_no_existente(self, mock_repo):
        """Debe retornar None si la eco-aventura no existe."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        mock_repo.return_value = None

        result = EcoAventuraService.obtener(999)

        self.assertIsNone(result)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.crear")
    def test_crear_ecoaventura(self, mock_crear):
        """Debe llamar al repositorio con los datos y retornar la instancia creada."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        eco = MagicMock()
        mock_crear.return_value = eco

        result = EcoAventuraService.crear({"nombre": "Senderismo", "precio": 80.0})

        mock_crear.assert_called_once()
        self.assertEqual(result, eco)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.actualizar")
    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_actualizar_exitoso(self, mock_obtener, mock_actualizar):
        """Debe actualizar y retornar la instancia modificada."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        instancia = MagicMock()
        mock_obtener.return_value = instancia
        mock_actualizar.return_value = instancia

        result = EcoAventuraService.actualizar(1, {"precio": 120.0})

        mock_actualizar.assert_called_once_with(instancia, {"precio": 120.0})
        self.assertEqual(result, instancia)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_actualizar_no_existente(self, mock_obtener):
        """Debe retornar None si la eco-aventura a actualizar no existe."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        mock_obtener.return_value = None

        result = EcoAventuraService.actualizar(999, {"precio": 120.0})

        self.assertIsNone(result)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_toggle_activo_de_activo_a_inactivo(self, mock_obtener):
        """toggle_activo debe cambiar activo=True a activo=False."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        instancia = MagicMock()
        instancia.activo = True
        mock_obtener.return_value = instancia

        result = EcoAventuraService.toggle_activo(1)

        self.assertFalse(result.activo)
        instancia.save.assert_called_once()

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_toggle_activo_no_existente(self, mock_obtener):
        """toggle_activo debe retornar None si la eco-aventura no existe."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        mock_obtener.return_value = None

        result = EcoAventuraService.toggle_activo(999)

        self.assertIsNone(result)


class TestEcoAventuraServiceItinerario(TestCase):
    """Pruebas para operaciones de itinerario"""

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_itinerario")
    def test_obtener_itinerario_existente(self, mock_repo):
        """Debe retornar el itinerario si existe."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        itinerario = MagicMock()
        mock_repo.return_value = itinerario

        result = EcoAventuraService.obtener_itinerario(1)

        self.assertEqual(result, itinerario)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_itinerario")
    def test_obtener_itinerario_no_existente(self, mock_repo):
        """Debe retornar None si no hay itinerario."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        mock_repo.return_value = None

        result = EcoAventuraService.obtener_itinerario(999)

        self.assertIsNone(result)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.guardar_itinerario")
    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_guardar_itinerario_exitoso(self, mock_obtener, mock_guardar):
        """Debe guardar y retornar el itinerario."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        eco = MagicMock()
        mock_obtener.return_value = eco
        itinerario = MagicMock()
        mock_guardar.return_value = itinerario

        result = EcoAventuraService.guardar_itinerario(1, {"cronograma": "Día 1"})

        mock_guardar.assert_called_once_with(eco, {"cronograma": "Día 1"})
        self.assertEqual(result, itinerario)

    @patch("EcoAventuras.EcoAventuraService.EcoAventuraRepository.obtener_por_id")
    def test_guardar_itinerario_eco_no_existe(self, mock_obtener):
        """Debe retornar None si la eco-aventura no existe."""
        from EcoAventuras.EcoAventuraService import EcoAventuraService
        mock_obtener.return_value = None

        result = EcoAventuraService.guardar_itinerario(999, {})

        self.assertIsNone(result)


# ─────────────────────────────────────────────
# 2. TESTS DE REPOSITORIO (EcoAventuraRepository)
# ─────────────────────────────────────────────

class TestEcoAventuraRepository(TestCase):
    """Pruebas para EcoAventuraRepository"""

    @patch("EcoAventuras.EcoAventuraRepository.EcoAventuraModel.objects")
    def test_obtener_activas_filtra_por_precio(self, mock_objects):
        """Debe aplicar filtro precio__gte y precio__lte."""
        from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository
        qs = MagicMock()
        qs.filter.return_value = qs
        qs.order_by.return_value = qs
        mock_objects.filter.return_value = qs

        EcoAventuraRepository.obtener_activas_con_filtros({"precio_min": 50, "precio_max": 200})

        calls = [str(c) for c in qs.filter.call_args_list]
        self.assertTrue(any("precio__gte" in c for c in calls))
        self.assertTrue(any("precio__lte" in c for c in calls))

    @patch("EcoAventuras.EcoAventuraRepository.EcoAventuraModel.objects")
    def test_obtener_por_id_existente(self, mock_objects):
        """Debe retornar la instancia si existe."""
        from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository
        eco = MagicMock()
        mock_objects.filter.return_value.first.return_value = eco

        result = EcoAventuraRepository.obtener_por_id(1)

        self.assertEqual(result, eco)

    @patch("EcoAventuras.EcoAventuraRepository.EcoAventuraModel.objects")
    def test_obtener_por_id_no_existente(self, mock_objects):
        """Debe retornar None si no existe."""
        from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository
        mock_objects.filter.return_value.first.return_value = None

        result = EcoAventuraRepository.obtener_por_id(999)

        self.assertIsNone(result)

    @patch("EcoAventuras.EcoAventuraRepository.EcoAventuraModel.objects.create")
    def test_crear_ecoaventura(self, mock_create):
        """Debe llamar a objects.create con los datos correctos."""
        from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository
        eco = MagicMock()
        mock_create.return_value = eco
        data = {"nombre": "Tirolesa", "precio": 60.0}

        result = EcoAventuraRepository.crear(data)

        mock_create.assert_called_once_with(**data)
        self.assertEqual(result, eco)

    def test_actualizar_campos(self):
        """Debe actualizar cada campo de la instancia y llamar save()."""
        from EcoAventuras.EcoAventuraRepository import EcoAventuraRepository
        instancia = MagicMock()

        EcoAventuraRepository.actualizar(instancia, {"precio": 150.0, "ubicacion": "Valle del Cauca"})

        instancia.save.assert_called_once()


# ─────────────────────────────────────────────
# 3. TESTS DE CONTROLADOR (EcoAventuraController)
# ─────────────────────────────────────────────

class TestEcoAventuraController(APITestCase):
    """Pruebas de integración para los endpoints de EcoAventuras"""

    def setUp(self):
        self.factory = APIRequestFactory()

    @patch("EcoAventuras.EcoAventuraController.EcoAventuraService.listar_activas")
    @patch("EcoAventuras.EcoAventuraController.EcoAventuraListSerializer")
    def test_get_ecoaventuras_retorna_200(self, mock_serializer, mock_service):
        """GET /ecoaventuras/ debe retornar 200 con estructura paginada."""
        from EcoAventuras.EcoAventuraController import ecoaventuras
        request = self.factory.get("/ecoaventuras/")

        mock_service.return_value = {
            "count": 1, "total_pages": 1, "page": 1, "page_size": 9,
            "results": [MagicMock()]
        }
        mock_serializer.return_value.data = [{"id": 1, "nombre": "Rafting"}]

        request = self.factory.get("/ecoaventuras/")
        response = ecoaventuras(request)


        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    @patch("EcoAventuras.EcoAventuraController.EcoAventuraService.obtener")
    def test_get_detalle_no_encontrado(self, mock_obtener):
        """GET /ecoaventuras/<id>/ con ID inexistente debe retornar 404."""
        from EcoAventuras.EcoAventuraController import ecoaventura_detalle
        request = self.factory.get("/ecoaventuras/")
        mock_obtener.return_value = None

        request = self.factory.get("/ecoaventuras/999/")
        response = ecoaventura_detalle(request, id=999)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("EcoAventuras.EcoAventuraController.EcoAventuraDetailSerializer")
    @patch("EcoAventuras.EcoAventuraController.EcoAventuraService.obtener")
    def test_get_detalle_exitoso(self, mock_obtener, mock_serializer):
        """GET /ecoaventuras/<id>/ con ID válido debe retornar 200."""
        from EcoAventuras.EcoAventuraController import ecoaventura_detalle
        request = self.factory.get("/ecoaventuras/")
        mock_obtener.return_value = MagicMock()
        mock_serializer.return_value.data = {"id": 1, "nombre": "Rafting"}

        request = self.factory.get("/ecoaventuras/1/")
        response = ecoaventura_detalle(request, id=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("EcoAventuras.EcoAventuraController.EcoAventuraService.obtener_itinerario")
    def test_get_itinerario_no_existente(self, mock_obtener):
        """GET itinerario sin datos debe retornar itinerario: None."""
        from EcoAventuras.EcoAventuraController import ecoaventura_itinerario
        
        mock_obtener.return_value = None

        request = self.factory.get("/ecoaventuras/1/itinerario/")

        response = ecoaventura_itinerario(request, id=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["itinerario"])

    @patch("EcoAventuras.EcoAventuraController.EcoAventuraDetailSerializer")
    @patch("EcoAventuras.EcoAventuraController.EcoAventuraService.toggle_activo")
    @patch("EcoAventuras.EcoAventuraController.EcoAventuraService.obtener")
    def test_patch_toggle_activo(self, mock_obtener, mock_toggle, mock_serializer):
        """PATCH con toggle_activo debe cambiar el estado y retornar 200."""
        from EcoAventuras.EcoAventuraController import ecoaventura_detalle
        request = self.factory.get("/ecoaventuras/")
        eco = MagicMock()
        eco.activo = False
        mock_obtener.return_value = eco
        mock_toggle.return_value = eco
        mock_serializer.return_value.data = {"id": 1, "activo": False}

        request = self.factory.patch(
    "/ecoaventuras/1/",
    {"toggle_activo": True},
    format="json"
)
        response = ecoaventura_detalle(request, id=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_toggle.assert_called_once_with(1)
