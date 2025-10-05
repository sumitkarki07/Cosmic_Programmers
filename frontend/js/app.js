document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const weatherForm = document.getElementById('weather-form');
    const addressInput = document.getElementById('address');
    const weatherResults = document.getElementById('weather-results');
    const loadingDiv = document.getElementById('loading');
    const errorDisplay = document.getElementById('error-display');
    const alertDisplay = document.getElementById('alert-display');
    const mapContainer = document.getElementById('map');
    
    // Tab elements
    const tabCurrent = document.getElementById('tab-current');
    const tabPlanning = document.getElementById('tab-planning');
    const tabForecast = document.getElementById('tab-forecast');
    const currentWeatherSection = document.getElementById('current-weather-section');
    const planningSection = document.getElementById('planning-section');
    
    // Planning form elements
    const planningForm = document.getElementById('planning-form');
    const planningAddress = document.getElementById('planning-address');
    const planningDate = document.getElementById('planning-date');
    const planningYears = document.getElementById('planning-years');
    const yearsDisplay = document.getElementById('years-display');
    const planningResults = document.getElementById('planning-results');
    const planningLoading = document.getElementById('planning-loading');
    const probabilityDashboard = document.getElementById('probability-dashboard');
    
    // Download buttons
    const downloadCSV = document.getElementById('download-csv');
    const downloadJSON = document.getElementById('download-json');
    
    // Unit conversion elements
    const unitToggle = document.getElementById('unit-toggle');
    const unitLabel = document.getElementById('unit-label');
    
    // Predictions elements
    const predictionsSection = document.getElementById('predictions-section');
    const predictionsContent = document.getElementById('predictions-content');
    const enableNotificationsBtn = document.getElementById('enable-notifications');
    const notificationPrompt = document.getElementById('notification-prompt');
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Quick location buttons
    const quickLocationBtns = document.querySelectorAll('.quick-location');
    const useMyLocationBtn = document.getElementById('use-my-location');
    
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-top');

    // State management
    let currentWeatherData = null;
    let currentLocation = null;
    let currentProbabilityData = null;
    let isMetric = true; // true for Metric (°C, m/s, mm), false for Imperial (°F, mph, in)
    let notificationsEnabled = false;
    let activeTab = 'current';

    // Tab switching
    function switchTab(tab) {
        activeTab = tab;
        
        // Update tab buttons
        [tabCurrent, tabPlanning, tabForecast].forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        });
        
        // Hide all sections
        currentWeatherSection.classList.add('hidden');
        planningSection.classList.add('hidden');
        
        if (tab === 'current') {
            tabCurrent.classList.remove('bg-gray-100', 'text-gray-700');
            tabCurrent.classList.add('bg-blue-600', 'text-white');
            currentWeatherSection.classList.remove('hidden');
        } else if (tab === 'planning') {
            tabPlanning.classList.remove('bg-gray-100', 'text-gray-700');
            tabPlanning.classList.add('bg-blue-600', 'text-white');
            planningSection.classList.remove('hidden');
        } else if (tab === 'forecast') {
            tabForecast.classList.remove('bg-gray-100', 'text-gray-700');
            tabForecast.classList.add('bg-blue-600', 'text-white');
            currentWeatherSection.classList.remove('hidden');
            // Auto-scroll to forecast section if available
            setTimeout(() => {
                const forecastSection = document.getElementById('forecast-section');
                if (forecastSection && !forecastSection.classList.contains('hidden')) {
                    forecastSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }
    
    // Tab click handlers
    tabCurrent.addEventListener('click', () => switchTab('current'));
    tabPlanning.addEventListener('click', () => switchTab('planning'));
    tabForecast.addEventListener('click', () => switchTab('forecast'));
    
    // Planning years slider
    planningYears.addEventListener('input', (e) => {
        yearsDisplay.textContent = e.target.value;
    });
    
    // Activity button selection
    document.querySelectorAll('.activity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.activity-btn').forEach(b => {
                b.classList.remove('bg-white', 'text-green-600');
                b.classList.add('bg-white/20', 'text-white');
            });
            this.classList.remove('bg-white/20', 'text-white');
            this.classList.add('bg-white', 'text-green-600');
        });
    });

    // Initialize Leaflet map
    let map = L.map('map').setView([20, 0], 2); // World view
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    let marker;

    // Check notification permission on load
    if ('Notification' in window && Notification.permission === 'granted') {
        notificationsEnabled = true;
        if (notificationPrompt) {
            notificationPrompt.classList.add('hidden');
        }
    }

    // Unit conversion functions
    function celsiusToFahrenheit(c) {
        return (c * 9/5) + 32;
    }

    function fahrenheitToCelsius(f) {
        return (f - 32) * 5/9;
    }

    function msToMph(ms) {
        return ms * 2.237;
    }

    function mphToMs(mph) {
        return mph / 2.237;
    }

    function mmToInches(mm) {
        return mm * 0.0394;
    }

    function inchesToMm(inches) {
        return inches / 0.0394;
    }

    // Unit toggle functionality
    unitToggle.addEventListener('click', () => {
        isMetric = !isMetric;
        unitLabel.textContent = isMetric ? 'Metric' : 'Imperial';
        
        // Re-display weather data with new units
        if (currentWeatherData && currentLocation) {
            displayWeather(currentWeatherData, currentLocation.name, currentLocation.lat, currentLocation.lon);
        }
    });

    // Notification permission
    enableNotificationsBtn.addEventListener('click', async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                notificationsEnabled = true;
                notificationPrompt.classList.add('hidden');
                showNotification('Weather Alerts Enabled', 'You will now receive weather alerts for this location.');
            }
        } else {
            alert('Your browser does not support notifications.');
        }
    });

    // Show notification function
    function showNotification(title, body, icon = '🌦️') {
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50">' + icon + '</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50">⚠️</text></svg>'
            });
        }
    }

    // Mobile menu toggle
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Scroll to top functionality
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.remove('hidden');
        } else {
            scrollTopBtn.classList.add('hidden');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Weather tips based on conditions
    const weatherTips = {
        hot: "Stay hydrated and avoid prolonged sun exposure. Use sunscreen and seek shade.",
        cold: "Dress warmly in layers. Protect extremities from frostbite.",
        rainy: "Carry an umbrella and drive carefully. Watch for flooding in low areas.",
        windy: "Secure loose objects outdoors. Be cautious while driving.",
        normal: "Perfect weather! Enjoy your day and stay informed about conditions."
    };

    // Quick location buttons
    quickLocationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const location = btn.getAttribute('data-location');
            addressInput.value = location;
            weatherForm.dispatchEvent(new Event('submit'));
        });
    });

    // Use my location button
    useMyLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            loadingDiv.classList.remove('hidden');
            weatherResults.classList.add('hidden');
            errorDisplay.classList.add('hidden');
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    await fetchWeatherByCoords(lat, lon, 'Your Location');
                },
                (error) => {
                    loadingDiv.classList.add('hidden');
                    showError('Unable to get your location. Please enter manually.');
                }
            );
        } else {
            showError('Geolocation is not supported by your browser.');
        }
    });

    // Main weather form submission
    weatherForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const address = addressInput.value.trim();
        
        // Show loading, hide others
        loadingDiv.classList.remove('hidden');
        weatherResults.classList.add('hidden');
        errorDisplay.classList.add('hidden');

        try {
            // Geocode the address to get latitude and longitude
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const geoData = await geoRes.json();

            if (!geoData.length) {
                throw new Error('Address not found. Please enter a valid location.');
            }

            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);
            const locationName = geoData[0].display_name;

            await fetchWeatherByCoords(lat, lon, locationName);

        } catch (error) {
            loadingDiv.classList.add('hidden');
            showError(error.message);
        }
    });

    // Fetch weather by coordinates
    async function fetchWeatherByCoords(lat, lon, locationName) {
        try {
            // Fix map view - invalidate size to ensure proper rendering
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    map.setView([lat, lon], 13);
                }
            }, 100);

            // Update marker
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker([lat, lon]).addTo(map);
            marker.bindPopup(`<b>${locationName.split(',')[0]}</b>`).openPopup();

            // Fetch weather data using lat/lon
            const response = await fetch(`http://127.0.0.1:5001/api/weather?lat=${lat}&lon=${lon}`);
            if (!response.ok) {
                throw new Error(`Unable to fetch weather data. Server returned ${response.status}`);
            }
            const data = await response.json();
            
            // Store current data and location
            currentWeatherData = data;
            currentLocation = { lat, lon, name: locationName };
            
            loadingDiv.classList.add('hidden');
            displayWeather(data, locationName, lat, lon);
            
            // Generate predictions
            generatePredictions(data.weather, locationName);
            
            // Fetch and display 7-day forecast
            fetchSevenDayForecast(lat, lon);
            
        } catch (error) {
            loadingDiv.classList.add('hidden');
            showError(error.message);
        }
    }

    // Fetch 7-day forecast
    async function fetchSevenDayForecast(lat, lon) {
        const forecastSection = document.getElementById('forecast-section');
        const forecastContent = document.getElementById('forecast-content');
        const forecastLoading = document.getElementById('forecast-loading');
        const forecastAlertsSection = document.getElementById('forecast-alerts');
        const forecastAlertsContent = document.getElementById('forecast-alerts-content');
        
        try {
            forecastSection.classList.remove('hidden');
            forecastLoading.classList.remove('hidden');
            forecastContent.innerHTML = '<p class="text-gray-500 col-span-full text-center">Loading forecast...</p>';
            
            const response = await fetch(`http://127.0.0.1:5001/api/forecast?lat=${lat}&lon=${lon}&days=7`);
            if (!response.ok) {
                throw new Error(`Unable to fetch forecast data. Server returned ${response.status}`);
            }
            
            const data = await response.json();
            forecastLoading.classList.add('hidden');
            
            if (data.success && data.forecast.forecast.length > 0) {
                displaySevenDayForecast(data.forecast.forecast, data.forecast_alerts);
                
                // Show alerts if any
                if (data.forecast_alerts && data.forecast_alerts.length > 0) {
                    displayForecastAlerts(data.forecast_alerts);
                } else {
                    forecastAlertsSection.classList.add('hidden');
                }
            } else {
                forecastContent.innerHTML = '<p class="text-red-500 col-span-full text-center">No forecast data available.</p>';
            }
            
        } catch (error) {
            forecastLoading.classList.add('hidden');
            forecastContent.innerHTML = `<p class="text-red-500 col-span-full text-center">Error: ${error.message}</p>`;
        }
    }

    // Display 7-day forecast
    function displaySevenDayForecast(forecast) {
        const forecastContent = document.getElementById('forecast-content');
        forecastContent.innerHTML = '';
        
        const weatherIcons = {
            1: '☀️', 2: '🌤️', 3: '⛅', 4: '☁️', 5: '🌧️', 
            6: '⛈️', 7: '🌨️', 8: '🌫️', 9: '💨'
        };
        
        forecast.forEach((day, index) => {
            const date = new Date(day.date);
            const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Convert values based on unit system
            let temp = day.temperature;
            let windSpeed = day.wind_speed;
            let rainfall = day.rainfall;
            
            if (!isMetric) {
                temp = celsiusToFahrenheit(temp);
                windSpeed = msToMph(windSpeed);
                rainfall = mmToInches(rainfall);
            }
            
            // Get weather icon
            const icon = weatherIcons[day.weather_symbol] || '🌍';
            
            // Determine alert level for this day
            let alertBorder = 'border-gray-200';
            let alertBg = 'bg-white';
            if (rainfall > (isMetric ? 30 : 1.18) || windSpeed > (isMetric ? 20 : 45) || temp > (isMetric ? 38 : 100)) {
                alertBorder = 'border-red-400';
                alertBg = 'bg-red-50';
            } else if (rainfall > (isMetric ? 15 : 0.59) || windSpeed > (isMetric ? 15 : 34) || temp > (isMetric ? 35 : 95) || temp < (isMetric ? 0 : 32)) {
                alertBorder = 'border-orange-400';
                alertBg = 'bg-orange-50';
            }
            
            const card = `
                <div class="border-2 ${alertBorder} ${alertBg} rounded-lg p-4 transition hover:shadow-md">
                    <div class="text-center">
                        <div class="text-sm font-semibold text-gray-700">${dayName}</div>
                        <div class="text-xs text-gray-500 mb-2">${dateStr}</div>
                        <div class="text-4xl mb-2">${icon}</div>
                        <div class="text-2xl font-bold text-gray-800 mb-1">
                            ${temp !== null ? temp.toFixed(1) : 'N/A'}${isMetric ? '°C' : '°F'}
                        </div>
                    </div>
                    <div class="mt-3 space-y-1 text-xs">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">💨 Wind:</span>
                            <span class="font-semibold">${windSpeed !== null ? windSpeed.toFixed(1) : 'N/A'} ${isMetric ? 'm/s' : 'mph'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">🌧️ Rain:</span>
                            <span class="font-semibold">${rainfall !== null ? rainfall.toFixed(1) : 'N/A'} ${isMetric ? 'mm' : 'in'}</span>
                        </div>
                    </div>
                </div>
            `;
            
            forecastContent.innerHTML += card;
        });
    }

    // Display forecast alerts
    function displayForecastAlerts(forecastAlerts) {
        const forecastAlertsSection = document.getElementById('forecast-alerts');
        const forecastAlertsContent = document.getElementById('forecast-alerts-content');
        
        forecastAlertsSection.classList.remove('hidden');
        forecastAlertsContent.innerHTML = '';
        
        forecastAlerts.forEach(dayAlert => {
            const date = new Date(dayAlert.date);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            
            const highAlerts = dayAlert.alerts.filter(a => a.severity === 'high');
            const moderateAlerts = dayAlert.alerts.filter(a => a.severity === 'moderate');
            
            if (highAlerts.length > 0 || moderateAlerts.length > 0) {
                let alertsHtml = `<div class="border-l-4 ${highAlerts.length > 0 ? 'border-red-500' : 'border-orange-500'} pl-3">`;
                alertsHtml += `<div class="font-semibold text-sm text-gray-800 mb-1">${dateStr}</div>`;
                
                [...highAlerts, ...moderateAlerts].forEach(alert => {
                    const severityColor = alert.severity === 'high' ? 'text-red-700' : 'text-orange-700';
                    alertsHtml += `<div class="text-xs ${severityColor}">⚠️ ${alert.message}</div>`;
                });
                
                alertsHtml += '</div>';
                forecastAlertsContent.innerHTML += alertsHtml;
            }
        });
    }

    // Display weather data
    function displayWeather(data, locationName, lat, lon) {
        const { weather, alerts } = data;
        
        // Show results section
        weatherResults.classList.remove('hidden');
        errorDisplay.classList.add('hidden');

        // Update location info
        document.getElementById('location-name').textContent = locationName.split(',')[0];
        document.getElementById('location-coords').textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
        
        // Update timestamp
        const now = new Date();
        document.getElementById('last-updated').textContent = `Updated: ${now.toLocaleTimeString()}`;

        // Get weather values and convert based on unit system
        let temp = weather.temperature;
        let wind = weather.wind_speed;
        let rain = weather.rainfall;

        // Display with appropriate units
        if (isMetric) {
            document.getElementById('temp-value').textContent = temp !== null ? `${temp.toFixed(1)} °C` : 'N/A';
            document.getElementById('wind-value').textContent = wind !== null ? `${wind.toFixed(1)} m/s` : 'N/A';
            document.getElementById('rain-value').textContent = rain !== null ? `${rain.toFixed(1)} mm/hr` : 'N/A';
        } else {
            // Convert to Imperial
            const tempF = temp !== null ? celsiusToFahrenheit(temp) : null;
            const windMph = wind !== null ? msToMph(wind) : null;
            const rainIn = rain !== null ? mmToInches(rain) : null;
            
            document.getElementById('temp-value').textContent = tempF !== null ? `${tempF.toFixed(1)} °F` : 'N/A';
            document.getElementById('wind-value').textContent = windMph !== null ? `${windMph.toFixed(1)} mph` : 'N/A';
            document.getElementById('rain-value').textContent = rainIn !== null ? `${rainIn.toFixed(2)} in/hr` : 'N/A';
        }

        // Display alerts with better styling
        alertDisplay.innerHTML = '';
        if (alerts && alerts.length > 0) {
            alerts.forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'mb-3 p-4 rounded-lg border-l-4';
                
                if (alert.severity === 'high') {
                    alertDiv.className += ' bg-red-50 border-red-500';
                    alertDiv.innerHTML = `
                        <div class="flex items-start gap-3">
                            <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                            <div>
                                <p class="font-bold text-red-800">Critical Alert</p>
                                <p class="text-red-700">${alert.message}</p>
                            </div>
                        </div>
                    `;
                    
                    // Send notification for critical alerts
                    if (notificationsEnabled) {
                        showNotification('⚠️ Critical Weather Alert', alert.message, '⚠️');
                    }
                } else if (alert.severity === 'moderate') {
                    alertDiv.className += ' bg-orange-50 border-orange-500';
                    alertDiv.innerHTML = `
                        <div class="flex items-start gap-3">
                            <i class="fas fa-exclamation-circle text-orange-600 text-2xl"></i>
                            <div>
                                <p class="font-bold text-orange-800">Warning</p>
                                <p class="text-orange-700">${alert.message}</p>
                            </div>
                        </div>
                    `;
                } else {
                    alertDiv.className += ' bg-green-50 border-green-500';
                    alertDiv.innerHTML = `
                        <div class="flex items-start gap-3">
                            <i class="fas fa-check-circle text-green-600 text-2xl"></i>
                            <div>
                                <p class="font-bold text-green-800">All Clear</p>
                                <p class="text-green-700">${alert.message}</p>
                            </div>
                        </div>
                    `;
                }
                alertDisplay.appendChild(alertDiv);
            });
        }

        // Update weather tip
        updateWeatherTip(temp, wind, rain);

        // Scroll to results smoothly
        weatherResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Generate weather predictions
    function generatePredictions(weather, locationName) {
        const temp = weather.temperature;
        const wind = weather.wind_speed;
        const rain = weather.rainfall;
        
        const predictions = [];
        
        // Predict based on current conditions
        // High rainfall - flood risk
        if (rain > 15 && rain <= 30) {
            predictions.push({
                type: 'flood',
                severity: 'moderate',
                title: 'Potential Flood Risk',
                description: 'Current rainfall levels may lead to flooding in low-lying areas within 24-48 hours.',
                action: 'Monitor weather updates and avoid flood-prone areas.',
                icon: 'water',
                color: 'blue'
            });
        } else if (rain > 30) {
            predictions.push({
                type: 'flood',
                severity: 'high',
                title: 'High Flood Risk',
                description: 'Heavy rainfall detected. Significant flooding expected in the next 12-24 hours.',
                action: 'Evacuate flood-prone areas immediately. Stay on high ground.',
                icon: 'house-flood-water',
                color: 'red'
            });
        }
        
        // High wind - storm/landslide risk
        if (wind > 15 && wind <= 20) {
            predictions.push({
                type: 'storm',
                severity: 'moderate',
                title: 'Storm Watch',
                description: 'Strong winds may intensify. Storm conditions possible in the next 24 hours.',
                action: 'Secure outdoor items and stay informed.',
                icon: 'wind',
                color: 'orange'
            });
        } else if (wind > 20) {
            predictions.push({
                type: 'storm',
                severity: 'high',
                title: 'Severe Storm Warning',
                description: 'Dangerous wind speeds detected. Severe storm expected within 12 hours.',
                action: 'Stay indoors. Avoid travel. Secure all outdoor items.',
                icon: 'hurricane',
                color: 'red'
            });
        }
        
        // Combined high rain + wind - landslide risk
        if (rain > 20 && wind > 10) {
            predictions.push({
                type: 'landslide',
                severity: 'high',
                title: 'Landslide Alert',
                description: 'Heavy rain and wind combination increases landslide risk in hilly areas.',
                action: 'Avoid slopes and hillsides. Evacuate if near vulnerable areas.',
                icon: 'mountain',
                color: 'brown'
            });
        }
        
        // Temperature extremes
        if (temp > 35 && temp <= 38) {
            predictions.push({
                type: 'heat',
                severity: 'moderate',
                title: 'Heat Advisory',
                description: 'High temperatures may continue. Heat wave possible in coming days.',
                action: 'Stay hydrated. Limit outdoor activities during peak hours.',
                icon: 'temperature-high',
                color: 'orange'
            });
        } else if (temp > 38) {
            predictions.push({
                type: 'heat',
                severity: 'high',
                title: 'Extreme Heat Warning',
                description: 'Dangerous heat levels. Heat wave expected to persist for 48+ hours.',
                action: 'Stay indoors in air conditioning. Check on vulnerable individuals.',
                icon: 'sun',
                color: 'red'
            });
        }
        
        // Cold weather (potential snowfall)
        if (temp < 0) {
            predictions.push({
                type: 'snow',
                severity: 'moderate',
                title: 'Snowfall Possible',
                description: 'Freezing temperatures may result in snowfall in the next 24-48 hours.',
                action: 'Prepare for winter conditions. Stock up on essentials.',
                icon: 'snowflake',
                color: 'blue'
            });
        }
        
        // Display predictions
        if (predictions.length > 0) {
            predictionsSection.classList.remove('hidden');
            predictionsContent.innerHTML = predictions.map(pred => {
                const colorClasses = {
                    red: 'bg-red-50 border-red-300 text-red-800',
                    orange: 'bg-orange-50 border-orange-300 text-orange-800',
                    blue: 'bg-blue-50 border-blue-300 text-blue-800',
                    brown: 'bg-yellow-50 border-yellow-400 text-yellow-900'
                };
                
                return `
                    <div class="p-4 ${colorClasses[pred.color]} border-2 rounded-lg">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-${pred.icon} text-2xl mt-1"></i>
                            <div class="flex-grow">
                                <h5 class="font-bold text-lg mb-1">${pred.title}</h5>
                                <p class="text-sm mb-2">${pred.description}</p>
                                <div class="flex items-start gap-2 text-sm">
                                    <i class="fas fa-info-circle mt-0.5"></i>
                                    <p class="font-semibold">${pred.action}</p>
                                </div>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white shadow-sm">
                                ${pred.severity === 'high' ? '⚠️ HIGH' : '⚡ MODERATE'}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Send notification for predictions
            if (notificationsEnabled && predictions.length > 0) {
                const highSeverity = predictions.filter(p => p.severity === 'high');
                if (highSeverity.length > 0) {
                    showNotification(
                        `🔮 Weather Prediction Alert`,
                        `${highSeverity.length} severe weather event(s) predicted for ${locationName.split(',')[0]} in the next 24-48 hours.`,
                        '🔮'
                    );
                }
            }
        } else {
            predictionsSection.classList.add('hidden');
        }
    }

    // Update weather tip based on conditions
    function updateWeatherTip(temp, wind, rain) {
        const tipText = document.getElementById('tip-text');
        
        if (temp !== 'N/A' && temp > 35) {
            tipText.textContent = weatherTips.hot;
        } else if (temp !== 'N/A' && temp < 5) {
            tipText.textContent = weatherTips.cold;
        } else if (rain !== 'N/A' && rain > 10) {
            tipText.textContent = weatherTips.rainy;
        } else if (wind !== 'N/A' && wind > 15) {
            tipText.textContent = weatherTips.windy;
        } else {
            tipText.textContent = weatherTips.normal;
        }
    }

    // Show error message
    function showError(message) {
        errorDisplay.classList.remove('hidden');
        weatherResults.classList.add('hidden');
        document.getElementById('error-message').textContent = message;
        errorDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ========== PLANNING FUNCTIONALITY ==========
    
    // Planning form submission
    planningForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const address = planningAddress.value.trim();
        const date = planningDate.value;
        const years = planningYears.value;
        
        if (!address || !date) {
            alert('Please enter both location and date');
            return;
        }
        
        // Geocode the address
        try {
            planningLoading.classList.remove('hidden');
            probabilityDashboard.classList.add('hidden');
            
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();
            
            if (geoData.length === 0) {
                throw new Error('Location not found. Please try a different search term.');
            }
            
            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);
            const locationName = geoData[0].display_name;
            
            // Fetch probability data
            await fetchProbabilityData(lat, lon, date, years, locationName);
            
        } catch (error) {
            planningLoading.classList.add('hidden');
            alert(`Error: ${error.message}`);
        }
    });
    
    // Fetch probability data
    async function fetchProbabilityData(lat, lon, targetDate, years, locationName) {
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/probability?lat=${lat}&lon=${lon}&date=${targetDate}&years=${years}`);
            
            if (!response.ok) {
                throw new Error(`Unable to fetch probability data. Server returned ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error('Failed to retrieve probability data');
            }
            
            currentProbabilityData = result.data;
            planningLoading.classList.add('hidden');
            planningResults.classList.remove('hidden');
            displayProbabilityResults(result.data, locationName, targetDate);
            
        } catch (error) {
            planningLoading.classList.add('hidden');
            alert(`Error: ${error.message}`);
        }
    }
    
    // Display probability results
    function displayProbabilityResults(data, locationName, targetDate) {
        // Update header
        document.getElementById('planning-location-name').textContent = locationName.split(',')[0];
        document.getElementById('planning-date-display').textContent = new Date(targetDate).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        document.getElementById('planning-years-analyzed').textContent = data.days_analyzed;
        document.getElementById('planning-days-away').textContent = data.days_until_event;
        
        // Temperature analysis
        displayProbability('temp', data.temperature);
        
        // Wind analysis
        displayProbability('wind', data.wind_speed);
        
        // Rainfall analysis
        displayProbability('rain', data.rainfall);
        
        // Overall recommendation
        generateRecommendation(data);
        
        probabilityDashboard.classList.remove('hidden');
    }
    
    // Display individual probability analysis
    function displayProbability(type, data) {
        const containerId = `${type}-probability`;
        const container = document.getElementById(containerId);
        
        if (!data || data.mean === null) {
            container.innerHTML = '<p class="text-gray-500">No data available</p>';
            return;
        }
        
        let html = '';
        
        // Statistics
        html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">';
        html += `<div class="bg-gray-50 p-3 rounded-lg"><div class="text-xs text-gray-600">Average</div><div class="text-lg font-bold">${data.mean}${getUnit(type)}</div></div>`;
        html += `<div class="bg-gray-50 p-3 rounded-lg"><div class="text-xs text-gray-600">Median</div><div class="text-lg font-bold">${data.median}${getUnit(type)}</div></div>`;
        html += `<div class="bg-gray-50 p-3 rounded-lg"><div class="text-xs text-gray-600">Min</div><div class="text-lg font-bold">${data.min}${getUnit(type)}</div></div>`;
        html += `<div class="bg-gray-50 p-3 rounded-lg"><div class="text-xs text-gray-600">Max</div><div class="text-lg font-bold">${data.max}${getUnit(type)}</div></div>`;
        html += '</div>';
        
        // Probability bars
        html += '<div class="space-y-2">';
        
        Object.entries(data.probabilities).forEach(([condition, probability]) => {
            const color = getProbabilityColor(condition, probability);
            const label = formatConditionLabel(condition);
            
            html += `
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-semibold text-gray-700">${label}</span>
                        <span class="text-sm font-bold text-${color}-700">${probability}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-${color}-500 h-3 rounded-full transition-all duration-500" style="width: ${probability}%"></div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // Get unit based on type and current unit system
    function getUnit(type) {
        if (type === 'temp') return isMetric ? '°C' : '°F';
        if (type === 'wind') return isMetric ? ' m/s' : ' mph';
        if (type === 'rain') return isMetric ? ' mm' : ' in';
        return '';
    }
    
    // Get color for probability bar
    function getProbabilityColor(condition, probability) {
        if (condition.includes('very') || condition.includes('uncomfortable')) {
            if (probability > 50) return 'red';
            if (probability > 25) return 'orange';
            return 'yellow';
        }
        if (probability > 70) return 'green';
        if (probability > 40) return 'blue';
        return 'gray';
    }
    
    // Format condition label
    function formatConditionLabel(condition) {
        return condition.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Generate overall recommendation
    function generateRecommendation(data) {
        const tempProbs = data.temperature.probabilities;
        const windProbs = data.wind_speed.probabilities;
        const rainProbs = data.rainfall.probabilities;
        
        let score = 0;
        let issues = [];
        
        // Evaluate temperature
        if (tempProbs.very_hot && tempProbs.very_hot > 30) {
            score -= tempProbs.very_hot / 10;
            issues.push('high temperatures');
        }
        if (tempProbs.very_cold && tempProbs.very_cold > 30) {
            score -= tempProbs.very_cold / 10;
            issues.push('freezing conditions');
        }
        
        // Evaluate wind
        if (windProbs.very_windy && windProbs.very_windy > 30) {
            score -= windProbs.very_windy / 10;
            issues.push('strong winds');
        }
        
        // Evaluate rain
        if (rainProbs.very_wet && rainProbs.very_wet > 30) {
            score -= rainProbs.very_wet / 10;
            issues.push('heavy rainfall');
        }
        
        // Calculate comfortable conditions
        const comfortableTemp = tempProbs.comfortable || 0;
        const calmWind = windProbs.calm || 0;
        const dryConditions = rainProbs.dry || 0;
        
        score += (comfortableTemp + calmWind + dryConditions) / 30;
        
        // Generate recommendation text
        let recommendation = '';
        let recommendationColor = 'from-green-500 to-teal-600';
        
        if (score > 5) {
            recommendation = `✅ Excellent conditions for your outdoor activity! Historical data shows very favorable weather with comfortable temperatures, calm winds, and low chance of rain.`;
            recommendationColor = 'from-green-500 to-emerald-600';
        } else if (score > 2) {
            recommendation = `👍 Good conditions overall. Some variability possible, but generally suitable for outdoor activities. Consider bringing appropriate gear for ${issues.length > 0 ? issues[0] : 'weather changes'}.`;
            recommendationColor = 'from-blue-500 to-cyan-600';
        } else if (score > -2) {
            recommendation = `⚠️ Mixed conditions. Historical data shows ${issues.length > 0 ? issues.join(', ') + ' are' : 'weather is'} possible. Plan accordingly and have backup options ready.`;
            recommendationColor = 'from-orange-500 to-amber-600';
        } else {
            recommendation = `❌ Challenging conditions expected. Historical data shows high probability of ${issues.join(', ')}. Consider rescheduling your outdoor activity or choosing a different location.`;
            recommendationColor = 'from-red-500 to-rose-600';
        }
        
        const recommendationDiv = document.getElementById('overall-recommendation');
        recommendationDiv.className = `bg-gradient-to-r ${recommendationColor} text-white rounded-xl p-6`;
        document.getElementById('recommendation-text').textContent = recommendation;
    }
    
    // Download CSV
    downloadCSV.addEventListener('click', () => {
        if (!currentProbabilityData) return;
        
        let csv = 'Category,Metric,Value\n';
        
        // Temperature data
        csv += `Temperature,Mean,${currentProbabilityData.temperature.mean}\n`;
        csv += `Temperature,Median,${currentProbabilityData.temperature.median}\n`;
        csv += `Temperature,Min,${currentProbabilityData.temperature.min}\n`;
        csv += `Temperature,Max,${currentProbabilityData.temperature.max}\n`;
        csv += `Temperature,Std Dev,${currentProbabilityData.temperature.std_dev}\n`;
        Object.entries(currentProbabilityData.temperature.probabilities).forEach(([key, val]) => {
            csv += `Temperature Probability,${formatConditionLabel(key)},${val}%\n`;
        });
        
        // Wind data
        csv += `Wind Speed,Mean,${currentProbabilityData.wind_speed.mean}\n`;
        csv += `Wind Speed,Median,${currentProbabilityData.wind_speed.median}\n`;
        csv += `Wind Speed,Min,${currentProbabilityData.wind_speed.min}\n`;
        csv += `Wind Speed,Max,${currentProbabilityData.wind_speed.max}\n`;
        csv += `Wind Speed,Std Dev,${currentProbabilityData.wind_speed.std_dev}\n`;
        Object.entries(currentProbabilityData.wind_speed.probabilities).forEach(([key, val]) => {
            csv += `Wind Probability,${formatConditionLabel(key)},${val}%\n`;
        });
        
        // Rainfall data
        csv += `Rainfall,Mean,${currentProbabilityData.rainfall.mean}\n`;
        csv += `Rainfall,Median,${currentProbabilityData.rainfall.median}\n`;
        csv += `Rainfall,Min,${currentProbabilityData.rainfall.min}\n`;
        csv += `Rainfall,Max,${currentProbabilityData.rainfall.max}\n`;
        csv += `Rainfall,Std Dev,${currentProbabilityData.rainfall.std_dev}\n`;
        Object.entries(currentProbabilityData.rainfall.probabilities).forEach(([key, val]) => {
            csv += `Rainfall Probability,${formatConditionLabel(key)},${val}%\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-probability-${currentProbabilityData.target_date}.csv`;
        a.click();
    });
    
    // Download JSON
    downloadJSON.addEventListener('click', () => {
        if (!currentProbabilityData) return;
        
        const json = JSON.stringify(currentProbabilityData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-probability-${currentProbabilityData.target_date}.json`;
        a.click();
    });

    // Add animations on page load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});