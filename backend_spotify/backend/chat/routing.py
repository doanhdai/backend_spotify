from django.urls import re_path
from . import consumers
from .auth import JWTAuthMiddleware

websocket_urlpatterns = [
    re_path(r'ws/chat/$', JWTAuthMiddleware(consumers.ChatConsumer.as_asgi())),
] 