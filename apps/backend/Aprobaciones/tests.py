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

        cls.lider1_user = User.objects.create_user(
            username='lider1', email='lider1@test.com', password='Test1234'
        )
        cls.lider1 = ClienteModel.objects.create(
            usuario=cls.lider1_user, nombre='Lider Uno', telefono='3001111111',
            estado=cls.estado_activo, tipo_moneda=cls.moneda, es_lider=True
        )

        cls.lider2_user = User.objects.create_user(
            username='lider2', email='lider2@test.com', password='Test1234'
        )
        cls.lider2 = ClienteModel.objects.create(
            usuario=cls.lider2_user, nombre='Lider Dos', telefono='3002222222',
            estado=cls.estado_activo, tipo_moneda=cls.moneda, es_lider=True
        )

        TerritorioModel.objects.create(
            nombre_territorio='Territorio Lider1', region='R1',
            estado=cls.estado_activo, administrador=cls.lider1
        )
        TerritorioModel.objects.create(
            nombre_territorio='Territorio Lider2', region='R2',
            estado=cls.estado_activo, administrador=cls.lider2
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

    def _put_json(self, url, data, **extra):
        return self.client.patch(
            url, json.dumps(data),
            content_type='application/json', **extra
        )

    def _crear_solicitud(self, nombre, email, lider):
        u = User.objects.create_user(
            username=email.split('@')[0], email=email, password='Test1234'
        )
        c = ClienteModel.objects.create(
            usuario=u, nombre=nombre, telefono='3000000000',
            estado=self.estado_en_revision, tipo_moneda=self.moneda, es_actor=True
        )
        ClienteTiposActoresModel.objects.create(id_actor=c, id_tipo=self.tipo_productor)
        a = AprobacionModel.objects.create(
            id_actor=c, id_lider=lider, estado_resultado=EstadoAprobacion.EN_REVISION
        )
        return c, a


class HU5_AceptarRechazarTest(BaseTest):
    def setUp(self):
        self.token1 = self._get_token(self.lider1_user, extra_claims={
            'es_lider': True
        })
        self.token2 = self._get_token(self.lider2_user, extra_claims={
            'es_lider': True
        })

    def test_lider_lista_sus_solicitudes(self):
        self._crear_solicitud('Actor1', 'a1@test.com', self.lider1)
        self._crear_solicitud('Actor2', 'a2@test.com', self.lider1)
        self._crear_solicitud('Actor3', 'a3@test.com', self.lider2)

        response = self.client.get(
            '/api/solicitudes/', **self._auth_header(self.token1)
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_lider_aprueba_solicitud(self):
        actor, aprobacion = self._crear_solicitud('ActorA', 'aprueba@test.com', self.lider1)
        response = self._put_json(
            f'/api/solicitudes/{aprobacion.id_aprobacion}/actualizar/',
            {'estado_resultado': 'APROBADO'},
            **self._auth_header(self.token1)
        )
        self.assertEqual(response.status_code, 200)
        actor.refresh_from_db()
        self.assertEqual(actor.estado, self.estado_activo)

    def test_lider_rechaza_solicitud(self):
        actor, aprobacion = self._crear_solicitud('ActorR', 'rechaza@test.com', self.lider1)
        response = self._put_json(
            f'/api/solicitudes/{aprobacion.id_aprobacion}/actualizar/',
            {'estado_resultado': 'RECHAZADO'},
            **self._auth_header(self.token1)
        )
        self.assertEqual(response.status_code, 200)
        actor.refresh_from_db()
        self.assertEqual(actor.estado, self.estado_rechazado)

    def test_lider_no_aprueba_solicitud_ajena(self):
        actor, aprobacion = self._crear_solicitud('ActorX', 'ajeno@test.com', self.lider2)
        response = self._put_json(
            f'/api/solicitudes/{aprobacion.id_aprobacion}/actualizar/',
            {'estado_resultado': 'APROBADO'},
            **self._auth_header(self.token1)
        )
        self.assertEqual(response.status_code, 404)


class HU51_InhabilitarActorTest(BaseTest):
    def setUp(self):
        self.token1 = self._get_token(self.lider1_user, extra_claims={
            'es_lider': True
        })

        actor_user = User.objects.create_user(
            username='actor_test', email='actor@test.com', password='Test1234'
        )
        self.actor = ClienteModel.objects.create(
            usuario=actor_user, nombre='Actor Test', telefono='3003333333',
            estado=self.estado_activo, tipo_moneda=self.moneda, es_actor=True
        )
        ClienteTiposActoresModel.objects.create(id_actor=self.actor, id_tipo=self.tipo_productor)
        AprobacionModel.objects.create(
            id_actor=self.actor, id_lider=self.lider1,
            estado_resultado=EstadoAprobacion.APROBADO
        )

    def test_lider_inhabilita_actor(self):
        response = self._put_json(
            f'/api/lider/actores/{self.actor.id_cliente}/toggle-estado/',
            {},
            **self._auth_header(self.token1)
        )
        self.assertEqual(response.status_code, 200)
        self.actor.refresh_from_db()
        self.assertEqual(self.actor.estado, self.estado_inactivo)

    def test_lider_reactiva_actor(self):
        self.actor.estado = self.estado_inactivo
        self.actor.save()
        response = self._put_json(
            f'/api/lider/actores/{self.actor.id_cliente}/toggle-estado/',
            {'accion': 'habilitar'},
            **self._auth_header(self.token1)
        )
        self.assertEqual(response.status_code, 200)
        self.actor.refresh_from_db()
        self.assertEqual(self.actor.estado, self.estado_activo)
