from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Belt, Sensor, SensorCalibration, CalibrationPoint
from .serializers import BeltConfigSerializer, SensorConfigSerializer


class ConfigurationViewSet(viewsets.ViewSet):
    """
    ViewSet para ESP32 buscar configuração de sensores.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='sensors')
    def sensors(self, request):
        """
        Retorna configuração dos sensores para uma correia específica.
        
        Query parameters:
        - belt_id: ID da correia (obrigatório)
        
        Retorna:
        {
            "belt_id": 1,
            "belt_name": "Correia Principal",
            "encoder_pulses_per_revolution": 360,
            "sensors": [
                {"id": 1, "sensor_number": 1, "enabled": true, ...},
                ...
            ]
        }
        """
        belt_id = request.query_params.get('belt_id')
        
        if not belt_id:
            return Response(
                {
                    'status': 'error',
                    'message': 'belt_id parameter is required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            belt = Belt.objects.get(id=belt_id)
        except Belt.DoesNotExist:
            return Response(
                {
                    'status': 'error',
                    'message': f'Belt with id {belt_id} not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        sensors = Sensor.objects.filter(belt=belt).order_by('sensor_number')
        sensor_serializer = SensorConfigSerializer(sensors, many=True)
        
        return Response(
            {
                'status': 'success',
                'belt_id': belt.id,
                'belt_name': belt.name,
                'encoder_pulses_per_revolution': belt.encoder_pulses_per_revolution,
                'sensors': sensor_serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='belt')
    def belt(self, request):
        """
        Retorna configuração completa da correia incluindo sensores.
        
        Query parameters:
        - belt_id: ID da correia (obrigatório)
        """
        belt_id = request.query_params.get('belt_id')
        
        if not belt_id:
            return Response(
                {
                    'status': 'error',
                    'message': 'belt_id parameter is required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            belt = Belt.objects.get(id=belt_id)
        except Belt.DoesNotExist:
            return Response(
                {
                    'status': 'error',
                    'message': f'Belt with id {belt_id} not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = BeltConfigSerializer(belt)
        
        return Response(
            {
                'status': 'success',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='toggle-sensor')
    def toggle_sensor(self, request):
        """
        Habilita ou desabilita um sensor específico.
        
        Body JSON:
        {
            "sensor_id": 1,
            "enabled": true
        }
        """
        sensor_id = request.data.get('sensor_id')
        enabled = request.data.get('enabled')
        
        if sensor_id is None or enabled is None:
            return Response(
                {
                    'status': 'error',
                    'message': 'sensor_id and enabled parameters are required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            sensor.enabled = enabled
            sensor.save()
            
            return Response(
                {
                    'status': 'success',
                    'message': f'Sensor {sensor.sensor_number} {"enabled" if enabled else "disabled"}',
                    'sensor': SensorConfigSerializer(sensor).data
                },
                status=status.HTTP_200_OK
            )
        except Sensor.DoesNotExist:
            return Response(
                {
                    'status': 'error',
                    'message': f'Sensor with id {sensor_id} not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='calibrations')
    def list_calibrations(self, request):
        """Lista todas as calibrações."""
        calibrations = SensorCalibration.objects.all()
        data = []
        for cal in calibrations:
            data.append({
                'id': cal.id,
                'name': cal.name,
                'description': cal.description,
                'fixed_capacitor_pf': cal.fixed_capacitor_pf,
                'a4': cal.a4,
                'a3': cal.a3,
                'a2': cal.a2,
                'a1': cal.a1,
                'a0': cal.a0,
                'created_at': cal.created_at,
                'updated_at': cal.updated_at,
            })
        
        return Response({
            'status': 'success',
            'calibrations': data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='calibrations')
    def create_calibration(self, request):
        """Cria uma nova calibração com pontos e coeficientes."""
        name = request.data.get('name')
        description = request.data.get('description', '')
        fixed_capacitor_pf = request.data.get('fixed_capacitor_pf')
        coefficients = request.data.get('coefficients', {})
        points = request.data.get('points', [])
        
        if not name or fixed_capacitor_pf is None:
            return Response({
                'status': 'error',
                'message': 'name and fixed_capacitor_pf are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        a4 = coefficients.get('a', 0)
        a3 = coefficients.get('b', 0)
        a2 = coefficients.get('c', 0)
        a1 = coefficients.get('d', 0)
        a0 = coefficients.get('e', 0)

        max_voltage_v = float(request.data.get('max_voltage_v', 3.3))
        min_voltage_v = float(request.data.get('min_voltage_v', 0.0))

        def apply_poly(v):
            return a4*(v**4) + a3*(v**3) + a2*(v**2) + a1*v + a0

        min_capacitance_pf = apply_poly(min_voltage_v)
        max_capacitance_pf = apply_poly(max_voltage_v)

        calibration = SensorCalibration.objects.create(
            name=name,
            description=description,
            fixed_capacitor_pf=fixed_capacitor_pf,
            a4=a4, a3=a3, a2=a2, a1=a1, a0=a0,
            min_voltage_v=min_voltage_v,
            max_voltage_v=max_voltage_v,
            min_capacitance_pf=min_capacitance_pf,
            max_capacitance_pf=max_capacitance_pf,
        )
        
        for point in points:
            CalibrationPoint.objects.create(
                calibration=calibration,
                variable_capacitor_pf=point.get('varCap'),
                measured_voltage_v=point.get('voltage'),
            )
        
        Sensor.objects.all().update(calibration=calibration)
        
        return Response({
            'status': 'success',
            'message': 'Calibração criada e aplicada a todos os sensores',
            'calibration_id': calibration.id,
            'min_capacitance_pf': min_capacitance_pf,
            'max_capacitance_pf': max_capacitance_pf,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='calibrations/detail')
    def get_calibration(self, request):
        """Retorna detalhes de uma calibração específica."""
        calibration_id = request.query_params.get('id')
        try:
            calibration = SensorCalibration.objects.get(id=calibration_id)
            points = CalibrationPoint.objects.filter(calibration=calibration)
            
            return Response({
                'status': 'success',
                'calibration': {
                    'id': calibration.id,
                    'name': calibration.name,
                    'description': calibration.description,
                    'fixed_capacitor_pf': calibration.fixed_capacitor_pf,
                    'min_voltage_v': calibration.min_voltage_v,
                    'max_voltage_v': calibration.max_voltage_v,
                    'coefficients': {
                        'a4': calibration.a4,
                        'a3': calibration.a3,
                        'a2': calibration.a2,
                        'a1': calibration.a1,
                        'a0': calibration.a0,
                    },
                    'points': [{
                        'variable_capacitor_pf': p.variable_capacitor_pf,
                        'measured_voltage_v': p.measured_voltage_v,
                    } for p in points]
                }
            }, status=status.HTTP_200_OK)
        except SensorCalibration.DoesNotExist:
            return Response({
                'status': 'error',
                'message': f'Calibration with id {calibration_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
