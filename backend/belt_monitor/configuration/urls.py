from django.urls import path
from .views import ConfigurationViewSet

# Manual URL patterns without router to avoid DRF converter conflict
urlpatterns = [
    path('sensors/', ConfigurationViewSet.as_view({'get': 'sensors'}), name='configuration-sensors'),
    path('belt/', ConfigurationViewSet.as_view({'get': 'belt'}), name='configuration-belt'),
    path('toggle-sensor/', ConfigurationViewSet.as_view({'post': 'toggle_sensor'}), name='configuration-toggle-sensor'),
    path('calibrations/', ConfigurationViewSet.as_view({'get': 'list_calibrations', 'post': 'create_calibration'}), name='configuration-calibrations'),
    path('calibrations/detail/', ConfigurationViewSet.as_view({'get': 'get_calibration'}), name='configuration-calibration-detail'),
]
