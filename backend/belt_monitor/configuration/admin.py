from django.contrib import admin

from .models import Belt, SensorCalibration, CalibrationPoint, Sensor


@admin.register(Belt)
class BeltAdmin(admin.ModelAdmin):
    list_display = ('name', 'length_m', 'width_mm', 'speed_m_s', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Belt Information', {
            'fields': ('name', 'length_m', 'width_mm', 'speed_m_s')
        }),
        ('Encoder Configuration', {
            'fields': ('encoder_pulses_per_revolution',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class CalibrationPointInline(admin.TabularInline):
    """Inline admin for calibration points within sensor calibration."""
    model = CalibrationPoint
    extra = 1
    fields = ('variable_capacitor_pf', 'measured_voltage_v')
    ordering = ('variable_capacitor_pf',)


@admin.register(SensorCalibration)
class SensorCalibrationAdmin(admin.ModelAdmin):
    list_display = ('name', 'fixed_capacitor_pf', 'calibration_points_count', 'is_calibrated', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at', 'calibration_points_count', 'is_calibrated')
    inlines = [CalibrationPointInline]
    fieldsets = (
        ('Calibration Information', {
            'fields': ('name', 'description', 'fixed_capacitor_pf')
        }),
        ('Polynomial Coefficients', {
            'fields': ('a4', 'a3', 'a2', 'a1', 'a0'),
            'classes': ('collapse',),
            'description': 'Coefficients for the 4th degree polynomial: C = a4*V^4 + a3*V^3 + a2*V^2 + a1*V + a0'
        }),
        ('Calibration Status', {
            'fields': ('calibration_points_count', 'is_calibrated'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CalibrationPoint)
class CalibrationPointAdmin(admin.ModelAdmin):
    list_display = ('calibration', 'variable_capacitor_pf', 'measured_voltage_v')
    search_fields = ('calibration__name',)
    list_filter = ('calibration',)
    readonly_fields = ('calibration',)
    fieldsets = (
        ('Calibration Reference', {
            'fields': ('calibration',)
        }),
        ('Measurement Data', {
            'fields': ('variable_capacitor_pf', 'measured_voltage_v')
        }),
    )


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('sensor_number', 'belt', 'enabled', 'plate_size_mm', 'offset_longitudinal_mm', 'offset_lateral_mm', 'calibration')
    search_fields = ('sensor_number',)
    list_filter = ('enabled', 'belt')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Sensor Identification', {
            'fields': ('belt', 'sensor_number', 'enabled')
        }),
        ('Physical Configuration', {
            'fields': ('plate_size_mm', 'offset_longitudinal_mm', 'offset_lateral_mm')
        }),
        ('Calibration', {
            'fields': ('calibration',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
