import os
import sys
import django

# --- YE NAYA CODE HAI (Path Fix karne ke liye) ---
# Current folder ko system path mein jod rahe hain taaki 'backend' mil jaye
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Settings module set karna
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
email = 'admin@example.com'
password = 'admin123'

try:
    if not User.objects.filter(username=username).exists():
        print("Creating superuser...")
        User.objects.create_superuser(username, email, password)
        print("✅ Superuser created successfully!")
    else:
        print("⚠️ Superuser already exists.")
except Exception as e:
    print(f"❌ Error: {e}")