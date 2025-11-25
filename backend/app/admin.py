from django.contrib import admin
from .models import Lead, Customer, Payment, Task, Tender, TechData

# Models ko Admin Panel me register kar rahe hain

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'company', 'name', 'status')
    search_fields = ('company', 'name', 'email')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'company', 'name', 'status')
    search_fields = ('company', 'name')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'amount', 'remaining', 'invoice')
    search_fields = ('company', 'invoice')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    # Assigned_to hata diya, Priority rakha hai
    list_display = ('id', 'date', 'company_name', 'client_name', 'task_name', 'priority', 'status')
    search_fields = ('company_name', 'client_name', 'gem_id')
    list_filter = ('status', 'priority', 'date') # Filter bhi add kar diya
@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):
    list_display = ('id', 'bid_no', 'company', 'status', 'end_date')
    list_filter = ('status',)

@admin.register(TechData)
class TechDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'machine', 'serial', 'status')
    search_fields = ('company', 'serial')