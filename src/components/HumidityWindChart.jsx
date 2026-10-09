import React, { useState } from 'react'
import { Droplets, Wind } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { formatTime } from '../utils/weatherUtils'

const HumidityWindChart = ({ forecastList = [], timezoneOffset = 0 }) => {
  const [activeMetric, setActiveMetric] = useState('humidity') // 'humidity' or 'wind'

  if (!Array.isArray(forecastList) || forecastList.length === 0) return null

  const chartData = forecastList.slice(0, 8).map((item) => ({
    time: formatTime(item.dt, timezoneOffset),
    humidity: item.main.humidity,
    wind: Math.round((item.wind ? (item.wind.speedKmH || item.wind.speed * 3.6) : 0) * 10) / 10
  }))

  const isHumidity = activeMetric === 'humidity'

  return (
    <div className="humidity-wind-chart-card">
      <div className="card-section-title">
        <div className="title-with-icon">
          {isHumidity ? (
            <Droplets size={20} className="title-icon-blue" />
          ) : (
            <Wind size={20} className="title-icon-cyan" />
          )}
          <h3>{isHumidity ? 'Humidity Trend' : 'Wind Speed Trend'}</h3>
        </div>

        <div className="chart-metric-switcher">
          <button
            className={`metric-tab ${activeMetric === 'humidity' ? 'active' : ''}`}
            onClick={() => setActiveMetric('humidity')}
          >
            Humidity (%)
          </button>
          <button
            className={`metric-tab ${activeMetric === 'wind' ? 'active' : ''}`}
            onClick={() => setActiveMetric('wind')}
          >
            Wind (km/h)
          </button>
        </div>
      </div>

      <div className="chart-wrapper-box">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(78, 164, 204, 0.15)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-elevated)',
                borderColor: 'var(--border)',
                borderRadius: '12px',
                color: 'var(--text-primary)'
              }}
            />
            {isHumidity ? (
              <Line
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#4EA4CC"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4EA4CC' }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="wind"
                name="Wind (km/h)"
                stroke="#A8C8E0"
                strokeWidth={3}
                dot={{ r: 4, fill: '#A8C8E0' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default HumidityWindChart
