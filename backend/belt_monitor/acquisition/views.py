from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import EncoderReading, SensorReading
from .serializers import (
    EncoderReadingSerializer,
    EncoderReadingDetailSerializer,
    SensorReadingDetailSerializer
)


class DataIngestionViewSet(viewsets.ViewSet):
    """
    ViewSet for hardware device data ingestion.
    
    Handles batch sensor and encoder data from IoT devices (ESP32, Raspberry Pi, etc.)
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='ingest')
    def ingest(self, request):
        """
        Ingest sensor and encoder data from hardware devices.
        
        Expected JSON format:
        {
            "belt_id": 1,
            "encoder_count": 182344,
            "sensors": [
                {"sensor_id": 1, "voltage": 2.31},
                {"sensor_id": 2, "voltage": 2.45},
                ...
            ]
        }
        
        Returns:
            - 201 Created: Successfully ingested data
            - 400 Bad Request: Invalid data format or validation errors
        """
        serializer = EncoderReadingSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                result = serializer.save()
                return Response(
                    {
                        'status': 'success',
                        'message': 'Data ingested successfully',
                        'data': {
                            'encoder_reading_id': result['encoder_reading_id'],
                            'belt_position_mm': result['belt_position_mm'],
                            'sensor_readings_count': result['sensor_readings_count']
                        }
                    },
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {
                        'status': 'error',
                        'message': str(e)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(
            {
                'status': 'error',
                'message': 'Validation failed',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'], url_path='latest-reading')
    def latest_reading(self, request):
        """
        Retrieve the most recent encoder reading.
        
        Optional query parameter:
        - belt_id: Filter by specific belt
        """
        belt_id = request.query_params.get('belt_id')
        
        queryset = EncoderReading.objects.all()
        if belt_id:
            queryset = queryset.filter(belt_id=belt_id)
        
        latest = queryset.first()
        
        if not latest:
            return Response(
                {
                    'status': 'error',
                    'message': 'No encoder readings found'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = EncoderReadingDetailSerializer(latest)
        return Response(
            {
                'status': 'success',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='sensor-readings')
    def sensor_readings(self, request):
        """
        Retrieve sensor readings with filtering options.
        
        Query parameters:
        - sensor_id: Filter by specific sensor
        - limit: Number of records to return (default: 100)
        """
        sensor_id = request.query_params.get('sensor_id')
        limit = request.query_params.get('limit', 100)
        
        try:
            limit = int(limit)
        except ValueError:
            return Response(
                {
                    'status': 'error',
                    'message': 'limit parameter must be an integer'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = SensorReading.objects.all()
        if sensor_id:
            queryset = queryset.filter(sensor_id=sensor_id)
        
        queryset = queryset[:limit]
        serializer = SensorReadingDetailSerializer(queryset, many=True)
        
        return Response(
            {
                'status': 'success',
                'count': len(serializer.data),
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='batch-ingest')
    def batch_ingest(self, request):
        """
        Ingest multiple batches of data in a single request.
        
        Expected JSON format:
        {
            "batches": [
                {
                    "belt_id": 1,
                    "encoder_count": 182344,
                    "sensors": [...]
                },
                ...
            ]
        }
        
        Returns:
            - 201 Created: All batches ingested successfully
            - 207 Multi-Status: Some batches succeeded, some failed
        """
        batches = request.data.get('batches', [])
        
        if not batches:
            return Response(
                {
                    'status': 'error',
                    'message': 'No batches provided'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        for idx, batch_data in enumerate(batches):
            serializer = EncoderReadingSerializer(data=batch_data)
            
            if serializer.is_valid():
                try:
                    result = serializer.save()
                    results.append({
                        'batch_index': idx,
                        'status': 'success',
                        'data': result
                    })
                except Exception as e:
                    results.append({
                        'batch_index': idx,
                        'status': 'error',
                        'message': str(e)
                    })
            else:
                results.append({
                    'batch_index': idx,
                    'status': 'error',
                    'errors': serializer.errors
                })
        
        # Determine overall status
        failed_count = sum(1 for r in results if r['status'] == 'error')
        if failed_count == 0:
            overall_status = status.HTTP_201_CREATED
        elif failed_count == len(results):
            overall_status = status.HTTP_400_BAD_REQUEST
        else:
            overall_status = status.HTTP_207_MULTI_STATUS
        
        return Response(
            {
                'status': 'batch_complete',
                'total': len(results),
                'successful': len(results) - failed_count,
                'failed': failed_count,
                'results': results
            },
            status=overall_status
        )

