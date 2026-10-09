import React from 'react'
import humidityIcon from '../assets/humidity.png'
import windIcon from '../assets/wind.png'
import { degreesToCardinal, formatTemperature, formatTime } from '../utils/weatherUtils'

const WeatherDetails = ({ weatherData, uvIndex, unit }) => {
  if (!weatherData) return null

  const {
    humidity,
    windSpeed,
    windDeg,
    pressure,
    visibility,
    feelsLike,
    sunrise,
    sunset,
    timezoneOffset
  } = weatherData

  const windCardinal = degreesToCardinal(windDeg)
  const displayFeelsLike = formatTemperature(feelsLike, unit)
  const sunriseTime = formatTime(sunrise, timezoneOffset)
  const sunsetTime = formatTime(sunset, timezoneOffset)

  // Calculate UV index label & risk level
  const getUVBadge = (uv) => {
    if (uv === null || uv === undefined) return { label: 'N/A', class: 'uv-none' }
    if (uv <= 2) return { label: 'Low', class: 'uv-low' }
    if (uv <= 5) return { label: 'Moderate', class: 'uv-mod' }
    if (uv <= 7) return { label: 'High', class: 'uv-high' }
    if (uv <= 10) return { label: 'Very High', class: 'uv-very-high' }
    return { label: 'Extreme', class: 'uv-extreme' }
  }

  const uvBadge = getUVBadge(uvIndex)

  return (
    <div className="weather-details-section">
      <h3 className="section-heading">Current Weather Metrics</h3>

      <div className="details-grid">
        {/* Humidity Card */}
        <div className="detail-card">
          <div className="card-icon-header">
            <img src={humidityIcon} alt="humidity" className="detail-card-img" />
            <span className="card-label">Humidity</span>
          </div>
          <div className="card-value-display">{humidity}%</div>
          <p className="card-subtext">
            {humidity > 70 ? 'High moisture' : humidity < 30 ? 'Dry air' : 'Comfortable'}
          </p>
        </div>

        {/* Wind Speed Card */}
        <div className="detail-card">
          <div className="card-icon-header">
            <img src={windIcon} alt="wind" className="detail-card-img" />
            <span className="card-label">Wind Speed</span>
          </div>
          <div className="card-value-display">
            {windSpeed} <span className="value-unit">km/h</span>
          </div>
          <p className="card-subtext">
            Direction: {windCardinal} ({windDeg}°)
          </p>
        </div>

        {/* Pressure Card */}
        <div className="detail-card">
          <div className="card-icon-header">
            <span className="detail-emoji">🧭</span>
            <span className="card-label">Pressure</span>
          </div>
          <div className="card-value-display">
            {pressure} <span className="value-unit">hPa</span>
          </div>
          <p className="card-subtext">
            {pressure > 1013 ? 'High pressure' : 'Normal / Low pressure'}
          </p>
        </div>

        {/* Visibility Card */}
        <div className="detail-card">
          <div className="card-icon-header">
            <span className="detail-emoji">👁️</span>
            <span className="card-label">Visibility</span>
          </div>
          <div className="card-value-display">
            {visibility.toFixed(1)} <span className="value-unit">km</span>
          </div>
          <p className="card-subtext">
            {visibility >= 10 ? 'Clear view' : 'Limited visibility'}
          </p>
        </div>

        {/* Feels Like Card */}
        <div className="detail-card">
          <div className="card-icon-header">
            <span className="detail-emoji">🌡️</span>
            <span className="card-label">Feels Like</span>
          </div>
          <div className="card-value-display">
            {displayFeelsLike}°<span className="value-unit">{unit}</span>
          </div>
          <p className="card-subtext">Thermal sensation</p>
        </div>

        {/* UV Index Card */}
        <div className="detail-card">
          <div className="card-icon-header">
            <span className="detail-emoji">☀️</span>
            <span className="card-label">UV Index</span>
          </div>
          <div className="card-value-display">
            {uvIndex !== null ? uvIndex : '--'}
            {uvIndex !== null && (
              <span className={`uv-chip ${uvBadge.class}`}>{uvBadge.label}</span>
            )}
          </div>
          <p className="card-subtext">Solar radiation protection</p>
        </div>
      </div>

      {/* Sun Times Bar */}
      <div className="sun-times-bar">
        <div className="sun-item">
          <span className="sun-icon">🌅</span>
          <div>
            <span className="sun-label">Sunrise</span>
            <span className="sun-time">{sunriseTime}</span>
          </div>
        </div>
        <div className="sun-divider"></div>
        <div className="sun-item">
          <span className="sun-icon">🌇</span>
          <div>
            <span className="sun-label">Sunset</span>
            <span className="sun-time">{sunsetTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherDetails
