from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # --- Authentication (Login/Token) ---
    path('token/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),

    # --- Leads ---
    path('leads/', LeadListCreate.as_view(), name='lead-list'),
    path('leads/<int:pk>/', LeadDetail.as_view(), name='lead-detail'),
    
    # 👇👇👇 NEW BULK IMPORT URL (Ye line add ki hai) 👇👇👇
    path('leads/bulk-import/', LeadBulkImport.as_view(), name='lead-bulk-import'),
    # 👆👆👆
    # ... Bulk Import ke niche ...
    path('leads/bulk-delete/', LeadBulkDelete.as_view(), name='lead-bulk-delete'),

    # --- Customers ---
    path('customers/', CustomerListCreate.as_view(), name='customer-list'),
    path('customers/<int:pk>/', CustomerDetail.as_view(), name='customer-detail'),

    # --- Payments ---
    path('payments/', PaymentListCreate.as_view(), name='payment-list'),
    path('payments/<int:pk>/', PaymentDetail.as_view(), name='payment-detail'),

    # --- Tasks (Technical) ---
    path('tasks/', TaskListCreate.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetail.as_view(), name='task-detail'),

    # --- Tenders ---
    path('tenders/', TenderListCreate.as_view(), name='tender-list'),
    path('tenders/<int:pk>/', TenderDetail.as_view(), name='tender-detail'),

    # --- Tech Data ---
    path('tech-data/', TechDataListCreate.as_view(), name='tech-data-list'),
    path('tech-data/<int:pk>/', TechDataDetail.as_view(), name='tech-data-detail'),

    # --- Sales Tasks (Follow Ups) ---
    path('sales-tasks/', SalesTaskListCreate.as_view(), name='sales-task-list'),
    path('sales-tasks/<int:pk>/', SalesTaskDetail.as_view(), name='sales-task-detail'),

    # ==========================================
    #       CUSTOM LOGIC (Magic 🪄)
    # ==========================================
    
    # 1. Lead se Payment create karna (Convert)
    path('leads/<int:pk>/convert/', ConvertLeadToPayment.as_view(), name='lead-to-payment'), 
    
    # 2. Payment se Technical Task create karna (Go Through)
    path('payments/<int:pk>/go-thru/', CreateTaskFromPayment.as_view(), name='payment-to-task'),
    
    # 3. Lead se Sales Task (Follow Up) create karna
    path('leads/<int:pk>/to-sales-task/', MoveLeadToSalesTask.as_view(), name='lead-to-sales'),
]