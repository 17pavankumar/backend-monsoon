from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from datetime import datetime, timedelta
import json

from .models import WeatherData, AirQualityData, WaterLevel, EcoTip, UserAlert
from .services import DataService, WaterLevelService, WeatherService
from community.models import CommunityReport

def home(request):
    """Home page with basic information"""
    context = {
        'recent_tips': EcoTip.objects.filter(is_active=True)[:3],
        'total_users': 1250,  # Mock data
        'cities_covered': 50,  # Mock data
        'reports_today': 25,   # Mock data
    }
    return render(request, 'dashboard/home.html', context)

@login_required
def dashboard(request):
    """Main dashboard view"""
    user_city = request.user.city or 'Chennai'
    
    # Get recent data
    data = DataService.get_recent_data(user_city)
    weather_data = data['weather']
    air_quality_data = data['air_quality']
    
    # Get water level data (mock for now)
    water_levels = WaterLevelService.get_mock_water_levels(user_city)
    
    # Get recent community reports
    recent_reports = CommunityReport.objects.filter(
        city__icontains=user_city,
        created_at__gte=datetime.now() - timedelta(days=7)
    )[:5]
    
    # Get eco tips
    eco_tips = EcoTip.objects.filter(is_active=True).order_by('?')[:4]
    
    # Get user alerts
    user_alerts = UserAlert.objects.filter(
        user=request.user,
        is_read=False
    )[:5]
    
    # Weather forecast
    forecast = WeatherService.get_forecast(user_city, days=3)
    
    context = {
        'user_city': user_city,
        'weather_data': weather_data,
        'air_quality_data': air_quality_data,
        'water_levels': water_levels,
        'recent_reports': recent_reports,
        'eco_tips': eco_tips,
        'user_alerts': user_alerts,
        'forecast': forecast,
    }
    
    return render(request, 'dashboard/dashboard.html', context)

@login_required
def weather_details(request):
    """Detailed weather information"""
    user_city = request.user.city or 'Chennai'
    
    # Get recent weather data
    weather_history = WeatherData.objects.filter(
        city__icontains=user_city
    ).order_by('-recorded_at')[:24]  # Last 24 entries
    
    # Get forecast
    forecast = WeatherService.get_forecast(user_city, days=7)
    
    # Get current weather
    current_weather = weather_history.first()
    if not current_weather:
        current_weather = DataService.update_weather_data(user_city)
    
    context = {
        'user_city': user_city,
        'current_weather': current_weather,
        'weather_history': weather_history,
        'forecast': forecast,
    }
    
    return render(request, 'dashboard/weather_details.html', context)

@login_required
def air_quality_details(request):
    """Detailed air quality information"""
    user_city = request.user.city or 'Chennai'
    
    # Get recent air quality data
    air_quality_history = AirQualityData.objects.filter(
        city__icontains=user_city
    ).order_by('-recorded_at')[:24]
    
    # Get current air quality
    current_air_quality = air_quality_history.first()
    if not current_air_quality:
        current_air_quality = DataService.update_air_quality_data(user_city)
    
    context = {
        'user_city': user_city,
        'current_air_quality': current_air_quality,
        'air_quality_history': air_quality_history,
        'aqi_info': {
            'Good': {'range': '0-50', 'color': '#00e400', 'description': 'Air quality is satisfactory'},
            'Moderate': {'range': '51-100', 'color': '#ffff00', 'description': 'Air quality is acceptable'},
            'Unhealthy for Sensitive Groups': {'range': '101-150', 'color': '#ff7e00', 'description': 'Sensitive people may experience problems'},
            'Unhealthy': {'range': '151-200', 'color': '#ff0000', 'description': 'Everyone may experience problems'},
            'Very Unhealthy': {'range': '201-300', 'color': '#8f3f97', 'description': 'Health alert: everyone may experience serious health effects'},
            'Hazardous': {'range': '301+', 'color': '#7e0023', 'description': 'Health warnings of emergency conditions'},
        }
    }
    
    return render(request, 'dashboard/air_quality_details.html', context)

@login_required
def water_levels(request):
    """Water level monitoring page"""
    user_city = request.user.city or 'Chennai'
    
    # Get or create mock water level data
    water_levels = WaterLevelService.get_mock_water_levels(user_city)
    
    # Create or update WaterLevel objects
    for level_data in water_levels:
        water_level, created = WaterLevel.objects.get_or_create(
            location_name=level_data['location_name'],
            defaults=level_data
        )
        if not created:
            # Update existing record
            for key, value in level_data.items():
                setattr(water_level, key, value)
            water_level.update_alert_status()
    
    # Get all water levels for the city
    city_water_levels = WaterLevel.objects.filter(city=user_city)
    
    context = {
        'user_city': user_city,
        'water_levels': city_water_levels,
    }
    
    return render(request, 'dashboard/water_levels.html', context)

@login_required
def eco_tips(request):
    """Eco tips page"""
    category = request.GET.get('category', 'all')
    
    if category == 'all':
        tips = EcoTip.objects.filter(is_active=True)
    else:
        tips = EcoTip.objects.filter(is_active=True, category=category)
    
    tips = tips.order_by('-created_at')
    
    categories = EcoTip.CATEGORIES
    
    context = {
        'tips': tips,
        'categories': categories,
        'selected_category': category,
    }
    
    return render(request, 'dashboard/eco_tips.html', context)

@login_required
@csrf_exempt
def mark_alert_read(request, alert_id):
    """Mark an alert as read"""
    if request.method == 'POST':
        try:
            alert = get_object_or_404(UserAlert, id=alert_id, user=request.user)
            alert.is_read = True
            alert.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def get_dashboard_data(request):
    """API endpoint for dashboard data"""
    user_city = request.user.city or 'Chennai'
    
    # Get recent data
    data = DataService.get_recent_data(user_city)
    
    response_data = {
        'weather': None,
        'air_quality': None,
        'timestamp': datetime.now().isoformat()
    }
    
    if data['weather']:
        response_data['weather'] = {
            'temperature': data['weather'].temperature,
            'humidity': data['weather'].humidity,
            'rainfall': data['weather'].rainfall,
            'description': data['weather'].weather_description,
        }
    
    if data['air_quality']:
        response_data['air_quality'] = {
            'aqi': data['air_quality'].aqi,
            'category': data['air_quality'].aqi_category,
            'color': data['air_quality'].aqi_color,
            'pm25': data['air_quality'].pm25,
        }
    
    return JsonResponse(response_data)
