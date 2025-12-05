from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Ye line zaroori hai taaki frontend '/api/leads/' call kar sake
    path('api/', include('app.urls')), 
]   

