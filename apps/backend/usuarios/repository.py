from django.contrib.auth.models import User
from Clientes.ClienteModel import ClienteModel


class UsuarioRepository:
    def get_user_by_username(self, username):
        return User.objects.filter(username=username).first()

    def get_user_by_email(self, email):
        return User.objects.filter(email=email).first()

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