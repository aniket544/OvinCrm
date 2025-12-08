from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import *
from .models import *
from datetime import date   
from .permissions import IsSalesTeamOrReadOnly, IsTechTeamOrReadOnly
from .serializers import CustomTokenObtainPairSerializer 
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum, Count, Q
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets

# ==========================================
#       PAGINATION CLASS (🚀 Fast Loading)
# ==========================================
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20  # Ek baar mein sirf 20 leads aayengi
    page_size_query_param = 'page_size'
    max_page_size = 100

# ==========================================
#       AUTHENTICATION
# ==========================================
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

# ==========================================
#       BASE VIEWS
# ==========================================
class BaseListCreateView(generics.ListCreateAPIView):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    def get_queryset(self):
        return self.model.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class BaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        return self.model.objects.all()


# ==========================================
#       SALES TEAM VIEWS (Secured Shared Access)
# ==========================================

# 1. Leads (🟢 UPDATED FOR SHARING)
class LeadListCreate(BaseListCreateView):
    serializer_class = LeadSerializer
    model = Lead
    # 👇👇 Security slightly relaxed so Sales team can see all leads
    permission_classes = [permissions.IsAuthenticated] 
    search_fields = ['name', 'company', 'status', 'contact']
    pagination_class = StandardResultsSetPagination 

    def get_queryset(self):
        user = self.request.user
        
        # --- 1. Permission Logic (Shared Access) ---
        # 👇👇 CHANGE: Removed 'filter(owner=user)', showing ALL leads to Sales/Tech/Admin
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            queryset = Lead.objects.all().order_by('-id')
        else:
            # Fallback for users not in groups (though ideally everyone is in a group)
            queryset = Lead.objects.filter(owner=user).order_by('-id')

        # --- 2. Filter Logic (React se aayi hui request) ---
        status_param = self.request.query_params.get('status', None)
        date_after = self.request.query_params.get('date_after', None)

        if status_param and status_param != '':
            queryset = queryset.filter(status=status_param)

        if date_after and date_after != '':
            queryset = queryset.filter(date__date__gte=date_after)

        return queryset

class LeadDetail(BaseDetailView):
    serializer_class = LeadSerializer
    model = Lead
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Allow viewing details of any lead
        return Lead.objects.all()


# 2. Customers (🟢 UPDATED FOR SHARING)
class CustomerListCreate(BaseListCreateView):
    serializer_class = CustomerSerializer
    model = Customer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'company', 'email']

    def get_queryset(self):
        user = self.request.user
        # 👇👇 CHANGE: Sales team sees ALL customers now
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Customer.objects.all().order_by('-date')
        return Customer.objects.filter(owner=user).order_by('-date')

class CustomerDetail(BaseDetailView):
    serializer_class = CustomerSerializer
    model = Customer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Customer.objects.all()


# 3. Payments (🟢 UPDATED FOR SHARING)
class PaymentListCreate(BaseListCreateView):
    serializer_class = PaymentSerializer
    model = Payment
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['company', 'invoice', 'so_no']

    def get_queryset(self):
        user = self.request.user
        # 👇👇 CHANGE: Rupesh can now see Ajay's payments
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Payment.objects.all().order_by('-id')
        return Payment.objects.filter(owner=user).order_by('-id')

class PaymentDetail(BaseDetailView):
    serializer_class = PaymentSerializer
    model = Payment
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.all()


# 4. Sales Tasks
class SalesTaskListCreate(BaseListCreateView):
    serializer_class = SalesTaskSerializer
    model = SalesTask
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['lead_name', 'company', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return SalesTask.objects.all().order_by('-date')
        return SalesTask.objects.filter(owner=user).order_by('-date')

class SalesTaskDetail(BaseDetailView):
    serializer_class = SalesTaskSerializer
    model = SalesTask
    permission_classes = [permissions.IsAuthenticated] # Keep simple for now

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return SalesTask.objects.all()
        return SalesTask.objects.filter(owner=user)

# ==========================================
#       TECH TEAM VIEWS (Strictly Private)
# ==========================================

# 5. Tasks (Technical)
class TaskListCreate(BaseListCreateView):
    serializer_class = TaskSerializer
    model = Task
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]
    search_fields = ['task_name', 'company_name', 'status', 'priority']

    def get_queryset(self):
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return Task.objects.all().order_by('-date')
        return Task.objects.filter(owner=self.request.user)

class TaskDetail(BaseDetailView):
    serializer_class = TaskSerializer
    model = Task
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]

    def get_queryset(self):
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return Task.objects.all()
        return Task.objects.filter(owner=self.request.user)

# 6. Tenders
class TenderListCreate(BaseListCreateView):
    serializer_class = TenderSerializer
    model = Tender
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]
    search_fields = ['company', 'bid_no', 'status']

    def get_queryset(self):
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return Tender.objects.all().order_by('-date')
        return Tender.objects.filter(owner=self.request.user)

class TenderDetail(BaseDetailView):
    serializer_class = TenderSerializer
    model = Tender
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return Tender.objects.all()
        return Tender.objects.filter(owner=self.request.user)

# 7. Tech Data (Strictly Tech Only)
class TechDataListCreate(BaseListCreateView):
    serializer_class = TechDataSerializer
    model = TechData
    # Tech team or Admin only can edit, others view only logic handled in FE/Permissions
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]
    search_fields = ['company', 'machine', 'serial']

    def get_queryset(self):
        # Admin aur Tech walo ko sab dikhega
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return TechData.objects.all().order_by('-id')
        
        # Sales walo ko bhi dikhega (Read Only via permission)
        return TechData.objects.all().order_by('-id')

class TechDataDetail(BaseDetailView):
    serializer_class = TechDataSerializer
    model = TechData
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]
    
    def get_queryset(self):
        return TechData.objects.all()

# ==========================================
#       CUSTOM LOGIC (Magic 🪄)
# ==========================================

# 1. Convert Lead -> Payment
class ConvertLeadToPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk)
            data = request.data
            
            if lead.status == 'Converted':
                pass 

            lead.status = 'Converted'
            lead.save()

            Payment.objects.create(
                owner=request.user,
                company=lead.company,
                so_no=data.get('so_no', 'N/A'),
                amount=data.get('amount', 0),
                advance=data.get('advance', 0),
                remaining=data.get('remaining', 0),
                invoice=data.get('invoice', 'Pending'),
                remark=data.get('remark', f"Converted from Lead: {lead.name}"),
                receipt=data.get('receipt') 
            )

            return Response({"message": "Deal finalized & Receipt Saved!"}, status=status.HTTP_200_OK)

        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             print("Error saving payment:", str(e)) 
             return Response({"error": f"Database error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# 2. Go Through: Payment -> Task
class CreateTaskFromPayment(APIView):
    permission_classes = [permissions.IsAuthenticated] 

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk) 
            data = request.data 
            
            Task.objects.create(
                owner=request.user,
                company_name=payment.company,
                client_name=data.get('client_name', ''),
                client_id=data.get('client_id', ''),
                gem_id=data.get('gem_id', ''),
                gem_password=data.get('gem_password', ''),
                task_name=data.get('task_name', 'Auto Created Task'),
                priority=data.get('priority', 'Medium'), 
                status="Pending"
            )
            return Response({"message": "Sent to Task Manager!"}, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Task creation failed."}, status=status.HTTP_400_BAD_REQUEST)


# 3. Lead -> Sales Task
class MoveLeadToSalesTask(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk) 
            data = request.data
            
            SalesTask.objects.create(
                owner=request.user,
                date=date.today(),
                lead_name=lead.name,
                company=lead.company,
                contact=lead.contact,
                task_type="Call", 
                next_follow_up=data.get('next_follow_up'),
                priority=data.get('priority', 'Medium'),
                remarks=data.get('remarks', f"Moved from Leads. Purpose: {lead.purpose}"),
                status="Pending"
            )
            
            lead.status = 'Interested' 
            lead.save()
            return Response({"message": "Added to Sales Task Manager!"}, status=status.HTTP_200_OK)

        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
#       BULK OPERATIONS
# ==========================================

# 4. Bulk Import
class LeadBulkImport(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not isinstance(request.data, list):
            return Response({"error": "Data must be a list"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = LeadSerializer(data=request.data, many=True, context={'request': request})
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response({"message": f"Imported {len(request.data)} leads!"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 5. Bulk Delete
class LeadBulkDelete(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({"error": "No IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count, _ = Lead.objects.filter(id__in=ids).delete()
        return Response({"message": f"Deleted {deleted_count} leads!"}, status=status.HTTP_200_OK)
    

class DashboardStats(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {}
        today = date.today()

        # --- 1. CHECK ROLE ---
        is_sales = user.groups.filter(name='Sales').exists()
        is_tech = user.groups.filter(name='Tech').exists()
        is_manager = user.is_superuser

        # --- 2. GATHER DATA BASED ON ROLE ---
        
        # 🟢 SALES DATA (Sales & Manager ke liye)
        if is_sales or is_manager:
            # Leads Info
            leads_qs = Lead.objects.all() if is_manager else Lead.objects.all() # Shared Access Logic: SAB DIKHEGA
            
            data['total_leads'] = leads_qs.count()
            data['new_leads'] = leads_qs.filter(status='New').count()
            data['interested_leads'] = leads_qs.filter(status='Interested').count()
            data['converted_leads'] = leads_qs.filter(status='Converted').count()
            
            # Todays Follow Ups
            data['todays_calls'] = SalesTask.objects.filter(next_follow_up=today).count()

            # --- 💰 REVENUE LOGIC ---
            # Payment ab shared hai, sabko total dikhega
            payment_qs = Payment.objects.all() 

            revenue = payment_qs.aggregate(Sum('amount'))['amount__sum'] or 0
            data['total_revenue'] = revenue

            # --- 🏆 LEADERBOARD (Kisne Kitna Kiya - Only for Manager/Admin View) ---
            if is_manager:
                leaderboard = Payment.objects.values('owner__username').annotate(total_amount=Sum('amount')).order_by('-total_amount')
                data['leaderboard'] = leaderboard
            
            # --- 🕒 RECENT TRANSACTIONS (Last 5 payments) ---
            recent_payments = payment_qs.order_by('-date', '-id')[:5]
            data['recent_payments'] = [
                {
                    'company': p.company,
                    'amount': p.amount,
                    'date': p.date,
                    'by': p.owner.username
                } for p in recent_payments
            ]

        # 🔴 TECH DATA (Tech & Manager ke liye)
        if is_tech or is_manager:
            tasks_qs = Task.objects.all() # Tech tasks usually shared
            data['pending_tasks'] = tasks_qs.filter(status='Pending').count()
            data['high_priority_tasks'] = tasks_qs.filter(priority='High', status='Pending').count()
            data['service_due'] = TechData.objects.filter(service_due__gte=today).count()
            data['active_tenders'] = Tender.objects.exclude(status__in=['Won', 'Lost']).count()

        # Role identify karke bhejo
        if is_manager: data['role_view'] = 'Manager'
        elif is_tech: data['role_view'] = 'Tech'
        else: data['role_view'] = 'Sales'

        return Response(data)