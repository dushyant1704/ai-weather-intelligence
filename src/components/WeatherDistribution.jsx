import React from 'react'
import { PieChart as PieIcon } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { calculateWeatherDistribution } from '../utils/weatherUtils'

const WeatherDistribution = ({ forecastList = [] }) => {
  const distributionData = calculateWeatherDistribution(forecastList)

  return (
    <div className="weather-distribution-card">
      <div className="card-section-title">
        <div className="title-with-icon">
          <PieIcon size={20} className="title-icon-gold" />
          <h3>Forecast Conditions Breakdown</h3>
        </div>
      </div>

      <div className="distribution-content-row">
        <div className="donut-chart-box">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`${val}%`, 'Frequency']}
                contentStyle={{
                  backgroundColor: 'var(--card-bg-solid)',
                  borderColor: 'var(--card-border)',
                  borderRadius: '10px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="distribution-legend">
          {distributionData.map((item, idx) => (
            <div key={idx} className="legend-row">
              <span className="legend-color-dot" style={{ backgroundColor: item.color }} />
              <span className="legend-label">{item.name}</span>
              <span className="legend-percentage">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WeatherDistribution
