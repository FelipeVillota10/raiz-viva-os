from .GrowthRepository import GrowthRepository

class GrowthService:
    def __init__(self):
        self.repo = GrowthRepository()

    def get_dashboard_metrics(self):
        return {
            'usuarios_activos':        self.repo.get_usuarios_activos(),
            'actores_activos':         self.repo.get_actores_activos(),
            'eventos_realizados':      self.repo.get_eventos_realizados(),
            'ventas_totales':          self.repo.get_ventas_totales(),
            'ventas_actores_locales':  self.repo.get_ventas_actores_locales(),
            'ventas_por_territorio':   self.repo.get_ventas_por_territorio(),
        }