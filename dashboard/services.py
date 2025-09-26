import requests
from django.conf import settings
from datetime import datetime, timedelta
import logging
from .models import WeatherData, AirQualityData

logger = logging.getLogger(__name__)

class WeatherService:
    BASE_URL = "http://api.openweathermap.org/data/2.5"
    
    @classmethod
    def get_current_weather(cls, city):
        """Fetch current weather data from OpenWeatherMap API"""
        try:
            url = f"{cls.BASE_URL}/weather"
            params = {
                'q': city,
                'appid': settings.OPENWEATHER_API_KEY,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            weather_data = {
                'city': data['name'],
                'country': data['sys']['country'],
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': data['wind']['speed'],
                'weather_description': data['weather'][0]['description'],
                'rainfall': cls._extract_rainfall(data)
            }
            
            return weather_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Weather API error for {city}: {str(e)}")
            return None
        except KeyError as e:
            logger.error(f"Weather data parsing error: {str(e)}")
            return None
    
    @classmethod
    def get_forecast(cls, city, days=5):
        """Fetch weather forecast"""
        try:
            url = f"{cls.BASE_URL}/forecast"
            params = {
                'q': city,
                'appid': settings.OPENWEATHER_API_KEY,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            forecast_data = []
            for item in data['list'][:days*8]:  # 8 entries per day (3-hour intervals)
                forecast_data.append({
                    'datetime': datetime.fromtimestamp(item['dt']),
                    'temperature': item['main']['temp'],
                    'humidity': item['main']['humidity'],
                    'description': item['weather'][0]['description'],
                    'rainfall': cls._extract_rainfall(item),
                    'wind_speed': item['wind']['speed']
                })
            
            return forecast_data
        except Exception as e:
            logger.error(f"Forecast API error for {city}: {str(e)}")
            return []
    
    @classmethod
    def _extract_rainfall(cls, data):
        """Extract rainfall data from weather response"""
        rain = data.get('rain', {})
        return rain.get('1h', rain.get('3h', 0.0))

class AirQualityService:
    BASE_URL = "https://api.openaq.org/v2"
    
    @classmethod
    def get_air_quality(cls, city):
        """Fetch air quality data from OpenAQ API"""
        try:
            # First, get the latest measurements for the city
            url = f"{cls.BASE_URL}/latest"
            params = {
                'city': city,
                'limit': 100,
                'parameter': ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if not data.get('results'):
                return cls._get_mock_air_quality(city)
            
            # Process the results
            measurements = {}
            for result in data['results']:
                for measurement in result.get('measurements', []):
                    param = measurement['parameter']
                    value = measurement['value']
                    measurements[param] = value
            
            # Calculate AQI (simplified calculation)
            aqi = cls._calculate_aqi(measurements)
            
            air_quality_data = {
                'city': city,
                'country': data['results'][0]['country'] if data['results'] else 'Unknown',
                'aqi': aqi,
                'pm25': measurements.get('pm25'),
                'pm10': measurements.get('pm10'),
                'o3': measurements.get('o3'),
                'no2': measurements.get('no2'),
                'so2': measurements.get('so2'),
                'co': measurements.get('co')
            }
            
            return air_quality_data
            
        except Exception as e:
            logger.error(f"Air Quality API error for {city}: {str(e)}")
            return cls._get_mock_air_quality(city)
    
    @classmethod
    def _calculate_aqi(cls, measurements):
        """Calculate AQI based on pollutant measurements"""
        # Simplified AQI calculation based on PM2.5
        pm25 = measurements.get('pm25', 25)  # Default moderate value
        
        if pm25 <= 12:
            return int((50/12) * pm25)
        elif pm25 <= 35.4:
            return int(50 + ((100-50)/(35.4-12.1)) * (pm25-12.1))
        elif pm25 <= 55.4:
            return int(100 + ((150-100)/(55.4-35.5)) * (pm25-35.5))
        elif pm25 <= 150.4:
            return int(150 + ((200-150)/(150.4-55.5)) * (pm25-55.5))
        elif pm25 <= 250.4:
            return int(200 + ((300-200)/(250.4-150.5)) * (pm25-150.5))
        else:
            return int(300 + ((500-300)/(500.4-250.5)) * (pm25-250.5))
    
    @classmethod
    def _get_mock_air_quality(cls, city):
        """Return mock air quality data when API fails"""
        import random
        return {
            'city': city,
            'country': 'India',
            'aqi': random.randint(50, 150),
            'pm25': random.uniform(15, 45),
            'pm10': random.uniform(25, 75),
            'o3': random.uniform(50, 120),
            'no2': random.uniform(20, 60),
            'so2': random.uniform(5, 25),
            'co': random.uniform(1, 5)
        }

class DataService:
    @classmethod
    def update_weather_data(cls, city):
        """Update weather data for a city"""
        weather_data = WeatherService.get_current_weather(city)
        if weather_data:
            weather_obj = WeatherData.objects.create(**weather_data)
            return weather_obj
        return None
    
    @classmethod
    def update_air_quality_data(cls, city):
        """Update air quality data for a city"""
        air_quality_data = AirQualityService.get_air_quality(city)
        if air_quality_data:
            air_quality_obj = AirQualityData.objects.create(**air_quality_data)
            return air_quality_obj
        return None
    
    @classmethod
    def get_recent_data(cls, city, hours=24):
        """Get recent weather and air quality data"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        weather_data = WeatherData.objects.filter(
            city__icontains=city,
            recorded_at__gte=cutoff_time
        ).first()
        
        air_quality_data = AirQualityData.objects.filter(
            city__icontains=city,
            recorded_at__gte=cutoff_time
        ).first()
        
        # If no recent data, fetch new data
        if not weather_data:
            weather_data = cls.update_weather_data(city)
        
        if not air_quality_data:
            air_quality_data = cls.update_air_quality_data(city)
        
        return {
            'weather': weather_data,
            'air_quality': air_quality_data
        }

class WaterLevelService:
    @classmethod
    def get_mock_water_levels(cls, city):
        """Generate mock water level data for demonstration"""
        import random
        
        water_bodies = [
            {'name': f'{city} River', 'type': 'river'},
            {'name': f'{city} Lake', 'type': 'lake'},
            {'name': f'{city} Dam', 'type': 'dam'},
        ]
        
        mock_data = []
        for body in water_bodies:
            normal_level = random.uniform(10, 20)
            warning_level = normal_level * 1.3
            danger_level = normal_level * 1.6
            current_level = random.uniform(normal_level * 0.8, danger_level * 1.1)
            
            mock_data.append({
                'location_name': body['name'],
                'city': city,
                'water_body_type': body['type'],
                'current_level': round(current_level, 2),
                'normal_level': round(normal_level, 2),
                'warning_level': round(warning_level, 2),
                'danger_level': round(danger_level, 2),
                'latitude': random.uniform(12.9, 13.1),  # Chennai area
                'longitude': random.uniform(80.1, 80.3),
            })
        
        return mock_data
    