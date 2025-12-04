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

# 1. Leads
class LeadListCreate(BaseListCreateView):
    serializer_class = LeadSerializer
    model = Lead
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]
    search_fields = ['name', 'company', 'status', 'contact']

    # 👇👇👇 NEW SECURE LOGIC 👇👇👇
    def get_queryset(self):
        user = self.request.user
        
        # Agar User 'Sales' ya 'Tech' Group ka hai, tabhi SABKO SABKA data dikhega
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Lead.objects.all().order_by('-date')
        
        # Agar koi Normal User hai (Bina Group wala), toh usse SALES ka data NAHI dikhega
        # Wo sirf apna data dekh payega (Jo ki empty hoga)
        return Lead.objects.filter(owner=user).order_by('-date')

class LeadDetail(BaseDetailView):
    serializer_class = LeadSerializer
    model = Lead
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]
    
    # Detail view me bhi same logic (Security ke liye)
    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Lead.objects.all()
        return Lead.objects.filter(owner=user)


# 2. Customers
class CustomerListCreate(BaseListCreateView):
    serializer_class = CustomerSerializer
    model = Customer
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]
    search_fields = ['name', 'company', 'email']

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Customer.objects.all().order_by('-date')
        return Customer.objects.filter(owner=user).order_by('-date')

class CustomerDetail(BaseDetailView):
    serializer_class = CustomerSerializer
    model = Customer
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Customer.objects.all()
        return Customer.objects.filter(owner=user)


# 3. Payments
class PaymentListCreate(BaseListCreateView):
    serializer_class = PaymentSerializer
    model = Payment
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]
    search_fields = ['company', 'invoice', 'so_no']

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Payment.objects.all().order_by('-id')
        return Payment.objects.filter(owner=user).order_by('-id')

class PaymentDetail(BaseDetailView):
    serializer_class = PaymentSerializer
    model = Payment
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return Payment.objects.all()
        return Payment.objects.filter(owner=user)


# 4. Sales Tasks
class SalesTaskListCreate(BaseListCreateView):
    serializer_class = SalesTaskSerializer
    model = SalesTask
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]
    search_fields = ['lead_name', 'company', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name__in=['Sales', 'Tech']).exists() or user.is_superuser:
            return SalesTask.objects.all().order_by('-date')
        return SalesTask.objects.filter(owner=user).order_by('-date')

class SalesTaskDetail(BaseDetailView):
    serializer_class = SalesTaskSerializer
    model = SalesTask
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]

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
        # Sirf Tech Team ya Admin SAB kuch dekh sakta hai
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return Task.objects.all().order_by('-date')
        
        # Sales wala ya Normal User sirf APNA banaya hua task dekh payega
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

# 7. Tech Data
class TechDataListCreate(BaseListCreateView):
    serializer_class = TechDataSerializer
    model = TechData
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]
    search_fields = ['company', 'machine', 'serial']

    def get_queryset(self):
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return TechData.objects.all().order_by('-id')
        return TechData.objects.filter(owner=self.request.user)

class TechDataDetail(BaseDetailView):
    serializer_class = TechDataSerializer
    model = TechData
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.groups.filter(name='Tech').exists() or self.request.user.is_superuser:
            return TechData.objects.all()
        return TechData.objects.filter(owner=self.request.user)
# ==========================================
#       CUSTOM LOGIC (Magic 🪄)
# ==========================================

# 1. Convert Lead -> Payment
class ConvertLeadToPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk) # Shared access
            data = request.data
            
            if lead.status == 'Converted':
                return Response({"message": "Already Converted!"}, status=status.HTTP_400_BAD_REQUEST)

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
            )
            return Response({"message": "Deal finalized!"}, status=status.HTTP_200_OK)

        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             return Response({"error": f"Database error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


# 2. Go Through: Payment -> Task
class CreateTaskFromPayment(APIView):
    permission_classes = [permissions.IsAuthenticated] 

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk) # Shared access
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
            lead = Lead.objects.get(pk=pk) # Shared access
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
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]

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
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]

    def post(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({"error": "No IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count, _ = Lead.objects.filter(id__in=ids).delete()
        return Response({"message": f"Deleted {deleted_count} leads!"}, status=status.HTTP_200_OK)