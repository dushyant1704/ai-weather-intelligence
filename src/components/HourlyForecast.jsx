import React from 'react'
import { Clock, Umbrella } from 'lucide-react'
import { getWeatherIcon, formatTemperature, formatTime } from '../utils/weatherUtils'

const HourlyForecast = ({
  forecastList = [],
  timezoneOffset = 0,
  unit = 'C'
}) => {
  if (!Array.isArray(forecastList) || forecastList.length === 0) return null

  // Slice first 8 three-hour steps (next 24 hours)
  const hourlyItems = forecastList.slice(0, 8)

  return (
    <div className="hourly-forecast-card">
      <div className="card-section-title">
        <div className="title-with-icon">
          <Clock size={20} className="title-icon-gold" />
          <h3>Hourly Forecast (24 Hours)</h3>
        </div>
        <span className="subtitle-hint">Scroll horizontal →</span>
      </div>

      <div className="hourly-timeline-container">
        {hourlyItems.map((item, idx) => {
          const mainCond = item.weather && item.weather[0] ? item.weather[0].main : 'Clear'
          const iconCode = item.weather && item.weather[0] ? item.weather[0].icon : '01d'
          const assetIcon = getWeatherIcon(iconCode, mainCond)
          const tempVal = formatTemperature(item.main.temp, unit)
          const timeStr = formatTime(item.dt, timezoneOffset)
          const pop = item.pop !== undefined ? Math.round(item.pop * 100) : 0

          return (
            <div key={idx} className="hourly-item-pill">
              <span className="time-label">{idx === 0 ? 'Now' : timeStr}</span>
              
              <img
                src={assetIcon}
                alt={mainCond}
                className="hourly-asset-icon"
              />

              <span className="temp-val">{tempVal}°{unit}</span>

              {pop > 0 ? (
                <div className="pop-badge" title="Precipitation Probability">
                  <Umbrella size={12} />
                  <span>{pop}%</span>
                </div>
              ) : (
                <span className="condition-short">{mainCond}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HourlyForecast
