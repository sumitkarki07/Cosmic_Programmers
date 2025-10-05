document.addEventListener('DOMContentLoaded', () => {
    const weatherForm = document.getElementById('weather-form');
    const addressInput = document.getElementById('address');
    const weatherDisplay = document.getElementById('weather-display');
    const alertDisplay = document.getElementById('alert-display');
    const mapContainer = document.getElementById('map');

    // Initialize Leaflet map
    let map = L.map('map').setView([20, 78], 4); // Default view (India)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    let marker;

    weatherForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const address = addressInput.value.trim();
        alertDisplay.textContent = '';
        weatherDisplay.innerHTML = '';

        try {
            // Geocode the address to get latitude and longitude
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const geoData = await geoRes.json();

            if (!geoData.length) {
                alertDisplay.textContent = 'Address not found. Please enter a valid address.';
                return;
            }

            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);

            // Update map view and marker
            map.setView([lat, lon], 13);
            if (marker) {
                marker.setLatLng([lat, lon]);
            } else {
                marker = L.marker([lat, lon]).addTo(map);
            }
            marker.bindPopup(`<b>${geoData[0].display_name}</b>`).openPopup();

            // Fetch weather data using lat/lon
            const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            alertDisplay.textContent = 'Error: ' + error.message;
        }
    });

    function displayWeather(data) {
        const { weather, alert } = data;
        weatherDisplay.innerHTML = `
            <p>Temperature: ${weather.temperature} °C</p>
            <p>Wind Speed: ${weather.wind_speed} m/s</p>
            <p>Rainfall: ${weather.rainfall} mm/hr</p>
        `;
        alertDisplay.textContent = alert ? alert : 'No extreme weather alerts.';
    }
});