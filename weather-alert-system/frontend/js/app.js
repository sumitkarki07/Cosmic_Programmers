document.addEventListener('DOMContentLoaded', () => {
    const weatherForm = document.getElementById('weather-form');
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const weatherDisplay = document.getElementById('weather-display');
    const alertDisplay = document.getElementById('alert-display');

    weatherForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const lat = latInput.value;
        const lon = lonInput.value;

        try {
            const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            alertDisplay.textContent = 'Error fetching weather data: ' + error.message;
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