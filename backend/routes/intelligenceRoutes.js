import { Router } from 'express'

import {
  getCurrentWeather,
  getForecast,
  getUVIndex
} from '../services/openWeatherService.js'

import {
  analyzeWeatherData
} from '../agents/dataIntelligenceAgent.js'

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

  return {
    lat,
    lon
  }
}

router.get('/data-quality', async (req, res) => {
  try {
    const { lat, lon } =
      getCoordinates(req)

    const [
      current,
      forecast,
      uvData
    ] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecast(lat, lon),
      getUVIndex(lat, lon)
    ])

    const result =
      analyzeWeatherData({
        current: {
          cityName:
            current?.name || '',

          country:
            current?.sys?.country || '',

          coord: {
            lat:
              current?.coord?.lat,

            lon:
              current?.coord?.lon
          },

          temperature:
            current?.main?.temp,

          feelsLike:
            current?.main?.feels_like,

          humidity:
            current?.main?.humidity,

          pressure:
            current?.main?.pressure,

          visibility:
            typeof current?.visibility === 'number'
              ? current.visibility / 1000
              : null,

          windSpeed:
            typeof current?.wind?.speed === 'number'
              ? current.wind.speed * 3.6
              : null,

          weatherCondition:
            current?.weather?.[0]?.main || '',

          weatherDescription:
            current?.weather?.[0]?.description || '',

          iconCode:
            current?.weather?.[0]?.icon || '',

          dt:
            current?.dt || null
        },

        forecast,

        uv:
          uvData?.uvIndex ?? null
      })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error(
      'Data Intelligence Agent error:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Data Intelligence Agent failed.'
    })
  }
})

export default router