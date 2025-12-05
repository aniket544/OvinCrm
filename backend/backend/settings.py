"""
Django settings for backend project.
"""

from pathlib import Path
from datetime import timedelta
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Security & Debug ---
# Production me Secret Key environment variable se leni chahiye, par abhi hardcoded hai (theek hai testing ke liye)
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-5%#o^xyi5=5e3y(o6*$zil6e(bnk6ehixxhm)s#$&-q6uv+!kk')

# Debug False rakhna production ke liye
DEBUG = False 

# FIX 1: Allow any host in production (Render default)
ALLOWED_HOSTS = ['*'] 

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    # 'whitenoise.runserver_nostatic', # Optional: Dev me whitenoise check karne ke liye
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',            
    'rest_framework_simplejwt',  
    'corsheaders',               
    
    # Local apps
    'app',

    # 👇 CLOUDINARY APPS (Order matter karta hai: cloudinary_storage pehle, fir cloudinary)
    'cloudinary_storage', 
    'cloudinary',
]

MIDDLEWARE = [
    # FIX 2: Whitenoise for static files (Security ke neeche hona chahiye)
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    
    # FIX 3: CORS middleware upar hona chahiye
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database (dj-database-url handles Render connection)
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True


# --- Static files (CSS, JavaScript, Images) ---
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Whitenoise compression storage
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# --- DRF & JWT Config ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}


# --- CORS CONFIG ---
CORS_ALLOW_ALL_ORIGINS = True


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==========================================
# 👇👇 CLOUDINARY MEDIA CONFIGURATION 👇👇
# ==========================================

# 1. Cloudinary Credentials (Render Environment Variables se uthayega)
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# 2. Tell Django to use Cloudinary for MEDIA files (Images/Videos)
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# 3. Media URL (Ab ye Cloudinary ka URL ban jayega)
MEDIA_URL = '/media/' 
# Note: Cloudinary use karte waqt MEDIA_ROOT ki technical zaroorat nahi hoti production me,
# par local development ke liye rakhna safe hai.
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')