from django.db import models
from django.contrib.auth.models import User
from datetime import date  # <--- Ye zaroori hai default date ke liye

# 1. Lead Manager Model
class Lead(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(null=True, blank=True) 
    sno = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=200)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True, null=True) 
    note = models.TextField(blank=True)
    purpose = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=50, default="New")

    def __str__(self):
        return self.company

# 2. Customer Manager Model
class Customer(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)
    sno = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=200)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    purpose = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=50, default="Active")
    remarks = models.TextField(blank=True)

# 3. Payment Status Model
class Payment(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.CharField(max_length=200)
    so_no = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    advance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    remaining = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    invoice = models.CharField(max_length=100, blank=True)
    remark = models.TextField(blank=True)
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)

# 4. Task Manager Model (System/Admin Tasks)
class Task(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=date.today) 
    
    company_name = models.CharField(max_length=200, blank=True)
    client_name = models.CharField(max_length=200, blank=True)
    client_id = models.CharField(max_length=100, blank=True)
    gem_id = models.CharField(max_length=100, blank=True)
    gem_password = models.CharField(max_length=100, blank=True)
    
    task_name = models.TextField(blank=True) 
    priority = models.CharField(max_length=50, default="Medium")
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default="Pending")

# 5. Tender Submission Model
class Tender(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)
    company = models.CharField(max_length=200)
    bid_no = models.CharField(max_length=100)
    item = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default="Draft")

# 6. Tech Data Model
class TechData(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.CharField(max_length=200)
    machine = models.CharField(max_length=200, blank=True)
    serial = models.CharField(max_length=100, blank=True)
    warranty = models.DateField(null=True, blank=True)
    service_due = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default="Active")

# 7. Sales Task Model (Follow Ups)
class SalesTask(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)
    lead_name = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    contact = models.CharField(max_length=50, blank=True)
    task_type = models.CharField(max_length=100, default="Follow Up")
    next_follow_up = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default="Pending")
    remarks = models.TextField(blank=True)
    follow_up_count = models.IntegerField(default=0)
    
    # Priority Choices
    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')

    def __str__(self):
        return f"{self.lead_name} - {self.task_type}"