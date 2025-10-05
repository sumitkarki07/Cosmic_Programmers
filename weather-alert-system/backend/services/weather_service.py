class WeatherService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.meteomatics.com"

    def fetch_weather_data(self, lat, lon):
        endpoint = f"{self.base_url}/weather?lat={lat}&lon={lon}&apikey={self.api_key}"
        response = requests.get(endpoint)

        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()