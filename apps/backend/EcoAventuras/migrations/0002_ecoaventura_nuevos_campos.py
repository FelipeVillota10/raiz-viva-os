import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('EcoAventuras', '0001_initial'),
        ('Clientes', '__first__'),
    ]

    operations = [
        migrations.AddField(
            model_name='ecoaventuramodel',
            name='ubicacion',
            field=models.CharField(max_length=200, default='Sin especificar'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ecoaventuramodel',
            name='dificultad',
            field=models.CharField(
                max_length=10,
                choices=[('BAJA', 'Baja'), ('MEDIA', 'Media'), ('ALTA', 'Alta')],
                default='MEDIA',
            ),
        ),
        migrations.AddField(
            model_name='ecoaventuramodel',
            name='duracion',
            field=models.PositiveIntegerField(help_text='Duración en horas', default=4),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ecoaventuramodel',
            name='imagen_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='ecoaventuramodel',
            name='creado_por',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='ecoaventuras',
                to='Clientes.clientemodel',
            ),
        ),
        migrations.CreateModel(
            name='EcoAventuraItinerario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cronograma', models.TextField(blank=True, default='')),
                ('actividades', models.TextField(blank=True, default='')),
                ('transporte', models.TextField(blank=True, default='')),
                ('restricciones', models.TextField(blank=True, default='')),
                ('recomendaciones', models.TextField(blank=True, default='')),
                ('contactos', models.TextField(blank=True, default='')),
                ('notas_especiales', models.TextField(blank=True, default='')),
                ('ecoaventura', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='itinerario',
                    to='EcoAventuras.ecoaventuramodel',
                )),
            ],
            options={
                'db_table': 'eco_aventura_itinerarios',
            },
        ),
    ]
