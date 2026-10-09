import React, { useState } from 'react'
import searchIcon from '../assets/search.png'

const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setValidationError('Please enter a city name')
      return
    }
    setValidationError('')
    onSearch(trimmed)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    if (validationError) setValidationError('')
  }

  const handleClear = () => {
    setQuery('')
    setValidationError('')
  }

  return (
    <div className="search-bar-container">
      <form className={`search-form ${validationError ? 'has-error' : ''}`} onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search city name (e.g. Tokyo, London, Paris)..."
            value={query}
            onChange={handleChange}
            disabled={isLoading}
            aria-label="City Search"
          />
          {query && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={handleClear}
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          className="search-submit-btn"
          disabled={isLoading}
          aria-label="Search button"
        >
          {isLoading ? (
            <span className="spinner-sm"></span>
          ) : (
            <img src={searchIcon} alt="search" className="search-icon-img" />
          )}
        </button>
      </form>
      {validationError && <p className="validation-message">{validationError}</p>}
    </div>
  )
}

export default SearchBar
