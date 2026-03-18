from django.db import models

from configuration.models import Belt, Sensor


class EncoderReading(models.Model):
    """
    Represents a position reading from the encoder connected to the conveyor belt.
    """
    belt = models.ForeignKey(
        Belt,
        on_delete=models.CASCADE,
        related_name='encoder_readings',
        help_text="The conveyor belt this encoder reading belongs to"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the encoder reading was recorded"
    )
    encoder_count = models.IntegerField(
        help_text="Raw encoder pulse counter value"
    )
    belt_position_mm = models.FloatField(
        help_text="Calculated belt position in millimeters along the belt loop"
    )

    class Meta:
        verbose_name = "Encoder Reading"
        verbose_name_plural = "Encoder Readings"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.belt.name} - {self.encoder_count} pulses → {self.belt_position_mm}mm"


class SensorReading(models.Model):
    """
    Represents a voltage measurement from a capacitive sensor.
    """
    sensor = models.ForeignKey(
        Sensor,
        on_delete=models.CASCADE,
        related_name='sensor_readings',
        help_text="The sensor this reading belongs to"
    )
    encoder_reading = models.ForeignKey(
        EncoderReading,
        on_delete=models.CASCADE,
        related_name='sensor_readings',
        help_text="The encoder reading associated with this sensor measurement"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the sensor reading was recorded"
    )
    voltage_v = models.FloatField(
        help_text="Voltage measured from the sensor circuit in volts"
    )
    capacitance_pf = models.FloatField(
        null=True,
        blank=True,
        help_text="Calculated capacitance in picofarads using calibration polynomial"
    )

    class Meta:
        verbose_name = "Sensor Reading"
        verbose_name_plural = "Sensor Readings"
        ordering = ['-timestamp']

    def save(self, *args, **kwargs):
        """Calculate capacitance from voltage using sensor calibration."""
        if self.sensor.calibration and self.voltage_v is not None:
            cal = self.sensor.calibration
            V = self.voltage_v
            V_MAX = 3.3
            V_MIN = 0.0

            def apply_poly(v):
                return (
                    (cal.a4 or 0) * (v ** 4) +
                    (cal.a3 or 0) * (v ** 3) +
                    (cal.a2 or 0) * (v ** 2) +
                    (cal.a1 or 0) * v +
                    (cal.a0 or 0)
                )

            self.capacitance_pf = max(0, min(apply_poly(V), apply_poly(V_MAX)))

        super().save(*args, **kwargs)

    def __str__(self):
        cap_str = f" → {self.capacitance_pf}pF" if self.capacitance_pf else ""
        return f"Sensor {self.sensor.sensor_number} - {self.voltage_v}V{cap_str}"
