from django.urls import re_path
from main.consumers import QuizConsumer

websocket_urlpatterns = [
    re_path(r"ws/quiz/(?P<room_name>[0-9a-fA-F-]+)/$", QuizConsumer.as_asgi()),  # ✅ Allows UUIDs
]
