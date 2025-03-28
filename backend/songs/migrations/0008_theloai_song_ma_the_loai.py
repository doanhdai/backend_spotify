# Generated by Django 4.2.20 on 2025-03-20 14:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('songs', '0007_playlist_playlistsong'),
    ]

    operations = [
        migrations.CreateModel(
            name='TheLoai',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('ten_the_loai', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='song',
            name='ma_the_loai',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='songs', to='songs.theloai'),
        ),
    ]
