from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.static import serve
urlpatterns = [
    # --- Authentication (Login/Token) ---
    path('token/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),

    # --- Dashboard ---
    path('dashboard/stats/', DashboardStats.as_view(), name='dashboard-stats'),

    # --- Leads ---
    path('leads/', LeadListCreate.as_view(), name='lead-list'),
    path('leads/<int:pk>/', LeadDetail.as_view(), name='lead-detail'),
    path('leads/bulk-import/', LeadBulkImport.as_view(), name='lead-bulk-import'), # 🚛 Import
    path('leads/bulk-delete/', LeadBulkDelete.as_view(), name='lead-bulk-delete'), # 🧹 Delete

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
    
    # 1. Lead -> Payment (Convert)
    path('leads/<int:pk>/convert/', ConvertLeadToPayment.as_view(), name='lead-to-payment'), 
    
    # 2. Payment -> Technical Task (Go Through)
    path('payments/<int:pk>/go-thru/', CreateTaskFromPayment.as_view(), name='payment-to-task'),
    
    # 3. Lead -> Sales Task (Follow Up)
    path('leads/<int:pk>/to-sales-task/', MoveLeadToSalesTask.as_view(), name='lead-to-sales'),





    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
