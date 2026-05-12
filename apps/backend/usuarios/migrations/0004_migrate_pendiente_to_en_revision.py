from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('usuarios', '0003_seed_tipos_actores'),
    ]

    operations = [
        migrations.RunSQL(
            sql="UPDATE aprobaciones SET estado_resultado = 'EN_REVISION' WHERE estado_resultado = 'PENDIENTE';",
            reverse_sql="UPDATE aprobaciones SET estado_resultado = 'PENDIENTE' WHERE estado_resultado = 'EN_REVISION';",
        ),
    ]
