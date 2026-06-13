from django.db import models
from EcoAventuras.EcoAventuraModel import EcoAventuraModel


class Paquete(models.Model):
    session_key = models.CharField(max_length=100)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "paquete"

    def __str__(self):
        return f"Paquete sesión {self.session_key}"

    def calcular_total(self):
        return sum(item.subtotal() for item in self.items.all())


class PaqueteItem(models.Model):
    paquete = models.ForeignKey(Paquete, on_delete=models.CASCADE, related_name="items")
    ecoaventura = models.ForeignKey(EcoAventuraModel, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    fecha_reserva = models.DateField(null=True, blank=True)
    num_personas = models.PositiveIntegerField(default=1)
    agregado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "paquete_item"
        unique_together = ("paquete", "ecoaventura", "fecha_reserva")

    def __str__(self):
        return f"{self.ecoaventura.nombre} x{self.num_personas}"

    def subtotal(self):
        precio = self.ecoaventura.precio or 0
        return precio * self.num_personas


# --- NUEVO MODELO PARA HU14.A2 ---
class ReglasConfig(models.Model):
    """Almacena las restricciones globales configuradas por el Admin"""
    min_personas = models.PositiveIntegerField(default=1)
    max_personas = models.PositiveIntegerField(default=20)
    max_actividades = models.PositiveIntegerField(default=6)
    # Guardamos las fechas bloqueadas como una lista en formato JSON ['YYYY-MM-DD', ...]
    fechas_bloqueadas = models.JSONField(default=list, blank=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reglas_config"

    def __str__(self):
        return f"Reglas operativas (Última actualización: {self.actualizado_en})"