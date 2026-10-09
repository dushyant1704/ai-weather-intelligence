import React from 'react'
import { Star, MapPin, Thermometer, ArrowUp, ArrowDown } from 'lucide-react'
import { getWeatherIcon, formatTemperature } from '../utils/weatherUtils'
import humidityAsset from '../assets/humidity.png'
import windAsset from '../assets/wind.png'

const CurrentWeather = ({
  weatherData,
  unit = 'C',
  isFavorite,
  onToggleFavorite
}) => {
  if (!weatherData) return null

  const {
    cityName,
    state,
    country,
    temperature,
    feelsLike,
    tempMin,
    tempMax,
    humidity,
    windSpeed,
    weatherCondition,
    weatherDescription,
    iconCode
  } = weatherData

  const mainIconAsset = getWeatherIcon(iconCode, weatherCondition)
  const formattedTemp = formatTemperature(temperature, unit)
  const formattedFeelsLike = formatTemperature(feelsLike, unit)
  const formattedMin = formatTemperature(tempMin, unit)
  const formattedMax = formatTemperature(tempMax, unit)

  const locationSubtitle = [state, country].filter(Boolean).join(', ')

  return (
    <div className="current-weather-hero">
      <div className="hero-backdrop-glow" />

      {/* Top Header Row */}
      <div className="hero-header-row">
        <div className="location-info">
          <div className="city-headline">
            <MapPin size={22} className="pin-icon" />
            <h1 className="city-name">{cityName}</h1>
            {locationSubtitle && <span className="country-badge">{locationSubtitle}</span>}
          </div>
          <p className="condition-subtext">{weatherDescription}</p>
        </div>

        <div className="hero-top-right-actions">
          <button
            className={`favorite-star-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(cityName)}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star size={18} fill={isFavorite ? "#f59e0b" : "none"} color={isFavorite ? "#f59e0b" : "currentColor"} />
            <span className="fav-label">{isFavorite ? "Saved" : "Save City"}</span>
          </button>
        </div>
      </div>

      {/* Main Temp & Icon Display */}
      <div className="hero-main-content">
        <div className="hero-icon-container">
          <img
            src={mainIconAsset}
            alt={weatherCondition}
            className="hero-weather-asset"
          />
        </div>

        <div className="hero-temperature-display">
          <div className="temp-large-box">
            <span className="temp-number">{formattedTemp}</span>
            <span className="temp-degree-unit">°{unit}</span>
          </div>

          <div className="feels-like-row">
            <Thermometer size={16} className="feels-icon" />
            <span>Feels like {formattedFeelsLike}°{unit}</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="hero-stats-footer">
        <div className="stat-item range-item">
          <div className="range-pills">
            <span className="range-pill min-pill">
              <ArrowDown size={14} /> Min {formattedMin}°{unit}
            </span>
            <span className="range-pill max-pill">
              <ArrowUp size={14} /> Max {formattedMax}°{unit}
            </span>
          </div>
        </div>

        <div className="stat-item quick-metric">
          <img src={humidityAsset} alt="Humidity" className="stat-asset-icon" />
          <div className="metric-text">
            <span className="metric-val">{humidity}%</span>
            <span className="metric-lbl">Humidity</span>
          </div>
        </div>

        <div className="stat-item quick-metric">
          <img src={windAsset} alt="Wind Speed" className="stat-asset-icon" />
          <div className="metric-text">
            <span className="metric-val">{windSpeed} km/h</span>
            <span className="metric-lbl">Wind Speed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
