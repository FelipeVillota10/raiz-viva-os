from django.db import migrations


def seed_monedas(apps, schema_editor):
    Moneda = apps.get_model('usuarios', 'Moneda')
    monedas = [
        ('Peso colombiano', 'COP'),
        ('Dólar estadounidense', 'USD'),
        ('Euro', 'EUR'),
        ('Peso mexicano', 'MXN'),
    ]
    for nombre, simbolo in monedas:
        Moneda.objects.get_or_create(nombre=nombre, defaults={'simbolo': simbolo})


def reverse_seed_monedas(apps, schema_editor):
    Moneda = apps.get_model('usuarios', 'Moneda')
    Moneda.objects.filter(
        nombre__in=[
            'Peso colombiano',
            'Dólar estadounidense',
            'Euro',
            'Peso mexicano',
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0005_alter_aprobaciones_estado_resultado'),
    ]

    operations = [
        migrations.RunPython(seed_monedas, reverse_seed_monedas),
    ]
