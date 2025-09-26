from django.contrib import admin
from dashboard.models import WeatherData
from dashboard.models import AirQualityData
from dashboard.models import WaterLevel
from dashboard.models import EcoTip
from dashboard.models import UserAlert

# Register your models here.

admin.site.register(WeatherData)
admin.site.register(AirQualityData)
admin.site.register(WaterLevel)
admin.site.register(EcoTip)
admin.site.register(UserAlert)
