# Weather Alert System

## Overview
The Weather Alert System is a full-stack application that provides real-time weather data and alerts for extreme weather conditions using the Meteomatics API. The application is built with a Flask backend and a simple frontend interface.

## Features
- Fetches live weather data based on user-provided latitude and longitude.
- Checks for extreme weather conditions such as:
  - Rainfall greater than 30 mm/hr
  - Wind speed greater than 20 m/s
  - Temperature greater than 38 °C
- Displays current weather information and alert messages on the frontend.

## Project Structure
```
weather-alert-system
├── backend
│   ├── app.py
│   ├── config.py
│   ├── services
│   │   ├── __init__.py
│   │   └── weather_service.py
│   ├── utils
│   │   ├── __init__.py
│   │   └── alert_checker.py
│   ├── requirements.txt
│   └── .env.example
├── frontend
│   ├── index.html
│   ├── css
│   │   └── styles.css
│   └── js
│       └── app.js
└── README.md
```

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Create a `.env` file based on the `.env.example` template and fill in your Meteomatics API credentials.
3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the Flask application:
   ```
   python app.py
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Open `index.html` in your web browser to access the application.

## Usage
- Enter the latitude and longitude in the input fields.
- Click the "Check Weather" button to fetch the current weather data.
- The application will display the weather information along with any alerts for extreme conditions.

## License
This project is open-source and available for modification and distribution.