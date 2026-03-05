"""
Tests for the Acquisition API endpoints.

These tests can be run with:
    python manage.py test acquisition
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from configuration.models import Belt, Sensor, SensorCalibration
from acquisition.models import EncoderReading, SensorReading


class DataIngestionAPITests(TestCase):
    """Test suite for the data ingestion API endpoints."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()

        # Create a test belt
        self.belt = Belt.objects.create(
            name="Test Belt",
            length_m=1.12,
            width_mm=500,
            speed_m_s=1.5,
            encoder_pulses_per_revolution=1000
        )

        # Create test sensors
        self.sensors = []
        for i in range(1, 4):
            sensor = Sensor.objects.create(
                belt=self.belt,
                sensor_number=i,
                enabled=True,
                plate_size_mm=65,
                offset_longitudinal_mm=0,
                offset_lateral_mm=(i - 1) * 70
            )
            self.sensors.append(sensor)

    def test_ingest_single_batch(self):
        """Test successful ingestion of a single batch."""
        data = {
            'belt_id': self.belt.id,
            'encoder_count': 182344,
            'sensors': [
                {'sensor_id': self.sensors[0].id, 'voltage': 2.31},
                {'sensor_id': self.sensors[1].id, 'voltage': 2.45},
            ]
        }

        response = self.client.post(
            '/api/acquisition/ingest/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['sensor_readings_count'], 2)

        # Verify database entries
        encoder_reading = EncoderReading.objects.get(
            id=response.data['data']['encoder_reading_id']
        )
        self.assertEqual(encoder_reading.encoder_count, 182344)
        self.assertEqual(encoder_reading.sensor_readings.count(), 2)

    def test_ingest_missing_belt(self):
        """Test ingestion fails when belt_id does not exist."""
        data = {
            'belt_id': 999,
            'encoder_count': 182344,
            'sensors': [
                {'sensor_id': self.sensors[0].id, 'voltage': 2.31},
            ]
        }

        response = self.client.post(
            '/api/acquisition/ingest/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')

    def test_ingest_invalid_sensor_id(self):
        """Test ingestion fails when sensor_id does not exist."""
        data = {
            'belt_id': self.belt.id,
            'encoder_count': 182344,
            'sensors': [
                {'sensor_id': 999, 'voltage': 2.31},
            ]
        }

        response = self.client.post(
            '/api/acquisition/ingest/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ingest_voltage_out_of_range(self):
        """Test ingestion fails when voltage is out of range."""
        data = {
            'belt_id': self.belt.id,
            'encoder_count': 182344,
            'sensors': [
                {'sensor_id': self.sensors[0].id, 'voltage': 6.0},  # > 5V
            ]
        }

        response = self.client.post(
            '/api/acquisition/ingest/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ingest_empty_sensors_list(self):
        """Test ingestion fails with empty sensors list."""
        data = {
            'belt_id': self.belt.id,
            'encoder_count': 182344,
            'sensors': []
        }

        response = self.client.post(
            '/api/acquisition/ingest/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ingest_too_many_sensors(self):
        """Test ingestion fails when more than 16 sensors."""
        data = {
            'belt_id': self.belt.id,
            'encoder_count': 182344,
            'sensors': [
                {'sensor_id': self.sensors[0].id, 'voltage': 2.31}
                for _ in range(17)
            ]
        }

        response = self.client.post(
            '/api/acquisition/ingest/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_latest_reading(self):
        """Test retrieving the latest encoder reading."""
        # Create an encoder reading
        encoder_reading = EncoderReading.objects.create(
            belt=self.belt,
            encoder_count=182344,
            belt_position_mm=523.45
        )

        response = self.client.get('/api/acquisition/latest-reading/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['id'], encoder_reading.id)

    def test_latest_reading_filter_by_belt(self):
        """Test retrieving latest reading filtered by belt."""
        encoder_reading = EncoderReading.objects.create(
            belt=self.belt,
            encoder_count=182344,
            belt_position_mm=523.45
        )

        response = self.client.get(
            f'/api/acquisition/latest-reading/?belt_id={self.belt.id}'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['id'], encoder_reading.id)

    def test_sensor_readings_list(self):
        """Test retrieving sensor readings."""
        encoder_reading = EncoderReading.objects.create(
            belt=self.belt,
            encoder_count=182344,
            belt_position_mm=523.45
        )

        SensorReading.objects.create(
            sensor=self.sensors[0],
            encoder_reading=encoder_reading,
            voltage_v=2.31
        )

        response = self.client.get('/api/acquisition/sensor-readings/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['count'], 1)

    def test_sensor_readings_filter_by_sensor(self):
        """Test filtering sensor readings by sensor_id."""
        encoder_reading = EncoderReading.objects.create(
            belt=self.belt,
            encoder_count=182344,
            belt_position_mm=523.45
        )

        SensorReading.objects.create(
            sensor=self.sensors[0],
            encoder_reading=encoder_reading,
            voltage_v=2.31
        )

        response = self.client.get(
            f'/api/acquisition/sensor-readings/?sensor_id={self.sensors[0].id}'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_batch_ingest(self):
        """Test batch ingestion of multiple datasets."""
        data = {
            'batches': [
                {
                    'belt_id': self.belt.id,
                    'encoder_count': 182344,
                    'sensors': [
                        {'sensor_id': self.sensors[0].id, 'voltage': 2.31},
                    ]
                },
                {
                    'belt_id': self.belt.id,
                    'encoder_count': 182354,
                    'sensors': [
                        {'sensor_id': self.sensors[1].id, 'voltage': 2.45},
                    ]
                }
            ]
        }

        response = self.client.post(
            '/api/acquisition/batch-ingest/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['successful'], 2)
        self.assertEqual(response.data['failed'], 0)
