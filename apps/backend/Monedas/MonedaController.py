from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .MonedaService import MonedaService
from .MonedaSerializer import MonedaSerializer

class MonedaController(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = MonedaService()

