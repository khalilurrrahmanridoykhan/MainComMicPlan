# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import FormViewSet, SubmissionViewSet, ProjectViewSet, LanguageViewSet, CustomAuthToken, RegisterUser
from django.conf import settings
from django.conf.urls.static import static
from api.views import update_translations  # Import the update_translations view

router = DefaultRouter()
router.register(r'forms', FormViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'projects', ProjectViewSet, basename='project')  # Add basename argument
router.register(r'languages', LanguageViewSet)  # Register the LanguageViewSet

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('api/auth/register/', RegisterUser.as_view(), name='api_register'),
    path('api/projects/<int:pk>/create_form/', FormViewSet.as_view({'post': 'create_form'}), name='create_form'),  # Add custom route for create_form
    path('api/forms/<int:form_id>/translations/', update_translations, name='update_translations'),  # Add the new route for updating translations
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)