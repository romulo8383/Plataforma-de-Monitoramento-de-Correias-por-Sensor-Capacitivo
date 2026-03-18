from rest_framework import serializers

from configuration.models import Sensor
from .models import EncoderReading, SensorReading


class SensorReadingInputSerializer(serializers.Serializer):
    """
    Serializer for sensor data received from hardware devices.
    Handles validation of sensor_id and voltage measurements.
    """
    sensor_id = serializers.IntegerField(
        help_text="ID of the sensor (1-16)"
    )
    voltage = serializers.FloatField(
        help_text="Measured voltage from the sensor in volts"
    )

    def validate_sensor_id(self, value):
        """Validate that the sensor_id exists in the database."""
        if not Sensor.objects.filter(sensor_number=value).exists():
            raise serializers.ValidationError(
                f"Sensor with number {value} does not exist."
            )
        return value

    def validate_voltage(self, value):
        """Validate that voltage is within reasonable range."""
        if value < 0:
            raise serializers.ValidationError(
                "Voltage cannot be negative."
            )
        if value > 5:
            raise serializers.ValidationError(
                "Voltage exceeds typical range (0-5V)."
            )
        return value


class EncoderReadingSerializer(serializers.Serializer):
    """
    Serializer for batch data ingestion from hardware devices.
    Handles encoder count and multiple sensor readings.
    """
    belt_id = serializers.IntegerField(
        help_text="ID of the conveyor belt"
    )
    encoder_count = serializers.IntegerField(
        help_text="Raw encoder pulse counter value"
    )
    sensors = SensorReadingInputSerializer(
        many=True,
        help_text="List of sensor readings (up to 16)"
    )

    def validate_sensors(self, value):
        """Validate that sensor list is not empty and not too large."""
        if not value:
            raise serializers.ValidationError(
                "At least one sensor reading is required."
            )
        if len(value) > 16:
            raise serializers.ValidationError(
                "Maximum 16 sensors allowed per request."
            )
        return value

    def validate_encoder_count(self, value):
        """Validate that encoder count is non-negative."""
        if value < 0:
            raise serializers.ValidationError(
                "Encoder count cannot be negative."
            )
        return value

    def create(self, validated_data):
        """
        Create EncoderReading and associated SensorReading instances.
        
        Returns:
            dict: Status and details of created objects
        """
        from configuration.models import Belt
        
        belt_id = validated_data.get('belt_id')
        encoder_count = validated_data.get('encoder_count')
        sensors_data = validated_data.get('sensors', [])

        try:
            belt = Belt.objects.get(id=belt_id)
        except Belt.DoesNotExist:
            raise serializers.ValidationError(
                f"Belt with ID {belt_id} does not exist."
            )

        # Calculate belt position
        belt_position_mm = (encoder_count % belt.encoder_pulses_per_revolution) / \
                          belt.encoder_pulses_per_revolution * belt.length_m * 1000

        # Create EncoderReading
        encoder_reading = EncoderReading.objects.create(
            belt=belt,
            encoder_count=encoder_count,
            belt_position_mm=belt_position_mm
        )

        # Create SensorReadings
        sensor_readings = []
        for sensor_data in sensors_data:
            sensor = Sensor.objects.get(sensor_number=sensor_data['sensor_id'])
            sensor_reading = SensorReading.objects.create(
                sensor=sensor,
                encoder_reading=encoder_reading,
                voltage_v=sensor_data['voltage']
            )
            sensor_readings.append(sensor_reading)

        return {
            'encoder_reading_id': encoder_reading.id,
            'belt_position_mm': encoder_reading.belt_position_mm,
            'sensor_readings_count': len(sensor_readings)
        }


class EncoderReadingDetailSerializer(serializers.ModelSerializer):
    """Serializer for retrieving EncoderReading details."""
    belt_name = serializers.CharField(source='belt.name', read_only=True)

    class Meta:
        model = EncoderReading
        fields = ('id', 'belt', 'belt_name', 'encoder_count', 'belt_position_mm', 'timestamp')
        read_only_fields = ('id', 'timestamp')


class SensorReadingDetailSerializer(serializers.ModelSerializer):
    """Serializer for retrieving SensorReading details."""
    sensor_number = serializers.IntegerField(source='sensor.sensor_number', read_only=True)
    encoder_reading_position = serializers.FloatField(
        source='encoder_reading.belt_position_mm',
        read_only=True
    )

    class Meta:
        model = SensorReading
        fields = (
            'id',
            'sensor',
            'sensor_number',
            'encoder_reading',
            'encoder_reading_position',
            'voltage_v',
            'capacitance_pf',
            'timestamp'
        )
        read_only_fields = ('id', 'timestamp')
