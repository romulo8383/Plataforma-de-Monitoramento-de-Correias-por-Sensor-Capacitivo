from django.contrib import admin

from .models import Belt


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
