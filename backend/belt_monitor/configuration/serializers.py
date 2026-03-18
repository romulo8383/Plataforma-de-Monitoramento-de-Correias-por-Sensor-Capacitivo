from rest_framework import serializers
from .models import Belt, Sensor, SensorCalibration


class SensorConfigSerializer(serializers.ModelSerializer):
    """Serializer simplificado para configuração da ESP32"""
    class Meta:
        model = Sensor
        fields = ['id', 'sensor_number', 'enabled', 'plate_size_mm', 
                  'offset_longitudinal_mm', 'offset_lateral_mm']


class BeltConfigSerializer(serializers.ModelSerializer):
    """Serializer para configuração da correia"""
    sensors = SensorConfigSerializer(many=True, read_only=True)
    
    class Meta:
        model = Belt
        fields = ['id', 'name', 'length_m', 'width_mm', 'speed_m_s', 
                  'encoder_pulses_per_revolution', 'sensors']
