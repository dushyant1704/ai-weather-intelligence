import { Router } from "express";

import { getForecast } from "../services/openWeatherService.js";

import {
  analyzeForecastTrend
} from "../agents/forecastTrendAgent.js";

const router = Router();

router.get(
  "/forecast-trend",
  async (req, res) => {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({
          success: false,
          message:
            "Latitude and longitude are required."
        });
      }

      const latitude = Number(lat);
      const longitude = Number(lon);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Latitude and longitude must be valid numbers."
        });
      }

      const forecast =
        await getForecast(
          latitude,
          longitude
        );

      const forecastList =
        Array.isArray(forecast?.list)
          ? forecast.list
          : [];

      const result =
        analyzeForecastTrend(
          forecastList
        );

      res.json({
        success: true,

        location: {
          city:
            forecast?.city?.name || null,

          country:
            forecast?.city?.country || null,

          coordinates: {
            latitude,
            longitude
          }
        },

        data: result
      });
    } catch (error) {
      console.error(
        "Forecast trend error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to generate forecast trend.",
        error: error.message
      });
    }
  }
);

export default router;