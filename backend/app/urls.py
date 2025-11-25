from django.urls import path
from .views import *
# Ye import zaroori hai Login ke liye
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # --- Authentication (Login/Token) ---
    # Ye missing tha isliye 404 aa raha tha
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),

    # --- Leads ---
    path('leads/', LeadListCreate.as_view(), name='lead-list'),
    path('leads/<int:pk>/', LeadDetail.as_view(), name='lead-detail'),

    # --- Customers ---
    path('customers/', CustomerListCreate.as_view(), name='customer-list'),
    path('customers/<int:pk>/', CustomerDetail.as_view(), name='customer-detail'),

    # --- Payments ---
    path('payments/', PaymentListCreate.as_view(), name='payment-list'),
    path('payments/<int:pk>/', PaymentDetail.as_view(), name='payment-detail'),

    # --- Tasks ---
    path('tasks/', TaskListCreate.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetail.as_view(), name='task-detail'),

    # --- Tenders ---
    path('tenders/', TenderListCreate.as_view(), name='tender-list'),
    path('tenders/<int:pk>/', TenderDetail.as_view(), name='tender-detail'),

    # --- Tech Data ---
    path('tech-data/', TechDataListCreate.as_view(), name='tech-data-list'),
    path('tech-data/<int:pk>/', TechDataDetail.as_view(), name='tech-data-detail'),

    # path('leads/<int:pk>/convert/', ConvertLeadToTask.as_view(), name='convert-lead'),
    # backend/app/urls.py

    # --- CUSTOM LOGIC (Magic 🪄) ---
    path('leads/<int:pk>/convert/', ConvertLeadToPayment.as_view(), name='lead-to-payment'), 
    path('payments/<int:pk>/go-thru/', CreateTaskFromPayment.as_view(), name='payment-to-task'),

    # --- Sales Tasks ---
    path('sales-tasks/', SalesTaskListCreate.as_view(), name='sales-task-list'),
    path('sales-tasks/<int:pk>/', SalesTaskDetail.as_view(), name='sales-task-detail'),


    path('leads/<int:pk>/convert/', ConvertLeadToPayment.as_view(), name='lead-to-payment'), 
    path('payments/<int:pk>/go-thru/', CreateTaskFromPayment.as_view(), name='payment-to-task'),
    
    # --- NEW URL ---
    path('leads/<int:pk>/to-sales-task/', MoveLeadToSalesTask.as_view(), name='lead-to-sales'),
]