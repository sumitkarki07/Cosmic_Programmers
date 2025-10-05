import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
from config import Config

class WeatherService:
    def __init__(self):
        self.username = Config.METEOMATICS_API_USERNAME
        self.password = Config.METEOMATICS_API_PASSWORD
        self.base_url = "https://api.meteomatics.com"

    def fetch_weather_data(self, lat, lon):
        """
        Fetch weather data from Meteomatics API
        Returns: dict with temperature, wind_speed, and rainfall
        """
        if not self.username or not self.password:
            raise ValueError("Meteomatics API credentials not configured")

        # Get current timestamp in ISO format
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        # Parameters we want to fetch
        parameters = 't_2m:C,wind_speed_10m:ms,precip_1h:mm'
        
        # Build the API URL
        url = f"{self.base_url}/{timestamp}/{parameters}/{lat},{lon}/json"
        
        try:
            response = requests.get(
                url,
                auth=HTTPBasicAuth(self.username, self.password),
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Parse the response
            weather_data = {
                'temperature': None,
                'wind_speed': None,
                'rainfall': None,
                'location': {
                    'lat': lat,
                    'lon': lon
                },
                'timestamp': timestamp
            }
            
            # Extract data from response
            if 'data' in data:
                for param in data['data']:
                    param_name = param['parameter']
                    if param_name == 't_2m:C':
                        weather_data['temperature'] = param['coordinates'][0]['dates'][0]['value']
                    elif param_name == 'wind_speed_10m:ms':
                        weather_data['wind_speed'] = param['coordinates'][0]['dates'][0]['value']
                    elif param_name == 'precip_1h:mm':
                        weather_data['rainfall'] = param['coordinates'][0]['dates'][0]['value']
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error fetching weather data: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"Error parsing weather data: {str(e)}")