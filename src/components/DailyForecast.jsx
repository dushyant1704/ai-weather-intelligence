import React from 'react'
import { Calendar, Umbrella, Wind, Droplets } from 'lucide-react'
import { groupForecastByDay, getWeatherIcon, formatTemperature } from '../utils/weatherUtils'

const DailyForecast = ({
  forecastList = [],
  timezoneOffset = 0,
  unit = 'C'
}) => {
  const dailyData = groupForecastByDay(forecastList, timezoneOffset)

  if (!dailyData || dailyData.length === 0) return null

  // Global min/max for scale bar
  const globalMin = Math.min(...dailyData.map(d => d.minTemp))
  const globalMax = Math.max(...dailyData.map(d => d.maxTemp))
  const tempRange = Math.max(1, globalMax - globalMin)

  return (
    <div className="daily-forecast-card">
      <div className="card-section-title">
        <div className="title-with-icon">
          <Calendar size={20} className="title-icon-gold" />
          <h3>5-Day Forecast</h3>
        </div>
      </div>

      <div className="daily-list-container">
        {dailyData.map((day, idx) => {
          const assetIcon = getWeatherIcon(day.iconCode, day.dominantCondition)
          const minVal = formatTemperature(day.minTemp, unit)
          const maxVal = formatTemperature(day.maxTemp, unit)

          // Calculate temperature range bar positions (%)
          const leftPercent = Math.max(0, Math.min(80, ((day.minTemp - globalMin) / tempRange) * 100))
          const widthPercent = Math.max(15, Math.min(100 - leftPercent, ((day.maxTemp - day.minTemp) / tempRange) * 100))

          return (
            <div key={idx} className="daily-row-item">
              <div className="day-name-col">
                <span className="day-title">{day.dayName}</span>
                <span className="day-condition">{day.dominantCondition}</span>
              </div>

              <div className="day-icon-col">
                <img src={assetIcon} alt={day.dominantCondition} className="daily-asset-icon" />
              </div>

              <div className="day-metrics-col">
                {day.pop > 0 && (
                  <span className="metric-chip rain-chip">
                    <Umbrella size={12} /> {day.pop}%
                  </span>
                )}
                <span className="metric-chip humidity-chip">
                  <Droplets size={12} /> {day.avgHumidity}%
                </span>
                <span className="metric-chip wind-chip">
                  <Wind size={12} /> {day.avgWind}k
                </span>
              </div>

              <div className="day-temp-bar-col">
                <span className="temp-val min">{minVal}°</span>
                <div className="temp-bar-track">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`
                    }}
                  />
                </div>
                <span className="temp-val max">{maxVal}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DailyForecast
