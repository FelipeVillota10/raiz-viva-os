from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db import transaction
from Clientes.ClienteModel import ClienteModel
from Estados.EstadoModel import EstadoModel
from Monedas.MonedaModel import MonedaModel
from TiposActores.TipoActorModel import TipoActorModel
from TiposActores.ClienteTiposActoresModel import ClienteTiposActoresModel
from Territorio.TerritorioModel import TerritorioModel
from Servicios.ServicioModel import ServicioModel, ClienteServicioModel
from Aprobaciones.AprobacionModel import AprobacionModel, EstadoAprobacion
from django.utils import timezone
from datetime import timedelta

PASSWORD = "Admin123"
PASSWORD_HASH = make_password(PASSWORD)


class Command(BaseCommand):
    help = "Siembra datos de prueba en la base de datos"

    def handle(self, *args, **options):
        self._limpiar()
        self._crear_estados()
        self._crear_monedas()
        self._crear_tipos_actores()
        self._crear_usuarios()
        self.stdout.write(self.style.SUCCESS("Datos de prueba insertados correctamente"))

    def _limpiar(self):
        self.stdout.write("Limpiando tablas...")
        ClienteServicioModel.objects.all().delete()
        AprobacionModel.objects.all().delete()
        ClienteTiposActoresModel.objects.all().delete()
        TerritorioModel.objects.all().delete()
        ClienteModel.objects.all().delete()
        User.objects.all().delete()
        TipoActorModel.objects.all().delete()
        ServicioModel.objects.all().delete()
        MonedaModel.objects.all().delete()
        EstadoModel.objects.all().delete()

    def _crear_estados(self):
        for nombre in ['en_revision', 'rechazado', 'aprobado', 'activo', 'inactivo']:
            EstadoModel.objects.create(nombre_estado=nombre)
        self.stdout.write("  Estados creados")

    def _crear_monedas(self):
        MonedaModel.objects.create(nombre='europea', simbolo='EUR')
        MonedaModel.objects.create(nombre='estadounidense', simbolo='USD')
        MonedaModel.objects.create(nombre='colombiana', simbolo='COP')
        self.stdout.write("  Monedas creadas")

    def _crear_tipos_actores(self):
        tipos = [
            (1, 'productor', 'Suministro de productos locales y artesanales'),
            (2, 'caminante', 'Guia de rutas e interprete de saberes'),
            (3, 'custodio', 'Proteccion de biodiversidad y patrimonio'),
            (4, 'facilitador', 'Tallerista y gestor de experiencias'),
            (5, 'anfitrion', 'Gestor de alojamiento, gastronomia y transporte'),
            (6, 'turista', 'Visitante de experiencias'),
        ]
        for tid, nombre, desc in tipos:
            TipoActorModel.objects.create(id=tid, nombre_tipo=nombre, descripcion=desc)
        self.stdout.write("  Tipos de actores creados")

    def _crear_usuarios(self):
        activo = EstadoModel.objects.get(nombre_estado='activo')
        en_revision = EstadoModel.objects.get(nombre_estado='en_revision')
        europea = MonedaModel.objects.get(nombre='europea')
        estadounidense = MonedaModel.objects.get(nombre='estadounidense')
        colombiana = MonedaModel.objects.get(nombre='colombiana')

        users_data = [
            {'id': 1, 'username': 'lider_buitrera', 'email': 'lider.buitrera@raizviva.com', 'first': 'Maria', 'last': 'Lopez', 'is_staff': True},
            {'id': 2, 'username': 'lider_purace', 'email': 'lider.purace@raizviva.com', 'first': 'Carlos', 'last': 'Gonzalez', 'is_staff': True},
            {'id': 7, 'username': 'admin_raizviva', 'email': 'admin@raizviva.com', 'first': 'Admin', 'last': 'RaizViva', 'is_staff': True},
            {'id': 8, 'username': 'lider_silvia', 'email': 'lider.silvia@raizviva.com', 'first': 'Silvia', 'last': 'Ramirez', 'is_staff': True},
            {'id': 9, 'username': 'lider_andres', 'email': 'lider.andres@raizviva.com', 'first': 'Andres', 'last': 'Torres', 'is_staff': True},
            {'id': 10, 'username': 'lider_diana', 'email': 'lider.diana@raizviva.com', 'first': 'Diana', 'last': 'Vargas', 'is_staff': True},
            {'id': 11, 'username': 'lider_felipe', 'email': 'lider.felipe@raizviva.com', 'first': 'Felipe', 'last': 'Mora', 'is_staff': True},
            {'id': 12, 'username': 'lider_claudia', 'email': 'lider.claudia@raizviva.com', 'first': 'Claudia', 'last': 'Mejia', 'is_staff': True},
            {'id': 13, 'username': 'lider_ricardo', 'email': 'lider.ricardo@raizviva.com', 'first': 'Ricardo', 'last': 'Perez', 'is_staff': True},
            {'id': 3, 'username': 'productor_amaime', 'email': 'productor.amaime@raizviva.com', 'first': 'Juan', 'last': 'Martinez'},
            {'id': 4, 'username': 'caminante_palmira', 'email': 'caminante.palmira@raizviva.com', 'first': 'Ana', 'last': 'Rodriguez'},
            {'id': 5, 'username': 'anfitrion_buitrera', 'email': 'anfitrion.buitrera@raizviva.com', 'first': 'Pedro', 'last': 'Sanchez'},
            {'id': 6, 'username': 'turista_prueba', 'email': 'turista@raizviva.com', 'first': 'Sofia', 'last': 'Garcia'},
        ]

        users = {}
        for ud in users_data:
            user = User.objects.create_user(
                id=ud['id'],
                username=ud['username'],
                email=ud['email'],
                password=PASSWORD,
                first_name=ud['first'],
                last_name=ud['last'],
                is_staff=ud.get('is_staff', False),
                is_active=True,
            )
            users[ud['username']] = user

        # Clientes
        lideres_data = [
            {'id': 1, 'user': users['lider_buitrera'], 'nombre': 'Maria Lopez', 'tel': '3001234567', 'moneda': europea, 'reputacion': 95.00, 'es_lider': True},
            {'id': 2, 'user': users['lider_purace'], 'nombre': 'Carlos Gonzalez', 'tel': '3007654321', 'moneda': estadounidense, 'reputacion': 90.00, 'es_lider': True},
            {'id': 8, 'user': users['lider_silvia'], 'nombre': 'Silvia Ramirez', 'tel': '3002222222', 'moneda': europea, 'es_lider': True},
            {'id': 9, 'user': users['lider_andres'], 'nombre': 'Andres Torres', 'tel': '3003333333', 'moneda': europea, 'es_lider': True},
            {'id': 10, 'user': users['lider_diana'], 'nombre': 'Diana Vargas', 'tel': '3004444444', 'moneda': europea, 'es_lider': True},
            {'id': 11, 'user': users['lider_felipe'], 'nombre': 'Felipe Mora', 'tel': '3005555555', 'moneda': europea, 'es_lider': True},
            {'id': 12, 'user': users['lider_claudia'], 'nombre': 'Claudia Mejia', 'tel': '3006666666', 'moneda': europea, 'es_lider': True},
            {'id': 13, 'user': users['lider_ricardo'], 'nombre': 'Ricardo Perez', 'tel': '3007777777', 'moneda': europea, 'es_lider': True},
        ]

        clientes = {}
        for ld in lideres_data:
            c = ClienteModel.objects.create(
                id_cliente=ld['id'],
                usuario=ld['user'],
                nombre=ld['nombre'],
                telefono=ld['tel'],
                estado=activo,
                tipo_moneda=ld.get('moneda'),
                reputacion=ld.get('reputacion'),
                es_lider=ld.get('es_lider', False),
            )
            clientes[ld['user'].username] = c

        # Admin
        admin_cliente = ClienteModel.objects.create(
            id_cliente=7,
            usuario=users['admin_raizviva'],
            nombre='Admin RaizViva',
            telefono='3000000000',
            estado=activo,
            tipo_moneda=europea,
            es_admin=True,
        )
        clientes['admin_raizviva'] = admin_cliente

        # Actores
        actores_data = [
            {'id': 3, 'user': users['productor_amaime'], 'nombre': 'Juan Martinez', 'tel': '3012345678', 'moneda': colombiana, 'estado': en_revision, 'es_actor': True},
            {'id': 4, 'user': users['caminante_palmira'], 'nombre': 'Ana Rodriguez', 'tel': '3098765432', 'moneda': europea, 'estado': en_revision, 'es_actor': True},
            {'id': 5, 'user': users['anfitrion_buitrera'], 'nombre': 'Pedro Sanchez', 'tel': '3101234567', 'moneda': colombiana, 'estado': activo, 'reputacion': 75.50, 'es_actor': True},
            {'id': 6, 'user': users['turista_prueba'], 'nombre': 'Sofia Garcia', 'tel': '3201234567', 'moneda': europea, 'estado': activo, 'es_turista': True},
        ]

        actores = {}
        for ad in actores_data:
            c = ClienteModel.objects.create(
                id_cliente=ad['id'],
                usuario=ad['user'],
                nombre=ad['nombre'],
                telefono=ad['tel'],
                estado=ad['estado'],
                tipo_moneda=ad['moneda'],
                reputacion=ad.get('reputacion'),
                es_actor=ad.get('es_actor', False),
                es_turista=ad.get('es_turista', False),
            )
            actores[ad['user'].username] = c

        # Territory leaders mapping
        territorio_data = [
            (1, clientes['lider_buitrera'], 'Buitrera', 'Zona Rural Palmira'),
            (2, clientes['lider_silvia'], 'La Torre', 'Zona Urbana Palmira'),
            (3, clientes['lider_andres'], 'Amaime', 'Zona Rural Palmira'),
            (4, clientes['lider_purace'], 'Purace', 'Cauca'),
            (5, clientes['lider_diana'], 'Popayan', 'Cauca'),
            (6, clientes['lider_felipe'], 'Pasto', 'Narino'),
        ]

        for tid, adm, nombre, region in territorio_data:
            TerritorioModel.objects.create(
                id_territorio=tid,
                estado=activo,
                administrador=adm,
                nombre_territorio=nombre,
                region=region,
            )

        # Cliente-TiposActores
        ClienteTiposActoresModel.objects.create(id_actor=actores['productor_amaime'], id_tipo_id=1)
        ClienteTiposActoresModel.objects.create(id_actor=actores['caminante_palmira'], id_tipo_id=2)
        ClienteTiposActoresModel.objects.create(id_actor=actores['anfitrion_buitrera'], id_tipo_id=5)
        ClienteTiposActoresModel.objects.create(id_actor=actores['turista_prueba'], id_tipo_id=6)

        # Aprobaciones
        ahora = timezone.now()
        AprobacionModel.objects.create(
            id_actor=actores['productor_amaime'],
            id_lider=clientes['lider_buitrera'],
            estado_resultado=EstadoAprobacion.EN_REVISION,
            fecha_solicitud=ahora - timedelta(days=2),
        )
        AprobacionModel.objects.create(
            id_actor=actores['caminante_palmira'],
            id_lider=clientes['lider_buitrera'],
            estado_resultado=EstadoAprobacion.EN_REVISION,
            fecha_solicitud=ahora - timedelta(days=1),
        )
        AprobacionModel.objects.create(
            id_actor=actores['anfitrion_buitrera'],
            id_lider=clientes['lider_buitrera'],
            estado_resultado=EstadoAprobacion.APROBADO,
            observaciones='Bienvenido al equipo. Territorio Buitrera necesita anfitriones.',
            fecha_solicitud=ahora - timedelta(days=5),
            fecha_respuesta=ahora - timedelta(days=4),
        )

        # Servicios
        servicios_data = [
            ('Restaurante', 'Servicio de alimentacion con productos locales', None, 'por persona'),
            ('Hoteleria', 'Alojamiento en casas rurales y hospedajes comunitarios', None, 'por noche'),
            ('Spa', 'Tratamientos naturales con plantas y saberes ancestrales', None, 'por sesion'),
            ('Guia de caminata', 'Recorridos guiados por senderos naturales y culturales', None, 'por persona'),
            ('Artesanias', 'Elaboracion y venta de piezas artesanales locales', None, 'por pieza'),
            ('Transporte', 'Movilidad interna dentro del territorio', None, 'por trayecto'),
            ('Taller gastronomico', 'Talleres de cocina tradicional y productos locales', None, 'por persona'),
            ('Interpretacion cultural', 'Narracion de historias, mitos y saberes del territorio', None, 'por grupo'),
            ('Agricultura', 'Venta directa de productos agricolas organicos', None, 'por kilo'),
            ('Experiencia vivencial', 'Inmersion en la vida cotidiana de la comunidad', None, 'por dia'),
        ]

        servicios = []
        for nombre, desc, precio, unidad in servicios_data:
            s = ServicioModel.objects.create(nombre=nombre, descripcion=desc, precio_base=precio, unidad=unidad)
            servicios.append(s)

        # Cliente-Servicios
        cs_data = [
            (actores['productor_amaime'], servicios[8], 15000.00),
            (actores['productor_amaime'], servicios[4], 25000.00),
            (actores['caminante_palmira'], servicios[3], 35000.00),
            (actores['caminante_palmira'], servicios[7], 40000.00),
            (actores['anfitrion_buitrera'], servicios[0], 20000.00),
            (actores['anfitrion_buitrera'], servicios[1], 50000.00),
            (actores['anfitrion_buitrera'], servicios[5], 10000.00),
        ]
        for cliente, servicio, precio in cs_data:
            ClienteServicioModel.objects.create(cliente=cliente, servicio=servicio, precio_acordado=precio)

        # Reset sequences
        from django.db import connection
        with connection.cursor() as cursor:
            tables = [
                ('tipos_actores_id_seq', 'tipos_actores', 'id'),
                ('auth_user_id_seq', 'auth_user', 'id'),
                ('clientes_id_cliente_seq', 'clientes', 'id_cliente'),
                ('territorios_id_territorio_seq', 'territorios', 'id_territorio'),
                ('estados_id_seq', 'estados', 'id'),
                ('monedas_id_seq', 'monedas', 'id'),
                ('servicios_id_seq', 'servicios', 'id'),
            ]
            for seq, table, col in tables:
                cursor.execute(f"SELECT setval('{seq}', (SELECT MAX({col}) FROM {table}))")

        self.stdout.write(f"  {len(users_data)} usuarios creados (password: {PASSWORD})")
