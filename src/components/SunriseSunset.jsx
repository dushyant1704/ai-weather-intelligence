import React from 'react'
import { Sunrise, Sunset, Sun } from 'lucide-react'
import { formatTime, calculateSunProgress } from '../utils/weatherUtils'

const SunriseSunset = ({
  sunrise,
  sunset,
  timezoneOffset = 0
}) => {
  if (!sunrise || !sunset) return null

  const sunriseTimeStr = formatTime(sunrise, timezoneOffset)
  const sunsetTimeStr = formatTime(sunset, timezoneOffset)
  const sunProgress = calculateSunProgress(sunrise, sunset)

  // Total daylight calculation
  const totalSeconds = Math.max(0, sunset - sunrise)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return (
    <div className="sunrise-sunset-card">
      <div className="card-section-title">
        <div className="title-with-icon">
          <Sun size={20} className="title-icon-gold" />
          <h3>Sun & Daylight Trajectory</h3>
        </div>
        <span className="daylight-duration-pill">
          {hours}h {minutes}m Daylight
        </span>
      </div>

      <div className="arc-visual-container">
        <div className="arc-track-svg-box">
          <svg viewBox="0 0 200 100" className="sun-arc-svg">
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="var(--card-border)"
              strokeWidth="4"
              strokeDasharray="4 4"
            />
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="4"
              strokeDasharray="250"
              strokeDashoffset={250 - (250 * sunProgress) / 100}
            />
          </svg>

          {/* Animated Sun Marker on Arc */}
          <div
            className="sun-position-marker"
            style={{
              left: `${10 + (sunProgress * 0.8)}%`,
              bottom: `${Math.sin((sunProgress * Math.PI) / 100) * 65 + 10}px`
            }}
          >
            <Sun size={22} className="sun-glowing-icon" />
          </div>
        </div>

        <div className="sun-times-row">
          <div className="sun-time-box">
            <Sunrise size={22} className="sunrise-icon" />
            <div>
              <span className="sun-label">Sunrise</span>
              <span className="sun-val">{sunriseTimeStr}</span>
            </div>
          </div>

          <div className="sun-time-box">
            <Sunset size={22} className="sunset-icon" />
            <div>
              <span className="sun-label">Sunset</span>
              <span className="sun-val">{sunsetTimeStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SunriseSunset
