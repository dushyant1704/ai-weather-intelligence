import React from 'react'
import { Star, X, MapPin } from 'lucide-react'

const FavoriteCities = ({
  favorites = [],
  onSelectCity,
  onRemoveFavorite,
  activeCity
}) => {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="favorites-empty-box">
        <Star size={18} className="star-empty-icon" />
        <span>No saved favorite locations yet. Click the star on any city hero card to add.</span>
      </div>
    )
  }

  return (
    <div className="favorite-cities-section">
      <div className="card-section-title">
        <div className="title-with-icon">
          <Star size={20} className="title-icon-gold" fill="#f59e0b" />
          <h3>Favorite Locations</h3>
        </div>
      </div>

      <div className="favorites-grid">
        {favorites.map((city) => {
          const isActive = activeCity && activeCity.toLowerCase() === city.toLowerCase()
          return (
            <div
              key={city}
              className={`favorite-card-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCity(city)}
            >
              <div className="fav-card-info">
                <MapPin size={16} className="fav-pin-icon" />
                <span className="fav-city-title">{city}</span>
              </div>
              <button
                className="fav-remove-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFavorite(city)
                }}
                title="Remove from favorites"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FavoriteCities
