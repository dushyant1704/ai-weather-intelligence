
import { analyzeWeatherData } from "./dataIntelligenceAgent.js";
import { analyzeWeatherRisk } from "./riskIntelligenceAgent.js";
import { analyzeForecastTrend } from "./forecastTrendAgent.js";
import { analyzeActivityDecision } from "./activityDecisionAgent.js";
import { analyzeCityIntelligence } from "./cityIntelligenceAgent.js";
import { reasonAboutWeather } from "./weatherReasoningAgent.js";
import {
  searchLocations,
  getCurrentWeather,
  getForecast,
  getUVIndex
} from "../services/openWeatherService.js";

const CITY_DATABASE = {
  pune: { name: "Pune", country: "IN", lat: 18.5204, lon: 73.8567 },
  mumbai: { name: "Mumbai", country: "IN", lat: 19.0760, lon: 72.8777 },
  delhi: { name: "Delhi", country: "IN", lat: 28.6139, lon: 77.2090 },
  bangalore: { name: "Bangalore", country: "IN", lat: 12.9716, lon: 77.5946 },
  bengaluru: { name: "Bangalore", country: "IN", lat: 12.9716, lon: 77.5946 },
  indore: { name: "Indore", country: "IN", lat: 22.7196, lon: 75.8577 }
};

const normalizeQuery = (query = "") => {
  return String(query)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

// Match complete words instead of accidental substrings.
const containsKeyword = (query, keyword) => {
  const escaped = keyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  return new RegExp(`\\b${escaped}\\b`, "i").test(query);
};

const detectActivity = (query) => {
  const activities = {
    running: ["running", "run", "jogging", "jog"],
    walking: ["walking", "walk"],
    cycling: ["cycling", "bike ride", "biking"],
    cricket: ["cricket"],
    travel: ["travel", "trip", "journey"],
    photography: ["photography", "photo", "photograph"],
    driving: ["driving", "drive"],
    outdoor_event: ["outdoor event", "event", "picnic"]
  };

  for (const [activity, keywords] of Object.entries(activities)) {
    if (keywords.some(keyword => containsKeyword(query, keyword))) {
      return activity;
    }
  }

  return null;
};

// Bengaluru and Bangalore are aliases for one city.
const detectCities = (query) => {
  const cityAliases = {
    pune: ["pune"],
    mumbai: ["mumbai"],
    delhi: ["delhi"],
    bangalore: ["bangalore", "bengaluru"],
    indore: ["indore"]
  };

  const detectedCities = [];

  for (const [city, aliases] of Object.entries(cityAliases)) {
    if (aliases.some(alias => containsKeyword(query, alias))) {
      detectedCities.push(city);
    }
  }

  return detectedCities;
};

const detectIntent = (query) => {
  const normalized = normalizeQuery(query);
  const cities = detectCities(normalized);
  const activity = detectActivity(normalized);

  const comparisonKeywords = [
    "compare",
    "comparison",
    "which is better",
    "better between",
    "versus",
    "vs",
    "or"
  ];

  const riskKeywords = [
    "risk",
    "danger",
    "dangerous",
    "safe",
    "safety",
    "hazard"
  ];

  const trendKeywords = [
    "trend",
    "forecast",
    "tomorrow",
    "later",
    "next few hours",
    "next hours",
    "improving",
    "worsening",
    "getting worse"
  ];

  const reasoningKeywords = [
    "why",
    "feels",
    "uncomfortable",
    "explain",
    "reason"
  ];

  const matchesAny = keywords =>
    keywords.some(keyword => containsKeyword(normalized, keyword));

  if (
    cities.length >= 2 &&
    (matchesAny(comparisonKeywords) || activity)
  ) {
    return {
      intent: "CITY_COMPARISON",
      activity: activity || "general",
      cities,
      confidence: 0.95
    };
  }

  if (matchesAny(riskKeywords)) {
    return {
      intent: "RISK_ASSESSMENT",
      activity: activity || "general",
      cities,
      confidence: 0.88
    };
  }

  if (matchesAny(trendKeywords)) {
    return {
      intent: "FORECAST_TREND",
      activity: activity || "general",
      cities,
      confidence: 0.85
    };
  }

  if (matchesAny(reasoningKeywords)) {
    return {
      intent: "WEATHER_REASONING",
      activity: activity || "general",
      cities,
      confidence: 0.85
    };
  }

  if (activity) {
    return {
      intent: "ACTIVITY_DECISION",
      activity,
      cities,
      confidence: 0.90
    };
  }

  return {
    intent: "GENERAL_WEATHER",
    activity: "general",
    cities,
    confidence: 0.60
  };
};

const buildExecutionPlan = (intentResult) => {
  const plans = {
    CITY_COMPARISON: [
      "data", "risk", "trend", "activity", "city"
    ],
    ACTIVITY_DECISION: [
      "data", "risk", "trend", "activity"
    ],
    RISK_ASSESSMENT: [
      "data", "risk"
    ],
    FORECAST_TREND: [
      "data", "trend"
    ],
    WEATHER_REASONING: [
      "data", "reasoning"
    ],
    GENERAL_WEATHER: [
      "data"
    ]
  };

  return plans[intentResult.intent] || ["data"];
};

const formatCurrentForDataAgent = (current, latitude, longitude) => {
  if (!current) return null;
  return {
    cityName: current?.name || current?.cityName || "",
    country: current?.sys?.country || current?.country || "",
    coord: {
      lat: Number.isFinite(current?.coord?.lat)
        ? current.coord.lat
        : (Number.isFinite(latitude) ? latitude : null),
      lon: Number.isFinite(current?.coord?.lon)
        ? current.coord.lon
        : (Number.isFinite(longitude) ? longitude : null)
    },
    temperature:
      typeof current?.main?.temp === "number"
        ? current.main.temp
        : (current?.temperatureCelsius ?? current?.temperature ?? null),
    feelsLike:
      typeof current?.main?.feels_like === "number"
        ? current.main.feels_like
        : (current?.feelsLikeCelsius ?? current?.feelsLike ?? null),
    humidity:
      typeof current?.main?.humidity === "number"
        ? current.main.humidity
        : (current?.humidityPercent ?? current?.humidity ?? null),
    pressure:
      typeof current?.main?.pressure === "number"
        ? current.main.pressure
        : (current?.pressureHpa ?? current?.pressure ?? null),
    visibility:
      typeof current?.visibility === "number"
        ? (current.visibility > 100 ? current.visibility / 1000 : current.visibility)
        : (current?.visibilityKm ?? null),
    windSpeed:
      typeof current?.wind?.speed === "number"
        ? current.wind.speed * 3.6
        : (current?.windSpeedKmh ?? current?.windSpeed ?? null),
    weatherCondition:
      current?.weather?.[0]?.main || current?.condition || current?.weatherCondition || "",
    weatherDescription:
      current?.weather?.[0]?.description || current?.description || current?.weatherDescription || "",
    iconCode:
      current?.weather?.[0]?.icon || current?.iconCode || "",
    dt: current?.dt || null
  };
};

export const prepareWeatherData = (current, forecast, uvData) => {
  const firstForecast = forecast?.list?.[0];
  const rainProbability =
    typeof firstForecast?.pop === "number"
      ? firstForecast.pop
      : null;

  return {
    cityName: current?.name || current?.cityName || "",
    country: current?.sys?.country || current?.country || "",
    coord: {
      lat: current?.coord?.lat ?? current?.coord?.latitude ?? null,
      lon: current?.coord?.lon ?? current?.coord?.longitude ?? null
    },
    temperatureCelsius:
      typeof current?.main?.temp === "number"
        ? current.main.temp
        : (current?.temperatureCelsius ?? current?.temperature ?? null),
    feelsLikeCelsius:
      typeof current?.main?.feels_like === "number"
        ? current.main.feels_like
        : (current?.feelsLikeCelsius ?? current?.feelsLike ?? null),
    humidityPercent:
      typeof current?.main?.humidity === "number"
        ? current.main.humidity
        : (current?.humidityPercent ?? current?.humidity ?? null),
    pressureHpa:
      typeof current?.main?.pressure === "number"
        ? current.main.pressure
        : (current?.pressureHpa ?? current?.pressure ?? null),
    windSpeedKmh:
      typeof current?.wind?.speed === "number"
        ? current.wind.speed * 3.6
        : (current?.windSpeedKmh ?? current?.windSpeed ?? null),
    visibilityKm:
      typeof current?.visibility === "number"
        ? (current.visibility > 100 ? current.visibility / 1000 : current.visibility)
        : (current?.visibilityKm ?? current?.visibility ?? null),
    condition:
      current?.weather?.[0]?.main || current?.condition || current?.weatherCondition || "",
    description:
      current?.weather?.[0]?.description || current?.description || "",
    rainProbability,
    uvIndex:
      typeof uvData?.uvIndex === "number"
        ? uvData.uvIndex
        : (typeof uvData === "number" ? uvData : null)
  };
};

export const orchestrateWeatherQuery = ({
  query,
  latitude,
  longitude
}) => {
  const intentResult = detectIntent(query);
  const executionPlan = buildExecutionPlan(intentResult);

  return {
    orchestrator: {
      name: "AI Weather Orchestrator",
      version: "1.0",
      status: "planned"
    },
    query,
    location: {
      latitude,
      longitude
    },
    intent: intentResult.intent,
    activity: intentResult.activity,
    cities: intentResult.cities,
    routingConfidence: intentResult.confidence,
    executionPlan,
    routingReason:
      `Query classified as ${intentResult.intent}. ` +
      `Selected ${executionPlan.length} specialized agent(s).`
  };
};

const buildCityAnalyses = async (cityNames, activity = "general") => {
  const analyses = [];

  for (const name of cityNames) {
    if (typeof name !== "string" || !name.trim()) continue;

    let lat = null;
    let lon = null;
    let cityName = name;
    let countryName = "";

    const key = name.trim().toLowerCase();

    if (CITY_DATABASE[key]) {
      lat = CITY_DATABASE[key].lat;
      lon = CITY_DATABASE[key].lon;
      cityName = CITY_DATABASE[key].name;
      countryName = CITY_DATABASE[key].country;
    } else {
      try {
        const locations = await searchLocations(name);
        if (locations.length > 0) {
          lat = locations[0].lat;
          lon = locations[0].lon;
          cityName = locations[0].name;
          countryName = locations[0].country;
        }
      } catch (err) {
        console.warn(`Failed to locate city ${name}:`, err.message);
      }
    }

    if (lat === null || lon === null) continue;

    try {
      const [current, forecast, uv] = await Promise.all([
        getCurrentWeather(lat, lon),
        getForecast(lat, lon),
        getUVIndex(lat, lon)
      ]);

      const prepared = prepareWeatherData(current, forecast, uv);

      const riskResult = analyzeWeatherRisk({
        current: prepared,
        uvIndex: prepared.uvIndex,
        rainProbability: prepared.rainProbability,
        activity
      });

      const trendResult = analyzeForecastTrend(forecast?.list || []);

      analyses.push({
        city: cityName || current?.name || name,
        country: countryName || current?.sys?.country || "",
        coordinates: { latitude: lat, longitude: lon },
        risks: riskResult.risks,
        overallRisk: riskResult.overallRisk,
        activityRisk: riskResult.activityRisk,
        overallTrend: trendResult.overallTrend,
        interactions: riskResult.interactions || []
      });
    } catch (err) {
      console.warn(`Failed to generate analysis for city ${name}:`, err.message);
    }
  }

  return analyses;
};

export const executeWeatherPlan = async ({
  query = "",
  latitude = null,
  longitude = null,
  current = null,
  forecast = null,
  uvData = null,
  activity = null,
  cityAnalyses = [],
  cities = []
}) => {
  const plan = orchestrateWeatherQuery({ query, latitude, longitude });
  const selectedActivity = activity || plan.activity || "general";
  const executionPlan = plan.executionPlan || ["data"];

  let activeLat = Number.isFinite(latitude) ? latitude : null;
  let activeLon = Number.isFinite(longitude) ? longitude : null;

  // Resolve coordinates from explicit coordinates, detected city names, or a city mentioned in the query.
  const targetCities = (Array.isArray(cities) && cities.length > 0) ? cities : (plan.cities || []);
  let queryCity = null;
  if (activeLat === null || activeLon === null) {
    const normalizedQuery = String(query || "").trim();
    const locationMatch = normalizedQuery.match(/\b(?:in|for|at|near)\s+([a-zA-Z][a-zA-Z .'-]{1,60}?)(?:[?!.,]|$)/i);
    if (locationMatch) queryCity = locationMatch[1].trim();
    else if (normalizedQuery && !detectActivity(normalizedQuery) &&
      !/\b(weather|forecast|risk|safe|safety|trend|tomorrow|today|conditions)\b/i.test(normalizedQuery)) {
      queryCity = normalizedQuery;
    }
  }
  const cityToResolve = (targetCities.length > 0 && typeof targetCities[0] === "string")
    ? targetCities[0]
    : queryCity;

  if ((activeLat === null || activeLon === null) && cityToResolve && typeof cityToResolve === "string") {
    const cityKey = cityToResolve.toLowerCase().trim();
    if (CITY_DATABASE[cityKey]) {
      activeLat = CITY_DATABASE[cityKey].lat;
      activeLon = CITY_DATABASE[cityKey].lon;
    } else {
      try {
        const locations = await searchLocations(cityToResolve);
        if (locations.length > 0) {
          activeLat = locations[0].lat;
          activeLon = locations[0].lon;
        }
      } catch (err) {
        console.warn(`Location search failed for city ${cityToResolve}:`, err.message);
      }
    }
  }

  // Fetch weather data if not provided
  let currentData = current;
  let forecastData = forecast;
  let uvVal = uvData;

  if ((!currentData || !forecastData) && activeLat !== null && activeLon !== null) {
    try {
      const [fetchedCurrent, fetchedForecast, fetchedUv] = await Promise.all([
        currentData ? Promise.resolve(currentData) : getCurrentWeather(activeLat, activeLon),
        forecastData ? Promise.resolve(forecastData) : getForecast(activeLat, activeLon),
        (uvVal !== null && uvVal !== undefined) ? Promise.resolve(uvVal) : getUVIndex(activeLat, activeLon)
      ]);
      currentData = fetchedCurrent;
      forecastData = fetchedForecast;
      uvVal = fetchedUv;
    } catch (err) {
      return {
        orchestrator: {
          name: "AI Weather Orchestrator",
          version: "1.0",
          status: "failed"
        },
        success: false,
        message: `Failed to fetch weather data: ${err.message}`,
        intent: plan.intent,
        activity: selectedActivity,
        executionPlan
      };
    }
  }

  if (!currentData) {
    return {
      orchestrator: {
        name: "AI Weather Orchestrator",
        version: "1.0",
        status: "failed"
      },
      success: false,
      message: "Weather data is required for orchestration. Provide coordinates or city in request.",
      intent: plan.intent,
      activity: selectedActivity,
      executionPlan
    };
  }

  // 1. Data Intelligence Agent (always first step)
  const formattedCurrentForData = formatCurrentForDataAgent(currentData, activeLat, activeLon);
  const rawUvNumber = typeof uvVal === "number" ? uvVal : (typeof uvVal?.uvIndex === "number" ? uvVal.uvIndex : null);

  const dataQualityResult = analyzeWeatherData({
    current: formattedCurrentForData,
    forecast: forecastData,
    uv: rawUvNumber
  });

  if (!dataQualityResult?.decision?.readyForAI) {
    return {
      orchestrator: {
        name: "AI Weather Orchestrator",
        version: "1.0",
        status: "failed"
      },
      success: false,
      message: "Weather data is insufficient for downstream decision-making.",
      intent: plan.intent,
      activity: selectedActivity,
      executionPlan,
      dataQuality: dataQualityResult?.dataQuality,
      checks: dataQualityResult?.checks
    };
  }

  const preparedWeather = prepareWeatherData(currentData, forecastData, uvVal);
  const results = {
    orchestrator: {
      name: "AI Weather Orchestrator",
      version: "1.0",
      status: "completed"
    },
    success: true,
    query,
    intent: plan.intent,
    activity: selectedActivity,
    executionPlan,
    dataQuality: dataQualityResult.dataQuality,
    normalizedData: dataQualityResult.normalizedData
  };

  // 2. Risk Intelligence Agent
  if (executionPlan.includes("risk")) {
    try {
      results.riskResult = analyzeWeatherRisk({
        current: preparedWeather,
        uvIndex: preparedWeather.uvIndex,
        rainProbability: preparedWeather.rainProbability,
        activity: selectedActivity
      });
    } catch (err) {
      results.riskResult = {
        agent: { name: "Risk Intelligence Agent", version: "2.0.0", status: "failed" },
        success: false,
        message: err.message || "Risk analysis failed."
      };
    }
  }

  // 3. Forecast Trend Agent
  if (executionPlan.includes("trend")) {
    try {
      results.trendResult = analyzeForecastTrend(forecastData?.list || []);
    } catch (err) {
      results.trendResult = {
        agent: { name: "Forecast Trend Agent", version: "1.0", status: "failed" },
        success: false,
        message: err.message || "Forecast trend analysis failed."
      };
    }
  }

  // 4. Activity Decision Agent
  if (executionPlan.includes("activity")) {
    try {
      if (!results.riskResult || results.riskResult.activityRisk?.score === null || results.riskResult.activityRisk?.score === undefined) {
        results.activityDecision = {
          agent: { name: "Activity Decision Agent", version: "1.0", status: "failed" },
          success: false,
          message: "Activity decision requires a valid activity-specific risk score."
        };
      } else {
        results.activityDecision = analyzeActivityDecision({
          activity: selectedActivity,
          riskResult: results.riskResult,
          trendResult: results.trendResult
        });
      }
    } catch (err) {
      results.activityDecision = {
        agent: { name: "Activity Decision Agent", version: "1.0", status: "failed" },
        success: false,
        message: err.message || "Activity decision analysis failed."
      };
    }
  }

  // 5. City Intelligence Agent
  if (executionPlan.includes("city")) {
    try {
      let resolvedCityAnalyses = [];

      if (Array.isArray(cityAnalyses) && cityAnalyses.length >= 2) {
        resolvedCityAnalyses = cityAnalyses;
      } else if (Array.isArray(cities) && cities.length >= 2 && typeof cities[0] === "object" && cities[0] !== null) {
        resolvedCityAnalyses = cities;
      } else {
        const cityNames = (Array.isArray(cities) && cities.length >= 2)
          ? cities
          : (plan.cities && plan.cities.length >= 2 ? plan.cities : []);

        if (cityNames.length >= 2) {
          resolvedCityAnalyses = await buildCityAnalyses(cityNames, selectedActivity);
        }
      }

      if (!Array.isArray(resolvedCityAnalyses) || resolvedCityAnalyses.length < 2) {
        results.cityResult = {
          agent: { name: "City Intelligence Agent", version: "1.0", status: "failed" },
          success: false,
          message: "At least two cities with valid weather data are required for comparison."
        };
      } else {
        results.cityResult = analyzeCityIntelligence({
          cities: resolvedCityAnalyses,
          activity: selectedActivity
        });
      }
    } catch (err) {
      results.cityResult = {
        agent: { name: "City Intelligence Agent", version: "1.0", status: "failed" },
        success: false,
        message: err.message || "City comparison failed."
      };
    }
  }

  // 6. Weather Reasoning Agent
  if (executionPlan.includes("reasoning")) {
    try {
      results.reasoningResult = reasonAboutWeather({
        current: preparedWeather,
        uvIndex: preparedWeather.uvIndex
      });
    } catch (err) {
      results.reasoningResult = {
        agent: { name: "Weather Reasoning Agent", version: "1.0.0", status: "failed" },
        success: false,
        message: err.message || "Weather reasoning failed."
      };
    }
  }

  return results;
};

export const executeOrchestratedQuery = executeWeatherPlan;

