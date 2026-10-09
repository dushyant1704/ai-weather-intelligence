import React, { useState, useEffect } from 'react'
import { GitCompare, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { fetchCurrentWeather, fetchUVIndex } from '../services/weatherApi'
import { formatTemperature, degreesToCardinal, getWeatherIcon } from '../utils/weatherUtils'

const CityComparison = ({
  defaultCities = ['Pune', 'Mumbai', 'Delhi'],
  unit = 'C',
  onSelectCity
}) => {
  const [cityNames, setCityNames] = useState(defaultCities)
  const [comparisonData, setComparisonData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [newCityInput, setNewCityInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const loadComparison = async () => {
      setIsLoading(true)
      setErrorMsg('')
      try {
        const results = await Promise.all(
          cityNames.map(async (city) => {
            try {
              const data = await fetchCurrentWeather(city)
              let uv = null
              if (data.coord && data.coord.lat) {
                uv = await fetchUVIndex(data.coord.lat, data.coord.lon)
              }
              return { ...data, uvIndex: uv }
            } catch (err) {
              console.warn('Failed to load comparison data for city:', city, err)
              return null
            }
          })
        )
        setComparisonData(results.filter(Boolean))
      } catch (err) {
        console.error('Error fetching comparison data:', err)
        setErrorMsg('Failed to load comparison data')
      } finally {
        setIsLoading(false)
      }
    }

    if (cityNames.length > 0) {
      loadComparison()
    }
  }, [cityNames])

  const handleAddCity = (e) => {
    e.preventDefault()
    if (!newCityInput.trim()) return
    const trimmed = newCityInput.trim()
    if (cityNames.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('City already added to comparison matrix')
      return
    }
    if (cityNames.length >= 4) {
      setErrorMsg('Maximum 4 cities can be compared at once')
      return
    }
    setCityNames([...cityNames, trimmed])
    setNewCityInput('')
    setErrorMsg('')
  }

  const handleRemoveCity = (cityToRemove) => {
    setCityNames(cityNames.filter(c => c.toLowerCase() !== cityToRemove.toLowerCase()))
  }

  return (
    <div className="city-comparison-section">
      <div className="card-section-title">
        <div className="title-with-icon">
          <GitCompare size={20} className="title-icon-gold" />
          <h3>Live City Weather Comparison Matrix</h3>
        </div>
      </div>

      {/* Add City Input Form */}
      <form onSubmit={handleAddCity} className="comparison-add-form">
        <input
          type="text"
          className="comparison-input"
          placeholder="Add city to compare (e.g. Paris, Delhi)..."
          value={newCityInput}
          onChange={(e) => setNewCityInput(e.target.value)}
        />
        <button type="submit" className="comparison-add-btn">
          <Plus size={16} /> Add City
        </button>
      </form>

      {errorMsg && <p className="comparison-error-text">{errorMsg}</p>}

      {isLoading ? (
        <div className="comparison-loading-box">
          <Loader2 className="animate-spin" size={24} />
          <span>Fetching comparison data...</span>
        </div>
      ) : (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="metric-header-cell">Weather Parameter</th>
                {comparisonData.map((cityData) => {
                  const iconAsset = getWeatherIcon(cityData.iconCode, cityData.weatherCondition)
                  return (
                    <th key={cityData.cityName} className="city-header-cell">
                      <div className="city-header-inner">
                        <img src={iconAsset} alt={cityData.weatherCondition} className="table-city-icon" />
                        <span className="table-city-name">{cityData.cityName}</span>
                        <div className="header-actions-sub">
                          <button
                            className="view-city-btn"
                            onClick={() => onSelectCity(cityData.cityName)}
                            title="Load full weather dashboard"
                          >
                            <ArrowRight size={14} /> View
                          </button>
                          <button
                            className="remove-city-btn"
                            onClick={() => handleRemoveCity(cityData.cityName)}
                            title="Remove city"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="metric-label-cell">Temperature</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell bold-val">
                    {formatTemperature(c.temperature, unit)}°{unit}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label-cell">Condition</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell">
                    {c.weatherCondition}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label-cell">Feels Like</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell">
                    {formatTemperature(c.feelsLike, unit)}°{unit}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label-cell">Humidity</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell">
                    {c.humidity}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label-cell">Wind Speed</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell">
                    {c.windSpeed} km/h ({degreesToCardinal(c.windDeg)})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label-cell">Air Pressure</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell">
                    {c.pressure} hPa
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label-cell">Visibility</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell">
                    {c.visibility} km
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label-cell">UV Index</td>
                {comparisonData.map(c => (
                  <td key={c.cityName} className="metric-value-cell">
                    {c.uvIndex !== null ? c.uvIndex : 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CityComparison
