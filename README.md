# 🌤️ Weather Event Planner

A real-time weather monitoring and event planning system that uses NASA Earth observation data to help users plan outdoor activities with confidence.

## 🌟 Features

- **📍 Location-based Weather Data**: Search any location worldwide
- **🗺️ Interactive Map**: Visual representation of searched location
- **📊 Weather Probability Analysis**: Historical data analysis for event planning
- **📅 7-Day Forecast**: Extended weather predictions
- **📱 Mobile Responsive**: Works on all device sizes
- **⚡ Real-time Updates**: Live weather data using Meteomatics API
- **💾 Data Export**: Download weather data in CSV or JSON format
- **🔔 Weather Alerts**: Real-time extreme weather notifications



## 🛠️ Tech Stack

- **Frontend**:
  - HTML5, CSS3, JavaScript
  - Tailwind CSS
  - Leaflet.js for maps
  - Font Awesome icons

- **Backend**:
  - Python
  - Flask
  - Meteomatics API integration

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sumitkarki07/weather-alert-system.git
   cd weather-alert-system
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Add your Meteomatics API credentials to .env
   ```

3. **Run the application**:
   ```bash
   # Start backend (from backend directory)
   python app.py

   # Open frontend
   cd ../frontend
   # Use a local server or open index.html in browser
   ```

## 🔑 Environment Variables

Create a `.env` file in the backend directory:
```
METEOMATICS_API_USERNAME=your_username
METEOMATICS_API_PASSWORD=your_password
METEOMATICS_API_URL=https://api.meteomatics.com
DEBUG=True
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🎯 NASA Space Apps Challenge 2025

This project was developed for the NASA Space Apps Challenge 2025 under the "Will It Rain on My Parade?" challenge category.

## 👥 Team Cosmic Programmers

- [Sachin Shrestha](https://github.com/shrestha-sachin)
- [Sumit Karki](https://github.com/sumitkarki07)




## 📞 Contact

Email: sumitkarki49@gmail.com / sachinstha600@gmail.com


## 🙏 Acknowledgments

- [NASA Earth Observation Data](https://www.nasa.gov/earth)
- [Meteomatics API](https://www.meteomatics.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet.js](https://leafletjs.com/)
