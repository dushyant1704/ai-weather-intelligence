import React from 'react'
import { History, Trash2, Search } from 'lucide-react'

const RecentSearches = ({
  searches = [],
  onSelectCity,
  onClearHistory,
  activeCity
}) => {
  if (!searches || searches.length === 0) return null

  return (
    <div className="recent-searches-section">
      <div className="card-section-title">
        <div className="title-with-icon">
          <History size={18} className="title-icon-gold" />
          <h3>Recent Searches</h3>
        </div>
        <button className="clear-history-link" onClick={onClearHistory}>
          <Trash2 size={12} /> Clear History
        </button>
      </div>

      <div className="recent-pills-row">
        {searches.map((city) => {
          const isActive = activeCity && activeCity.toLowerCase() === city.toLowerCase()
          return (
            <button
              key={city}
              className={`recent-search-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCity(city)}
            >
              <Search size={12} className="pill-search-icon" />
              <span>{city}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RecentSearches
