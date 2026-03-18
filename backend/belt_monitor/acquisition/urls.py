from django.urls import path
from .views import DataIngestionViewSet

# Manual URL patterns without router to avoid DRF converter conflict
urlpatterns = [
    path('ingest/', DataIngestionViewSet.as_view({'post': 'ingest'}), name='data-ingestion-ingest'),
    path('latest-reading/', DataIngestionViewSet.as_view({'get': 'latest_reading'}), name='data-ingestion-latest-reading'),
    path('sensor-readings/', DataIngestionViewSet.as_view({'get': 'sensor_readings'}), name='data-ingestion-sensor-readings'),
    path('batch-ingest/', DataIngestionViewSet.as_view({'post': 'batch_ingest'}), name='data-ingestion-batch-ingest'),
]
