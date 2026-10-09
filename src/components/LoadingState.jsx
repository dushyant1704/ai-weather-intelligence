import React from 'react'

const LoadingState = ({ message = 'Fetching weather data...' }) => {
  return (
    <div className="loading-state-container" aria-live="polite">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>

      {/* Skeleton cards */}
      <div className="skeleton-grid">
        <div className="skeleton-card hero-skeleton"></div>
        <div className="skeleton-card grid-skeleton"></div>
      </div>
    </div>
  )
}

export default LoadingState
