from django.contrib import admin

from .models import EncoderReading, SensorReading


@admin.register(EncoderReading)
class EncoderReadingAdmin(admin.ModelAdmin):
    list_display = ('belt', 'encoder_count', 'belt_position_mm', 'timestamp')
    list_filter = ('belt',)
    readonly_fields = ('timestamp',)
    fieldsets = (
        ('Belt Reference', {
            'fields': ('belt',)
        }),
        ('Encoder Data', {
            'fields': ('encoder_count', 'belt_position_mm')
        }),
        ('Timestamp', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )


@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ('sensor', 'voltage_v', 'capacitance_pf', 'timestamp')
    list_filter = ('sensor',)
    search_fields = ('sensor__sensor_number',)
    readonly_fields = ('timestamp',)
    fieldsets = (
        ('Sensor Reference', {
            'fields': ('sensor', 'encoder_reading')
        }),
        ('Measurement Data', {
            'fields': ('voltage_v', 'capacitance_pf')
        }),
        ('Timestamp', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )
