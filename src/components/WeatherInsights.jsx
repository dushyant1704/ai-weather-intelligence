import React from 'react'
import { LineChart, Sparkles, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { generateRecommendations } from '../utils/weatherUtils'

const WeatherInsights = ({ weatherData }) => {
  if (!weatherData) return null

  const recommendations = generateRecommendations(weatherData)

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={20} className="insight-type-icon warning" />
      case 'success':
        return <CheckCircle2 size={20} className="insight-type-icon success" />
      case 'info':
      default:
        return <Info size={20} className="insight-type-icon info" />
    }
  }

  return (
    <div className="weather-insights-card">
      <div className="card-section-title">
        <div className="title-with-icon">
          <LineChart size={20} className="title-icon-gold" />
          <h3>Weather Summary & Safety Notes</h3>
        </div>
        <span className="live-ai-badge">
          Data-Driven Summary
        </span>
      </div>

      <div className="insights-grid">
        {recommendations.map((rec, index) => (
          <div key={index} className={`insight-item-box ${rec.type}`}>
            <div className="insight-icon-col">{getInsightIcon(rec.type)}</div>
            <div className="insight-text-col">
              <h4 className="insight-item-title">{rec.title}</h4>
              <p className="insight-item-desc">{rec.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeatherInsights
