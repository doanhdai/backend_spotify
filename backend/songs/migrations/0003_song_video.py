# Generated by Django 4.2.20 on 2025-04-07 06:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='video',
            field=models.FileField(blank=True, null=True, upload_to='songs/video/'),
        ),
    ]
