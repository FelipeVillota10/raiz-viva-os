from rest_framework import serializers
from .TiqueteModel import Tiquete
from Experiencia.ExperienciaModel import ExperienciaModel


class ExperienciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienciaModel
        fields = ['id_experiencia', 'territorio', 'costo_total', 'nombre', 'descripcion']


class TiqueteSerializer(serializers.ModelSerializer):
    id_experiencia = ExperienciaSerializer(read_only=True)

    class Meta:
        model = Tiquete
        fields = '__all__'
