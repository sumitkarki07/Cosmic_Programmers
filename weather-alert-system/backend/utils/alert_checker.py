def check_alert_conditions(weather_data):
    alert_message = []

    # Check for rainfall
    if weather_data.get('precipitation', 0) > 30:
        alert_message.append("Alert: Heavy rainfall expected (> 30 mm/hr).")

    # Check for wind speed
    if weather_data.get('wind_speed', 0) > 20:
        alert_message.append("Alert: High wind speed detected (> 20 m/s).")

    # Check for temperature
    if weather_data.get('temperature', 0) > 38:
        alert_message.append("Alert: Extreme heat warning (> 38 °C).")

    return alert_message if alert_message else ["No extreme weather conditions."]