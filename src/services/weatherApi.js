import { deduplicateLocations } from '../utils/weatherUtils'

const API_BASE_URL = 'http://localhost:5000/api/weather'

// In-memory cache for API calls with 5-minute TTL
const apiCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

const getCachedData = (key) => {
  const cached = apiCache.get(key)

  if (!cached) return null

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key)
    return null
  }

  return cached.data
}

const setCachedData = (key, data) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Handles responses from our backend.
 * The backend returns:
 * {
 *   success: true,
 *   data: ...
 * }
 */
const handleBackendResponse = async (response) => {
  let payload = null

  try {
    payload = await response.json()
  } catch {
    throw new Error('Invalid response received from weather backend.')
  }

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.message ||
      `Weather backend request failed (HTTP ${response.status}).`

    if (response.status === 400) {
      throw new Error(
        'Invalid location or coordinates. Please try again.'
      )
    }

    if (response.status === 404) {
      throw new Error(
        'Weather data unavailable for this location.'
      )
    }

    if (response.status >= 500) {
      throw new Error(
        message ||
          'Weather backend service is temporarily unavailable.'
      )
    }

    throw new Error(message)
  }

  return payload?.data
}

/**
 * Handles network errors.
 */
const handleNetworkError = (error) => {
  if (
    error?.name === 'TypeError' ||
    error?.message?.includes('fetch')
  ) {
    throw new Error(
      'Network Error: Unable to reach the weather backend. Make sure the backend is running on port 5000.'
    )
  }

  throw error
}

/**
 * Search candidate locations through our backend.
 */
export const searchLocations = async (query) => {
  if (
    !query ||
    typeof query !== 'string' ||
    !query.trim()
  ) {
    return []
  }

  const trimmed = query.trim()

  const cacheKey = `search_${trimmed.toLowerCase()}`
  const cached = getCachedData(cacheKey)

  if (cached) {
    return cached
  }

  try {
    const endpoint =
      `${API_BASE_URL}/search?q=${encodeURIComponent(trimmed)}`

    const response = await fetch(endpoint)

    const data = await handleBackendResponse(response)

    if (!Array.isArray(data)) {
      return []
    }

    const deduplicated = deduplicateLocations(data)

    setCachedData(cacheKey, deduplicated)

    return deduplicated
  } catch (error) {
    console.warn('Location search error:', error)

    if (
      error?.message?.includes('Network Error') ||
      error?.message?.includes('weather backend')
    ) {
      throw error
    }

    return []
  }
}

/**
 * Geocode a city name to coordinates.
 */
export const geocodeCity = async (cityName) => {
  if (
    !cityName ||
    typeof cityName !== 'string' ||
    !cityName.trim()
  ) {
    throw new Error('Please enter a city name')
  }

  const candidates = await searchLocations(cityName)

  if (!candidates || candidates.length === 0) {
    throw new Error(
      `City "${cityName}" not found. Please check spelling.`
    )
  }

  return candidates[0]
}

/**
 * Reverse geocode coordinates.
 */
export const reverseGeocode = async (lat, lon) => {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return {
      name: '',
      state: '',
      country: ''
    }
  }

  const cacheKey =
    `reverse_${lat.toFixed(2)}_${lon.toFixed(2)}`

  const cached = getCachedData(cacheKey)

  if (cached) {
    return cached
  }

  try {
    const endpoint =
      `${API_BASE_URL}/reverse?lat=${lat}&lon=${lon}`

    const response = await fetch(endpoint)

    const data = await handleBackendResponse(response)

    const result = data || {
      name: '',
      state: '',
      country: ''
    }

    setCachedData(cacheKey, result)

    return result
  } catch (error) {
    console.warn('Reverse geocode error:', error)

    return {
      name: '',
      state: '',
      country: ''
    }
  }
}

/**
 * Fetch current weather by city name or coordinates.
 */
export const fetchCurrentWeather = async (query) => {
  let lat
  let lon

  let geoInfo = {
    name: '',
    state: '',
    country: ''
  }

  if (typeof query === 'string') {
    const geo = await geocodeCity(query)

    lat = geo.lat
    lon = geo.lon

    geoInfo = {
      name: geo.name,
      state: geo.state,
      country: geo.country
    }
  } else if (
    query &&
    typeof query.lat === 'number' &&
    typeof query.lon === 'number'
  ) {
    lat = query.lat
    lon = query.lon

    if (query.name) {
      geoInfo = {
        name: query.name,
        state: query.state || '',
        country: query.country || ''
      }
    } else {
      geoInfo = await reverseGeocode(lat, lon)
    }
  } else {
    throw new Error(
      'Invalid search query parameters.'
    )
  }

  try {
    const endpoint =
      `${API_BASE_URL}/current?lat=${lat}&lon=${lon}`

    const response = await fetch(endpoint)

    const data = await handleBackendResponse(response)

    const windMs = data?.wind
      ? data.wind.speed || 0
      : 0

    const windKmH =
      Math.round(windMs * 3.6 * 10) / 10

    const resolvedCity =
      geoInfo.name ||
      data?.name ||
      'Unknown Location'

    const resolvedCountry =
      geoInfo.country ||
      data?.sys?.country ||
      ''

    return {
      cityName: resolvedCity,
      state: geoInfo.state,
      country: resolvedCountry,

      coord: {
        lat,
        lon
      },

      temperature:
        typeof data?.main?.temp === 'number'
          ? data.main.temp
          : 0,

      feelsLike:
        typeof data?.main?.feels_like === 'number'
          ? data.main.feels_like
          : data?.main?.temp || 0,

      tempMin:
        typeof data?.main?.temp_min === 'number'
          ? data.main.temp_min
          : 0,

      tempMax:
        typeof data?.main?.temp_max === 'number'
          ? data.main.temp_max
          : 0,

      humidity:
        typeof data?.main?.humidity === 'number'
          ? data.main.humidity
          : 0,

      pressure:
        typeof data?.main?.pressure === 'number'
          ? data.main.pressure
          : 1013,

      visibility:
        typeof data?.visibility === 'number'
          ? Math.round(
              (data.visibility / 1000) * 10
            ) / 10
          : null,

      windSpeedMs: windMs,

      windSpeed: windKmH,

      windDeg:
        data?.wind?.deg || 0,

      sunrise:
        data?.sys?.sunrise || null,

      sunset:
        data?.sys?.sunset || null,

      timezoneOffset:
        typeof data?.timezone === 'number'
          ? data.timezone
          : 0,

      weatherCondition:
        data?.weather?.[0]?.main || 'Clear',

      weatherDescription:
        data?.weather?.[0]?.description ||
        'Clear Sky',

      iconCode:
        data?.weather?.[0]?.icon || '01d',

      dt:
        data?.dt ||
        Math.floor(Date.now() / 1000)
    }
  } catch (error) {
    handleNetworkError(error)
  }
}

/**
 * Fetch 5-day / 3-hour forecast.
 */
export const fetchForecast = async (query) => {
  let lat
  let lon

  if (typeof query === 'string') {
    const geo = await geocodeCity(query)

    lat = geo.lat
    lon = geo.lon
  } else if (
    query &&
    typeof query.lat === 'number' &&
    typeof query.lon === 'number'
  ) {
    lat = query.lat
    lon = query.lon
  } else {
    throw new Error(
      'Invalid search query parameters.'
    )
  }

  try {
    const endpoint =
      `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}`

    const response = await fetch(endpoint)

    const data = await handleBackendResponse(response)

    const normalizedList =
      (data?.list || []).map((item) => ({
        ...item,

        wind: {
          ...item.wind,

          speedKmH: item.wind
            ? Math.round(
                (item.wind.speed || 0) *
                  3.6 *
                  10
              ) / 10
            : 0
        }
      }))

    return {
      city: data?.city
        ? data.city.name
        : '',

      country: data?.city
        ? data.city.country
        : '',

      timezoneOffset:
        data?.city?.timezone || 0,

      list: normalizedList
    }
  } catch (error) {
    handleNetworkError(error)
  }
}

/**
 * Fetch current UV Index through our backend.
 */
export const fetchUVIndex = async (lat, lon) => {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return null
  }

  try {
    const endpoint =
      `${API_BASE_URL}/uv?lat=${lat}&lon=${lon}`

    const response = await fetch(endpoint)

    const data = await handleBackendResponse(response)

    if (
      data &&
      typeof data.uvIndex === 'number'
    ) {
      return data.uvIndex
    }

    return null
  } catch (error) {
    console.warn(
      'UV Index backend error:',
      error
    )

    return null
  }
}