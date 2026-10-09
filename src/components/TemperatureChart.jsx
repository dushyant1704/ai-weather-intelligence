import React from 'react'
import { TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { formatTemperature, formatTime } from '../utils/weatherUtils'

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-time">{label}</p>
        <p className="tooltip-temp">
          Temperature: <strong>{data.temp}°{unit}</strong>
        </p>
        <p className="tooltip-feels">
          Feels Like: <span>{data.feelsLike}°{unit}</span>
        </p>
        <p className="tooltip-cond">{data.condition}</p>
      </div>
    )
  }
  return null
}

const TemperatureChart = ({
  forecastList = [],
  timezoneOffset = 0,
  unit = 'C'
}) => {
  if (!Array.isArray(forecastList) || forecastList.length === 0) return null

  // Take first 8 forecast entries (~24h)
  const chartData = forecastList.slice(0, 8).map((item) => {
    const rawTemp = item.main.temp
    const displayTemp = formatTemperature(rawTemp, unit)
    const timeLabel = formatTime(item.dt, timezoneOffset)
    const condition = item.weather && item.weather[0] ? item.weather[0].main : 'Clear'

    return {
      time: timeLabel,
      temp: displayTemp,
      feelsLike: formatTemperature(item.main.feels_like, unit),
      condition
    }
  })

  return (
    <div className="temperature-chart-card">
      <div className="card-section-title">
        <div className="title-with-icon">
          <TrendingUp size={20} className="title-icon-gold" />
          <h3>24-Hour Temperature Trend</h3>
        </div>
        <span className="unit-badge">°{unit}</span>
      </div>

      <div className="chart-wrapper-box">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4EA4CC" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#4EA4CC" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(78, 164, 204, 0.15)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#4EA4CC"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#tempGradient)"
              activeDot={{ r: 6, fill: '#4EA4CC', stroke: '#E8F4FC', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TemperatureChart
