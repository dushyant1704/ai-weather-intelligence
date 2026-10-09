import React from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { generateWeatherAlerts } from '../utils/weatherUtils'

const WeatherAlerts = ({ weatherData }) => {
  if (!weatherData) return null

  const alerts = generateWeatherAlerts(weatherData)

  return (
    <div className="weather-alerts-section">
      <div className="card-section-title">
        <div className="title-with-icon">
          <AlertTriangle size={20} className="title-icon-gold" />
          <h3>Active Weather Alerts & Advisories</h3>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts-card">
          <ShieldCheck size={28} className="shield-icon" />
          <div>
            <h4>No Severe Weather Warnings Active</h4>
            <p>Weather conditions in {weatherData.cityName} are within normal safety parameters.</p>
          </div>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert-banner ${alert.severity}`}>
              <AlertTriangle size={24} className="alert-banner-icon" />
              <div className="alert-content">
                <div className="alert-header-row">
                  <h4 className="alert-title">{alert.title}</h4>
                  <span className={`severity-badge ${alert.severity}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="alert-message">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WeatherAlerts
