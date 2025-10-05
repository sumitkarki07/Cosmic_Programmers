def check_alert_conditions(weather_data):
    """
    Check if weather conditions exceed alert thresholds
    Returns: list of alert messages
    """
    alert_messages = []
    
    # Get weather values with defaults
    rainfall = weather_data.get('rainfall', 0) or 0
    wind_speed = weather_data.get('wind_speed', 0) or 0
    temperature = weather_data.get('temperature', 0) or 0

    # Check for heavy rainfall (> 30 mm/hr)
    if rainfall > 30:
        alert_messages.append({
            'type': 'rainfall',
            'severity': 'high',
            'message': f'⚠️ FLOOD ALERT: Heavy rainfall detected ({rainfall:.1f} mm/hr). Risk of flooding.'
        })
    
    # Check for high wind speed (> 20 m/s)
    if wind_speed > 20:
        alert_messages.append({
            'type': 'wind',
            'severity': 'high',
            'message': f'⚠️ STORM ALERT: High wind speed detected ({wind_speed:.1f} m/s). Dangerous conditions.'
        })
    
    # Check for extreme heat (> 38 °C)
    if temperature > 38:
        alert_messages.append({
            'type': 'heat',
            'severity': 'high',
            'message': f'⚠️ HEAT ALERT: Extreme temperature detected ({temperature:.1f} °C). Heat wave warning.'
        })
    
    # Add moderate warnings
    if 20 <= rainfall <= 30:
        alert_messages.append({
            'type': 'rainfall',
            'severity': 'moderate',
            'message': f'⚡ Moderate rainfall detected ({rainfall:.1f} mm/hr). Stay alert.'
        })
    
    if 15 <= wind_speed <= 20:
        alert_messages.append({
            'type': 'wind',
            'severity': 'moderate',
            'message': f'⚡ Strong winds detected ({wind_speed:.1f} m/s). Exercise caution.'
        })
    
    if 35 <= temperature <= 38:
        alert_messages.append({
            'type': 'heat',
            'severity': 'moderate',
            'message': f'⚡ High temperature detected ({temperature:.1f} °C). Stay hydrated.'
        })
    
    return alert_messages if alert_messages else [{
        'type': 'none',
        'severity': 'low',
        'message': '✅ No extreme weather conditions detected. Weather is normal.'
    }]