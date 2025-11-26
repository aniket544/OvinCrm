# """
# Django settings for backend project.
# """

# from pathlib import Path
# from datetime import timedelta
# import dj_database_url
# import os

# # Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent


# # Quick-start development settings - unsuitable for production
# SECRET_KEY = 'django-insecure-5%#o^xyi5=5e3y(o6*$zil6e(bnk6ehixxhm)s#$&-q6uv+!kk'

# DEBUG = False

# ALLOWED_HOSTS = ['your-domain.com', 'your-render-url.onrender.com', '127.0.0.1']


# # Application definition

# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
    
#     # Third party apps
#     'rest_framework',            
#     'rest_framework_simplejwt',  
#     'corsheaders',               
    
#     # Local apps
#     'app',
# ]

# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# ROOT_URLCONF = 'backend.urls'

# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# WSGI_APPLICATION = 'backend.wsgi.application'


# # Database
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'crm',
#         'USER': 'root',
#         'PASSWORD': 'goku',
#         'HOST': 'localhost',
#         'PORT': '3306',
#     }
# }


# # Password validation
# AUTH_PASSWORD_VALIDATORS = [
#     { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
#     { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
#     { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
#     { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
# ]


# # Internationalization
# LANGUAGE_CODE = 'en-us'

# # --- TIMEZONE SETTINGS (Updated) ---
# TIME_ZONE = 'Asia/Kolkata'  # <--- Ab ye India ka time dikhayega
# USE_I18N = True
# USE_TZ = True  # <--- Isko False hi rakhna Windows error bachane ke liye


# # Static files (CSS, JavaScript, Images)
# STATIC_URL = 'static/'

# # Default primary key field type
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # --- DRF & JWT Config ---
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
# }

# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
# }


# STATIC_ROOT = BASE_DIR / 'staticfiles'
# STATIC_URL = '/static/'

# # --- CORS Config ---
# CORS_ALLOW_ALL_ORIGINS = False



# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173", # Dev ke liye
#     "https://your-frontend.vercel.app", # Final Frontend ka URL
# ]




"""
Django settings for backend project.
"""

from pathlib import Path
from datetime import timedelta
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# Render automatically generates a secret key if needed, but this one works too
SECRET_KEY = 'django-insecure-5%#o^xyi5=5e3y(o6*$zil6e(bnk6ehixxhm)s#$&-q6uv+!kk'

# Render production mein Debug False hona chahiye (Lekin agar error dekhna ho to True kar lena)
DEBUG = False

# Render ke liye '*' zaroori hai shuru mein
ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',            
    'rest_framework_simplejwt',  
    'corsheaders',               
    
    # Local apps
    'app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # <--- Ye naya add kiya hai (Zaroori hai)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',       # <--- Isko upar hi rehne dena
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


# --- DATABASE SETTINGS (Updated for Render) ---
# Ye automatic detect karega: Local pe SQLite chalayega, Render pe PostgreSQL
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


# --- STATIC FILES (Updated for WhiteNoise) ---


STATICFILES_DIRS = [
BASE_DIR / 'static',
]
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

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

# --- CORS Config (Open for everyone initially) ---
# Jab sab chal jaye tab isko False karke specific domain daal dena
CORS_ALLOW_ALL_ORIGINS = True