import React from 'react'
import { AlertCircle, RefreshCw, Search } from 'lucide-react'

const ErrorState = ({ message, onRetry, onSearchDefault }) => {
  return (
    <div className="error-state-card">
      <div className="error-icon-box">
        <AlertCircle size={48} className="error-svg-icon" />
      </div>

      <h3 className="error-headline">Unable to Load Weather Data</h3>
      <p className="error-description">
        {message || "We encountered an issue fetching live weather for this location."}
      </p>

      <div className="error-actions-row">
        {onRetry && (
          <button className="error-action-btn retry-btn" onClick={onRetry}>
            <RefreshCw size={16} /> Try Again
          </button>
        )}
        {onSearchDefault && (
          <button className="error-action-btn default-btn" onClick={onSearchDefault}>
            <Search size={16} /> Load Pune
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorState
