from django.urls import re_path
from main.consumers import Consumer

websocket_urlpatterns = [
    re_path(r"ws/editor/(?P<room_name>[0-9a-fA-F-]+)/$", Consumer.as_asgi()),  # ✅ Allows UUIDs
]
