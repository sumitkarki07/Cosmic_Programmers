# 🌤️ Weather Event Planner

**NASA Space Apps Challenge 2025 - Tell Us a Climate Story!**

Plan your perfect outdoor activity with data-driven weather insights using historical NASA Earth observation data.

---

## 🎯 What Is This?

A comprehensive weather analysis platform that helps you plan outdoor activities months in advance by analyzing **years of historical weather data**. Unlike traditional forecasts (1-2 weeks), our tool shows you the **probability** of extreme conditions for any future date based on historical patterns.

Perfect for planning:
- 🏖️ Vacations & Holidays  
- 🥾 Hiking & Camping
- 🎣 Fishing Trips
- 💒 Outdoor Weddings
- 🏃 Athletic Events
- 🌾 Agricultural Activities

## ✨ Three Powerful Modes

### 1. 📊 Event Planning (Challenge Feature!)
- **Historical Probability Analysis** using 3-10 years of data
- **Risk Assessment** for temperature, wind, and rainfall
- **Statistical Insights**: mean, median, range, std deviation
- **Smart Recommendations** based on suitability scores
- **Data Export** in CSV or JSON format

### 2. ��️ Current Weather
- Real-time conditions worldwide
- Automatic extreme weather alerts
- Interactive maps

### 3. 📅 7-Day Forecast
- Extended predictions
- Daily extreme event analysis
- Color-coded severity indicators

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Configure API credentials
cp .env.example .env
# Edit .env with your Meteomatics credentials

# 3. Start server
python app.py

# 4. Open browser
open http://127.0.0.1:5001/../frontend/index.html
```

## 📖 How to Use Event Planning

1. Click **"Event Planning"** tab
2. Enter location and target date
3. Select years of historical data (5-7 recommended)
4. Click **"Analyze Weather Probability"**
5. Review probability statistics and recommendations
6. Download data in CSV or JSON format

## 📊 Weather Thresholds

| Condition | Threshold |
|-----------|-----------|
| Very Hot | ≥ 35°C (95°F) |
| Very Cold | ≤ 0°C (32°F) |
| Very Windy | ≥ 15 m/s (34 mph) |
| Very Wet | ≥ 10 mm/day |

## 🔧 API Endpoints

```bash
# Historical Probability
GET /api/probability?lat={lat}&lon={lon}&date={YYYY-MM-DD}&years={5}

# Current Weather
GET /api/weather?lat={lat}&lon={lon}

# 7-Day Forecast
GET /api/forecast?lat={lat}&lon={lon}&days={7}
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast setup guide
- **[EVENT_PLANNING_SETUP.md](./EVENT_PLANNING_SETUP.md)** - Technical documentation
- **[NASA_CHALLENGE_SUBMISSION.md](./NASA_CHALLENGE_SUBMISSION.md)** - Challenge details

## 🧪 Testing

```bash
# Test all endpoints
python backend/test_api.py

# Test probability specifically
python backend/test_probability.py
```

## 💡 What Makes It Special

✅ **Probability-Based**: Not forecasts, but historical likelihood  
✅ **Long-Range Planning**: Months or years in advance  
✅ **Customizable Thresholds**: Adapt to any climate  
✅ **Data Export**: Full transparency (CSV/JSON)  
✅ **NASA Data**: Earth observation powered  
✅ **Multi-Year Analysis**: 3-10 years configurable

## 🛠️ Tech Stack

**Backend**: Flask, Python, Meteomatics API  
**Frontend**: HTML5, Tailwind CSS, JavaScript, Leaflet.js  
**Data**: NASA Earth Observation via Meteomatics

## 📁 Project Structure

```
weather-alert-system/
├── backend/
│   ├── app.py                      # Flask API
│   ├── services/weather_service.py # Data fetching
│   ├── test_probability.py         # Tests
│   └── requirements.txt
├── frontend/
│   ├── index.html                  # UI
│   └── js/app.js                   # Logic
└── docs/                           # Documentation
```

## 🐛 Troubleshooting

**Server won't start?**
```bash
lsof -ti:5001 | xargs kill -9
python backend/app.py
```

**API credentials error?**
- Check `.env` file exists in `backend/` directory
- Verify credentials are correct

**No data returned?**
- Try a major city first
- Ensure your API plan includes historical data

## 🎯 NASA Challenge Criteria

✅ **Personalized queries**: Custom location, date, analysis period  
✅ **Multiple variables**: Temperature, wind, rainfall  
✅ **Visual representation**: Probability bars, statistics, colors  
✅ **Data download**: CSV and JSON export  
✅ **Historical data**: Multi-year NASA data analysis  
✅ **Probability analysis**: Clear percentages for each condition  
✅ **User-friendly**: Intuitive interface, mobile responsive

## 🌟 Future Enhancements

- Climate trend analysis
- Multi-location comparison
- Activity-specific recommendations
- Social sharing
- Mobile apps

## 👥 Team

**Cosmic Programmers**  
NASA Space Apps Challenge 2025

## 🙏 Acknowledgments

- NASA for Earth observation data
- Meteomatics for API access
- OpenStreetMap for geocoding
- Space Apps Challenge organizers

---

**Made with ❤️ for NASA Space Apps Challenge 2025**

*Plan smarter. Stay safer. Enjoy outdoor experiences with data-driven insights!* 🌤️
