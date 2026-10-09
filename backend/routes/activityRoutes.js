import { Router } from "express";

import {
  getCurrentWeather,
  getForecast,
  getUVIndex
} from "../services/openWeatherService.js";

import {
  analyzeWeatherRisk
} from "../agents/riskIntelligenceAgent.js";

import {
  analyzeForecastTrend
} from "../agents/forecastTrendAgent.js";

import {
  analyzeActivityDecision
} from "../agents/activityDecisionAgent.js";

const router = Router();

router.get(
  "/activity-decision",
  async (req, res) => {
    try {
      const {
        lat,
        lon,
        activity = "running"
      } = req.query;

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

      const [
        current,
        forecast,
        uv
      ] = await Promise.all([
        getCurrentWeather(
          latitude,
          longitude
        ),

        getForecast(
          latitude,
          longitude
        ),

        getUVIndex(
          latitude,
          longitude
        )
      ]);

      const firstForecast =
        forecast?.list?.[0] || {};

      const weather = {
        temperature:
          current?.main?.temp,

        feelsLike:
          current?.main?.feels_like,

        humidity:
          current?.main?.humidity,

        windSpeed:
          typeof current?.wind?.speed ===
          "number"
            ? current.wind.speed * 3.6
            : null,

        visibility:
          typeof current?.visibility ===
          "number"
            ? current.visibility / 1000
            : null,

        uvIndex:
          uv?.uvIndex ?? uv?.uv_index ?? null,

        rainProbability:
          typeof firstForecast?.pop ===
          "number"
            ? firstForecast.pop
            : null,

        precipitation:
          firstForecast?.rain?.["3h"] ??
          firstForecast?.rain?.["1h"] ??
          null
      };

      const riskResult =
        analyzeWeatherRisk({
          weather,
          activity
        });

      const trendResult =
        analyzeForecastTrend(
          forecast?.list || []
        );

      const decision =
        analyzeActivityDecision({
          activity,
          riskResult,
          trendResult
        });

      res.json({
        success: true,

        location: {
          city:
            current?.name || null,

          country:
            current?.sys?.country || null,

          coordinates: {
            latitude,
            longitude
          }
        },

        data: decision
      });
    } catch (error) {
      console.error(
        "Activity decision error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to generate activity decision.",
        error: error.message
      });
    }
  }
);

export default router;