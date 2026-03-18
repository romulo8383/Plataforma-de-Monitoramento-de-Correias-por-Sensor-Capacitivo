#!/usr/bin/env python
"""
Script para criar dados iniciais no banco de dados
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'belt_monitor.settings')
django.setup()

from configuration.models import Belt, Sensor, SensorCalibration

def create_initial_data():
    print("Criando dados iniciais...")
    
    # Criar correia
    belt, created = Belt.objects.get_or_create(
        id=1,
        defaults={
            'name': 'Correia Principal',
            'length_m': 100.0,
            'width_mm': 1000.0,
            'speed_m_s': 2.5,
            'encoder_pulses_per_revolution': 360,
        }
    )
    
    if created:
        print(f"OK Correia criada: {belt.name}")
    else:
        print(f"INFO Correia ja existe: {belt.name}")
    
    # Criar calibração padrão
    calibration, created = SensorCalibration.objects.get_or_create(
        id=1,
        defaults={
            'name': 'Calibracao Padrao',
            'description': 'Calibracao inicial para testes',
            'fixed_capacitor_pf': 100.0,
            'a4': 0.0,
            'a3': 0.0,
            'a2': 1.0,
            'a1': 0.5,
            'a0': 0.0,
        }
    )
    
    if created:
        print(f"OK Calibracao criada: {calibration.name}")
    else:
        print(f"INFO Calibracao ja existe: {calibration.name}")
    
    # Criar 16 sensores
    sensors_created = 0
    for i in range(1, 17):
        sensor, created = Sensor.objects.get_or_create(
            belt=belt,
            sensor_number=i,
            defaults={
                'enabled': i <= 3,  # Habilitar apenas os 3 primeiros
                'plate_size_mm': 50.0,
                'offset_longitudinal_mm': 0.0,
                'offset_lateral_mm': 100.0 * i,
                'calibration': calibration,
            }
        )
        
        if created:
            sensors_created += 1
    
    if sensors_created > 0:
        print(f"OK {sensors_created} sensores criados")
    else:
        print(f"INFO Sensores ja existem")
    
    # Resumo
    print("\nResumo:")
    print(f"   Correias: {Belt.objects.count()}")
    print(f"   Sensores: {Sensor.objects.count()}")
    print(f"   Sensores habilitados: {Sensor.objects.filter(enabled=True).count()}")
    print(f"   Calibracoes: {SensorCalibration.objects.count()}")
    print("\nOK Banco de dados pronto para testes!")

if __name__ == '__main__':
    create_initial_data()
