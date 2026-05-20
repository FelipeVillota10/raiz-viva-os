from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from Clientes.ClienteModel import ClienteModel
from TiposActores.TipoActorModel import TipoActorModel
from TiposActores.ClienteTiposActoresModel import ClienteTiposActoresModel
from Territorio.TerritorioModel import TerritorioModel
from Monedas.MonedaModel import MonedaModel
from Aprobaciones.AprobacionModel import AprobacionModel, EstadoAprobacion
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
            return None, 'No active account found with the given credentials'

        if not user_obj.check_password(password):
            return None, 'No active account found with the given credentials'

        if not user_obj.is_active:
            return None, 'No active account found with the given credentials'

        cliente = self.repository.get_cliente_by_user(user_obj)
        if cliente:
            if not cliente.es_actor and not cliente.es_turista and not cliente.es_lider:
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

        cliente = ClienteModel.objects.create(
            usuario=user,
            nombre=nombre_completo,
            telefono=telefono,
            estado=territorio.estado if territorio else None,
            tipo_moneda=tipo_moneda,
            es_actor=es_actor,
            es_lider=es_lider,
            es_turista=es_turista,
        )

        for tipo_id in tipos_actores:
            tipo = TipoActorModel.objects.get(id=tipo_id)
            ClienteTiposActoresModel.objects.create(id_actor=cliente, id_tipo=tipo)

        return cliente

    def send_registration_notifications(self, cliente):
        territorio_nombre = cliente.estado.nombre_estado if cliente.estado else None

        EmailService.send_solicitud_recibida(
            cliente_email=cliente.usuario.email,
            cliente_nombre=cliente.nombre,
            territorio=territorio_nombre,
            es_turista=cliente.es_turista,
        )

        if cliente.estado and not cliente.es_turista:
            lider = ClienteModel.objects.filter(
                estado=cliente.estado,
                es_lider=True
            ).first()

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
                    territorio=territorio_nombre or '',
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

    def get_cliente(self, pk):
        return ClienteModel.objects.get(pk=pk)

    def listar_tipos_actores(self):
        return TipoActorModel.objects.all()

    def listar_territorios(self):
        return TerritorioModel.objects.all()

    def listar_monedass(self):
        return MonedaModel.objects.all()