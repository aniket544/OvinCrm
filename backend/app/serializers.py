from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Lead, Customer, Payment, Task, Tender, TechData
from .models import SalesTask 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# --- LOGIN SERIALIZER (Role Return karne ke liye) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check User Group
        user_groups = self.user.groups.values_list('name', flat=True)
        
        if 'Sales' in user_groups:
            data['role'] = 'Sales'
        elif 'Tech' in user_groups:
            data['role'] = 'Tech'
        else:
            data['role'] = 'Admin' # Default fallback
            
        return data

# 1. Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user

# 2. Lead Serializer (UPDATED WITH DATA MASKING 🔒)
class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ('owner',)

    # 👇👇👇 YE LOGIC ADD KIYA HAI 👇👇👇
    def to_representation(self, instance):
        # Pehle normal data lo
        data = super().to_representation(instance)
        
        # Request object se User nikalo
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user

            # Agar user 'Tech' group ka hai aur Admin nahi hai -> Number Mask kar do
            if user.groups.filter(name='Tech').exists() and not user.is_superuser:
                phone = data.get('contact', '')
                if phone and len(str(phone)) > 5:
                    # Shuru ke digits rakho, last ke 5 digits '*****' kar do
                    visible_part = str(phone)[:-5] 
                    data['contact'] = visible_part + '*****'
        
        return data
    # 👆👆👆 UPDATE END 👆👆👆

# 3. Customer Serializer
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ('owner',)

# 4. Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('owner',)

# 5. Task Serializer
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('owner',)

# 6. Tender Serializer
class TenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender
        fields = '__all__'
        read_only_fields = ('owner',)

# 7. Tech Data Serializer
class TechDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechData
        fields = '__all__'
        read_only_fields = ('owner',)

# 8. Sales Task Serializer
class SalesTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesTask
        fields = '__all__'
        read_only_fields = ('owner',)