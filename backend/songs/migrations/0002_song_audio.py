# Generated by Django 4.2.20 on 2025-03-15 14:55

import cloudinary.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='audio',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='audio'),
        ),
    ]
