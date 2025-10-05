from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.weather_service import WeatherService
from utils.alert_checker import check_alert_conditions

load_dotenv()

app = Flask(__name__)
CORS(app)

weather_service = WeatherService()

@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    try:
        weather_data = weather_service.fetch_weather_data(lat, lon)
        alert_message = check_alert_conditions(weather_data)
        return jsonify({'weather': weather_data, 'alert': alert_message})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)