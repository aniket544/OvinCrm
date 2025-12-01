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

# --- 1. Custom Login View (Role bhejne ke liye) ---
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# --- 2. Registration View ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

# --- 3. Base Views (Common Logic) ---
class BaseListCreateView(generics.ListCreateAPIView):
    # Search aur Ordering enable kar rahe hain
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    def get_queryset(self):
        # Admin sabka data dekh sakta hai, User sirf apna (ya group logic handle karega permissions.py)
        if self.request.user.is_superuser:
            return self.model.objects.all()
        return self.model.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class BaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        if self.request.user.is_superuser:
            return self.model.objects.all()
        return self.model.objects.filter(owner=self.request.user)


# ==========================================
#       SALES TEAM VIEWS (Sales Edit, Tech Read-Only)
# ==========================================

# 1. Leads
class LeadListCreate(BaseListCreateView):
    serializer_class = LeadSerializer
    model = Lead
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly] # <--- SECURITY ADDED
    search_fields = ['name', 'company', 'status', 'contact']

class LeadDetail(BaseDetailView):
    serializer_class = LeadSerializer
    model = Lead
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly] # <--- SECURITY ADDED

# 2. Customers
class CustomerListCreate(BaseListCreateView):
    serializer_class = CustomerSerializer
    model = Customer
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly] # <--- SECURITY ADDED
    search_fields = ['name', 'company', 'email']

class CustomerDetail(BaseDetailView):
    serializer_class = CustomerSerializer
    model = Customer
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]

# 3. Payments
class PaymentListCreate(BaseListCreateView):
    serializer_class = PaymentSerializer
    model = Payment
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly] # <--- SECURITY ADDED
    search_fields = ['company', 'invoice', 'so_no']

class PaymentDetail(BaseDetailView):
    serializer_class = PaymentSerializer
    model = Payment
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]

# 4. Sales Tasks (Follow Ups)
class SalesTaskListCreate(BaseListCreateView):
    serializer_class = SalesTaskSerializer
    model = SalesTask
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly] # <--- SECURITY ADDED
    search_fields = ['lead_name', 'company', 'status']

class SalesTaskDetail(BaseDetailView):
    serializer_class = SalesTaskSerializer
    model = SalesTask
    permission_classes = [permissions.IsAuthenticated, IsSalesTeamOrReadOnly]


# ==========================================
#       TECH TEAM VIEWS (Tech Edit, Sales Read-Only)
# ==========================================

# 5. Tasks (Technical)
class TaskListCreate(BaseListCreateView):
    serializer_class = TaskSerializer
    model = Task
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly] # <--- SECURITY ADDED
    search_fields = ['task_name', 'company_name', 'status', 'priority']

class TaskDetail(BaseDetailView):
    serializer_class = TaskSerializer
    model = Task
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]

# 6. Tenders
class TenderListCreate(BaseListCreateView):
    serializer_class = TenderSerializer
    model = Tender
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly] # <--- SECURITY ADDED
    search_fields = ['company', 'bid_no', 'status']

class TenderDetail(BaseDetailView):
    serializer_class = TenderSerializer
    model = Tender
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]

# 7. Tech Data
class TechDataListCreate(BaseListCreateView):
    serializer_class = TechDataSerializer
    model = TechData
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly] # <--- SECURITY ADDED
    search_fields = ['company', 'machine', 'serial']

class TechDataDetail(BaseDetailView):
    serializer_class = TechDataSerializer
    model = TechData
    permission_classes = [permissions.IsAuthenticated, IsTechTeamOrReadOnly]


# ==========================================
#       CUSTOM LOGIC (Magic 🪄)
# ==========================================

# 1. Convert Lead -> Payment
class ConvertLeadToPayment(APIView):
    permission_classes = [permissions.IsAuthenticated] # Ispe restriction nahi lagayi taki process smooth rahe

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk, owner=request.user)
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

            return Response({"message": "Deal finalized and Payment record created!"}, status=status.HTTP_200_OK)

        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             return Response({"error": f"Database error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


# 2. Go Through: Payment -> Task (System Task)
class CreateTaskFromPayment(APIView):
    permission_classes = [permissions.IsAuthenticated] # Ye Sales wale use karenge Tech ko task bhejne ke liye

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk, owner=request.user)
            data = request.data 
            
            task_title = data.get('task_name', 'Auto Created Task')
            
            Task.objects.create(
                owner=request.user,
                company_name=payment.company,
                client_name=data.get('client_name', ''),
                client_id=data.get('client_id', ''),
                gem_id=data.get('gem_id', ''),
                gem_password=data.get('gem_password', ''),
                task_name=task_title,
                priority=data.get('priority', 'Medium'), 
                status="Pending"
            )

            return Response({"message": "Sent to Task Manager!"}, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({"error": "Payment record not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Task creation failed."}, status=status.HTTP_400_BAD_REQUEST)


# 3. Lead -> Sales Task (Follow Up)
class MoveLeadToSalesTask(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk, owner=request.user)
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