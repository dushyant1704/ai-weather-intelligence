import clearIcon from '../assets/clear.png'
import cloudIcon from '../assets/cloud.png'
import drizzleIcon from '../assets/drizzle.png'
import rainIcon from '../assets/rain.png'
import snowIcon from '../assets/snow.png'

/**
 * Maps OpenWeatherMap condition code or main string to available local PNG assets.
 * @param {string} iconCode - OWM icon string (e.g. '01d')
 * @param {string} mainCondition - OWM main condition text (e.g. 'Clouds')
 * @returns {string} - Imported PNG asset path
 */
export const getWeatherIcon = (iconCode = '', mainCondition = '') => {
  const code = (iconCode || '').toLowerCase()
  const main = (mainCondition || '').toLowerCase()

  if (code.startsWith('01') || main === 'clear') {
    return clearIcon
  }
  if (code.startsWith('02') || code.startsWith('03') || code.startsWith('04') || main === 'clouds') {
    return cloudIcon
  }
  if (code.startsWith('09') || main === 'drizzle') {
    return drizzleIcon
  }
  if (code.startsWith('10') || code.startsWith('11') || main === 'rain' || main === 'thunderstorm') {
    return rainIcon
  }
  if (code.startsWith('13') || main === 'snow') {
    return snowIcon
  }
  if (code.startsWith('50') || main === 'mist' || main === 'fog' || main === 'haze') {
    return cloudIcon
  }
  return clearIcon
}

/**
 * Determines theme variant based on weather condition & night state.
 * @param {string} iconCode - e.g., '01n'
 * @param {string} mainCondition - e.g., 'Clear'
 * @returns {string} - theme class modifier
 */
export const getWeatherThemeClass = (iconCode = '', mainCondition = '') => {
  const code = (iconCode || '').toLowerCase()
  const main = (mainCondition || '').toLowerCase()
  const isNight = code.endsWith('n')

  if (isNight) return 'theme-night'
  if (main === 'clear' || code.startsWith('01')) return 'theme-clear'
  if (main === 'clouds' || code.startsWith('02') || code.startsWith('03') || code.startsWith('04')) return 'theme-clouds'
  if (main === 'rain' || main === 'drizzle' || main === 'thunderstorm' || code.startsWith('09') || code.startsWith('10') || code.startsWith('11')) return 'theme-rain'
  if (main === 'snow' || code.startsWith('13')) return 'theme-snow'

  return 'theme-clear'
}

/**
 * Converts wind degrees (0-360) into cardinal direction.
 * @param {number} deg 
 * @returns {string}
 */
export const degreesToCardinal = (deg) => {
  if (deg === undefined || deg === null || isNaN(deg)) return 'N/A'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round((deg % 360) / 22.5) % 16
  return directions[index]
}

/**
 * Formats temperature based on target unit ('C' or 'F').
 * @param {number} tempInC 
 * @param {string} unit - 'C' or 'F'
 * @returns {number|string}
 */
export const formatTemperature = (tempInC, unit = 'C') => {
  if (tempInC === undefined || tempInC === null || isNaN(tempInC)) return 'N/A'
  if (unit === 'F') {
    return Math.round((tempInC * 9) / 5 + 32)
  }
  return Math.round(tempInC)
}

/**
 * Dynamic Humidity Description Label
 * @param {number} humidity 
 * @returns {string}
 */
export const getHumidityLabel = (humidity) => {
  if (humidity === undefined || humidity === null || isNaN(humidity)) return 'N/A'
  if (humidity <= 30) return 'Low Humidity'
  if (humidity <= 60) return 'Moderate Humidity'
  if (humidity <= 80) return 'High Humidity'
  return 'Very High Humidity'
}

/**
 * Dynamic Air Pressure Description Label
 * @param {number} pressure 
 * @returns {string}
 */
export const getPressureLabel = (pressure) => {
  if (pressure === undefined || pressure === null || isNaN(pressure)) return 'N/A'
  if (pressure < 1000) return 'Low Pressure System'
  if (pressure <= 1020) return 'Normal Pressure'
  return 'High Pressure System'
}

/**
 * Dynamic Visibility Description Label
 * @param {number} visibilityKm 
 * @returns {string}
 */
export const getVisibilityLabel = (visibilityKm) => {
  if (visibilityKm === undefined || visibilityKm === null || isNaN(visibilityKm)) return 'N/A'
  if (visibilityKm >= 10) return 'Excellent Visibility'
  if (visibilityKm >= 5) return 'Moderate Visibility'
  return 'Poor Visibility'
}

/**
 * Dynamic UV Index Severity Label & Class
 * @param {number} uvIndex 
 * @returns {{label: string, cls: string}}
 */
export const getUVLabel = (uvIndex) => {
  if (uvIndex === undefined || uvIndex === null || isNaN(uvIndex)) {
    return { label: 'N/A', cls: 'uv-none' }
  }
  if (uvIndex <= 2) return { label: 'Low', cls: 'uv-low' }
  if (uvIndex <= 5) return { label: 'Moderate', cls: 'uv-mod' }
  if (uvIndex <= 7) return { label: 'High', cls: 'uv-high' }
  if (uvIndex <= 10) return { label: 'Very High', cls: 'uv-very-high' }
  return { label: 'Extreme', cls: 'uv-extreme' }
}

/**
 * Deduplicates geocoding candidate results using name, state, country, and rounded coordinates.
 * @param {Array} results 
 * @returns {Array} Unique locations
 */
export const deduplicateLocations = (results = []) => {
  if (!Array.isArray(results) || results.length === 0) return []
  const seen = new Set()
  return results.filter(item => {
    const nameKey = (item.name || '').toLowerCase().trim()
    const stateKey = (item.state || '').toLowerCase().trim()
    const countryKey = (item.country || '').toLowerCase().trim()
    const latRound = typeof item.lat === 'number' ? item.lat.toFixed(2) : '0'
    const lonRound = typeof item.lon === 'number' ? item.lon.toFixed(2) : '0'
    
    const key = `${nameKey}|${stateKey}|${countryKey}|${latRound}|${lonRound}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Centralized helper to format time in the target city's local timezone.
 * @param {Date|number} input - Date object or Epoch seconds timestamp
 * @param {number} timezoneOffsetSeconds - City timezone offset in seconds from UTC
 * @param {boolean} includeSeconds - Whether to include seconds in output
 * @returns {string} e.g. "11:18:33 PM" or "11:18 PM"
 */
export const formatCityLocalTime = (input, timezoneOffsetSeconds = 0, includeSeconds = false) => {
  if (!input) return '--:--'
  let utcMs = 0
  if (input instanceof Date) {
    utcMs = input.getTime()
  } else if (typeof input === 'number') {
    utcMs = input < 1e11 ? input * 1000 : input
  } else {
    return '--:--'
  }

  const cityLocalMs = utcMs + (timezoneOffsetSeconds * 1000)
  const targetDate = new Date(cityLocalMs)

  return targetDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    timeZone: 'UTC'
  })
}

/**
 * Centralized helper to format full date in the target city's local timezone.
 * @param {Date|number} input - Date object or Epoch seconds timestamp
 * @param {number} timezoneOffsetSeconds - City timezone offset in seconds from UTC
 * @returns {string} e.g. "Monday, October 5, 2026"
 */
export const formatCityLocalDate = (input = new Date(), timezoneOffsetSeconds = 0) => {
  let utcMs = 0
  if (input instanceof Date) {
    utcMs = input.getTime()
  } else if (typeof input === 'number') {
    utcMs = input < 1e11 ? input * 1000 : input
  } else {
    utcMs = Date.now()
  }

  const cityLocalMs = utcMs + (timezoneOffsetSeconds * 1000)
  const targetDate = new Date(cityLocalMs)

  return targetDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

/**
 * Formats Unix timestamp to AM/PM time representation.
 * @param {number} timestamp - Epoch seconds
 * @param {number} timezoneOffsetSeconds - OWM timezone offset in seconds
 * @returns {string}
 */
export const formatTime = (timestamp, timezoneOffsetSeconds = 0) => {
  return formatCityLocalTime(timestamp, timezoneOffsetSeconds, false)
}

/**
 * Formats date object to full readable string in location timezone.
 * @param {Date|number} date 
 * @param {number} timezoneOffsetSeconds
 * @returns {string}
 */
export const formatFullDate = (date = new Date(), timezoneOffsetSeconds = 0) => {
  return formatCityLocalDate(date, timezoneOffsetSeconds)
}

/**
 * Converts date string or timestamp into Day Name (e.g., 'Mon', 'Today').
 * @param {string|number} dateInput 
 * @param {number} timezoneOffsetSeconds 
 * @returns {string}
 */
export const formatDayName = (dateInput, timezoneOffsetSeconds = 0) => {
  const date = typeof dateInput === 'number'
    ? new Date((dateInput + timezoneOffsetSeconds) * 1000)
    : new Date(dateInput)

  const today = new Date()
  if (date.getUTCDate() === today.getDate() && date.getMonth() === today.getMonth()) {
    return 'Today'
  }

  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

/**
 * Groups OWM 3-hour forecast list into daily aggregations for 5-7 days.
 * @param {Array} list - OWM forecast list
 * @param {number} timezoneOffset 
 * @returns {Array} Daily forecast objects
 */
export const groupForecastByDay = (list = [], timezoneOffset = 0) => {
  if (!Array.isArray(list) || list.length === 0) return []

  const grouped = {}

  list.forEach((item) => {
    const itemDate = new Date((item.dt + timezoneOffset) * 1000)
    const dateKey = itemDate.toISOString().split('T')[0]

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        dateKey,
        dt: item.dt,
        temps: [],
        conditions: [],
        icons: [],
        humidity: [],
        wind: [],
        pop: []
      }
    }

    grouped[dateKey].temps.push(item.main.temp)
    if (item.weather && item.weather[0]) {
      grouped[dateKey].conditions.push(item.weather[0].main)
      grouped[dateKey].icons.push(item.weather[0].icon)
    }
    grouped[dateKey].humidity.push(item.main.humidity)
    grouped[dateKey].wind.push(item.wind.speed)
    if (typeof item.pop === 'number') {
      grouped[dateKey].pop.push(item.pop)
    }
  })

  const dailyList = Object.keys(grouped).map((dateKey, index) => {
    const dayData = grouped[dateKey]
    const minTemp = Math.min(...dayData.temps)
    const maxTemp = Math.max(...dayData.temps)

    const conditionCounts = {}
    dayData.conditions.forEach(c => { conditionCounts[c] = (conditionCounts[c] || 0) + 1 })
    const dominantCondition = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b, 'Clear')

    const iconCounts = {}
    dayData.icons.forEach(ic => { iconCounts[ic] = (iconCounts[ic] || 0) + 1 })
    const dominantIconCode = Object.keys(iconCounts).reduce((a, b) => iconCounts[a] > iconCounts[b] ? a : b, '01d')

    const maxPop = dayData.pop.length > 0 ? Math.max(...dayData.pop) : 0

    const dateObj = new Date((dayData.dt + timezoneOffset) * 1000)
    const dayName = index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })

    return {
      dateKey,
      dayName,
      minTemp,
      maxTemp,
      dominantCondition,
      iconCode: dominantIconCode,
      avgHumidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length),
      avgWind: (dayData.wind.reduce((a, b) => a + b, 0) / dayData.wind.length).toFixed(1),
      pop: Math.round(maxPop * 100)
    }
  })

  return dailyList.slice(0, 7)
}

/**
 * Calculates condition breakdown distribution percentages across forecast items.
 * @param {Array} forecastList 
 * @returns {Array<{name: string, value: number, color: string}>}
 */
export const calculateWeatherDistribution = (forecastList = []) => {
  if (!Array.isArray(forecastList) || forecastList.length === 0) {
    return []
  }

  const counts = { Clear: 0, Clouds: 0, Rain: 0, Drizzle: 0, Snow: 0, Other: 0 }
  forecastList.forEach(item => {
    const main = item.weather && item.weather[0] ? item.weather[0].main : 'Clear'
    if (counts[main] !== undefined) {
      counts[main]++
    } else {
      counts.Other++
    }
  })

  const total = forecastList.length
  const result = []
  const palette = {
    Clear: '#4EA4CC',
    Clouds: '#4E6ABC',
    Rain: '#1A3F75',
    Drizzle: '#6b8ba8',
    Snow: '#A8C8E0',
    Other: '#E8F4FC'
  }

  Object.keys(counts).forEach(key => {
    if (counts[key] > 0) {
      result.push({
        name: key,
        value: Math.round((counts[key] / total) * 100),
        color: palette[key] || '#854F6C'
      })
    }
  })

  return result
}

/**
 * Computes daylight progress percentage (0 - 100) based on current timestamp, sunrise, sunset.
 * @param {number} sunrise - epoch seconds
 * @param {number} sunset - epoch seconds
 * @returns {number} 0 to 100 percentage
 */
export const calculateSunProgress = (sunrise, sunset) => {
  if (!sunrise || !sunset) return 50
  const now = Math.floor(Date.now() / 1000)
  if (now <= sunrise) return 0
  if (now >= sunset) return 100
  const total = sunset - sunrise
  const elapsed = now - sunrise
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

/**
 * Generates data-driven weather recommendations.
 * @param {Object} current 
 * @returns {Array<{title: string, desc: string, icon: string, type: string}>}
 */
export const generateRecommendations = (current) => {
  if (!current) return []
  const recs = []

  const temp = current.temperature
  const cond = (current.weatherCondition || '').toLowerCase()
  const wind = current.windSpeed
  const uv = current.uvIndex

  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm')) {
    recs.push({
      title: 'Carry an Umbrella',
      desc: 'Precipitation is detected in your area today. Don’t forget your umbrella or raincoat!',
      type: 'warning'
    })
  } else if (uv !== null && uv >= 6) {
    recs.push({
      title: 'Wear Sun Protection',
      desc: `UV index is high (${uv}). Wear sunscreen, sunglasses, and a hat outdoors.`,
      type: 'info'
    })
  } else {
    recs.push({
      title: 'Favorable Weather Conditions',
      desc: 'Current atmospheric conditions are clear and comfortable for outdoor travel.',
      type: 'success'
    })
  }

  if (typeof temp === 'number') {
    if (temp < 10) {
      recs.push({
        title: 'Dress Warmly',
        desc: 'Low temperature observed. Layer up with warm jacket and scarf.',
        type: 'warning'
      })
    } else if (temp > 30) {
      recs.push({
        title: 'Stay Hydrated',
        desc: 'High heat today. Drink plenty of water throughout the day.',
        type: 'warning'
      })
    }
  }

  if (typeof wind === 'number' && wind > 25) {
    recs.push({
      title: 'Windy Condition Alert',
      desc: `Strong winds up to ${wind} km/h. Secure outdoor items.`,
      type: 'info'
    })
  }

  return recs
}

/**
 * Generates active weather alerts based on extreme data criteria.
 * @param {Object} current 
 * @returns {Array<{id: string, title: string, severity: string, message: string}>}
 */
export const generateWeatherAlerts = (current) => {
  if (!current) return []
  const alerts = []

  if (typeof current.windSpeed === 'number' && current.windSpeed > 30) {
    alerts.push({
      id: 'high-wind',
      title: 'High Wind Warning',
      severity: 'high',
      message: `Wind speeds reaching ${current.windSpeed} km/h. Exercise caution outside.`
    })
  }

  const cond = (current.weatherCondition || '').toLowerCase()
  if (cond.includes('thunderstorm') || cond.includes('heavy rain')) {
    alerts.push({
      id: 'severe-rain',
      title: 'Severe Rainfall Advisory',
      severity: 'critical',
      message: 'Heavy precipitation detected. Watch out for localized street flooding and reduced visibility.'
    })
  }

  if (typeof current.uvIndex === 'number' && current.uvIndex >= 8) {
    alerts.push({
      id: 'uv-alert',
      title: 'Extreme UV Index Alert',
      severity: 'moderate',
      message: `UV index is currently ${current.uvIndex}. Limit sun exposure between 10 AM and 4 PM.`
    })
  }

  if (typeof current.temperature === 'number' && current.temperature > 38) {
    alerts.push({
      id: 'heat-wave',
      title: 'Heat Warning',
      severity: 'high',
      message: 'Extreme high temperature alert. Stay in air-conditioned spaces and hydrate frequently.'
    })
  }

  return alerts
}

/* LocalStorage Helpers */
const RECENT_KEY = 'weather_app_recent_searches'
const FAVORITES_KEY = 'weather_app_favorite_cities'
const THEME_KEY = 'weather_app_theme'

export const getRecentSearches = () => {
  try {
    const data = localStorage.getItem(RECENT_KEY)
    if (!data) return ['Pune', 'Mumbai', 'Delhi']
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : ['Pune', 'Mumbai', 'Delhi']
  } catch (err) {
    console.warn('Error reading recent searches:', err)
    return ['Pune', 'Mumbai', 'Delhi']
  }
}

export const addRecentSearch = (cityName) => {
  if (!cityName || typeof cityName !== 'string') return getRecentSearches()
  const trimmed = cityName.trim()
  if (!trimmed) return getRecentSearches()

  try {
    let current = getRecentSearches()
    current = current.filter(c => c.toLowerCase() !== trimmed.toLowerCase())
    current.unshift(trimmed)
    if (current.length > 5) {
      current = current.slice(0, 5)
    }
    localStorage.setItem(RECENT_KEY, JSON.stringify(current))
    return current
  } catch (err) {
    console.warn('Error saving recent search:', err)
    return []
  }
}

export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch (err) {
    console.warn('Error clearing recent searches:', err)
  }
}

export const getFavoriteCities = () => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY)
    if (!data) return ['Pune', 'Mumbai', 'Delhi']
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : ['Pune', 'Mumbai', 'Delhi']
  } catch (err) {
    console.warn('Error reading favorite cities:', err)
    return ['Pune', 'Mumbai', 'Delhi']
  }
}

export const toggleFavoriteCity = (cityName) => {
  if (!cityName) return getFavoriteCities()
  const trimmed = cityName.trim()
  try {
    let current = getFavoriteCities()
    const index = current.findIndex(c => c.toLowerCase() === trimmed.toLowerCase())
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(trimmed)
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(current))
    return current
  } catch (err) {
    console.warn('Error toggling favorite city:', err)
    return []
  }
}

export const isFavoriteCity = (cityName) => {
  if (!cityName) return false
  const current = getFavoriteCities()
  return current.some(c => c.toLowerCase() === cityName.trim().toLowerCase())
}

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark'
  } catch (err) {
    console.warn('Error reading theme preference:', err)
    return 'dark'
  }
}

export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch (err) {
    console.warn('Error saving theme preference:', err)
  }
}
