import React, { useState } from 'react'
import { formatTemperature, formatTime, getWeatherIcon } from '../utils/weatherUtils'

const WeatherChart = ({ forecastList = [], timezoneOffset = 0, unit = 'C' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (!forecastList || forecastList.length === 0) return null

  // Take upcoming 8 forecast points (24 hours)
  const pointsData = forecastList.slice(0, 8).map(item => ({
    time: formatTime(item.dt, timezoneOffset),
    temp: formatTemperature(item.main.temp, unit),
    rawTemp: item.main.temp,
    condition: item.weather && item.weather[0] ? item.weather[0].main : 'Clear',
    iconCode: item.weather && item.weather[0] ? item.weather[0].icon : '01d'
  }))

  const width = 600
  const height = 180
  const paddingX = 40
  const paddingTop = 35
  const paddingBottom = 40

  const temps = pointsData.map(p => p.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempSpan = Math.max(maxTemp - minTemp, 4) // minimum spread of 4 for layout spacing

  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingTop - paddingBottom

  // Compute (x, y) coordinates for each point
  const coords = pointsData.map((pt, idx) => {
    const x = paddingX + (idx / (pointsData.length - 1)) * chartWidth
    const normalizedY = (pt.temp - minTemp) / tempSpan
    const y = height - paddingBottom - normalizedY * chartHeight
    return { ...pt, x, y }
  })

  // Build SVG smooth path string using cardinal spline
  const pathD = coords.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`
    const prev = a[i - 1]
    const cp1x = prev.x + (point.x - prev.x) / 2
    const cp1y = prev.y
    const cp2x = prev.x + (point.x - prev.x) / 2
    const cp2y = point.y
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`
  }, '')

  // Gradient area path string
  const firstPt = coords[0]
  const lastPt = coords[coords.length - 1]
  const areaD = `${pathD} L ${lastPt.x},${height - paddingBottom} L ${firstPt.x},${height - paddingBottom} Z`

  return (
    <div className="weather-chart-section">
      <div className="chart-header">
        <h3 className="section-heading">24-Hour Temperature Trend</h3>
        <span className="chart-subhead">Interactive forecast curve</span>
      </div>

      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="weather-svg-chart">
          <defs>
            <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="tempLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--chart-primary)" />
              <stop offset="100%" stopColor="var(--accent-glow)" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#tempAreaGradient)" />

          {/* Horizontal Reference Lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="var(--chart-grid)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="var(--chart-grid)"
          />

          {/* Trend Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#tempLineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Data Points and Labels */}
          {coords.map((pt, i) => {
            const isHovered = hoveredIndex === i
            return (
              <g
                key={i}
                className="chart-point-group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Temperature Value Label */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  className="chart-temp-label"
                >
                  {pt.temp}°{unit}
                </text>

                {/* Point Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4.5}
                  className={`chart-dot ${isHovered ? 'hovered' : ''}`}
                />

                {/* Time Label */}
                <text
                  x={pt.x}
                  y={height - 15}
                  textAnchor="middle"
                  className="chart-time-label"
                >
                  {pt.time}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip overlay */}
        {hoveredIndex !== null && coords[hoveredIndex] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(coords[hoveredIndex].x / width) * 100}%`
            }}
          >
            <div className="tooltip-inner">
              <img
                src={getWeatherIcon(coords[hoveredIndex].iconCode, coords[hoveredIndex].condition)}
                alt="icon"
                className="tooltip-icon"
              />
              <div>
                <strong>{coords[hoveredIndex].temp}°{unit}</strong>
                <div>{coords[hoveredIndex].condition}</div>
                <small>{coords[hoveredIndex].time}</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherChart
