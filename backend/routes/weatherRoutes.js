import { Router } from 'express';

import {
  searchLocations,
  reverseGeocode,
  getCurrentWeather,
  getForecast,
  getUVIndex
} from '../services/openWeatherService.js';

const router = Router();

const getCoordinates = async (req) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return { lat, lon };
  }

  const city = req.query.city || req.query.q;
  if (city && typeof city === 'string' && city.trim()) {
    const locations = await searchLocations(city.trim());
    if (locations && locations.length > 0) {
      return { lat: locations[0].lat, lon: locations[0].lon, name: locations[0].name };
    }
  }

  throw new Error('Valid lat and lon or city query parameters are required.');
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
    const { lat, lon } = await getCoordinates(req);

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
    const { lat, lon } = await getCoordinates(req);

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
    const { lat, lon } = await getCoordinates(req);

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
    const { lat, lon } = await getCoordinates(req);

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