from django.contrib import admin
from .models import Role, ActorTerritorial, ActorRol, SolicitudRegistro


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'icono', 'es_turista')
    list_filter = ('es_turista',)
    search_fields = ('nombre',)


class ActorRolInline(admin.TabularInline):
    model = ActorRol
    extra = 1


@admin.register(ActorTerritorial)
class ActorTerritorialAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'sector', 'moneda', 'telefono', 'fecha_registro')
    list_filter = ('sector', 'moneda', 'fecha_registro')
    search_fields = ('usuario__username', 'usuario__email', 'usuario__first_name', 'telefono')
    inlines = [ActorRolInline]


@admin.register(SolicitudRegistro)
class SolicitudRegistroAdmin(admin.ModelAdmin):
    list_display = ('id', 'actor', 'estado', 'fecha_solicitud', 'fecha_respuesta')
    list_filter = ('estado', 'fecha_solicitud')
    search_fields = ('actor__usuario__username', 'actor__usuario__email')
    readonly_fields = ('fecha_solicitud',)
    actions = ['aprobar_solicitudes', 'rechazar_solicitudes']

    @admin.action(description='Aprobar solicitudes seleccionadas')
    def aprobar_solicitudes(self, request, queryset):
        from django.utils import timezone
        queryset.update(estado='aprobado', fecha_respuesta=timezone.now())

    @admin.action(description='Rechazar solicitudes seleccionadas')
    def rechazar_solicitudes(self, request, queryset):
        from django.utils import timezone
        queryset.update(estado='rechazado', fecha_respuesta=timezone.now())