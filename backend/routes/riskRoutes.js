import { Router } from 'express'

import {
  getCurrentWeather,
  getForecast,
  getUVIndex
} from '../services/openWeatherService.js'

import {
  analyzeWeatherRisk
} from '../agents/riskIntelligenceAgent.js'

const router = Router()

const getCoordinates = (req) => {
  const lat = Number(req.query.lat)
  const lon = Number(req.query.lon)

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {
    throw new Error(
      'Valid lat and lon query parameters are required.'
    )
  }

  return { lat, lon }
}

router.get('/risk-assessment', async (req, res) => {
  try {
    const { lat, lon } =
      getCoordinates(req)

    const activity =
      req.query.activity || 'general'

    const [
      current,
      forecast,
      uvData
    ] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon),
      getUVIndex(lat, lon)
    ])

    const currentData = {
      temperatureCelsius:
        current?.main?.temp ?? null,

      feelsLikeCelsius:
        current?.main?.feels_like ?? null,

      humidityPercent:
        current?.main?.humidity ?? null,

      windSpeedKmh:
        typeof current?.wind?.speed === 'number'
          ? current.wind.speed * 3.6
          : null,

      visibilityKm:
        typeof current?.visibility === 'number'
          ? current.visibility / 1000
          : null,

      condition:
        current?.weather?.[0]?.main || ''
    }

    const forecastRecords =
      Array.isArray(forecast?.list)
        ? forecast.list
        : []

    const currentForecast =
      forecastRecords[0] || null

    const rainProbability =
      typeof currentForecast?.pop === 'number'
        ? currentForecast.pop
        : null

    const result =
      analyzeWeatherRisk({
        current: currentData,

        uvIndex:
          uvData?.uvIndex ?? null,

        rainProbability,

        activity
      })

    res.json({
      success: true,

      data: {
        ...result,

        location: {
          city:
            current?.name || '',

          country:
            current?.sys?.country || '',

          coordinates: {
            latitude:
              current?.coord?.lat ?? null,

            longitude:
              current?.coord?.lon ?? null
          }
        }
      }
    })
  } catch (error) {
    console.error(
      'Risk Intelligence Agent error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Risk Intelligence Agent failed.'
    })
  }
})

export default router
