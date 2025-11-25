from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import *
from .models import *
from datetime import date   

# --- Registration View ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


# --- Base Views (For filtering data by Owner) ---
class BaseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.model.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class BaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.model.objects.filter(owner=self.request.user)


# ==========================================
#       STANDARD CRUD VIEWS (Tables)
# ==========================================

# 1. Leads
class LeadListCreate(BaseListCreateView):
    serializer_class = LeadSerializer
    model = Lead
class LeadDetail(BaseDetailView):
    serializer_class = LeadSerializer
    model = Lead

# 2. Customers
class CustomerListCreate(BaseListCreateView):
    serializer_class = CustomerSerializer
    model = Customer
class CustomerDetail(BaseDetailView):
    serializer_class = CustomerSerializer
    model = Customer

# 3. Payments
class PaymentListCreate(BaseListCreateView):
    serializer_class = PaymentSerializer
    model = Payment
class PaymentDetail(BaseDetailView):
    serializer_class = PaymentSerializer
    model = Payment

# 4. Tasks
class TaskListCreate(BaseListCreateView):
    serializer_class = TaskSerializer
    model = Task
class TaskDetail(BaseDetailView):
    serializer_class = TaskSerializer
    model = Task

# 5. Tenders
class TenderListCreate(BaseListCreateView):
    serializer_class = TenderSerializer
    model = Tender
class TenderDetail(BaseDetailView):
    serializer_class = TenderSerializer
    model = Tender

# 6. Tech Data
class TechDataListCreate(BaseListCreateView):
    serializer_class = TechDataSerializer
    model = TechData
class TechDataDetail(BaseDetailView):
    serializer_class = TechDataSerializer
    model = TechData


# ==========================================
#       CUSTOM LOGIC (Magic 🪄)
# ==========================================

# 1. Convert Lead -> Payment (Jab Lead Manager me Convert daboge)
class ConvertLeadToPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            # Lead dhoondo
            lead = Lead.objects.get(pk=pk, owner=request.user)
            
            if lead.status == 'Converted':
                return Response({"message": "Already Converted!"}, status=status.HTTP_400_BAD_REQUEST)

            # Status update karo
            lead.status = 'Converted'
            lead.save()

            # AB PAYMENT ME ENTRY BANAO (Task me nahi)
            Payment.objects.create(
                owner=request.user,
                company=lead.company,
                so_no="Pending", 
                amount=0,
                advance=0,
                remaining=0,
                invoice="Pending",
                remark=f"Converted from Lead: {lead.name} (Contact: {lead.contact})"
            )

            return Response({"message": "Moved to Payment Status!"}, status=status.HTTP_200_OK)

        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)



# 2. Go Thru: Payment -> Task (UPDATED FOR NEW FIELDS)
# 2. Go Through: Payment -> Task (UPDATED)
class CreateTaskFromPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk, owner=request.user)
            data = request.data 
            
            # Task Name format karo
            task_title = data.get('task_name', 'Auto Created Task')
            
            # Task Manager me entry banao with SPECIFIC FIELDS
            Task.objects.create(
                owner=request.user,
                
                # --- FIX: Date field ab model ka 'default=date.today' use karega ---
                # date=None hata diya hai
                
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
            # Ye generic error handling hai
            return Response({"error": "Task creation failed: Database conflict."}, status=status.HTTP_400_BAD_REQUEST)
# 1. Ye nayi View class add karo (Table dikhane ke liye)
class SalesTaskListCreate(BaseListCreateView):
    serializer_class = SalesTaskSerializer
    model = SalesTask
class SalesTaskDetail(BaseDetailView):
    serializer_class = SalesTaskSerializer
    model = SalesTask

## backend/app/views.py (Conversion Logic)

class ConvertLeadToPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk, owner=request.user)
            data = request.data # Frontend se aayi hui payment details
            
            if lead.status == 'Converted':
                return Response({"message": "Already Converted!"}, status=status.HTTP_400_BAD_REQUEST)

            # Lead Status Update
            lead.status = 'Converted'
            lead.save()

            # --- PAYMENT RECORD CREATION (Uses data from Frontend Modal) ---
            Payment.objects.create(
                owner=request.user,
                company=lead.company,
                so_no=data.get('so_no', 'N/A'),
                amount=data.get('amount', 0),
                advance=data.get('advance', 0),
                remaining=data.get('remaining', 0), # Frontend se calculated value
                invoice=data.get('invoice', 'Pending'),
                remark=data.get('remark', f"Converted from Lead: {lead.name}"),
            )

            return Response({"message": "Deal finalized and Payment record created!"}, status=status.HTTP_200_OK)

        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             return Response({"error": f"Database error during creation: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # ... purane views ...

# 3. Lead -> Sales Task (Follow Up ke liye) - NEW
class MoveLeadToSalesTask(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            lead = Lead.objects.get(pk=pk, owner=request.user)
            
            # Sales Task me entry banao
            SalesTask.objects.create(
                owner=request.user,
                date=date.today(),
                lead_name=lead.name,
                company=lead.company,
                contact=lead.contact,
                task_type="Call", # Default starting task
                status="Pending",
                remarks=f"Moved from Leads. Purpose: {lead.purpose}"
            )
            
            # Lead ka status update karo taaki pata chale uspe kaam chal raha hai
            lead.status = 'Interested' 
            lead.save()

            return Response({"message": "Added to Sales Task Manager!"}, status=status.HTTP_200_OK)

        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)






