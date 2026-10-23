/**
 * Data Intelligence Agent (v2.0.0)
 *
 * Responsibilities:
 * 1. Polymorphic telemetry ingestion (accepts both pre-flattened and raw OpenWeather schemas).
 * 2. Meteorological sanity validation with realistic terrestrial thresholds (supports high-altitude pressures).
 * 3. Safe, non-penalizing completeness scoring for optional sensors (visibility, UV, barometer).
 * 4. Transparent telemetry audit logging for downstream UI and agents.
 * 5. Unit normalization into SI/standard metric formats (km/h, °C, hPa, km).
 */

const isNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value)

const createCheck = (
  name,
  valid,
  value,
  message,
  required = true
) => ({
  name,
  valid,
  value,
  message,
  required
})

/**
 * Polymorphic adapter: normalizes inputs whether they arrive as raw OpenWeather payloads
 * (e.g., current.main.temp, current.wind.speed in m/s, current.visibility in meters)
 * or pre-flattened telemetry objects from intermediate routes.
 */
export const adaptCurrentTelemetry = (current) => {
  if (!current || typeof current !== 'object') return {}

  // 1. Temperature (°C)
  const temperature = isNumber(current?.temperature)
    ? current.temperature
    : (isNumber(current?.main?.temp) ? current.main.temp : null)

  // 2. Feels Like (°C)
  const feelsLike = isNumber(current?.feelsLike)
    ? current.feelsLike
    : (isNumber(current?.main?.feels_like) ? current.main.feels_like : null)

  // 3. Humidity (%)
  const humidity = isNumber(current?.humidity)
    ? current.humidity
    : (isNumber(current?.main?.humidity) ? current.main.humidity : null)

  // 4. Atmospheric Pressure (hPa)
  const pressure = isNumber(current?.pressure)
    ? current.pressure
    : (isNumber(current?.main?.pressure) ? current.main.pressure : null)

  // 5. Wind Speed (km/h)
  // If raw OpenWeather wind.speed (in m/s) is present, convert to km/h (* 3.6).
  // If windSpeed is already passed in km/h, preserve it.
  let windSpeed = null
  if (isNumber(current?.windSpeed)) {
    windSpeed = current.windSpeed
  } else if (isNumber(current?.wind?.speed)) {
    windSpeed = Math.round(current.wind.speed * 3.6 * 10) / 10
  }

  // 6. Visibility (km)
  // If raw OpenWeather visibility is given in meters (> 100), convert to km.
  let visibility = null
  if (isNumber(current?.visibility)) {
    visibility = current.visibility > 100
      ? Math.round((current.visibility / 1000) * 10) / 10
      : current.visibility
  }

  // 7. Geographic Coordinates
  const lat = isNumber(current?.coord?.lat)
    ? current.coord.lat
    : (isNumber(current?.lat) ? current.lat : null)

  const lon = isNumber(current?.coord?.lon)
    ? current.coord.lon
    : (isNumber(current?.lon) ? current.lon : null)

  // 8. Extended Meteorological Attributes
  const cloudPercent = isNumber(current?.clouds?.all)
    ? current.clouds.all
    : (isNumber(current?.cloudPercent) ? current.cloudPercent : null)

  const windDirection = isNumber(current?.wind?.deg)
    ? current.wind.deg
    : (isNumber(current?.windDirection) ? current.windDirection : null)

  const rainVolume = isNumber(current?.rain?.['1h'])
    ? current.rain['1h']
    : (isNumber(current?.rain?.['3h'])
        ? Math.round((current.rain['3h'] / 3) * 10) / 10
        : (isNumber(current?.precipitation) ? current.precipitation : 0))

  const cityName = current?.name || current?.cityName || ''
  const state = current?.state || ''
  const country = current?.sys?.country || current?.country || ''
  const weatherCondition = current?.weather?.[0]?.main || current?.weatherCondition || ''
  const weatherDescription = current?.weather?.[0]?.description || current?.weatherDescription || ''
  const iconCode = current?.weather?.[0]?.icon || current?.iconCode || current?.icon || ''
  const dt = current?.dt || current?.timestamp || null
  const sunrise = current?.sys?.sunrise || current?.sunrise || null
  const sunset = current?.sys?.sunset || current?.sunset || null
  const timezoneOffset = current?.timezone ?? current?.timezoneOffset ?? 0

  return {
    cityName,
    state,
    country,
    temperature,
    feelsLike,
    humidity,
    pressure,
    windSpeed,
    visibility,
    coord: (lat !== null && lon !== null) ? { lat, lon } : null,
    cloudPercent,
    windDirection,
    rainVolume,
    weatherCondition,
    weatherDescription,
    iconCode,
    dt,
    sunrise,
    sunset,
    timezoneOffset
  }
}

/**
 * Validates current weather observations against physical atmospheric limits.
 * Uses realistic terrestrial atmospheric bounds (500–1100 hPa to allow high-altitude habitats).
 */
const validateCurrentWeather = (adapted) => {
  const checks = []

  // Core Required: Temperature (-90°C to 60°C)
  checks.push(
    createCheck(
      'Temperature',
      isNumber(adapted?.temperature) &&
        adapted.temperature >= -90 &&
        adapted.temperature <= 60,
      adapted?.temperature,
      'Temperature must be between -90°C and 60°C.',
      true
    )
  )

  // Core Required: Feels Like Temperature (-90°C to 60°C)
  checks.push(
    createCheck(
      'Feels Like Temperature',
      isNumber(adapted?.feelsLike) &&
        adapted.feelsLike >= -90 &&
        adapted.feelsLike <= 60,
      adapted?.feelsLike,
      'Feels-like temperature must be between -90°C and 60°C.',
      true
    )
  )

  // Core Required: Humidity (0% to 100%)
  checks.push(
    createCheck(
      'Humidity',
      isNumber(adapted?.humidity) &&
        adapted.humidity >= 0 &&
        adapted.humidity <= 100,
      adapted?.humidity,
      'Humidity must be between 0% and 100%.',
      true
    )
  )

  // Core Required: Coordinates
  checks.push(
    createCheck(
      'Coordinates',
      isNumber(adapted?.coord?.lat) &&
        isNumber(adapted?.coord?.lon) &&
        adapted.coord.lat >= -90 &&
        adapted.coord.lat <= 90 &&
        adapted.coord.lon >= -180 &&
        adapted.coord.lon <= 180,
      adapted?.coord,
      'Coordinates must contain valid latitude (-90 to 90) and longitude (-180 to 180).',
      true
    )
  )

  // Secondary/Optional: Atmospheric Pressure (500 to 1100 hPa)
  // 500 hPa accommodates high-altitude settlements (La Rinconada @ 540 hPa, La Paz @ 640 hPa).
  checks.push(
    createCheck(
      'Pressure',
      adapted?.pressure == null ||
        (
          isNumber(adapted?.pressure) &&
          adapted.pressure >= 500 &&
          adapted.pressure <= 1100
        ),
      adapted?.pressure,
      'Pressure must be within realistic terrestrial atmospheric range (500–1100 hPa).',
      false
    )
  )

  // Secondary/Optional: Wind Speed (0 to 250 km/h)
  checks.push(
    createCheck(
      'Wind Speed',
      adapted?.windSpeed == null ||
        (
          isNumber(adapted?.windSpeed) &&
          adapted.windSpeed >= 0 &&
          adapted.windSpeed <= 250
        ),
      adapted?.windSpeed,
      'Wind speed must be between 0 and 250 km/h.',
      false
    )
  )

  // Secondary/Optional: Visibility (0 to 100 km)
  checks.push(
    createCheck(
      'Visibility',
      adapted?.visibility == null ||
        (
          isNumber(adapted?.visibility) &&
          adapted.visibility >= 0 &&
          adapted.visibility <= 100
        ),
      adapted?.visibility,
      'Visibility must be between 0 and 100 km (or omitted if sensor unavailable).',
      false
    )
  )

  return checks
}

/**
 * Validates UV index (optional parameter).
 */
const validateUV = (uvIndex) => {
  return createCheck(
    'UV Index',
    uvIndex == null ||
      (
        isNumber(uvIndex) &&
        uvIndex >= 0 &&
        uvIndex <= 20
      ),
    uvIndex,
    'UV index must be between 0 and 20 (or omitted if sensor unavailable).',
    false
  )
}

/**
 * Validates 5-day / 3-hour forecast telemetry.
 * Forecast wind speeds in OpenWeather are in m/s (valid 0–75 m/s, ~270 km/h).
 */
const validateForecast = (forecast) => {
  const list = Array.isArray(forecast?.list)
    ? forecast.list
    : []

  const hasForecastData = list.length > 0

  const validEntries = list.filter((item) => {
    const temperature = item?.main?.temp
    const humidity = item?.main?.humidity
    const wind = item?.wind?.speed

    // Realistic terrestrial forecast limits: temp [-90, 60]°C, humidity [0, 100]%, wind [0, 75] m/s
    return (
      isNumber(temperature) &&
      temperature >= -90 &&
      temperature <= 60 &&
      isNumber(humidity) &&
      humidity >= 0 &&
      humidity <= 100 &&
      isNumber(wind) &&
      wind >= 0 &&
      wind <= 75
    )
  })

  const validRatio =
    hasForecastData
      ? validEntries.length / list.length
      : 0

  return {
    check: createCheck(
      'Forecast Data',
      hasForecastData && validRatio >= 0.85,
      {
        totalRecords: list.length,
        validRecords: validEntries.length
      },
      'At least 85% of forecast records must contain valid atmospheric metrics.',
      true
    ),
    totalRecords: list.length,
    validRecords: validEntries.length,
    validRatio
  }
}

/**
 * Compiles validated observations into a clean, normalized SI format for downstream agents.
 */
const normalizeWeatherData = (
  adapted,
  forecast,
  uv
) => {
  const forecastList = Array.isArray(forecast?.list)
    ? forecast.list
    : []

  return {
    current: {
      cityName: adapted.cityName,
      state: adapted.state,
      country: adapted.country,

      coordinates: {
        latitude: adapted.coord?.lat ?? null,
        longitude: adapted.coord?.lon ?? null
      },

      temperatureCelsius: adapted.temperature,
      feelsLikeCelsius: adapted.feelsLike,
      humidityPercent: adapted.humidity,
      pressureHpa: adapted.pressure,
      windSpeedKmh: adapted.windSpeed,
      windDirection: adapted.windDirection,
      cloudPercent: adapted.cloudPercent,
      precipitationMm: adapted.rainVolume,
      visibilityKm: adapted.visibility,

      condition: adapted.weatherCondition,
      description: adapted.weatherDescription,
      icon: adapted.iconCode,

      timestamp: adapted.dt,
      sunrise: adapted.sunrise,
      sunset: adapted.sunset,
      timezoneOffset: adapted.timezoneOffset
    },

    uvIndex: isNumber(uv) ? uv : null,

    forecast: {
      city: forecast?.city?.name || forecast?.city || '',
      country: forecast?.city?.country || forecast?.country || '',
      timezoneOffset: forecast?.city?.timezone ?? forecast?.timezoneOffset ?? 0,
      recordCount: forecastList.length,

      records: forecastList.map((item) => ({
        timestamp: item?.dt || null,

        temperatureCelsius:
          isNumber(item?.main?.temp)
            ? item.main.temp
            : null,

        feelsLikeCelsius:
          isNumber(item?.main?.feels_like)
            ? item.main.feels_like
            : null,

        humidityPercent:
          isNumber(item?.main?.humidity)
            ? item.main.humidity
            : null,

        pressureHpa:
          isNumber(item?.main?.pressure)
            ? item.main.pressure
            : null,

        windSpeedKmh:
          isNumber(item?.wind?.speed)
            ? Math.round(item.wind.speed * 3.6 * 10) / 10
            : null,

        windDirection:
          isNumber(item?.wind?.deg)
            ? item.wind.deg
            : null,

        cloudPercent:
          isNumber(item?.clouds?.all)
            ? item.clouds.all
            : null,

        rainProbability:
          isNumber(item?.pop)
            ? item.pop
            : null,

        visibilityKm:
          isNumber(item?.visibility)
            ? (item.visibility > 100 ? item.visibility / 1000 : item.visibility)
            : null,

        condition:
          item?.weather?.[0]?.main || '',

        description:
          item?.weather?.[0]?.description || ''
      }))
    }
  }
}

/**
 * Main Data Intelligence Agent Entry Point.
 *
 * Performs polymorphic ingestion, rigorous physical audits, resilient completeness
 * scoring (avoiding false blockage on missing optional sensors), and clean normalization.
 */
export const analyzeWeatherData = ({
  current,
  forecast,
  uv
}) => {
  // 1. Adapt input (supports raw OpenWeather & pre-flattened objects seamlessly)
  const adapted = adaptCurrentTelemetry(current)

  // 2. Run validations
  const currentChecks = validateCurrentWeather(adapted)
  const uvCheck = validateUV(uv)
  const forecastResult = validateForecast(forecast)

  const allChecks = [
    ...currentChecks,
    uvCheck,
    forecastResult.check
  ]

  // 3. Validation Score (Percentage of passed checks)
  const validChecks = allChecks.filter((c) => c.valid).length
  const totalChecks = allChecks.length

  const validationScore = totalChecks > 0
    ? Math.round((validChecks / totalChecks) * 100)
    : 0

  // 4. Safe Completeness Score (Resolved optional-field trap):
  // - Required core checks (Temp, FeelsLike, Humidity, Coords): up to 50 pts
  // - Optional sensor telemetry (Pressure, Wind, Visibility, UV): up to 20 pts
  // - Forward forecast availability: 30 pts
  const requiredChecks = currentChecks.filter((c) => c.required)
  const requiredPassed = requiredChecks.every(
    (c) => c.valid && c.value !== null && c.value !== undefined
  )

  const coreCurrentScore = requiredPassed ? 50 : 0

  // Optional telemetry bonus (up to 20 points, 5 points each if present and valid)
  let optionalTelemetryScore = 0
  if (adapted.pressure !== null && isNumber(adapted.pressure)) optionalTelemetryScore += 5
  if (adapted.windSpeed !== null && isNumber(adapted.windSpeed)) optionalTelemetryScore += 5
  if (adapted.visibility !== null && isNumber(adapted.visibility)) optionalTelemetryScore += 5
  if (uv !== null && isNumber(uv)) optionalTelemetryScore += 5

  const forecastAvailable = forecastResult.totalRecords > 0
  const forecastScore = forecastAvailable ? 30 : 0

  const completenessScore = coreCurrentScore + optionalTelemetryScore + forecastScore

  // 5. Overall Quality Score (70% validation, 30% completeness)
  const qualityScore = Math.round(
    validationScore * 0.7 +
    completenessScore * 0.3
  )

  // 6. Classification Status
  let status = 'READY'
  if (qualityScore < 60 || !requiredPassed) {
    status = 'INSUFFICIENT'
  } else if (qualityScore < 80) {
    status = 'DEGRADED'
  }

  // 7. Data Normalization
  const normalizedData = normalizeWeatherData(
    adapted,
    forecast,
    uv
  )

  // 8. Gatekeeping Decision
  const readyForAI = qualityScore >= 80 && requiredPassed

  // Determine specific audit issues if not ready
  const failedChecks = allChecks.filter((c) => !c.valid)
  let reason = ''
  if (readyForAI) {
    reason = `Weather telemetry passed data quality standards (Quality: ${qualityScore}%, Validation: ${validationScore}%, Completeness: ${completenessScore}%). Ready for downstream AI agents.`
  } else if (!requiredPassed) {
    const missingRequired = requiredChecks
      .filter((c) => !c.valid || c.value === null || c.value === undefined)
      .map((c) => c.name)
    reason = `Critical telemetry missing or invalid: ${missingRequired.join(', ')}.`
  } else {
    reason = `Telemetry quality is below threshold (${qualityScore}% < 80%). Flagged checks: ${failedChecks.map((c) => c.name).join(', ')}.`
  }

  return {
    agent: {
      name: 'Data Intelligence Agent',
      version: '2.0.0',
      status: 'completed'
    },

    dataQuality: {
      score: qualityScore,
      status,
      validationScore,
      completenessScore,
      validChecks,
      totalChecks,
      forecastRecords: forecastResult.totalRecords,
      validForecastRecords: forecastResult.validRecords
    },

    checks: allChecks,

    normalizedData,

    decision: {
      readyForAI,
      reason
    }
  }
}