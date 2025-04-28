from django.db import models
from users.models import User
from django.utils import timezone

class Conversation(models.Model):
    TYPE_CHOICES = (
        ('private', 'PrivateChat'),
        ('group', 'GroupChat'),
    )
    
    name = models.CharField(max_length=255, blank=True, null=True)  # For GroupChat
    type_conversation = models.CharField(max_length=20, choices=TYPE_CHOICES, default='private')
    participants = models.ManyToManyField(User, related_name='conversations')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_conversations', null=True, blank=True)  # For GroupChat
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_message = models.TextField(blank=True, null=True)
    last_message_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if self.type_conversation == 'group' and self.name:
            return self.name
        return f"Conversation {self.id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'