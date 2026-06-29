from .TiqueteModel import Tiquete

class TiqueteRepository:
    def get_all(self):
        return Tiquete.objects.all()

    def get_by_id(self, id_tiquete):
        try:
            return Tiquete.objects.get(id_tiquete=id_tiquete)
        except Tiquete.DoesNotExist:
            return None

    def get_by_cliente(self, id_cliente):
        return Tiquete.objects.filter(id_cliente=id_cliente)

    def create(self, data):
        return Tiquete.objects.create(**data)

    def update(self, id_tiquete, data):
        tiquete = self.get_by_id(id_tiquete)
        if tiquete:
            for key, value in data.items():
                setattr(tiquete, key, value)
            tiquete.save()
        return tiquete

    def delete(self, id_tiquete):
        tiquete = self.get_by_id(id_tiquete)
        if tiquete:
            tiquete.delete()
            return True
        return False
