from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import AccessToken


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return False
        try:
            token = auth_header.split(' ')[1]
            access = AccessToken(token)
            return access.get('es_admin', False)
        except Exception:
            return False
