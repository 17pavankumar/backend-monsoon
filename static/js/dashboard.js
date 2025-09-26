// Dashboard JavaScript Functionality

// Global variables
let weatherChart = null;
let airQualityChart = null;
let waterLevelChart = null;
let refreshInterval = null;
let isRefreshing = false;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    startAutoRefresh();
});

// Initialize dashboard components
function initializeDashboard() {
    initializeCharts();
    initializeAnimations();
    initializeTooltips();
    checkDataFreshness();
    setupRealTimeUpdates();
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.querySelector('[onclick="refreshData()"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }

    // Card hover effects
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });

    // Interactive elements
    setupInteractiveElements();
    
    // Setup notification handlers
    setupNotificationHandlers();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

// Initialize charts
function initializeCharts() {
    createWeatherChart();
    createAirQualityChart();
    createWaterLevelChart();
    createRainfallChart();
}

// Create weather trend chart
function createWeatherChart() {
    const weatherCtx = document.getElementById('weatherChart');
    if (!weatherCtx) return;

    const gradient = weatherCtx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 154, 86, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 154, 86, 0.05)');

    weatherChart = new Chart(weatherCtx, {
        type: 'line',
        data: {
            labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
            datasets: [{
                label: 'Temperature (°C)',
                data: [25, 26, 28, 30, 29, 27, 28],
                borderColor: '#ff9a56',
                backgroundColor: gradient,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ff9a56',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Humidity (%)',
                data: [60, 62, 65, 68, 70, 68, 66],
                borderColor: '#43e97b',
                backgroundColor: 'rgba(67, 233, 123, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1',
                pointBackgroundColor: '#43e97b',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `Time: ${context[0].label}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6c757d'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: '#ff9a56'
                    },
                    ticks: {
                        color: '#6c757d'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        color: '#43e97b'
                    },
                    ticks: {
                        color: '#6c757d'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            elements: {
                line: {
                    borderWidth: 3
                }
            }
        }
    });
}

// Create air quality chart
function createAirQualityChart() {
    const airQualityCtx = document.getElementById('airQualityChart');
    if (!airQualityCtx) return;

    airQualityChart = new Chart(airQualityCtx, {
        type: 'doughnut',
        data: {
            labels: ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
            datasets: [{
                data: [30, 45, 15, 8, 2, 0],
                backgroundColor: [
                    '#00e400',
                    '#ffff00',
                    '#ff7e00',
                    '#ff0000',
                    '#8f3f97',
                    '#7e0023'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Create water level chart
function createWaterLevelChart() {
    const waterLevelCtx = document.getElementById('waterLevelChart');
    if (!waterLevelCtx) return;

    waterLevelChart = new Chart(waterLevelCtx, {
        type: 'bar',
        data: {
            labels: ['Chennai River', 'Marina Lake', 'Chembarambakkam Dam', 'Poondi Reservoir'],
            datasets: [{
                label: 'Water Level (%)',
                data: [85, 70, 95, 60],
                backgroundColor: [
                    '#17a2b8',
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ],
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: [
                    '#138496',
                    '#218838',
                    '#e0a800',
                    '#c82333'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const status = context.parsed.y > 80 ? 'High' : 
                                         context.parsed.y > 50 ? 'Normal' : 'Low';
                            return [`Level: ${context.parsed.y}%`, `Status: ${status}`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6c757d',
                        maxRotation: 45
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#6c757d',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Water Level Percentage',
                        color: '#495057'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Create rainfall chart
function createRainfallChart() {
    const rainfallCtx = document.getElementById('rainfallChart');
    if (!rainfallCtx) return;

    new Chart(rainfallCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Rainfall (mm)',
                data: [12, 8, 15, 22, 5, 0, 18],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6c757d'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6c757d',
                        callback: function(value) {
                            return value + 'mm';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

// Initialize animations
function initializeAnimations() {
    // Animate stat cards on load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });

    // Animate progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width || bar.getAttribute('aria-valuenow') + '%';
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1.5s ease-in-out';
            bar.style.width = width;
        }, 800);
    });

    // Count up animation for numbers
    animateNumbers();
}

// Animate numbers with count up effect
function animateNumbers() {
    const numberElements = document.querySelectorAll('.stat-card h3, .count-up');
    
    numberElements.forEach(element => {
        const finalValue = parseFloat(element.textContent) || 0;
        const suffix = element.textContent.replace(/[0-9.]/g, '');
        let currentValue = 0;
        const increment = finalValue / 50;
        const isFloat = finalValue % 1 !== 0;
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(counter);
            }
            
            const displayValue = isFloat ? currentValue.toFixed(1) : Math.floor(currentValue);
            element.textContent = displayValue + suffix;
        }, 40);
    });
}

// Initialize tooltips
function initializeTooltips() {
    // Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Custom tooltips for chart elements
    setupCustomTooltips();
}

// Setup custom tooltips
function setupCustomTooltips() {
    const elements = document.querySelectorAll('.tooltip-trigger');
    elements.forEach(element => {
        element.addEventListener('mouseenter', showCustomTooltip);
        element.addEventListener('mouseleave', hideCustomTooltip);
    });
}

// Show custom tooltip
function showCustomTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = event.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

// Hide custom tooltip
function hideCustomTooltip() {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Check data freshness and show indicators
function checkDataFreshness() {
    const lastUpdated = document.getElementById('last-updated');
    if (!lastUpdated) return;

    const updateTime = new Date(lastUpdated.textContent);
    const now = new Date();
    const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));

    if (diffMinutes > 30) {
        showDataFreshnessWarning();
    }
    
    // Add freshness indicator
    addFreshnessIndicator(diffMinutes);
}

// Add data freshness indicator
function addFreshnessIndicator(minutes) {
    const indicators = document.querySelectorAll('.data-freshness');
    indicators.forEach(indicator => {
        if (minutes < 5) {
            indicator.className = 'data-freshness fresh';
            indicator.innerHTML = '<i class="fas fa-circle text-success"></i> Live';
        } else if (minutes < 30) {
            indicator.className = 'data-freshness recent';
            indicator.innerHTML = '<i class="fas fa-circle text-warning"></i> Recent';
        } else {
            indicator.className = 'data-freshness stale';
            indicator.innerHTML = '<i class="fas fa-circle text-danger"></i> Stale';
        }
    });
}

// Show data freshness warning
function showDataFreshnessWarning() {
    const warningHtml = `
        <div class="alert alert-warning alert-dismissible fade show data-warning" role="alert">
            <i class="fas fa-clock me-2"></i>
            Data may be outdated. Consider refreshing for the latest information.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container-fluid');
    if (container && !container.querySelector('.data-warning')) {
        container.insertAdjacentHTML('afterbegin', warningHtml);
    }
}

// Refresh dashboard data
function refreshData() {
    if (isRefreshing) return;
    
    isRefreshing = true;
    const button = document.querySelector('button[onclick="refreshData()"]');
    const icon = button?.querySelector('i');
    
    if (icon) {
        icon.classList.remove('fa-sync-alt');
        icon.classList.add('fa-spinner', 'fa-spin');
    }
    
    if (button) {
        button.disabled = true;
    }

    // Show loading overlay
    showLoadingOverlay();
    
    // Simulate API call or use real endpoint
    const apiUrl = window.location.pathname.includes('dashboard') ? '/api/dashboard-data/' : '/api/dashboard-data/';
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateDashboardData(data);
            updateLastUpdated();
            showSuccessMessage('Data refreshed successfully!');
            
            // Update charts with animation
            updateChartsWithNewData(data);
        })
        .catch(error => {
            console.error('Error refreshing data:', error);
            showErrorMessage('Failed to refresh data. Please try again.');
            handleRefreshError(error);
        })
        .finally(() => {
            isRefreshing = false;
            hideLoadingOverlay();
            
            if (icon) {
                icon.classList.remove('fa-spinner', 'fa-spin');
                icon.classList.add('fa-sync-alt');
            }
            if (button) {
                button.disabled = false;
            }
        });
}

// Show loading overlay
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Refreshing data...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Handle refresh error
function handleRefreshError(error) {
    // Log error details
    console.error('Refresh error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    
    // Show retry option
    showRetryOption();
}

// Show retry option
function showRetryOption() {
    const retryHtml = `
        <div class="alert alert-danger alert-dismissible fade show retry-alert" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Failed to refresh data. Check your connection.
            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="refreshData()">
                Retry
            </button>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container-fluid');
    if (container && !container.querySelector('.retry-alert')) {
        container.insertAdjacentHTML('afterbegin', retryHtml);
    }
}

// Update dashboard data in UI
function updateDashboardData(data) {
    if (data.weather) {
        updateWeatherData(data.weather);
    }
    
    if (data.air_quality) {
        updateAirQualityData(data.air_quality);
    }
    
    if (data.water_levels) {
        updateWaterLevelData(data.water_levels);
    }
    
    // Update any additional data sections
    updateAdditionalData(data);
}

// Update weather data in UI
function updateWeatherData(weather) {
    const tempElement = document.querySelector('.weather-card h3');
    const humidityElement = document.querySelector('.humidity-card h3');
    const rainfallElement = document.querySelector('.rainfall-card h3');
    const descElement = document.querySelector('.weather-card small');
    
    if (tempElement) {
        animateValue(tempElement, parseFloat(weather.temperature), '°C');
    }
    
    if (humidityElement) {
        animateValue(humidityElement, parseFloat(weather.humidity), '%');
    }
    
    if (rainfallElement) {
        animateValue(rainfallElement, parseFloat(weather.rainfall), 'mm');
    }
    
    if (descElement && weather.description) {
        descElement.innerHTML = `<i class="fas fa-eye me-1"></i>${weather.description}`;
    }
}

// Update air quality data in UI
function updateAirQualityData(airQuality) {
    const aqiElement = document.querySelector('.air-quality-card h3');
    const categoryElement = document.querySelector('.air-quality-card small');
    
    if (aqiElement) {
        animateValue(aqiElement, parseInt(airQuality.aqi), '');
    }
    
    if (categoryElement) {
        categoryElement.style.color = airQuality.color;
        categoryElement.innerHTML = `<i class="fas fa-circle me-1"></i>${airQuality.category}`;
        
        // Add pulse animation for bad air quality
        if (airQuality.aqi > 150) {
            categoryElement.classList.add('pulse');
            setTimeout(() => categoryElement.classList.remove('pulse'), 3000);
        }
    }
}

// Update water level data
function updateWaterLevelData(waterLevels) {
    const waterLevelItems = document.querySelectorAll('.water-level-item');
    
    waterLevelItems.forEach((item, index) => {
        if (waterLevels[index]) {
            const level = waterLevels[index];
            const progressBar = item.querySelector('.progress-bar');
            const statusBadge = item.querySelector('.badge');
            
            if (progressBar) {
                progressBar.style.width = level.level_percentage + '%';
                progressBar.className = `progress-bar progress-bar-${level.alert_status}`;
            }
            
            if (statusBadge) {
                statusBadge.textContent = level.alert_status.toUpperCase();
                statusBadge.className = `badge badge-${level.alert_status}`;
            }
        }
    });
}

// Update additional data sections
function updateAdditionalData(data) {
    // Update any additional UI elements based on new data
    if (data.alerts) {
        updateAlerts(data.alerts);
    }
    
    if (data.forecast) {
        updateForecast(data.forecast);
    }
    
    if (data.community_stats) {
        updateCommunityStats(data.community_stats);
    }
}

// Update charts with new data
function updateChartsWithNewData(data) {
    if (weatherChart && data.weather_history) {
        updateWeatherChart(data.weather_history);
    }
    
    if (airQualityChart && data.air_quality_distribution) {
        updateAirQualityChart(data.air_quality_distribution);
    }
    
    if (waterLevelChart && data.water_levels) {
        updateWaterLevelChart(data.water_levels);
    }
}

// Animate value changes
function animateValue(element, newValue, suffix = '') {
    const currentValue = parseFloat(element.textContent) || 0;
    const increment = (newValue - currentValue) / 30;
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
            current = newValue;
            clearInterval(timer);
        }
        
        const displayValue = Math.abs(current) < 1 ? current.toFixed(1) : Math.round(current);
        element.textContent = displayValue + suffix;
    }, 30);
}

// Update last updated timestamp
function updateLastUpdated() {
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
        const now = new Date();
        lastUpdated.textContent = now.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Show success message
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showMessage(message, 'danger');
}

// Show message
function showMessage(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show alert-enter" role="alert">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container-fluid');
    if (container) {
        const existingAlert = container.querySelector('.alert-enter');
        if (existingAlert) {
            existingAlert.remove();
        }
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alert = container.querySelector('.alert-enter');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 150);
            }
        }, 5000);
    }
}

// Setup interactive elements
function setupInteractiveElements() {
    // Make cards clickable where appropriate
    const weatherCard = document.querySelector('.weather-card');
    if (weatherCard) {
        weatherCard.style.cursor = 'pointer';
        weatherCard.addEventListener('click', () => {
            window.location.href = '/dashboard/weather/';
        });
        
        // Add ripple effect
        addRippleEffect(weatherCard);
    }

    const airQualityCard = document.querySelector('.air-quality-card');
    if (airQualityCard) {
        airQualityCard.style.cursor = 'pointer';
        airQualityCard.addEventListener('click', () => {
            window.location.href = '/dashboard/air-quality/';
        });
        
        addRippleEffect(airQualityCard);
    }

    // Add hover effects to forecast items
    const forecastItems = document.querySelectorAll('.forecast-item');
    forecastItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.zIndex = '10';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = 'auto';
        });
    });
}

// Add ripple effect to elements
function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// Setup notification handlers
function setupNotificationHandlers() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Setup alert handlers
    const alertButtons = document.querySelectorAll('[data-alert-id]');
    alertButtons.forEach(button => {
        button.addEventListener('click', function() {
            const alertId = this.getAttribute('data-alert-id');
            markAlertRead(alertId);
        });
    });
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + R for refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
        
        // F5 for refresh
        if (e.key === 'F5') {
            e.preventDefault();
            refreshData();
        }
        
        // Esc to close modals/alerts
        if (e.key === 'Escape') {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                const closeBtn = alert.querySelector('.btn-close');
                if (closeBtn) closeBtn.click();
            });
        }
    });
}

// Setup real-time updates
function setupRealTimeUpdates() {
    // WebSocket connection for real-time updates (if supported)
    if ('WebSocket' in window) {
        setupWebSocket();
    }
    
    // Server-sent events fallback
    if ('EventSource' in window) {
        setupServerSentEvents();
    }
}

// Setup WebSocket connection
function setupWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/dashboard/`;
    
    try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = function(event) {
            console.log('WebSocket connected');
            showMessage('Real-time updates enabled', 'success');
        };
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleRealTimeUpdate(data);
        };
        
        ws.onclose = function(event) {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(setupWebSocket, 5000);
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
        
    } catch (error) {
        console.warn('WebSocket not supported or failed to connect');
    }
}

// Setup Server-Sent Events
function setupServerSentEvents() {
    try {
        const eventSource = new EventSource('/api/dashboard/stream/');
        
        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleRealTimeUpdate(data);
        };
        
        eventSource.onerror = function(error) {
            console.error('SSE error:', error);
            eventSource.close();
        };
        
    } catch (error) {
        console.warn('Server-Sent Events not supported');
    }
}

// Handle real-time updates
function handleRealTimeUpdate(data) {
    if (data.type === 'weather_update') {
        updateWeatherData(data.data);
    } else if (data.type === 'air_quality_update') {
        updateAirQualityData(data.data);
    } else if (data.type === 'alert') {
        showRealTimeAlert(data.data);
    }
}

// Show real-time alert
function showRealTimeAlert(alertData) {
    const alertHtml = `
        <div class="alert alert-${alertData.severity} alert-dismissible fade show real-time-alert" role="alert">
            <i class="fas fa-bolt me-2"></i>
            <strong>Live Alert:</strong> ${alertData.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container-fluid');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('Monsoon Data Alert', {
                body: alertData.message,
                icon: '/static/images/icon-192.png',
                badge: '/static/images/badge-72.png'
            });
        }
    }
}

// Start auto-refresh
function startAutoRefresh() {
    // Refresh every 5 minutes
    refreshInterval = setInterval(() => {
        if (!document.hidden && !isRefreshing) {
            refreshData();
        }
    }, 5 * 60 * 1000);
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Update weather chart with new data
function updateWeatherChart(weatherHistory) {
    if (!weatherChart || !weatherHistory) return;

    // Update datasets
    const tempData = weatherHistory.map(item => item.temperature);
    const humidityData = weatherHistory.map(item => item.humidity);
    const labels = weatherHistory.map(item => formatTimeLabel(item.recorded_at));
    
    weatherChart.data.labels = labels;
    weatherChart.data.datasets[0].data = tempData;
    weatherChart.data.datasets[1].data = humidityData;
    
    weatherChart.update('active');
}

// Update air quality chart
function updateAirQualityChart(distribution) {
    if (!airQualityChart || !distribution) return;
    
    airQualityChart.data.datasets[0].data = [
        distribution.good || 0,
        distribution.moderate || 0,
        distribution.unhealthy_sensitive || 0,
        distribution.unhealthy || 0,
        distribution.very_unhealthy || 0,
        distribution.hazardous || 0
    ];
    
    airQualityChart.update('active');
}

// Update water level chart
function updateWaterLevelChart(waterLevels) {
    if (!waterLevelChart || !waterLevels) return;
    
    const labels = waterLevels.map(level => level.location_name);
    const data = waterLevels.map(level => level.level_percentage);
    const colors = waterLevels.map(level => getWaterLevelColor(level.alert_status));
    
    waterLevelChart.data.labels = labels;
    waterLevelChart.data.datasets[0].data = data;
    waterLevelChart.data.datasets[0].backgroundColor = colors;
    
    waterLevelChart.update('active');
}

// Get water level color based on status
function getWaterLevelColor(status) {
    const colorMap = {
        'normal': '#28a745',
        'warning': '#ffc107', 
        'danger': '#fd7e14',
        'critical': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
}

// Format time label for charts
function formatTimeLabel(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Now';
    if (diffHours === 1) return '1h ago';
    return `${diffHours}h ago`;
}

// Mark alert as read
function markAlertRead(alertId) {
    fetch(`/dashboard/alert/${alertId}/mark-read/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
            if (alertElement) {
                alertElement.closest('.alert').remove();
            }
        }
    })
    .catch(error => console.error('Error marking alert as read:', error));
}

// Get CSRF token
function getCsrfToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopAutoRefresh();
        console.log('Dashboard inactive - stopping auto-refresh');
    } else {
        startAutoRefresh();
        console.log('Dashboard active - resuming auto-refresh');
        // Refresh data when page becomes visible again
        setTimeout(() => {
            if (!isRefreshing) refreshData();
        }, 1000);
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    // Resize charts
    if (weatherChart) weatherChart.resize();
    if (airQualityChart) airQualityChart.resize();
    if (waterLevelChart) waterLevelChart.resize();
    
    // Adjust layout for mobile
    adjustLayoutForMobile();
});

// Adjust layout for mobile devices
function adjustLayoutForMobile() {
    const isMobile = window.innerWidth < 768;
    const charts = document.querySelectorAll('.chart-container');
    
    charts.forEach(chart => {
        if (isMobile) {
            chart.style.height = '250px';
        } else {
            chart.style.height = '300px';
        }
    });
}

// Export weather data
function exportWeatherData() {
    const data = {
        timestamp: new Date().toISOString(),
        weather: getCurrentWeatherData(),
        air_quality: getCurrentAirQualityData(),
        water_levels: getCurrentWaterLevelData()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

// Get current weather data
function getCurrentWeatherData() {
    return {
        temperature: document.querySelector('.weather-card h3')?.textContent,
        humidity: document.querySelector('.humidity-card h3')?.textContent,
        rainfall: document.querySelector('.rainfall-card h3')?.textContent,
        description: document.querySelector('.weather-card small')?.textContent
    };
}

// Get current air quality data
function getCurrentAirQualityData() {
    return {
        aqi: document.querySelector('.air-quality-card h3')?.textContent,
        category: document.querySelector('.air-quality-card small')?.textContent
    };
}

// Get current water level data
function getCurrentWaterLevelData() {
    const waterLevels = [];
    document.querySelectorAll('.water-level-item').forEach(item => {
        const name = item.querySelector('h6')?.textContent;
        const level = item.querySelector('small')?.textContent;
        const status = item.querySelector('.badge')?.textContent;
        
        if (name) {
            waterLevels.push({ name, level, status });
        }
    });
    return waterLevels;
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor chart rendering performance
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.entryType === 'measure' && entry.name.includes('chart')) {
                console.log(`Chart render time: ${entry.duration}ms`);
            }
        });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // Monitor memory usage
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
            
            if (used > 50) { // Alert if using more than 50MB
                console.warn(`High memory usage: ${used}MB / ${total}MB`);
            }
        }, 30000); // Check every 30 seconds
    }
}

// Initialize performance monitoring
initPerformanceMonitoring();

// Update alerts
function updateAlerts(alerts) {
    const alertContainer = document.querySelector('.alerts-container');
    if (!alertContainer || !alerts) return;
    
    alertContainer.innerHTML = '';
    alerts.forEach(alert => {
        const alertHtml = `
            <div class="alert alert-${alert.severity} alert-dismissible fade show" role="alert">
                <i class="fas fa-${getAlertIcon(alert.type)} me-2"></i>
                <strong>${alert.title}:</strong> ${alert.message}
                <small class="d-block mt-1">${formatTimeAgo(new Date(alert.created_at))}</small>
                <button type="button" class="btn-close" data-alert-id="${alert.id}" aria-label="Close"></button>
            </div>
        `;
        alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    });
}

// Update forecast
function updateForecast(forecast) {
    const forecastContainer = document.querySelector('.forecast-container');
    if (!forecastContainer || !forecast) return;
    
    forecastContainer.innerHTML = '';
    forecast.slice(0, 3).forEach(item => {
        const forecastHtml = `
            <div class="forecast-item">
                <div class="forecast-date">${formatDate(new Date(item.datetime))}</div>
                <div class="forecast-temp">${item.temperature.toFixed(1)}°C</div>
                <div class="forecast-desc">${item.description}</div>
                ${item.rainfall > 0 ? `<div class="forecast-rain"><i class="fas fa-cloud-rain text-primary"></i> ${item.rainfall.toFixed(1)}mm</div>` : ''}
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', forecastHtml);
    });
}

// Update community stats
function updateCommunityStats(stats) {
    const statsElements = {
        total_reports: document.querySelector('.total-reports .count-up'),
        pending_reports: document.querySelector('.pending-reports .count-up'),
        resolved_reports: document.querySelector('.resolved-reports .count-up')
    };
    
    Object.entries(statsElements).forEach(([key, element]) => {
        if (element && stats[key]) {
            animateValue(element, stats[key], '');
        }
    });
}

// Get alert icon based on type
function getAlertIcon(type) {
    const iconMap = {
        'weather': 'cloud-sun',
        'air_quality': 'wind',
        'water_level': 'water',
        'community': 'users',
        'system': 'cog'
    };
    return iconMap[type] || 'info-circle';
}

// Format date for display
function formatDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
}

// Utility functions
const utils = {
    formatNumber: (num, decimals = 1) => {
        return parseFloat(num).toFixed(decimals);
    },
    
    getAQIColor: (aqi) => {
        if (aqi <= 50) return '#00e400';
        if (aqi <= 100) return '#ffff00';
        if (aqi <= 150) return '#ff7e00';
        if (aqi <= 200) return '#ff0000';
        if (aqi <= 300) return '#8f3f97';
        return '#7e0023';
    },
    
    formatTimeAgo: formatTimeAgo,
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// Cleanup function
function cleanup() {
    stopAutoRefresh();
    
    // Cleanup charts
    if (weatherChart) {
        weatherChart.destroy();
        weatherChart = null;
    }
    if (airQualityChart) {
        airQualityChart.destroy();
        airQualityChart = null;
    }
    if (waterLevelChart) {
        waterLevelChart.destroy();
        waterLevelChart = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', adjustLayoutForMobile);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Export functions for global access
window.refreshData = refreshData;
window.markAlertRead = markAlertRead;
window.exportWeatherData = exportWeatherData;
window.utils = utils;
window.cleanup = cleanup;
