from django.db import migrations


def seed_tipos_actores(apps, schema_editor):
    TiposActores = apps.get_model('usuarios', 'TiposActores')
    tipos_data = [
        'productor',
        'caminante',
        'custodio',
        'facilitador',
        'anfitrion',
        'turista',
    ]
    for nombre in tipos_data:
        TiposActores.objects.get_or_create(nombre_tipo=nombre)


def reverse_tipos_actores(apps, schema_editor):
    TiposActores = apps.get_model('usuarios', 'TiposActores')
    TiposActores.objects.filter(
        nombre_tipo__in=['productor', 'caminante', 'custodio', 'facilitador', 'anfitrion', 'turista']
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0002_cliente_nombre_completo_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_tipos_actores, reverse_tipos_actores),
    ]
