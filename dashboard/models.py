from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WeatherData(models.Model):
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    temperature = models.FloatField()
    humidity = models.FloatField()
    pressure = models.FloatField()
    rainfall = models.FloatField(default=0.0)  # in mm
    wind_speed = models.FloatField()
    weather_description = models.CharField(max_length=200)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.city} - {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"

class AirQualityData(models.Model):
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    aqi = models.IntegerField()  # Air Quality Index
    pm25 = models.FloatField(null=True, blank=True)  # PM2.5
    pm10 = models.FloatField(null=True, blank=True)  # PM10
    o3 = models.FloatField(null=True, blank=True)    # Ozone
    no2 = models.FloatField(null=True, blank=True)   # Nitrogen Dioxide
    so2 = models.FloatField(null=True, blank=True)   # Sulfur Dioxide
    co = models.FloatField(null=True, blank=True)    # Carbon Monoxide
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def aqi_category(self):
        if self.aqi <= 50:
            return "Good"
        elif self.aqi <= 100:
            return "Moderate"
        elif self.aqi <= 150:
            return "Unhealthy for Sensitive Groups"
        elif self.aqi <= 200:
            return "Unhealthy"
        elif self.aqi <= 300:
            return "Very Unhealthy"
        else:
            return "Hazardous"
    
    @property
    def aqi_color(self):
        colors = {
            "Good": "#00e400",
            "Moderate": "#ffff00",
            "Unhealthy for Sensitive Groups": "#ff7e00",
            "Unhealthy": "#ff0000",
            "Very Unhealthy": "#8f3f97",
            "Hazardous": "#7e0023"
        }
        return colors.get(self.aqi_category, "#7e0023")
    
    class Meta:
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.city} AQI: {self.aqi} - {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"

class WaterLevel(models.Model):
    ALERT_LEVELS = [
        ('normal', 'Normal'),
        ('warning', 'Warning'),
        ('danger', 'Danger'),
        ('critical', 'Critical'),
    ]
    
    location_name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    water_body_type = models.CharField(
        max_length=50, 
        choices=[('river', 'River'), ('lake', 'Lake'), ('dam', 'Dam'), ('reservoir', 'Reservoir')]
    )
    current_level = models.FloatField()  # in meters
    normal_level = models.FloatField()   # baseline normal level
    warning_level = models.FloatField()  # warning threshold
    danger_level = models.FloatField()   # danger threshold
    alert_status = models.CharField(max_length=20, choices=ALERT_LEVELS, default='normal')
    latitude = models.FloatField()
    longitude = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)
    
    @property
    def level_percentage(self):
        return min(100, (self.current_level / self.danger_level) * 100)
    
    def update_alert_status(self):
        if self.current_level >= self.danger_level:
            self.alert_status = 'critical'
        elif self.current_level >= self.warning_level:
            self.alert_status = 'danger'
        elif self.current_level >= self.normal_level * 1.2:
            self.alert_status = 'warning'
        else:
            self.alert_status = 'normal'
        self.save()
    
    def __str__(self):
        return f"{self.location_name} - {self.alert_status.title()}"

class EcoTip(models.Model):
    CATEGORIES = [
        ('rainwater', 'Rainwater Harvesting'),
        ('pollution', 'Pollution Reduction'),
        ('water_conservation', 'Water Conservation'),
        ('air_quality', 'Air Quality Improvement'),
        ('monsoon_safety', 'Monsoon Safety'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORIES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class UserAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_alerts')
    alert_type = models.CharField(
        max_length=50,
        choices=[
            ('weather', 'Weather Alert'),
            ('air_quality', 'Air Quality Alert'),
            ('water_level', 'Water Level Alert'),
        ]
    )
    message = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=[('info', 'Info'), ('warning', 'Warning'), ('danger', 'Danger')],
        default='info'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.alert_type} - {self.severity}"
