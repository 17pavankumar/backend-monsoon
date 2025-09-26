// Maps functionality for Monsoon Data Clock
// Handles interactive maps for water levels, community reports, and weather data

let map = null;
let markers = [];
let currentLocationMarker = null;

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        initializeMap();
    }
});

// Initialize Leaflet map
function initializeMap(lat = 13.0827, lng = 80.2707, zoom = 12) {
    // Default to Chennai coordinates
    map = L.map('map').setView([lat, lng], zoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Add weather layer (optional)
    addWeatherLayer();
    
    // Get user location
    getCurrentLocation();
    
    // Load map data based on current page
    loadMapData();
}

// Add weather overlay layer
function addWeatherLayer() {
    if (typeof L.tileLayer.wms !== 'undefined') {
        const weatherLayer = L.tileLayer.wms('https://maps.openweathermap.org/maps/2.0/weather/', {
            layers: 'TA2',
            format: 'image/png',
            transparent: true,
            opacity: 0.4,
            attribution: 'Weather data © OpenWeatherMap'
        }).addTo(map);
    }
}

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Add marker for current location
                currentLocationMarker = L.marker([lat, lng], {
                    icon: createCustomIcon('user-location')
                }).addTo(map)
                .bindPopup('<strong>Your Location</strong>')
                .openPopup();
                
                // Center map on user location
                map.setView([lat, lng], 13);
                
                // Update location in user profile if logged in
                updateUserLocation(lat, lng);
            },
            function(error) {
                console.warn('Geolocation error:', error);
                showLocationError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    } else {
        console.warn('Geolocation not supported');
        showToast('Geolocation is not supported by your browser', 'warning');
    }
}

// Update user location in backend
function updateUserLocation(lat, lng) {
    if (!document.querySelector('meta[name="user-authenticated"]')) return;
    
    fetch('/api/user/location/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            latitude: lat,
            longitude: lng
        })
    }).catch(error => {
        console.error('Failed to update user location:', error);
    });
}

// Load map data based on current page
function loadMapData() {
    const currentPage = getCurrentPageType();
    
    switch(currentPage) {
        case 'water-levels':
            loadWaterLevelMarkers();
            break;
        case 'community-reports':
            loadCommunityReportMarkers();
            break;
        case 'dashboard':
            loadDashboardMarkers();
            break;
        default:
            loadDefaultMarkers();
    }
}

// Get current page type from URL or data attribute
function getCurrentPageType() {
    const path = window.location.pathname;
    if (path.includes('water-levels')) return 'water-levels';
    if (path.includes('community')) return 'community-reports';
    if (path.includes('dashboard')) return 'dashboard';
    return 'default';
}

// Load water level markers
function loadWaterLevelMarkers() {
    fetch('/api/water-levels/')
        .then(response => response.json())
        .then(data => {
            data.forEach(waterLevel => {
                const marker = L.marker([waterLevel.latitude, waterLevel.longitude], {
                    icon: createCustomIcon(getWaterLevelIconType(waterLevel.alert_status))
                }).addTo(map);
                
                const popupContent = createWaterLevelPopup(waterLevel);
                marker.bindPopup(popupContent);
                
                markers.push(marker);
            });
        })
        .catch(error => {
            console.error('Error loading water level data:', error);
        });
}

// Load community report markers
function loadCommunityReportMarkers() {
    fetch('/api/community/reports/map/')
        .then(response => response.json())
        .then(data => {
            data.forEach(report => {
                if (report.latitude && report.longitude) {
                    const marker = L.marker([report.latitude, report.longitude], {
                        icon: createCustomIcon(getReportIconType(report.report_type))
                    }).addTo(map);
                    
                    const popupContent = createReportPopup(report);
                    marker.bindPopup(popupContent);
                    
                    markers.push(marker);
                }
            });
        })
        .catch(error => {
            console.error('Error loading community report data:', error);
        });
}

// Load dashboard overview markers
function loadDashboardMarkers() {
    Promise.all([
        fetch('/api/water-levels/').then(r => r.json()).catch(() => []),
        fetch('/api/community/reports/map/').then(r => r.json()).catch(() => [])
    ]).then(([waterLevels, reports]) => {
        // Add water level markers
        waterLevels.slice(0, 5).forEach(waterLevel => {
            const marker = L.marker([waterLevel.latitude, waterLevel.longitude], {
                icon: createCustomIcon(getWaterLevelIconType(waterLevel.alert_status))
            }).addTo(map);
            
            marker.bindPopup(createWaterLevelPopup(waterLevel));
            markers.push(marker);
        });
        
        // Add recent report markers
        reports.slice(0, 10).forEach(report => {
            if (report.latitude && report.longitude) {
                const marker = L.marker([report.latitude, report.longitude], {
                    icon: createCustomIcon(getReportIconType(report.report_type))
                }).addTo(map);
                
                marker.bindPopup(createReportPopup(report));
                markers.push(marker);
            }
        });
    });
}

// Load default markers (for general pages)
function loadDefaultMarkers() {
    // Add some demo markers for cities
    const demoLocations = [
        { name: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'city' },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946, type: 'city' },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777, type: 'city' },
        { name: 'Delhi', lat: 28.7041, lng: 77.1025, type: 'city' }
    ];
    
    demoLocations.forEach(location => {
        const marker = L.marker([location.lat, location.lng], {
            icon: createCustomIcon('city')
        }).addTo(map);
        
        marker.bindPopup(`<strong>${location.name}</strong><br>Click to view data`);
        markers.push(marker);
    });
}

// Create custom icons for different marker types
function createCustomIcon(type) {
    const iconConfigs = {
        'user-location': { color: '#007bff', icon: 'fa-map-marker-alt' },
        'normal': { color: '#28a745', icon: 'fa-water' },
        'warning': { color: '#ffc107', icon: 'fa-exclamation-triangle' },
        'danger': { color: '#dc3545', icon: 'fa-exclamation-triangle' },
        'critical': { color: '#8b0000', icon: 'fa-exclamation-triangle' },
        'waterlogging': { color: '#17a2b8', icon: 'fa-water' },
        'air_pollution': { color: '#6c757d', icon: 'fa-smog' },
        'water_pollution': { color: '#20c997', icon: 'fa-tint' },
        'waste_management': { color: '#fd7e14', icon: 'fa-trash' },
        'drainage_issue': { color: '#6f42c1', icon: 'fa-tools' },
        'flooding': { color: '#dc3545', icon: 'fa-house-flood-water' },
        'city': { color: '#495057', icon: 'fa-city' },
        'default': { color: '#6c757d', icon: 'fa-map-marker-alt' }
    };
    
    const config = iconConfigs[type] || iconConfigs['default'];
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color: ${config.color};">
                  <i class="fas ${config.icon}"></i>
               </div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -42]
    });
}

// Get water level icon type based on alert status
function getWaterLevelIconType(alertStatus) {
    const statusMap = {
        'normal': 'normal',
        'warning': 'warning', 
        'danger': 'danger',
        'critical': 'critical'
    };
    return statusMap[alertStatus] || 'normal';
}

// Get report icon type based on report type
function getReportIconType(reportType) {
    const typeMap = {
        'waterlogging': 'waterlogging',
        'air_pollution': 'air_pollution',
        'water_pollution': 'water_pollution',
        'waste_management': 'waste_management',
        'drainage_issue': 'drainage_issue',
        'flooding': 'flooding'
    };
    return typeMap[reportType] || 'default';
}

// Create water level popup content
function createWaterLevelPopup(waterLevel) {
    const statusClass = waterLevel.alert_status;
    const percentage = Math.min(100, (waterLevel.current_level / waterLevel.danger_level) * 100);
    
    return `
        <div class="map-popup water-level-popup">
            <h6 class="popup-title">${waterLevel.location_name}</h6>
            <div class="popup-content">
                <div class="mb-2">
                    <span class="badge badge-${statusClass}">${waterLevel.alert_status.toUpperCase()}</span>
                </div>
                <div class="level-info">
                    <div class="d-flex justify-content-between mb-1">
                        <small>Current Level:</small>
                        <small><strong>${waterLevel.current_level}m</strong></small>
                    </div>
                    <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar bg-${statusClass}" style="width: ${percentage}%"></div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <small class="text-muted">Normal: ${waterLevel.normal_level}m</small>
                        <small class="text-muted">Danger: ${waterLevel.danger_level}m</small>
                    </div>
                </div>
                <div class="popup-actions mt-2">
                    <button class="btn btn-sm btn-primary" onclick="viewWaterLevelDetails('${waterLevel.id}')">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create community report popup content
function createReportPopup(report) {
    const severityClass = report.severity;
    const statusClass = report.status;
    
    return `
        <div class="map-popup report-popup">
            <h6 class="popup-title">${report.title}</h6>
            <div class="popup-content">
                <div class="mb-2">
                    <span class="badge badge-${severityClass} me-1">${report.severity.toUpperCase()}</span>
                    <span class="badge badge-${statusClass}">${report.status.toUpperCase()}</span>
                </div>
                <p class="popup-description">${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</p>
                <div class="popup-meta">
                    <small class="text-muted">
                        <i class="fas fa-map-marker-alt me-1"></i>${report.location}
                    </small>
                    <br>
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>${formatTimeAgo(report.created_at)}
                    </small>
                </div>
                <div class="popup-actions mt-2">
                    <button class="btn btn-sm btn-primary" onclick="viewReportDetails('${report.id}')">
                        View Details
                    </button>
                    <div class="vote-buttons mt-1">
                        <button class="btn btn-sm btn-outline-success" onclick="voteReport('${report.id}', 'up')">
                            <i class="fas fa-arrow-up"></i> ${report.upvotes}
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="voteReport('${report.id}', 'down')">
                            <i class="fas fa-arrow-down"></i> ${report.downvotes}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// View water level details
function viewWaterLevelDetails(waterLevelId) {
    window.location.href = `/dashboard/water-levels/#level-${waterLevelId}`;
}

// View report details
function viewReportDetails(reportId) {
    window.location.href = `/community/reports/${reportId}/`;
}

// Vote on report from map popup
function voteReport(reportId, voteType) {
    if (typeof window.voteReport === 'function') {
        window.voteReport(reportId, voteType);
    } else {
        // Fallback voting function
        fetch(`/community/reports/${reportId}/vote/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ vote_type: voteType })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(`Vote ${voteType === 'up' ? 'up' : 'down'} recorded!`, 'success');
                // Refresh map data
                setTimeout(() => {
                    clearMarkers();
                    loadMapData();
                }, 1000);
            }
        })
        .catch(error => {
            console.error('Vote error:', error);
            showToast('Failed to vote. Please try again.', 'error');
        });
    }
}

// Clear all markers from map
function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

// Add marker at clicked location (for report creation)
function enableLocationPicker(callback) {
    const originalCursor = map.getContainer().style.cursor;
    map.getContainer().style.cursor = 'crosshair';
    
    const onMapClick = function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Remove previous location picker marker
        if (window.locationPickerMarker) {
            map.removeLayer(window.locationPickerMarker);
        }
        
        // Add new marker
        window.locationPickerMarker = L.marker([lat, lng], {
            icon: createCustomIcon('user-location')
        }).addTo(map)
        .bindPopup('Selected Location')
        .openPopup();
        
        // Restore cursor
        map.getContainer().style.cursor = originalCursor;
        
        // Remove click handler
        map.off('click', onMapClick);
        
        // Execute callback with coordinates
        if (callback) {
            callback(lat, lng);
        }
    };
    
    map.on('click', onMapClick);
    showToast('Click on the map to select a location', 'info');
}

// Utility function to format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

// Utility function to get CSRF token
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

// Show toast notification
function showToast(message, type) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback toast implementation
    const toastContainer = getOrCreateToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${getBootstrapColorClass(type)} border-0" 
             role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Clean up after toast is hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Get or create toast container
function getOrCreateToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }
    return container;
}

// Get Bootstrap color class for toast type
function getBootstrapColorClass(type) {
    const colorMap = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return colorMap[type] || 'secondary';
}

// Handle location error
function showLocationError(error) {
    let message = 'Location access failed';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
        case error.TIMEOUT:
            message = 'Location request timed out';
            break;
    }
    showToast(message, 'warning');
}

// Export functions for global access
window.initializeMap = initializeMap;
window.enableLocationPicker = enableLocationPicker;
window.clearMarkers = clearMarkers;
window.loadMapData = loadMapData;
