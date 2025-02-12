from pathlib import Path
import os 
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-9lofqr(d75^41v9anijlk6#3j4iu!^0gq@=cb12%5^_(f52^@1"

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost", "code-collaborator-git-main-maniacayus-projects.vercel.app", "codecollaborator.onrender.com"]

# WebSocket CORS Settings
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "https://code-collaborator-git-main-maniacayus-projects.vercel.app"]
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "https://code-collaborator-git-main-maniacayus-projects.vercel.app"]
CORS_ALLOW_CREDENTIALS = True

INSTALLED_APPS = [
    "corsheaders",
    "channels",
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "main",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ✅ Must be at the top
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "server.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "server.wsgi.application"
ASGI_APPLICATION = "server.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",  # ✅ Fixing missing channel layer
    },
}


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"



DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
