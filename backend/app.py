from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.weather_service import WeatherService
from utils.alert_checker import check_alert_conditions

app = Flask(__name__)
CORS(app)

# Initialize weather service
weather_service = WeatherService()

@app.route('/api/weather', methods=['GET'])
def get_weather():
    """
    Endpoint to fetch weather data and check for alerts
    Query params: lat (latitude), lon (longitude)
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    # Validate input
    if not lat or not lon:
        return jsonify({
            'error': 'Missing parameters',
            'message': 'Both latitude and longitude are required'
        }), 400

    # Validate lat/lon ranges
    try:
        lat_float = float(lat)
        lon_float = float(lon)
        
        if not (-90 <= lat_float <= 90):
            return jsonify({
                'error': 'Invalid latitude',
                'message': 'Latitude must be between -90 and 90'
            }), 400
            
        if not (-180 <= lon_float <= 180):
            return jsonify({
                'error': 'Invalid longitude',
                'message': 'Longitude must be between -180 and 180'
            }), 400
            
    except ValueError:
        return jsonify({
            'error': 'Invalid format',
            'message': 'Latitude and longitude must be valid numbers'
        }), 400

    # Fetch weather data
    try:
        weather_data = weather_service.fetch_weather_data(lat, lon)
        
        # Check for extreme weather alerts
        alerts = check_alert_conditions(weather_data)
        
        return jsonify({
            'success': True,
            'weather': weather_data,
            'alerts': alerts,
            'alert_count': len([a for a in alerts if a['severity'] in ['high', 'moderate']])
        }), 200
        
    except ValueError as e:
        return jsonify({
            'error': 'Configuration error',
            'message': str(e)
        }), 500
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch weather data',
            'message': str(e)
        }), 500

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """
    Endpoint to fetch 7-day weather forecast
    Query params: lat (latitude), lon (longitude), days (optional, default=7)
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    days = request.args.get('days', 7)

    # Validate input
    if not lat or not lon:
        return jsonify({
            'error': 'Missing parameters',
            'message': 'Both latitude and longitude are required'
        }), 400

    # Validate lat/lon ranges
    try:
        lat_float = float(lat)
        lon_float = float(lon)
        days_int = int(days)
        
        if not (-90 <= lat_float <= 90):
            return jsonify({
                'error': 'Invalid latitude',
                'message': 'Latitude must be between -90 and 90'
            }), 400
            
        if not (-180 <= lon_float <= 180):
            return jsonify({
                'error': 'Invalid longitude',
                'message': 'Longitude must be between -180 and 180'
            }), 400
        
        if not (1 <= days_int <= 14):
            return jsonify({
                'error': 'Invalid days',
                'message': 'Days must be between 1 and 14'
            }), 400
            
    except ValueError:
        return jsonify({
            'error': 'Invalid format',
            'message': 'Parameters must be valid numbers'
        }), 400

    # Fetch forecast data
    try:
        forecast_data = weather_service.fetch_forecast_data(lat, lon, days_int)
        
        # Check for extreme weather alerts in forecast
        forecast_alerts = []
        for day in forecast_data['forecast']:
            day_alerts = check_alert_conditions({
                'temperature': day['temperature'],
                'wind_speed': day['wind_speed'],
                'rainfall': day['rainfall']
            })
            
            if day_alerts:
                forecast_alerts.append({
                    'date': day['date'],
                    'alerts': day_alerts
                })
        
        return jsonify({
            'success': True,
            'forecast': forecast_data,
            'forecast_alerts': forecast_alerts,
            'total_alert_days': len(forecast_alerts)
        }), 200
        
    except ValueError as e:
        return jsonify({
            'error': 'Configuration error',
            'message': str(e)
        }), 500
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch forecast data',
            'message': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Weather Alert System API',
        'version': '1.0.0'
    }), 200

@app.route('/api/probability', methods=['GET'])
def get_weather_probability():
    """
    Endpoint to get weather forecast probability for event planning (up to 30 days)
    Query params: lat, lon, date (YYYY-MM-DD), days (optional, default=7, max=30)
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    target_date = request.args.get('date')
    days_range = request.args.get('days', 7)
    
    # Validate input
    if not lat or not lon or not target_date:
        return jsonify({
            'error': 'Missing parameters',
            'message': 'Latitude, longitude, and date are required'
        }), 400
    
    try:
        lat_float = float(lat)
        lon_float = float(lon)
        days_int = int(days_range)
        
        if not (-90 <= lat_float <= 90):
            return jsonify({
                'error': 'Invalid latitude',
                'message': 'Latitude must be between -90 and 90'
            }), 400
            
        if not (-180 <= lon_float <= 180):
            return jsonify({
                'error': 'Invalid longitude',
                'message': 'Longitude must be between -180 and 180'
            }), 400
        
        if not (1 <= days_int <= 30):
            return jsonify({
                'error': 'Invalid days',
                'message': 'Days must be between 1 and 30'
            }), 400
            
    except ValueError:
        return jsonify({
            'error': 'Invalid format',
            'message': 'Parameters must be valid numbers'
        }), 400
    
    # Fetch probability data using forecast
    try:
        probability_data = weather_service.fetch_forecast_probability(
            lat_float, lon_float, target_date, days_int
        )
        
        return jsonify({
            'success': True,
            'data': probability_data
        }), 200
        
    except ValueError as e:
        return jsonify({
            'error': 'Validation error',
            'message': str(e)
        }), 400
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch probability data',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5001)