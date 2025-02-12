# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import FormViewSet, SubmissionViewSet, ProjectViewSet, CustomAuthToken, RegisterUser
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'forms', FormViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'projects', ProjectViewSet, basename='project')  # Add basename argument

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('api/auth/register/', RegisterUser.as_view(), name='api_register'),
    path('api/projects/<int:pk>/create_form/', FormViewSet.as_view({'post': 'create_form'}), name='create_form'),  # Add custom route for create_form
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)