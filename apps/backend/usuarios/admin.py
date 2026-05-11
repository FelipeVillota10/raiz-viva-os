from django.contrib import admin
from .models import Moneda, Territorio, TiposActores, Cliente, ClienteTiposActores, Aprobaciones


@admin.register(Moneda)
class MonedaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'simbolo')
    search_fields = ('nombre',)


@admin.register(Territorio)
class TerritorioAdmin(admin.ModelAdmin):
    list_display = ('nombre_territorio', 'region')
    list_filter = ('region',)
    search_fields = ('nombre_territorio', 'region')


class ClienteTiposActoresInline(admin.TabularInline):
    model = ClienteTiposActores
    extra = 1


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'es_actor', 'es_lider', 'es_turista', 'id_territorio', 'telefono')
    list_filter = ('es_actor', 'es_lider', 'es_turista', 'id_territorio')
    search_fields = ('id_usuario__username', 'id_usuario__email', 'id_usuario__first_name')
    inlines = [ClienteTiposActoresInline]


@admin.register(TiposActores)
class TiposActoresAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_tipo')
    search_fields = ('nombre_tipo',)


@admin.register(Aprobaciones)
class AprobacionesAdmin(admin.ModelAdmin):
    list_display = ('id', 'id_actor', 'id_lider', 'estado_resultado', 'fecha_solicitud', 'fecha_respuesta')
    list_filter = ('estado_resultado', 'fecha_solicitud')
    search_fields = ('id_actor__id_usuario__username', 'id_actor__id_usuario__email', 'id_lider__id_usuario__username')
    readonly_fields = ('fecha_solicitud',)
    actions = ['aprobar_solicitudes', 'rechazar_solicitudes']

    @admin.action(description='Aprobar solicitudes seleccionadas')
    def aprobar_solicitudes(self, request, queryset):
        from django.utils import timezone
        queryset.update(estado_resultado='APROBADO', fecha_respuesta=timezone.now())

    @admin.action(description='Rechazar solicitudes seleccionadas')
    def rechazar_solicitudes(self, request, queryset):
        from django.utils import timezone
        queryset.update(estado_resultado='RECHAZADO', fecha_respuesta=timezone.now())