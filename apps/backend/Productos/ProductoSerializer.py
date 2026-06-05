from rest_framework import serializers
from Productos.ProductoModel import ProductoModel

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoModel
        fields = ['id_producto', 'nombre', 'descripcion', 'precio', 'stock']