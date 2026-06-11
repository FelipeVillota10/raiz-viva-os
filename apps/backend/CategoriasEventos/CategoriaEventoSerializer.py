# CategoriasEventos/CategoriaEventoSerializer.py

from rest_framework import serializers
from .CategoriaEventoModel import CategoriaEventoModel



class CategoriaEventoSerializer(serializers.ModelSerializer):

    class Meta:
        model  = CategoriaEventoModel
        fields = [ 'id', 'nombre', 'descripcion']
        