from .MonedaRepository import MonedaRepository

class MonedaService:
    def __init__(self):
        self.repository = MonedaRepository()

    def listar_monedas_activas(self):
        return self.repository.get_all()

    def registrar_moneda(self, data):
        #Validar que no exista ya una moneda con ese nombre
        nombre = data.get('nombre', '').strip().upper()
        if self.repository.get_by_nombre(nombre):
            raise ValueError(f"La moneda {nombre} ya está registrada.")
            
        data['nombre'] = nombre
        return self.repository.create(data)