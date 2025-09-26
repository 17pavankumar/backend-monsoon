from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('weather/', views.weather_details, name='weather_details'),
    path('air-quality/', views.air_quality_details, name='air_quality_details'),
    path('water-levels/', views.water_levels, name='water_levels'),
    path('eco-tips/', views.eco_tips, name='eco_tips'),
    path('alert/<int:alert_id>/mark-read/', views.mark_alert_read, name='mark_alert_read'),
    path('api/dashboard-data/', views.get_dashboard_data, name='dashboard_data'),
]