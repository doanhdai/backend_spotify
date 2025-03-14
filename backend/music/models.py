from django.db import models


class Artist(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Song(models.Model):
    title = models.CharField(max_length=200)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    duration = models.IntegerField(help_text="Thời lượng (giây)")
    file_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title