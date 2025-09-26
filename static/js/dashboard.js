// Dashboard JavaScript Functionality

// Global variables
let weatherChart = null;
let airQualityChart = null;
let refreshInterval = null;

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
            this.style.transform = 'translateY(-5px)'}
        )}
    )};

