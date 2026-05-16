from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, DESIGNATION_CHOICES


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserProfile
        fields = ['designation', 'bio', 'phone', 'location', 'avatar_color']


class UserSerializer(serializers.ModelSerializer):
    profile     = UserProfileSerializer(read_only=True)
    is_admin    = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format='%Y-%m-%d', read_only=True)

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_superuser', 'is_active', 'is_admin',
            'date_joined', 'profile',
        ]
        read_only_fields = ['id', 'date_joined', 'is_admin']

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model  = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        if User.objects.filter(email=data.get('email', '')).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


DESIGNATION_GROUPED = {}
for key, label in DESIGNATION_CHOICES:
    group = label.split('(')[0].strip()
    DESIGNATION_GROUPED.setdefault(group, []).append({'value': key, 'label': label})
