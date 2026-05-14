from .EstadoRepository import EstadoRepository

class EstadoService:
    def __init__(self):
        self.repository = EstadoRepository()

    def listar_estados(self):
        return self.repository.get_all()

    def registrar_estado(self, data):
        # Normalizar el nombre (Ej: "activo" -> "ACTIVO")
        nombre = data.get('nombre_estado', '').strip().upper()
        
        if not nombre:
            raise ValueError("El nombre del estado es obligatorio.")
            
        if self.repository.get_by_nombre(nombre):
            raise ValueError(f"El estado '{nombre}' ya existe.")
            
        data['nombre_estado'] = nombre
        return self.repository.create(data)