from django.contrib.auth.models import User
from Clientes.ClienteModel import ClienteModel


class UsuarioRepository:
    #se trae de la base de datos al usuario mediante filter
    #por el metodo filter al orm.
    def get_user_by_username(self, username):
        return User.objects.filter(username=username).first()
    #se traer el usuario por el email, nuevamente filter que nos ofrece el orm que tienen django
    def get_user_by_email(self, email):
        return User.objects.filter(email=email).first()
    #creamos el usuario con create_user que viene en el modelo User de django
    #y este mismo hashea las contraseñas que se le entregue mediante el metodo create_user propio de User
    def create_user(self, username, email, password, first_name, last_name):
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

    def user_exists_by_email(self, email):
        return User.objects.filter(email=email).exists()

    def user_exists_by_username(self, username):
        return User.objects.filter(username=username).exists()

    def get_cliente_by_user(self, user):
        return ClienteModel.objects.filter(usuario=user).first()