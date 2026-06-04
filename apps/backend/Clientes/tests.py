from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from Clientes.ClienteModel import ClienteModel
from Estados.EstadoModel import EstadoModel
from Monedas.MonedaModel import MonedaModel
from TiposActores.TipoActorModel import TipoActorModel
from Servicios.ServicioModel import ServicioModel, ClienteServicioModel


class BaseTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.estado_activo = EstadoModel.objects.create(nombre_estado='activo')
        cls.estado_inactivo = EstadoModel.objects.create(nombre_estado='inactivo')
        cls.estado_en_revision = EstadoModel.objects.create(nombre_estado='en_revision')
        cls.estado_aprobado = EstadoModel.objects.create(nombre_estado='aprobado')

        cls.moneda = MonedaModel.objects.create(nombre='colombiana', simbolo='COP')

        cls.tipo_productor = TipoActorModel.objects.create(
            id=1, nombre_tipo='productor', descripcion='Suministro'
        )

        cls.user_actor1 = User.objects.create_user(
            username='actor1', email='actor1@test.com', password='Test1234'
        )
        cls.cliente_actor1 = ClienteModel.objects.create(
            usuario=cls.user_actor1, nombre='Actor Uno', telefono='3001111111',
            estado=cls.estado_activo, tipo_moneda=cls.moneda,
            es_actor=True, direccion='Calle 1 #1-01'
        )

        cls.user_actor2 = User.objects.create_user(
            username='actor2', email='actor2@test.com', password='Test1234'
        )
        cls.cliente_actor2 = ClienteModel.objects.create(
            usuario=cls.user_actor2, nombre='Actor Dos', telefono='3002222222',
            estado=cls.estado_activo, tipo_moneda=cls.moneda,
            es_actor=True, direccion='Carrera 2 #2-02'
        )

        cls.user_inactivo = User.objects.create_user(
            username='inactivo', email='inactivo@test.com', password='Test1234'
        )
        ClienteModel.objects.create(
            usuario=cls.user_inactivo, nombre='Actor Inactivo', telefono='3003333333',
            estado=cls.estado_inactivo, tipo_moneda=cls.moneda,
            es_actor=True, direccion='Av 3 #3-03'
        )

        cls.servicio_a = ServicioModel.objects.create(
            nombre='Servicio A', descripcion='Desc A',
            precio_base='100.00', unidad='unidad'
        )
        cls.servicio_b = ServicioModel.objects.create(
            nombre='Servicio B', descripcion='Desc B',
            precio_base='200.00', unidad='kg'
        )

        cls.client = APIClient()

    def _get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def _auth_header(self, token):
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}


class HU6_MapaEconomicoTest(BaseTest):
    def setUp(self):
        self.token = self._get_token(self.user_actor1)
        self.headers = self._auth_header(self.token)

    def test_lista_clientes_incluye_direccion(self):
        response = self.client.get('/api/clientes/', **self.headers)
        self.assertEqual(response.status_code, 200)
        direcciones = [(c['nombre'], c.get('direccion')) for c in response.data]
        self.assertIn(('Actor Uno', 'Calle 1 #1-01'), direcciones)
        self.assertIn(('Actor Dos', 'Carrera 2 #2-02'), direcciones)

    def test_lista_clientes_tiene_activo_computado(self):
        response = self.client.get('/api/clientes/', **self.headers)
        for c in response.data:
            if c['nombre'] in ('Actor Uno', 'Actor Dos'):
                self.assertEqual(c['activo'], True)
            elif c['nombre'] == 'Actor Inactivo':
                self.assertEqual(c['activo'], False)

    def test_lista_clientes_incluye_servicios(self):
        ClienteServicioModel.objects.create(cliente=self.cliente_actor1, servicio=self.servicio_a)
        ClienteServicioModel.objects.create(cliente=self.cliente_actor1, servicio=self.servicio_b)
        response = self.client.get('/api/clientes/', **self.headers)
        actor1_data = next(
            c for c in response.data if c['nombre'] == 'Actor Uno'
        )
        self.assertIn('servicio', actor1_data)
        self.assertIn('Servicio A', actor1_data['servicio'])
