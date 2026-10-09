import { Router } from "express";

import {
  getCurrentWeather,
  getForecast,
  getUVIndex
} from "../services/openWeatherService.js";

import { analyzeWeatherRisk } from "../agents/riskIntelligenceAgent.js";
import { analyzeForecastTrend } from "../agents/forecastTrendAgent.js";
import { analyzeCityIntelligence } from "../agents/cityIntelligenceAgent.js";

const router = Router();

const CITY_DATABASE = {
  pune: {
    name: "Pune",
    country: "IN",
    lat: 18.5204,
    lon: 73.8567
  },

  mumbai: {
    name: "Mumbai",
    country: "IN",
    lat: 19.0760,
    lon: 72.8777
  },

  delhi: {
    name: "Delhi",
    country: "IN",
    lat: 28.6139,
    lon: 77.2090
  },

  bangalore: {
    name: "Bangalore",
    country: "IN",
    lat: 12.9716,
    lon: 77.5946
  },

  bengaluru: {
    name: "Bangalore",
    country: "IN",
    lat: 12.9716,
    lon: 77.5946
  }
};

const getCityAnalysis = async (city) => {

  const { lat, lon } = city;

  const [
    current,
    forecast,
    uv
  ] = await Promise.all([
    getCurrentWeather(lat, lon),
    getForecast(lat, lon),
    getUVIndex(lat, lon)
  ]);

  const firstForecast =
    forecast?.list?.[0];

  const rainProbability =
    typeof firstForecast?.pop === "number"
      ? firstForecast.pop * 100
      : null;

  const weatherData = {

    temperature:
      current?.main?.temp ?? null,

    feelsLike:
      current?.main?.feels_like ?? null,

    humidity:
      current?.main?.humidity ?? null,

    pressure:
      current?.main?.pressure ?? null,

    visibility:
      typeof current?.visibility === "number"
        ? current.visibility / 1000
        : null,

    windSpeed:
      typeof current?.wind?.speed === "number"
        ? current.wind.speed * 3.6
        : null,

    weatherCondition:
      current?.weather?.[0]?.main ||
      "",

    precipitation:
      current?.rain?.["1h"] ?? null,

    uvIndex: uv?.uvIndex ?? uv ?? null,

    rainProbability,

    coordinates: {
      latitude: lat,
      longitude: lon
    }
  };

  const riskResult =
    analyzeWeatherRisk(
      weatherData,
      "general"
    );

  const trendResult =
    analyzeForecastTrend(
      forecast?.list || []
    );

  return {

    city: city.name,

    country: city.country,

    coordinates: {
      latitude: lat,
      longitude: lon
    },

    risks:
      riskResult.risks,

    overallRisk:
      riskResult.overallRisk,

    activityRisk:
      riskResult.activityRisk,

    overallTrend:
      trendResult.overallTrend,

    interactions:
      riskResult.interactions || []
  };
};

router.get(
  "/city-comparison",
  async (req, res) => {

    try {

      const {
        city1,
        city2,
        activity = "general"
      } = req.query;

      if (!city1 || !city2) {

        return res.status(400).json({
          success: false,
          message:
            "city1 and city2 are required."
        });
      }

      const resolveCity = (name) => {

        const key =
          name.trim().toLowerCase();

        return CITY_DATABASE[key] || null;
      };

      const resolvedCity1 =
        resolveCity(city1);

      const resolvedCity2 =
        resolveCity(city2);

      if (!resolvedCity1 ||
          !resolvedCity2) {

        return res.status(400).json({
          success: false,
          message:
            "Currently supported cities: Pune, Mumbai, Delhi and Bangalore."
        });
      }

      const [
        analysis1,
        analysis2
      ] = await Promise.all([

        getCityAnalysis(
          resolvedCity1
        ),

        getCityAnalysis(
          resolvedCity2
        )
      ]);

      const result =
        analyzeCityIntelligence({
          cities: [
            analysis1,
            analysis2
          ],
          activity
        });

      res.json({

        success: true,

        location: {
          city1:
            resolvedCity1.name,

          city2:
            resolvedCity2.name
        },

        data: result

      });

    } catch (error) {

      console.error(
        "City Intelligence error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to analyze city comparison.",

        error:
          error.message

      });
    }
  }
);

export default router;
