from django.db import models
from users.models import User

# Create your models here.

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message = models.TextField(null=True, blank=True)  # Tin nhắn cuối cùng
    last_message_time = models.DateTimeField(null=True, blank=True)  # Thời gian tin nhắn cuối

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        participants = self.participants.all()
        return f"Conversation between {', '.join(p.username for p in participants)}"

    def get_other_participant(self, user):
        """Lấy người tham gia khác trong cuộc hội thoại"""
        return self.participants.exclude(id=user.id).first()

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_by = models.ManyToManyField(User, related_name='read_messages', blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.sender.username} to {self.receiver.username}: {self.content[:50]}'

    def mark_as_read(self, user):
        """Đánh dấu tin nhắn đã đọc bởi user"""
        if not self.is_read and user != self.sender:
            self.read_by.add(user)
            self.is_read = True
            self.save()
