from django.contrib.auth.models import User
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, DESIGNATION_CHOICES
from .serializers import UserSerializer, RegisterSerializer, UserProfileSerializer


# ── Register ──────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    queryset         = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access':  str(refresh.access_token),
            'user':    UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


# ── Login ─────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    from django.contrib.auth import authenticate
    user = authenticate(username=username, password=password)
    if not user:
        # Try login by email
        try:
            u = User.objects.get(email=username)
            user = authenticate(username=u.username, password=password)
        except User.DoesNotExist:
            pass
    if not user:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({'detail': 'Account is deactivated.'}, status=status.HTTP_403_FORBIDDEN)
    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
        'user':    UserSerializer(user).data,
    })


# ── Me ────────────────────────────────────────────────────────────
@api_view(['GET'])
def me_view(request):
    return Response(UserSerializer(request.user).data)


# ── Update Profile ────────────────────────────────────────────────
@api_view(['PATCH'])
def update_profile_view(request):
    user = request.user
    # Update base user fields
    user_fields = ['first_name', 'last_name', 'email']
    for field in user_fields:
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()

    # Update profile fields
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile_data = {k: v for k, v in request.data.items() if k not in user_fields}
    serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(UserSerializer(user).data)


# ── Change Password ───────────────────────────────────────────────
@api_view(['POST'])
def change_password_view(request):
    user = request.user
    old_pw = request.data.get('old_password', '')
    new_pw = request.data.get('new_password', '')
    if not user.check_password(old_pw):
        return Response({'detail': 'Current password is incorrect.'}, status=400)
    if len(new_pw) < 6:
        return Response({'detail': 'Password must be at least 6 characters.'}, status=400)
    user.set_password(new_pw)
    user.save()
    return Response({'detail': 'Password changed successfully.'})


# ── Admin: List All Users ─────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_users_list(request):
    users = User.objects.all().select_related('profile').order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# ── Admin: Update User Role / Status ─────────────────────────────
@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def admin_update_user(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=404)

    if user == request.user:
        return Response({'detail': 'You cannot modify your own account here.'}, status=400)

    if 'is_staff' in request.data:
        user.is_staff = bool(request.data['is_staff'])
    if 'is_active' in request.data:
        user.is_active = bool(request.data['is_active'])
    user.save()
    return Response(UserSerializer(user).data)


# ── Admin: Create User ──────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_create_user(request):
    data = request.data
    try:
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'detail': 'Username already exists.'}, status=400)
        if User.objects.filter(email=data.get('email')).exists() and data.get('email'):
            return Response({'detail': 'Email already exists.'}, status=400)

        user = User.objects.create_user(
            username=data.get('username'),
            email=data.get('email', ''),
            password=data.get('password'),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            is_staff=bool(data.get('is_staff', False))
        )
        
        # Profile is auto-created by signal, so we just update it
        profile = user.profile
        if data.get('designation'):
            profile.designation = data.get('designation')
            profile.save()

        return Response(UserSerializer(user).data, status=201)
    except Exception as e:
        return Response({'detail': str(e)}, status=400)


# ── Designations List ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def designations_view(request):
    return Response([{'value': k, 'label': v} for k, v in DESIGNATION_CHOICES])
