from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Clientes', '0004_remove_clientemodel_activo'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clientemodel',
            name='activo',
        ),
    ]
