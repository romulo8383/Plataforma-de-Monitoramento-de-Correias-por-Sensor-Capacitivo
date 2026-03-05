from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import DataIngestionViewSet

router = DefaultRouter()
router.register(r'', DataIngestionViewSet, basename='data-ingestion')

urlpatterns = [
    path('', include(router.urls)),
]
