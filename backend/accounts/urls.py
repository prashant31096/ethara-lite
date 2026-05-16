from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('register/',        views.RegisterView.as_view(),   name='register'),
    path('login/',           views.login_view,               name='login'),
    path('token/refresh/',   TokenRefreshView.as_view(),     name='token_refresh'),

    # Me
    path('me/',              views.me_view,                  name='me'),
    path('me/update/',       views.update_profile_view,      name='update_profile'),
    path('me/password/',     views.change_password_view,     name='change_password'),

    # Admin
    path('users/',           views.admin_users_list,         name='admin_users'),
    path('users/create/',    views.admin_create_user,        name='admin_create_user'),
    path('users/<int:user_id>/update/', views.admin_update_user, name='admin_update_user'),

    # Misc
    path('designations/',    views.designations_view,        name='designations'),
]
