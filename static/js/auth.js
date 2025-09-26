// Authentication JavaScript for Monsoon Data Clock
// Handles login, signup, form validation, and user interactions

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    setupPasswordValidation();
    setupFormEnhancements();
    setupAnimations();
});

// Initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.querySelector('form[method="post"]');
    const signupForm = document.querySelector('form[method="post"]');
    
    if (loginForm && window.location.pathname.includes('login')) {
        setupLoginForm(loginForm);
    }
    
    if (signupForm && window.location.pathname.includes('signup')) {
        setupSignupForm(signupForm);
    }
    
    // Setup demo credentials auto-fill
    setupDemoCredentials();
}

// Setup login form functionality
function setupLoginForm(form) {
    form.addEventListener('submit', function(e) {
        if (!validateLoginForm(form)) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state
        showFormLoading(form);
    });
    
    // Remember me functionality
    const rememberCheckbox = document.getElementById('remember-me');
    if (rememberCheckbox) {
        setupRememberMe(rememberCheckbox);
    }
    
    // Auto-focus username field
    const usernameField = form.querySelector('input[name="username"]');
    if (usernameField) {
        usernameField.focus();
    }
}

// Setup signup form functionality
function setupSignupForm(form) {
    form.addEventListener('submit', function(e) {
        if (!validateSignupForm(form)) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state
        showFormLoading(form);
    });
    
    // Real-time validation
    setupRealTimeValidation(form);
    
    // City autocomplete
    setupCityAutocomplete();
}

// Validate login form
function validateLoginForm(form) {
    const username = form.querySelector('input[name="username"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    
    let isValid = true;
    
    if (!username) {
        showFieldError('username', 'Username is required');
        isValid = false;
    } else {
        clearFieldError('username');
    }
    
    if (!password) {
        showFieldError('password', 'Password is required');
        isValid = false;
    } else {
        clearFieldError('password');
    }
    
    return isValid;
}

// Validate signup form
function validateSignupForm(form) {
    const fields = {
        username: form.querySelector('input[name="username"]').value.trim(),
        email: form.querySelector('input[name="email"]').value.trim(),
        first_name: form.querySelector('input[name="first_name"]').value.trim(),
        last_name: form.querySelector('input[name="last_name"]').value.trim(),
        city: form.querySelector('input[name="city"]').value.trim(),
        password1: form.querySelector('input[name="password1"]').value,
        password2: form.querySelector('input[name="password2"]').value
    };
    
    let isValid = true;
    
    // Username validation
    if (!fields.username) {
        showFieldError('username', 'Username is required');
        isValid = false;
    } else if (fields.username.length < 3) {
        showFieldError('username', 'Username must be at least 3 characters');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(fields.username)) {
        showFieldError('username', 'Username can only contain letters, numbers, and underscores');
        isValid = false;
    } else {
        clearFieldError('username');
    }
    
    // Email validation
    if (!fields.email) {
        showFieldError('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(fields.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearFieldError('email');
    }
    
    // Name validation
    if (!fields.first_name) {
        showFieldError('first_name', 'First name is required');
        isValid = false;
    } else {
        clearFieldError('first_name');
    }
    
    if (!fields.last_name) {
        showFieldError('last_name', 'Last name is required');
        isValid = false;
    } else {
        clearFieldError('last_name');
    }
    
    // City validation
    if (!fields.city) {
        showFieldError('city', 'City is required');
        isValid = false;
    } else {
        clearFieldError('city');
    }
    
    // Password validation
    const passwordValidation = validatePassword(fields.password1);
    if (!passwordValidation.isValid) {
        showFieldError('password1', passwordValidation.message);
        isValid = false;
    } else {
        clearFieldError('password1');
    }
    
    // Password confirmation
    if (fields.password1 !== fields.password2) {
        showFieldError('password2', 'Passwords do not match');
        isValid = false;
    } else {
        clearFieldError('password2');
    }
    
    return isValid;
}

// Password validation
function validatePassword(password) {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    return { isValid: true, message: 'Password is strong' };
}

// Setup password strength indicator
function setupPasswordValidation() {
    const passwordField = document.querySelector('input[name="password1"]');
    if (!passwordField) return;
    
    // Create password strength indicator
    const strengthIndicator = createPasswordStrengthIndicator();
    passwordField.parentNode.appendChild(strengthIndicator);
    
    passwordField.addEventListener('input', function() {
        updatePasswordStrength(this.value, strengthIndicator);
    });
}

// Create password strength indicator HTML
function createPasswordStrengthIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'password-strength mt-2';
    indicator.innerHTML = `
        <div class="password-strength-bar">
            <div class="strength-fill"></div>
        </div>
        <div class="password-requirements mt-2">
            <div class="requirement" data-requirement="length">
                <i class="fas fa-times text-danger"></i>
                <span>At least 8 characters</span>
            </div>
            <div class="requirement" data-requirement="uppercase">
                <i class="fas fa-times text-danger"></i>
                <span>One uppercase letter</span>
            </div>
            <div class="requirement" data-requirement="lowercase">
                <i class="fas fa-times text-danger"></i>
                <span>One lowercase letter</span>
            </div>
            <div class="requirement" data-requirement="number">
                <i class="fas fa-times text-danger"></i>
                <span>One number</span>
            </div>
        </div>
    `;
    return indicator;
}

// Update password strength indicator
function updatePasswordStrength(password, indicator) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };
    
    let score = 0;
    Object.values(requirements).forEach(met => {
        if (met) score++;
    });
    
    // Update requirement indicators
    Object.entries(requirements).forEach(([req, met]) => {
        const reqElement = indicator.querySelector(`[data-requirement="${req}"]`);
        const icon = reqElement.querySelector('i');
        
        if (met) {
            icon.className = 'fas fa-check text-success';
            reqElement.classList.add('met');
        } else {
            icon.className = 'fas fa-times text-danger';
            reqElement.classList.remove('met');
        }
    });
    
    // Update strength bar
    const strengthFill = indicator.querySelector('.strength-fill');
    const percentage = (score / 4) * 100;
    strengthFill.style.width = percentage + '%';
    
    // Update color based on strength
    strengthFill.className = 'strength-fill ' + getStrengthClass(score);
}

// Get strength class based on score
function getStrengthClass(score) {
    if (score <= 1) return 'strength-weak';
    if (score === 2) return 'strength-fair';
    if (score === 3) return 'strength-good';
    return 'strength-strong';
}

// Setup real-time validation
function setupRealTimeValidation(form) {
    const fields = form.querySelectorAll('input[required], input[type="email"]');
    
    fields.forEach(field => {
        field.addEventListener('input', function() {
            // Clear error on input
            if (this.classList.contains('is-invalid')) {
                clearFieldError(this.name);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    switch(fieldName) {
        case 'username':
            if (!value) {
                showFieldError(fieldName, 'Username is required');
            } else if (value.length < 3) {
                showFieldError(fieldName, 'Username must be at least 3 characters');
            } else {
                clearFieldError(fieldName);
                checkUsernameAvailability(value);
            }
            break;
            
        case 'email':
            if (!value) {
                showFieldError(fieldName, 'Email is required');
            } else if (!isValidEmail(value)) {
                showFieldError(fieldName, 'Please enter a valid email address');
            } else {
                clearFieldError(fieldName);
                checkEmailAvailability(value);
            }
            break;
            
        case 'city':
            if (!value) {
                showFieldError(fieldName, 'City is required');
            } else {
                clearFieldError(fieldName);
            }
            break;
    }
}

// Check username availability
function checkUsernameAvailability(username) {
    if (username.length < 3) return;
    
    const indicator = getOrCreateAvailabilityIndicator('username');
    indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    
    fetch('/api/check-username/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.available) {
            indicator.innerHTML = '<i class="fas fa-check text-success"></i> Available';
            indicator.className = 'availability-indicator text-success';
        } else {
            indicator.innerHTML = '<i class="fas fa-times text-danger"></i> Not available';
            indicator.className = 'availability-indicator text-danger';
        }
    })
    .catch(error => {
        console.error('Username check error:', error);
        indicator.innerHTML = '';
    });
}

// Check email availability
function checkEmailAvailability(email) {
    const indicator = getOrCreateAvailabilityIndicator('email');
    indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    
    fetch('/api/check-email/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.available) {
            indicator.innerHTML = '<i class="fas fa-check text-success"></i> Available';
            indicator.className = 'availability-indicator text-success';
        } else {
            indicator.innerHTML = '<i class="fas fa-times text-danger"></i> Already registered';
            indicator.className = 'availability-indicator text-danger';
        }
    })
    .catch(error => {
        console.error('Email check error:', error);
        indicator.innerHTML = '';
    });
}

// Get or create availability indicator
function getOrCreateAvailabilityIndicator(fieldName) {
    let indicator = document.querySelector(`.availability-indicator[data-field="${fieldName}"]`);
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'availability-indicator small mt-1';
        indicator.setAttribute('data-field', fieldName);
        
        const field = document.querySelector(`input[name="${fieldName}"]`);
        field.parentNode.appendChild(indicator);
    }
    
    return indicator;
}

// Setup city autocomplete
function setupCityAutocomplete() {
    const cityField = document.querySelector('input[name="city"]');
    if (!cityField) return;
    
    const cities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
        'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
        'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
        'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
        'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi'
    ];
    
    setupAutocomplete(cityField, cities);
}

// Generic autocomplete setup
function setupAutocomplete(field, suggestions) {
    const datalistId = field.name + '-suggestions';
    let datalist = document.getElementById(datalistId);
    
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        document.body.appendChild(datalist);
        field.setAttribute('list', datalistId);
    }
    
    // Populate datalist
    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        datalist.appendChild(option);
    });
}

// Setup demo credentials
function setupDemoCredentials() {
    const demoCredentials = document.querySelector('.demo-credentials');
    if (!demoCredentials) return;
    
    const loginForm = document.querySelector('form[method="post"]');
    if (!loginForm || !window.location.pathname.includes('login')) return;
    
    // Add click handler to demo credentials
    demoCredentials.addEventListener('click', function() {
        const usernameField = loginForm.querySelector('input[name="username"]');
        const passwordField = loginForm.querySelector('input[name="password"]');
        
        if (usernameField && passwordField) {
            usernameField.value = 'demo_user';
            passwordField.value = 'demo123456';
            
            // Add animation
            [usernameField, passwordField].forEach(field => {
                field.style.transform = 'scale(1.05)';
                field.style.borderColor = '#28a745';
                setTimeout(() => {
                    field.style.transform = 'scale(1)';
                    field.style.borderColor = '';
                }, 300);
            });
            
            showToast('Demo credentials filled!', 'success');
        }
    });
    
    // Add hover effect
    demoCredentials.style.cursor = 'pointer';
    demoCredentials.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
    });
    
    demoCredentials.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

// Setup remember me functionality
function setupRememberMe(checkbox) {
    // Load remembered username
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        const usernameField = document.querySelector('input[name="username"]');
        if (usernameField) {
            usernameField.value = rememberedUsername;
            checkbox.checked = true;
        }
    }
    
    // Handle form submission
    const form = checkbox.closest('form');
    form.addEventListener('submit', function() {
        const usernameField = form.querySelector('input[name="username"]');
        
        if (checkbox.checked && usernameField) {
            localStorage.setItem('rememberedUsername', usernameField.value);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
    });
}

// Setup form enhancements
function setupFormEnhancements() {
    // Add loading states to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            form.addEventListener('submit', function() {
                if (form.checkValidity()) {
                    showFormLoading(form);
                }
            });
        }
    });
    
    // Add input focus effects
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
        });
    });
    
    // Show password toggle
    setupPasswordToggle();
}

// Setup password toggle functionality
function setupPasswordToggle() {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    passwordFields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'password-field-wrapper position-relative';
        
        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(field);
        
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn btn-sm btn-outline-secondary password-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.right = '5px';
        toggleBtn.style.top = '50%';
        toggleBtn.style.transform = 'translateY(-50%)';
        toggleBtn.style.zIndex = '10';
        
        wrapper.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', function() {
            const type = field.type === 'password' ? 'text' : 'password';
            field.type = type;
            
            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    });
}

// Setup animations
function setupAnimations() {
    // Animate form fields on page load
    const formFields = document.querySelectorAll('.form-control');
    formFields.forEach((field, index) => {
        field.style.opacity = '0';
        field.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            field.style.transition = 'all 0.5s ease';
            field.style.opacity = '1';
            field.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Show field error
function showFieldError(fieldName, message) {
    const field = document.querySelector(`input[name="${fieldName}"]`);
    if (!field) return;
    
    field.classList.add('is-invalid');
    
    // Remove existing error
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(fieldName) {
    const field = document.querySelector(`input[name="${fieldName}"]`);
    if (!field) return;
    
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Show form loading state
function showFormLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    const loadingText = submitBtn.getAttribute('data-loading-text') || 'Processing...';
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${loadingText}`;
    
    // Store original text to restore on error
    submitBtn.setAttribute('data-original-text', originalText);
}

// Hide form loading state
function hideFormLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    const originalText = submitBtn.getAttribute('data-original-text');
    if (originalText) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get CSRF token
function getCsrfToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

// Show toast notification
function showToast(message, type = 'info') {
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
                <div class="toast-body">
                    <i class="fas fa-${getToastIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
    
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

// Get Bootstrap color class for toast
function getBootstrapColorClass(type) {
    const colorMap = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return colorMap[type] || 'secondary';
}

// Get toast icon
function getToastIcon(type) {
    const iconMap = {
        'success': 'check',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return iconMap[type] || 'info-circle';
}

// Handle network errors
function handleNetworkError(error) {
    console.error('Network error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
}

// Form submission with AJAX (for enhanced UX)
function submitFormAjax(form, successCallback, errorCallback) {
    const formData = new FormData(form);
    
    showFormLoading(form);
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json().catch(() => ({ success: true }));
        }
        throw new Error('Network response was not ok');
    })
    .then(data => {
        hideFormLoading(form);
        if (successCallback) {
            successCallback(data);
        }
    })
    .catch(error => {
        hideFormLoading(form);
        if (errorCallback) {
            errorCallback(error);
        } else {
            handleNetworkError(error);
        }
    });
}

// Export functions for global access
window.validateLoginForm = validateLoginForm;
window.validateSignupForm = validateSignupForm;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
window.showFormLoading = showFormLoading;
window.hideFormLoading = hideFormLoading;
window.submitFormAjax = submitFormAjax;blur', function() {
            validateField(this);
        });
        
        field.addEventListener('
