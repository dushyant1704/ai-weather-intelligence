import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Sun, Moon, Search, X, Loader2, Calendar } from 'lucide-react'
import searchIconAsset from '../assets/search.png'
import { formatCityLocalTime, formatCityLocalDate } from '../utils/weatherUtils'
import { searchLocations } from '../services/weatherApi'

const Header = ({
  theme,
  onToggleTheme,
  unit,
  onToggleUnit,
  onGeolocate,
  isLocating,
  onSearch,
  isLoading,
  timezoneOffset
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [suggestions, setSuggestions] = useState([])
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const searchContainerRef = useRef(null)

  // Ticking local clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Debounced search location suggestions fetch
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true)
      try {
        const results = await searchLocations(searchTerm)
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch (err) {
        console.warn('Search suggestions error:', err)
        setSuggestions([])
      } finally {
        setIsSearchingSuggestions(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setShowDropdown(false)
      if (suggestions.length > 0) {
        // If user submits form, select top-ranked candidate
        onSearch(suggestions[0])
      } else {
        onSearch(searchTerm.trim())
      }
    }
  }

  const handleSelectCandidate = (candidate) => {
    setSearchTerm(candidate.displayName)
    setShowDropdown(false)
    onSearch(candidate)
  }

  const handleClear = () => {
    setSearchTerm('')
    setSuggestions([])
    setShowDropdown(false)
  }

  // Centralized time and date formatting for active city's timezone
  const formattedTimeString = formatCityLocalTime(currentTime, timezoneOffset || 0, true)
  const formattedDateString = formatCityLocalDate(currentTime, timezoneOffset || 0)

  return (
    <header className="app-header">
      {/* Brand & Live Date Display */}
      <div className="header-brand-section">
        <div className="date-badge">
          <Calendar size={15} className="date-icon" />
          <span>{formattedDateString}</span>
          <span className="live-clock">{formattedTimeString}</span>
        </div>
      </div>

      {/* Center Search Bar & Dropdown */}
      <div className="header-search-container" ref={searchContainerRef}>
        <form className="header-search-form" onSubmit={handleSubmit}>
          <div className="search-input-box">
            {isSearchingSuggestions ? (
              <Loader2 className="animate-spin search-inline-icon" size={18} />
            ) : (
              <Search size={18} className="search-inline-icon" />
            )}
            <input
              type="text"
              className="header-search-input"
              placeholder="Search city or locality (e.g. Rau, Indore, Delhi, London)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true)
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={handleClear}
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="search-submit-button"
            disabled={isLoading || !searchTerm.trim()}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <img src={searchIconAsset} alt="Search" className="search-btn-img" />
            )}
          </button>
        </form>

        {/* Search Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="search-dropdown-menu">
            {suggestions.map((item, idx) => (
              <div
                key={`${item.lat}-${item.lon}-${idx}`}
                className="search-suggestion-item"
                onMouseDown={() => handleSelectCandidate(item)}
              >
                <MapPin size={16} className="suggestion-pin" />
                <div className="suggestion-info-box">
                  <span className="suggestion-name-title">{item.name}</span>
                  <span className="suggestion-sub-text">
                    {[item.state, item.country].filter(Boolean).join(', ')}
                  </span>
                </div>
                {item.country === 'IN' && (
                  <span className="in-country-pill">IN</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Geolocation, Unit Toggle, Theme Switcher */}
      <div className="header-actions">
        <button
          className="header-action-btn location-action"
          onClick={onGeolocate}
          disabled={isLocating}
          title="Use current geolocation"
        >
          {isLocating ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <MapPin size={16} />
          )}
          <span className="btn-label">{isLocating ? 'Locating...' : 'My Location'}</span>
        </button>

        <button
          className="header-action-btn unit-action"
          onClick={onToggleUnit}
          title="Toggle Temperature Unit"
        >
          <span className={`unit-toggle-pill ${unit === 'C' ? 'active' : ''}`}>°C</span>
          <span className="unit-slash">/</span>
          <span className={`unit-toggle-pill ${unit === 'F' ? 'active' : ''}`}>°F</span>
        </button>

        <button
          className="header-action-btn theme-action"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="theme-sun-icon" />
          ) : (
            <Moon size={18} className="theme-moon-icon" />
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
