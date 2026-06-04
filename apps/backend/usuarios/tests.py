import json
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from Clientes.ClienteModel import ClienteModel
from Estados.EstadoModel import EstadoModel
from Monedas.MonedaModel import MonedaModel
from TiposActores.TipoActorModel import TipoActorModel
from TiposActores.ClienteTiposActoresModel import ClienteTiposActoresModel
from Territorio.TerritorioModel import TerritorioModel
from Aprobaciones.AprobacionModel import AprobacionModel, EstadoAprobacion


class BaseTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.estado_activo = EstadoModel.objects.create(nombre_estado='activo')
        cls.estado_inactivo = EstadoModel.objects.create(nombre_estado='inactivo')
        cls.estado_en_revision = EstadoModel.objects.create(nombre_estado='en_revision')
        cls.estado_rechazado = EstadoModel.objects.create(nombre_estado='rechazado')

        cls.moneda = MonedaModel.objects.create(nombre='colombiana', simbolo='COP')

        cls.tipo_productor = TipoActorModel.objects.create(
            id=1, nombre_tipo='productor', descripcion='Suministro'
        )
        cls.tipo_turista = TipoActorModel.objects.create(
            id=6, nombre_tipo='turista', descripcion='Visitante'
        )

        cls.lider1 = User.objects.create_user(
            username='lider1', email='lider1@test.com', password='Test1234'
        )
        cls.cliente_lider1 = ClienteModel.objects.create(
            usuario=cls.lider1, nombre='Lider Uno', telefono='3001111111',
            estado=cls.estado_activo, tipo_moneda=cls.moneda, es_lider=True
        )

        cls.lider2 = User.objects.create_user(
            username='lider2', email='lider2@test.com', password='Test1234'
        )
        cls.cliente_lider2 = ClienteModel.objects.create(
            usuario=cls.lider2, nombre='Lider Dos', telefono='3002222222',
            estado=cls.estado_activo, tipo_moneda=cls.moneda, es_lider=True
        )

        cls.territorio1 = TerritorioModel.objects.create(
            nombre_territorio='Territorio Uno', region='Region1',
            estado=cls.estado_activo, administrador=cls.cliente_lider1
        )
        cls.territorio2 = TerritorioModel.objects.create(
            nombre_territorio='Territorio Dos', region='Region2',
            estado=cls.estado_activo, administrador=cls.cliente_lider2
        )

        cls.admin = User.objects.create_user(
            username='admin_test', email='admin@test.com', password='Admin1234'
        )
        ClienteModel.objects.create(
            usuario=cls.admin, nombre='Admin', telefono='3009999999',
            estado=cls.estado_activo, tipo_moneda=cls.moneda, es_admin=True
        )

        cls.client = APIClient()

    def _get_token(self, user, extra_claims=None):
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        if extra_claims:
            for key, value in extra_claims.items():
                access[key] = value
        return str(access)

    def _auth_header(self, token):
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def _json_patch(self, url, data, **extra):
        return self.client.patch(
            url, json.dumps(data),
            content_type='application/json', **extra
        )

    def _login(self, username, password):
        return self.client.post('/api/token/', {
            'username': username, 'password': password
        }, format='json')


class HU2_RegistroActorTest(BaseTest):
    def test_registro_actor_exitoso(self):
        data = {
            'nombre_completo': 'Juan Productor',
            'email': 'juan@test.com', 'password': 'Password1',
            'telefono': '3001234567',
            'id_territorio': self.territorio1.id_territorio,
            'tipos_actores': [self.tipo_productor.id],
            'es_actor': True, 'es_lider': False, 'es_turista': False,
        }
        response = self.client.post('/api/registro/cliente/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('Solicitud Enviada', response.data['mensaje'])

        cliente = ClienteModel.objects.get(usuario__email='juan@test.com')
        self.assertEqual(cliente.estado.nombre_estado, 'en_revision')
        aprobacion = AprobacionModel.objects.filter(id_actor=cliente).first()
        self.assertIsNotNone(aprobacion)
        self.assertEqual(aprobacion.id_lider, self.cliente_lider1)
        self.assertEqual(aprobacion.estado_resultado, EstadoAprobacion.EN_REVISION)

    def test_registro_actor_sin_territorio(self):
        data = {
            'nombre_completo': 'Juan Productor',
            'email': 'juan@test.com', 'password': 'Password1',
            'telefono': '3001234567',
            'tipos_actores': [self.tipo_productor.id],
            'es_actor': True, 'es_lider': False, 'es_turista': False,
        }
        response = self.client.post('/api/registro/cliente/', data, format='json')
        self.assertEqual(response.status_code, 400)


class HU3_RegistroTuristaTest(BaseTest):
    def test_registro_turista_exitoso(self):
        data = {
            'nombre_completo': 'Sofia Turista',
            'email': 'sofia@test.com', 'password': 'Password1',
            'telefono': '3007654321',
            'tipos_actores': [self.tipo_turista.id],
            'es_actor': False, 'es_lider': False, 'es_turista': True,
        }
        response = self.client.post('/api/registro/cliente/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('completado', response.data['mensaje'])

        cliente = ClienteModel.objects.get(usuario__email='sofia@test.com')
        self.assertEqual(cliente.estado.nombre_estado, 'activo')
        self.assertFalse(AprobacionModel.objects.filter(id_actor=cliente).exists())


class HU4_PerfilTest(BaseTest):
    def setUp(self):
        actor_user = User.objects.create_user(
            username='actor_aprobado', email='actor@test.com', password='Test1234'
        )
        self.cliente_actor = ClienteModel.objects.create(
            usuario=actor_user, nombre='Actor Aprobado', telefono='3005555555',
            estado=self.estado_activo, tipo_moneda=self.moneda, es_actor=True
        )
        ClienteTiposActoresModel.objects.create(
            id_actor=self.cliente_actor, id_tipo=self.tipo_productor
        )
        AprobacionModel.objects.create(
            id_actor=self.cliente_actor, id_lider=self.cliente_lider1,
            estado_resultado=EstadoAprobacion.APROBADO
        )
        self.token_aprobado = self._get_token(actor_user)

    def test_get_perfil_autenticado(self):
        response = self.client.get(
            '/api/auth/me/', **self._auth_header(self.token_aprobado)
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['nombre'], 'Actor Aprobado')
        self.assertEqual(response.data['activo'], True)

    def test_perfil_en_revision_muestra_aviso(self):
        data = {
            'nombre_completo': 'Pendiente Actor',
            'email': 'pendiente@test.com', 'password': 'Password1',
            'telefono': '3006666666',
            'id_territorio': self.territorio1.id_territorio,
            'tipos_actores': [self.tipo_productor.id],
            'es_actor': True, 'es_lider': False, 'es_turista': False,
        }
        self.client.post('/api/registro/cliente/', data, format='json')
        login_resp = self._login('pendiente@test.com', 'Password1')
        self.assertEqual(login_resp.status_code, 400)
        detail = login_resp.data['detail']
        if isinstance(detail, list):
            detail = detail[0]
        self.assertIn('revision', detail.lower())

    def test_perfil_rechazado_no_accede(self):
        rechazado_user = User.objects.create_user(
            username='rechazado', email='rechazado@test.com', password='Test1234'
        )
        ClienteModel.objects.create(
            usuario=rechazado_user, nombre='Actor Rechazado', telefono='3007777777',
            estado=self.estado_rechazado, tipo_moneda=self.moneda, es_actor=True
        )
        login_resp = self._login('rechazado@test.com', 'Test1234')
        self.assertEqual(login_resp.status_code, 400)
        detail = login_resp.data['detail']
        if isinstance(detail, list):
            detail = detail[0]
        self.assertIn('revision', detail.lower())


class HU41_ModificarPerfilTest(BaseTest):
    def setUp(self):
        user = User.objects.create_user(
            username='actor_mod', email='mod@test.com', password='Test1234'
        )
        self.cliente = ClienteModel.objects.create(
            usuario=user, nombre='Actor Original', telefono='3005555555',
            estado=self.estado_activo, tipo_moneda=self.moneda, es_actor=True
        )
        AprobacionModel.objects.create(
            id_actor=self.cliente, id_lider=self.cliente_lider1,
            estado_resultado=EstadoAprobacion.APROBADO
        )
        self.token = self._get_token(user)

    def test_actualizar_nombre(self):
        response = self._json_patch(
            '/api/perfil/actualizar/',
            {'nombre': 'Nuevo Nombre'},
            **self._auth_header(self.token)
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['nombre'], 'Nuevo Nombre')


class HU7_AdminLideresTest(BaseTest):
    def setUp(self):
        self.admin_token = self._get_token(self.admin, extra_claims={
            'es_admin': True
        })
        lider3_user = User.objects.create_user(
            username='lider3', email='lider3@test.com', password='Test1234'
        )
        self.cliente_lider3 = ClienteModel.objects.create(
            usuario=lider3_user, nombre='Lider Sin Territorio', telefono='3003333333',
            estado=self.estado_activo, tipo_moneda=self.moneda, es_lider=True
        )

    def test_admin_lista_lideres(self):
        response = self.client.get(
            '/api/admin/lideres/', **self._auth_header(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        nombres = [l['nombre'] for l in response.data]
        self.assertIn('Lider Uno', nombres)
        self.assertIn('Lider Dos', nombres)

    def test_admin_actualiza_lider_inhabilitar(self):
        response = self._json_patch(
            f'/api/admin/lideres/{self.cliente_lider1.id_cliente}/',
            {'activo': 'false'},
            **self._auth_header(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        self.cliente_lider1.refresh_from_db()
        self.assertEqual(self.cliente_lider1.estado, self.estado_inactivo)

    def test_admin_reasigna_territorio(self):
        response = self._json_patch(
            f'/api/admin/lideres/{self.cliente_lider3.id_cliente}/',
            {'territorio_id': self.territorio1.id_territorio},
            **self._auth_header(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        self.territorio1.refresh_from_db()
        self.assertEqual(self.territorio1.administrador, self.cliente_lider3)


class HU71_AdminTerritoriosTest(BaseTest):
    def setUp(self):
        self.admin_token = self._get_token(self.admin, extra_claims={
            'es_admin': True
        })

    def test_admin_lista_territorios(self):
        response = self.client.get(
            '/api/admin/territorios/', **self._auth_header(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        nombres = [t['nombre_territorio'] for t in response.data]
        self.assertIn('Territorio Uno', nombres)
        self.assertIn('Territorio Dos', nombres)

    def test_admin_inhabilita_territorio(self):
        estado_inactivo_id = self.estado_inactivo.id
        response = self._json_patch(
            f'/api/admin/territorios/{self.territorio1.id_territorio}/',
            {'id_estado': estado_inactivo_id},
            **self._auth_header(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        self.territorio1.refresh_from_db()
        self.assertEqual(self.territorio1.estado, self.estado_inactivo)


class HU72_CrearLiderTest(BaseTest):
    def setUp(self):
        self.admin_token = self._get_token(self.admin, extra_claims={
            'es_admin': True
        })

    def test_crear_lider_exitoso(self):
        data = {
            'nombre_completo': 'Nuevo Lider',
            'email': 'nuevolider@test.com', 'password': 'Password1',
            'telefono': '3008888888',
        }
        response = self.client.post(
            '/api/usuarios/admin/registrar-lider/',
            json.dumps(data), content_type='application/json',
            **self._auth_header(self.admin_token)
        )
        self.assertEqual(response.status_code, 201)
        lider = ClienteModel.objects.get(usuario__email='nuevolider@test.com')
        self.assertEqual(lider.es_lider, True)
        self.assertEqual(lider.estado, self.estado_activo)
