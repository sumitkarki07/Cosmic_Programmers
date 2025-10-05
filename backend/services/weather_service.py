import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime, timedelta
from config import Config
import statistics

class WeatherService:
    def __init__(self):
        self.username = Config.METEOMATICS_API_USERNAME
        self.password = Config.METEOMATICS_API_PASSWORD
        self.base_url = "https://api.meteomatics.com"
    
    # Weather condition thresholds for event planning
    THRESHOLDS = {
        'very_hot': 35,  # °C
        'very_cold': 0,  # °C
        'very_windy': 15,  # m/s
        'very_wet': 10,  # mm/day
        'uncomfortable_humidity': 80  # % (if available)
    }

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
    
    def fetch_forecast_data(self, lat, lon, days=7):
        """
        Fetch 7-day weather forecast from Meteomatics API
        Returns: list of daily forecasts with temperature, wind_speed, rainfall, and date
        """
        if not self.username or not self.password:
            raise ValueError("Meteomatics API credentials not configured")
        
        # Create time range for the next 7 days (one reading per day at noon)
        now = datetime.utcnow()
        time_strings = []
        
        for i in range(days):
            day = now + timedelta(days=i)
            # Get forecast at 12:00 UTC each day
            day_noon = day.replace(hour=12, minute=0, second=0, microsecond=0)
            time_strings.append(day_noon.isoformat() + 'Z')
        
        # Join timestamps with comma for multiple time points
        timestamps = ','.join(time_strings)
        
        # Parameters: temperature, wind speed, rainfall, and weather symbol
        parameters = 't_2m:C,wind_speed_10m:ms,precip_24h:mm,weather_symbol_1h:idx'
        
        # Build the API URL with multiple timestamps
        url = f"{self.base_url}/{timestamps}/{parameters}/{lat},{lon}/json"
        
        try:
            response = requests.get(
                url,
                auth=HTTPBasicAuth(self.username, self.password),
                timeout=15
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Initialize forecast array
            forecast_data = []
            
            # Parse the response - organize by date
            if 'data' in data:
                # Create a dictionary to group data by date
                dates_dict = {}
                
                for param in data['data']:
                    param_name = param['parameter']
                    coordinates = param['coordinates'][0]
                    
                    for date_entry in coordinates['dates']:
                        date_str = date_entry['date']
                        value = date_entry['value']
                        
                        if date_str not in dates_dict:
                            dates_dict[date_str] = {
                                'date': date_str,
                                'temperature': None,
                                'wind_speed': None,
                                'rainfall': None,
                                'weather_symbol': None
                            }
                        
                        # Map parameter to the correct field
                        if param_name == 't_2m:C':
                            dates_dict[date_str]['temperature'] = value
                        elif param_name == 'wind_speed_10m:ms':
                            dates_dict[date_str]['wind_speed'] = value
                        elif param_name == 'precip_24h:mm':
                            dates_dict[date_str]['rainfall'] = value
                        elif param_name == 'weather_symbol_1h:idx':
                            dates_dict[date_str]['weather_symbol'] = value
                
                # Convert dictionary to sorted list
                forecast_data = sorted(dates_dict.values(), key=lambda x: x['date'])
            
            return {
                'location': {
                    'lat': lat,
                    'lon': lon
                },
                'forecast': forecast_data
            }
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error fetching forecast data: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"Error parsing forecast data: {str(e)}")
    
    def fetch_forecast_probability(self, lat, lon, target_date_str, days_range=7):
        """
        Fetch weather forecast data for event planning (up to 30 days ahead)
        Analyzes forecast data to provide probability and risk assessment
        
        Args:
            lat, lon: Location coordinates
            target_date_str: Target date in format 'YYYY-MM-DD'
            days_range: Number of days around target date to analyze (default 7, max 30)
        
        Returns: Dictionary with forecast analysis and probability assessment
        """
        if not self.username or not self.password:
            raise ValueError("Meteomatics API credentials not configured")
        
        # Parse target date
        try:
            target_date = datetime.strptime(target_date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM-DD")
        
        # Check if target date is in the future
        now = datetime.utcnow()
        if target_date < now.replace(hour=0, minute=0, second=0, microsecond=0):
            raise ValueError("Target date must be in the future for forecast analysis")
        
        # Calculate days until target
        days_until_target = (target_date - now).days
        
        # Limit to API forecast capabilities (typically 30 days)
        if days_until_target > 30:
            raise ValueError("Target date is too far in future. Maximum 30 days ahead.")
        
        # Fetch forecast data for multiple days around target date
        # Get target day plus/minus range (e.g., 3 days before and after)
        range_days = min(days_range, days_until_target, 7)  # Max 7 days range
        
        forecast_temps = []
        forecast_winds = []
        forecast_rainfall = []
        time_strings = []
        forecast_details = []
        
        # Collect forecast data for the date range
        start_day = max(0, days_until_target - range_days // 2)
        end_day = min(30, days_until_target + range_days // 2 + 1)
        
        for day_offset in range(start_day, end_day):
            forecast_date = now + timedelta(days=day_offset)
            forecast_date = forecast_date.replace(hour=12, minute=0, second=0, microsecond=0)
            time_strings.append(forecast_date.isoformat() + 'Z')
        
        timestamps = ','.join(time_strings)
        parameters = 't_2m:C,wind_speed_10m:ms,precip_24h:mm,weather_symbol_1h:idx'
        url = f"{self.base_url}/{timestamps}/{parameters}/{lat},{lon}/json"
        
        try:
            response = requests.get(
                url,
                auth=HTTPBasicAuth(self.username, self.password),
                timeout=20
            )
            response.raise_for_status()
            data = response.json()
            
            # Parse and organize forecast data
            if 'data' in data:
                dates_dict = {}
                
                for param in data['data']:
                    param_name = param['parameter']
                    coordinates = param['coordinates'][0]
                    
                    for date_entry in coordinates['dates']:
                        date_str = date_entry['date']
                        value = date_entry['value']
                        
                        if date_str not in dates_dict:
                            dates_dict[date_str] = {
                                'date': date_str,
                                'temperature': None,
                                'wind_speed': None,
                                'rainfall': None,
                                'weather_symbol': None
                            }
                        
                        if param_name == 't_2m:C':
                            dates_dict[date_str]['temperature'] = value
                            if value is not None:
                                forecast_temps.append(value)
                        elif param_name == 'wind_speed_10m:ms':
                            dates_dict[date_str]['wind_speed'] = value
                            if value is not None:
                                forecast_winds.append(value)
                        elif param_name == 'precip_24h:mm':
                            dates_dict[date_str]['rainfall'] = value
                            if value is not None:
                                forecast_rainfall.append(value)
                        elif param_name == 'weather_symbol_1h:idx':
                            dates_dict[date_str]['weather_symbol'] = value
                
                # Convert to list and sort
                forecast_details = sorted(dates_dict.values(), key=lambda x: x['date'])
            
            # Calculate statistics and probabilities from forecast data
            result = {
                'location': {'lat': lat, 'lon': lon},
                'target_date': target_date_str,
                'days_analyzed': len(forecast_details),
                'analysis_type': 'forecast',
                'days_until_event': days_until_target,
                'forecast_range': forecast_details,
                'temperature': self._calculate_probabilities(forecast_temps, 'temperature'),
                'wind_speed': self._calculate_probabilities(forecast_winds, 'wind'),
                'rainfall': self._calculate_probabilities(forecast_rainfall, 'rainfall'),
            }
            
            return result
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error fetching forecast data: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"Error parsing forecast data: {str(e)}")
    
    def _calculate_probabilities(self, values, data_type):
        """Calculate statistical probabilities for weather conditions"""
        if not values or len(values) == 0:
            return {
                'mean': None,
                'median': None,
                'min': None,
                'max': None,
                'std_dev': None,
                'probabilities': {}
            }
        
        mean_val = statistics.mean(values)
        median_val = statistics.median(values)
        min_val = min(values)
        max_val = max(values)
        std_dev = statistics.stdev(values) if len(values) > 1 else 0
        
        # Calculate probabilities based on thresholds
        probabilities = {}
        
        if data_type == 'temperature':
            very_hot_count = sum(1 for v in values if v >= self.THRESHOLDS['very_hot'])
            very_cold_count = sum(1 for v in values if v <= self.THRESHOLDS['very_cold'])
            probabilities['very_hot'] = (very_hot_count / len(values)) * 100
            probabilities['very_cold'] = (very_cold_count / len(values)) * 100
            probabilities['comfortable'] = 100 - probabilities['very_hot'] - probabilities['very_cold']
            
        elif data_type == 'wind':
            very_windy_count = sum(1 for v in values if v >= self.THRESHOLDS['very_windy'])
            probabilities['very_windy'] = (very_windy_count / len(values)) * 100
            probabilities['calm'] = 100 - probabilities['very_windy']
            
        elif data_type == 'rainfall':
            very_wet_count = sum(1 for v in values if v >= self.THRESHOLDS['very_wet'])
            probabilities['very_wet'] = (very_wet_count / len(values)) * 100
            probabilities['dry'] = 100 - probabilities['very_wet']
        
        return {
            'mean': round(mean_val, 2),
            'median': round(median_val, 2),
            'min': round(min_val, 2),
            'max': round(max_val, 2),
            'std_dev': round(std_dev, 2),
            'probabilities': {k: round(v, 1) for k, v in probabilities.items()},
            'historical_values': values
        }