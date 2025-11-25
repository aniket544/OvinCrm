from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Lead, Customer, Payment, Task, Tender, TechData
from .models import SalesTask # <-- Import me add karna mat bhoolna


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

# 2. Lead Serializer
class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ('owner',)

# 3. Customer Serializer (This was missing or not imported)
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



class SalesTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesTask
        fields = '__all__'
        read_only_fields = ('owner',)
        