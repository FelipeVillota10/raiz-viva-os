from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from Clientes.ClienteModel import ClienteModel
from Estados.EstadoModel import EstadoModel
from TiposActores.TipoActorModel import TipoActorModel
from TiposActores.ClienteTiposActoresModel import ClienteTiposActoresModel
from Territorio.TerritorioModel import TerritorioModel
from Estados.EstadoModel import EstadoModel
from Monedas.MonedaModel import MonedaModel
from Servicios.ServicioModel import ServicioModel
from Aprobaciones.AprobacionModel import AprobacionModel, EstadoAprobacion
from Servicios.ServicioModel import ClienteServicioModel
from .repository import UsuarioRepository
from .EmailService import EmailService


class UsuarioService:
    def __init__(self):
        self.repository = UsuarioRepository()

    def authenticate(self, username, password):
        if '@' in username:
            user_obj = self.repository.get_user_by_email(username)
            if user_obj:
                username = user_obj.username
        else:
            user_obj = self.repository.get_user_by_username(username)

        if not user_obj:
            return None, 'No se encontró una cuenta con esas credenciales'

        if not user_obj.check_password(password):
            return None, 'No se encontró una cuenta con esas credenciales'

        if not user_obj.is_active:
            return None, 'Tu cuenta ha sido desactivada. Contacta al administrador.'

        cliente = self.repository.get_cliente_by_user(user_obj)
        if cliente:
            if cliente.es_turista or cliente.es_lider or cliente.es_admin:
                if not cliente.estado or cliente.estado.nombre_estado == 'inactivo':
                    return None, 'Tu cuenta ha sido deshabilitada. Contacta al administrador.'
            elif cliente.es_actor:
                tiene_aprobacion = AprobacionModel.objects.filter(
                    id_actor=cliente,
                    estado_resultado=EstadoAprobacion.APROBADO
                ).exists()
                if not tiene_aprobacion:
                    return None, 'Tu solicitud esta en revision. El lider territorial la revisara pronto.'
                if not cliente.estado or cliente.estado.nombre_estado == 'inactivo':
                    return None, 'Tu cuenta ha sido deshabilitada. Contacta al lider territorial.'
            else:
                return None, 'Tu solicitud esta en revision. El lider territorial la revisara pronto.'

        return cliente, None

    def get_perfil(self, user_id):
        return ClienteModel.objects.select_related(
            'usuario', 'estado', 'tipo_moneda'
        ).prefetch_related('tipos_actores__id_tipo').get(usuario_id=user_id)

    def register_cliente(self, data):
        nombre_completo = data.get('nombre_completo')
        email = data.get('email')
        password = data.get('password')
        telefono = data.get('telefono')
        id_territorio = data.get('id_territorio')
        id_tipo_moneda = data.get('id_tipo_moneda')
        tipos_actores = data.get('tipos_actores', [])
        es_actor = data.get('es_actor', False)
        es_lider = data.get('es_lider', False)
        es_turista = data.get('es_turista', False)
        es_admin = data.get('es_admin', False)

        partes_nombre = nombre_completo.split(' ', 1)
        first_name = partes_nombre[0]
        last_name = partes_nombre[1] if len(partes_nombre) > 1 else ''
        username = email.split('@')[0]
        counter = 1
        base_username = username

        while self.repository.user_exists_by_username(username):
            username = f"{base_username}{counter}"
            counter += 1

        user = self.repository.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        territorio = None
        if id_territorio:
            try:
                territorio = TerritorioModel.objects.get(id_territorio=id_territorio)
            except TerritorioModel.DoesNotExist:
                pass

        tipo_moneda = None
        if id_tipo_moneda:
            try:
                tipo_moneda = MonedaModel.objects.get(id=id_tipo_moneda)
            except MonedaModel.DoesNotExist:
                pass

        if es_actor:
            estado = EstadoModel.objects.get(nombre_estado='en_revision')
        else:
            estado = EstadoModel.objects.get(nombre_estado='activo')

        cliente = ClienteModel.objects.create(
            usuario=user,
            nombre=nombre_completo,
            telefono=telefono,
            estado=estado,
            tipo_moneda=tipo_moneda,
            es_actor=es_actor,
            es_lider=es_lider,
            es_turista=es_turista,
            es_admin=es_admin,
        )

        for tipo_id in tipos_actores:
            tipo = TipoActorModel.objects.get(id=tipo_id)
            ClienteTiposActoresModel.objects.create(id_actor=cliente, id_tipo=tipo)

        servicios_ids = data.get('servicios', [])
        for servicio_id in servicios_ids:
            try:
                servicio = ServicioModel.objects.get(id=servicio_id)
                ClienteServicioModel.objects.create(cliente=cliente, servicio=servicio)
            except ServicioModel.DoesNotExist:
                pass

        self.send_registration_notifications(cliente, territorio)
        return cliente

    def send_registration_notifications(self, cliente, territorio=None):
        territorio_nombre = territorio.nombre_territorio if territorio else ''

        EmailService.send_solicitud_recibida(
            cliente_email=cliente.usuario.email,
            cliente_nombre=cliente.nombre,
            territorio=territorio_nombre,
            es_turista=cliente.es_turista,
        )

        if territorio and not cliente.es_turista:
            lider = territorio.administrador
            if lider:
                AprobacionModel.objects.create(
                    id_actor=cliente,
                    id_lider=lider,
                    estado_resultado=EstadoAprobacion.EN_REVISION,
                )
                EmailService.send_notificacion_lider(
                    lider_email=lider.usuario.email,
                    lider_nombre=lider.nombre,
                    actor_nombre=cliente.nombre,
                    territorio=territorio_nombre,
                )

    def get_solicitudes_by_lider(self, cliente):
        return AprobacionModel.objects.filter(
            id_lider=cliente
        ).select_related('id_actor__usuario', 'id_lider__usuario').prefetch_related('id_actor__tipos_actores__id_tipo')

    def get_solicitud(self, pk):
        return AprobacionModel.objects.select_related(
            'id_actor__usuario',
            'id_lider__usuario'
        ).prefetch_related('id_actor__tipos_actores__id_tipo').get(pk=pk)

    def actualizar_solicitud(self, pk, cliente, estado, observaciones):
        aprobacion = AprobacionModel.objects.get(pk=pk, id_lider=cliente)

        aprobacion.estado_resultado = estado
        if observaciones:
            aprobacion.observaciones = observaciones

        if estado == EstadoAprobacion.APROBADO:
            aprobacion.id_actor.es_actor = True
            aprobacion.id_actor.save()
            EmailService.send_solicitud_aprobada(
                cliente_email=aprobacion.id_actor.usuario.email,
                cliente_nombre=aprobacion.id_actor.nombre,
            )
            aprobacion.fecha_respuesta = timezone.now()
        elif estado == EstadoAprobacion.RECHAZADO:
            EmailService.send_solicitud_rechazada(
                cliente_email=aprobacion.id_actor.usuario.email,
                cliente_nombre=aprobacion.id_actor.nombre,
                observaciones=observaciones,
            )
            aprobacion.fecha_respuesta = timezone.now()

        aprobacion.save()
        return aprobacion

    def get_dashboard_lider(self, cliente):
        total = AprobacionModel.objects.filter(id_lider=cliente).count()
        por_estado = AprobacionModel.objects.filter(id_lider=cliente).values('estado_resultado').annotate(c=Count('id'))
        resumen = {item['estado_resultado']: item['c'] for item in por_estado}

        return {
            'total': total,
            'en_revision': resumen.get('EN_REVISION', 0),
            'aprobados': resumen.get('APROBADO', 0),
            'rechazados': resumen.get('RECHAZADO', 0),
        }

    def get_actores_by_lider(self, lider):
        aprobaciones = AprobacionModel.objects.filter(
            id_lider=lider,
            estado_resultado=EstadoAprobacion.APROBADO
        ).select_related(
            'id_actor__usuario',
            'id_actor__estado'
        ).prefetch_related(
            'id_actor__tipos_actores__id_tipo'
        )
        actores = []
        for aprobacion in aprobaciones:
            actor = aprobacion.id_actor
            tipos = [{'id': ct.id_tipo.id, 'nombre_tipo': ct.id_tipo.nombre_tipo}
                     for ct in actor.tipos_actores.all()]
            territorio = TerritorioModel.objects.filter(administrador=lider).first()
            actores.append({
                'id_cliente': actor.id_cliente,
                'nombre': actor.nombre,
                'telefono': actor.telefono,
                'email': actor.usuario.email,
                'territorio_nombre': territorio.nombre_territorio if territorio else None,
                'tipos_actores': tipos,
                'activo': actor.estado.nombre_estado == 'activo' if actor.estado else False,
            })
        return actores

    def deshabilitar_actor(self, actor_id, lider):
        try:
            actor = ClienteModel.objects.get(id_cliente=actor_id, es_actor=True)
        except ClienteModel.DoesNotExist:
            return False, 'Actor no encontrado'

        tiene_permiso = AprobacionModel.objects.filter(
            id_actor=actor,
            id_lider=lider,
            estado_resultado=EstadoAprobacion.APROBADO
        ).exists()

        if not tiene_permiso:
            return False, 'No tienes permiso para deshabilitar este actor'

        actor.estado = EstadoModel.objects.get(nombre_estado='inactivo')
        actor.save()
        return True, 'Actor deshabilitado exitosamente'

    def habilitar_actor(self, actor_id, lider):
        try:
            actor = ClienteModel.objects.get(id_cliente=actor_id, es_actor=True)
        except ClienteModel.DoesNotExist:
            return False, 'Actor no encontrado'

        tiene_permiso = AprobacionModel.objects.filter(
            id_actor=actor,
            id_lider=lider,
            estado_resultado=EstadoAprobacion.APROBADO
        ).exists()

        if not tiene_permiso:
            return False, 'No tienes permiso para habilitar este actor'

        actor.estado = EstadoModel.objects.get(nombre_estado='activo')
        actor.save()
        return True, 'Actor habilitado exitosamente'

    def crear_lider_admin(self, data):
        nombre_completo = data.get('nombre_completo')
        email = data.get('email')
        password = data.get('password')
        telefono = data.get('telefono')
        id_territorio = data.get('id_territorio')
        activo_val = data.get('activo', True)
        estado=EstadoModel.objects.get(nombre_estado='activo' if activo_val else 'inactivo')

        partes_nombre = nombre_completo.split(' ', 1)
        first_name = partes_nombre[0]
        last_name = partes_nombre[1] if len(partes_nombre) > 1 else ''

        username = email.split('@')[0]
        counter = 1
        base_username = username
        while self.repository.user_exists_by_username(username):
            username = f"{base_username}{counter}"
            counter += 1

        with transaction.atomic():
            user = self.repository.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            cliente = ClienteModel.objects.create(
                usuario=user,
                nombre=nombre_completo,
                telefono=telefono,
                es_lider=True,
                estado=estado,
            )

            territorio = None
            if id_territorio:
                try:
                    territorio = TerritorioModel.objects.get(id_territorio=id_territorio)
                    if territorio.administrador_id:
                        raise ValueError('Este territorio ya tiene un líder asignado.')
                    territorio.administrador = cliente
                    territorio.save()
                except TerritorioModel.DoesNotExist:
                    raise ValueError('Territorio no encontrado.')

        return cliente

    def get_cliente(self, pk):
        return ClienteModel.objects.get(pk=pk)

    def listar_tipos_actores(self):
        return TipoActorModel.objects.all()

    def listar_territorios(self):
        return TerritorioModel.objects.all()

    def listar_monedas(self):
        return MonedaModel.objects.all()