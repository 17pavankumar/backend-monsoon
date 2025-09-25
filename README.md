# Monsoon Data Clock 🌧️

A comprehensive web application for monitoring environmental data during monsoon season. Track rainfall, air quality, water levels, and engage with your community for environmental awareness.

## 🌟 Features

- **Real-time Weather Monitoring**: Temperature, humidity, rainfall data from OpenWeatherMap API
- **Air Quality Index**: PM2.5, PM10, and other pollutant levels from OpenAQ API  
- **Water Level Alerts**: Monitor water levels in rivers, lakes, and dams
- **Community Reports**: Citizens can report waterlogging, pollution, and environmental issues
- **Eco-friendly Tips**: Sustainability guidelines for monsoon season
- **Interactive Dashboard**: Charts and visualizations for data analysis
- **Community Challenges**: Environmental initiatives and participation tracking
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js (for frontend dependencies)
- PostgreSQL (for production) or SQLite (for development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/monsoon-data-clock.git
cd monsoon-data-clock
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Collect static files**
```bash
python manage.py collectstatic
```

8. **Run development server**
```bash
python manage.py runserver
```

Visit `http://localhost:8000` to see the application.

## 🔧 Configuration

### API Keys Required

1. **OpenWeatherMap API**: 
   - Sign up at https://openweathermap.org/api
   - Add `OPENWEATHER_API_KEY` to your .env file

2. **OpenAQ API**:
   - Visit https://docs.openaq.org/
   - Add `OPENAQ_API_KEY` to your .env file (optional for basic usage)

### Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
OPENWEATHER_API_KEY=your_openweather_api_key
OPENAQ_API_KEY=your_openaq_api_key
```

## 📂 Project Structure

```
monsoon_tracker/
├── manage.py
├── requirements.txt
├── .env
├── monsoon_tracker/          # Main project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                     # Django apps
│   ├── accounts/            # User authentication
│   ├── dashboard/           # Main dashboard and data
│   └── community/           # Community features
├── templates/               # HTML templates
│   ├── base.html
│   ├── accounts/
│   ├── dashboard/
│   └── community/
└── static/                  # CSS, JS, images
    ├── css/
    ├── js/
    └── images/
```

## 🌐 Deployment

### Heroku Deployment

1. **Install Heroku CLI**

2. **Create Heroku app**
```bash
heroku create your-app-name
```

3. **Set environment variables**
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set OPENWEATHER_API_KEY=your-api-key
heroku config:set DEBUG=False
```

4. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

5. **Run migrations**
```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### Railway Deployment

1. **Connect your GitHub repo to Railway**

2. **Set environment variables** in Railway dashboard

3. **Deploy automatically** on git push

### Render Deployment

1. **Create new Web Service** on Render

2. **Connect your repository**

3. **Set build and start commands**:
   - Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start: `gunicorn monsoon_tracker.wsgi:application`

## 🎨 Frontend Technologies

- **Bootstrap 5**: Responsive UI framework
- **Chart.js**: Data visualization
- **Font Awesome**: Icons
- **Custom CSS**: Enhanced styling with animations
- **Vanilla JavaScript**: Interactive functionality

## 📊 Data Sources

- **Weather Data**: [OpenWeatherMap API](https://openweathermap.org/api)
- **Air Quality**: [OpenAQ API](https://docs.openaq.org/)
- **Water Levels**: Mock data (can be integrated with local APIs)

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Endpoints

### Weather Data
- `GET /api/weather/<city>/` - Get current weather
- `GET /api/forecast/<city>/` - Get weather forecast

### Air Quality
- `GET /api/air-quality/<city>/` - Get current air quality
- `GET /api/air-quality/history/<city>/` - Get historical data

### Community
- `GET /api/reports/` - List community reports
- `POST /api/reports/` - Create new report
- `POST /api/reports/<id>/vote/` - Vote on report

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.dashboard

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## 📱 Mobile Support

The application is fully responsive and provides an excellent mobile experience with:
- Touch-friendly interface
- Optimized charts and visualizations
- Progressive Web App (PWA) capabilities
- Offline support for basic functionality

## 🔒 Security Features

- CSRF protection
- XSS prevention
- SQL injection protection
- Secure password hashing
- Rate limiting on API endpoints
- Input validation and sanitization

## 🌍 Environmental Impact

This project promotes:
- Environmental awareness
- Community participation in sustainability
- Data-driven decision making
- Climate change adaptation
- Sustainable living practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/monsoon-data-clock/issues) page
2. Create a new issue if needed
3. Contact the maintainers

## 🙏 Acknowledgments

- OpenWeatherMap for weather data API
- OpenAQ for air quality data
- Bootstrap team for the UI framework
- Chart.js for visualization capabilities
- All contributors and community members

---

**Built with ❤️ for environmental awareness and community engagement during monsoon season**
