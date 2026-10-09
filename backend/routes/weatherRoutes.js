import { Router } from 'express';

import {
  searchLocations,
  reverseGeocode,
  getCurrentWeather,
  getForecast,
  getUVIndex
} from '../services/openWeatherService.js';

const router = Router();

const getCoordinates = (req) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {
    throw new Error('Valid lat and lon query parameters are required.');
  }

  return { lat, lon };
};

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;

    const locations = await searchLocations(query);

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Location search error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = getCoordinates(req);

    const location = await reverseGeocode(lat, lon);

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = getCoordinates(req);

    const weather = await getCurrentWeather(lat, lon);

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    console.error('Current weather error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = getCoordinates(req);

    const forecast = await getForecast(lat, lon);

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Forecast error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/uv', async (req, res) => {
  try {
    const { lat, lon } = getCoordinates(req);

    const uv = await getUVIndex(lat, lon);

    res.json({
      success: true,
      data: uv
    });
  } catch (error) {
    console.error('UV index error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;