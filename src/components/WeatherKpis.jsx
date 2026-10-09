import React from 'react'
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun
} from 'lucide-react'
import {
  formatTemperature,
  degreesToCardinal,
  getHumidityLabel,
  getPressureLabel,
  getVisibilityLabel,
  getUVLabel
} from '../utils/weatherUtils'
import humidityAsset from '../assets/humidity.png'
import windAsset from '../assets/wind.png'

const WeatherKpis = ({ weatherData, uvIndex, unit = 'C' }) => {
  if (!weatherData) return null

  const {
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    windDeg,
    pressure,
    visibility
  } = weatherData

  const tempVal = formatTemperature(temperature, unit)
  const feelsVal = formatTemperature(feelsLike, unit)
  const cardinalWind = degreesToCardinal(windDeg)

  const humidityRating = getHumidityLabel(humidity)
  const pressureRating = getPressureLabel(pressure)
  const visibilityRating = getVisibilityLabel(visibility)
  const uvBadge = getUVLabel(uvIndex)

  const kpiItems = [
    {
      id: 'temp',
      title: 'Temperature',
      icon: Thermometer,
      asset: null,
      value: tempVal !== 'N/A' ? `${tempVal}°${unit}` : 'N/A',
      subtext: feelsVal !== 'N/A' ? `Feels like ${feelsVal}°${unit}` : 'N/A',
      accent: 'var(--accent-gold)'
    },
    {
      id: 'humidity',
      title: 'Humidity',
      icon: Droplets,
      asset: humidityAsset,
      value: humidity !== null && humidity !== undefined ? `${humidity}%` : 'N/A',
      subtext: humidityRating,
      accent: '#38bdf8'
    },
    {
      id: 'wind',
      title: 'Wind Speed',
      icon: Wind,
      asset: windAsset,
      value: windSpeed !== null && windSpeed !== undefined ? `${windSpeed} km/h` : 'N/A',
      subtext: `Direction: ${cardinalWind}`,
      accent: '#06b6d4'
    },
    {
      id: 'pressure',
      title: 'Air Pressure',
      icon: Gauge,
      asset: null,
      value: pressure !== null && pressure !== undefined ? `${pressure} hPa` : 'N/A',
      subtext: pressureRating,
      accent: '#a855f7'
    },
    {
      id: 'visibility',
      title: 'Visibility',
      icon: Eye,
      asset: null,
      value: visibility !== null && visibility !== undefined ? `${visibility} km` : 'N/A',
      subtext: visibilityRating,
      accent: '#10b981'
    },
    {
      id: 'uv',
      title: 'UV Index',
      icon: Sun,
      asset: null,
      value: uvIndex !== null && uvIndex !== undefined ? `${uvIndex}` : 'N/A',
      subtext: uvBadge.label,
      badgeClass: uvBadge.cls,
      accent: '#f59e0b'
    }
  ]

  return (
    <div className="weather-kpi-grid">
      {kpiItems.map((item) => {
        const IconComponent = item.icon
        return (
          <div key={item.id} className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-title-box">
                {item.asset ? (
                  <img src={item.asset} alt={item.title} className="kpi-png-asset" />
                ) : (
                  <IconComponent size={20} style={{ color: item.accent }} />
                )}
                <span className="kpi-title">{item.title}</span>
              </div>
              {item.badgeClass && (
                <span className={`kpi-badge ${item.badgeClass}`}>
                  {item.subtext}
                </span>
              )}
            </div>

            <div className="kpi-body">
              <span className="kpi-value">{item.value}</span>
              {!item.badgeClass && (
                <span className="kpi-subtext">{item.subtext}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WeatherKpis
