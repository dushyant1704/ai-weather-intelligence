const clamp = (value, min = 0, max = 100) => {
  return Math.max(min, Math.min(max, value));
};

const round = (value, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const getActivityRiskScore = (cityResult) => {
  const score =
    cityResult?.activityRisk?.score ??
    cityResult?.activityRisk?.activityRiskScore;

  return typeof score === "number" && Number.isFinite(score) ? score : null;
};

const getOverallRiskScore = (cityResult) => {
  const score = cityResult?.overallRisk?.score;

  return typeof score === "number" && Number.isFinite(score) ? score : null;
};

const getTrendScore = (cityResult) => {
  const score = cityResult?.overallTrend?.score;

  return typeof score === "number" ? score : 50;
};

const calculateCitySuitability = (cityResult) => {
  const activityRisk = getActivityRiskScore(cityResult);
  const overallRisk = getOverallRiskScore(cityResult);
  const trendScore = getTrendScore(cityResult);

  const activitySuitability = 100 - activityRisk;
  const generalSuitability = 100 - overallRisk;

  let trendAdjustment = 0;

  if (trendScore <= 35) {
    trendAdjustment = 5;
  } else if (trendScore >= 65) {
    trendAdjustment = -5;
  }

  const score =
    activitySuitability * 0.70 +
    generalSuitability * 0.20 +
    50 * 0.10 +
    trendAdjustment;

  return clamp(Math.round(score));
};

const classifySuitability = (score) => {
  if (score >= 80) return "EXCELLENT";
  if (score >= 65) return "GOOD";
  if (score >= 45) return "MODERATE";
  if (score >= 25) return "POOR";

  return "UNSUITABLE";
};

const getRiskLevel = (score) => {
  if (score >= 80) return "VERY HIGH";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MODERATE";

  return "LOW";
};

const getTrendLevel = (score) => {
  if (score >= 65) return "WORSENING";
  if (score <= 35) return "IMPROVING";

  return "STABLE";
};

const generateFactors = (cityResult) => {
  const positive = [];
  const negative = [];

  const risks = cityResult?.risks || {};

  const checkRisk = (name, label) => {
    const score = risks[name]?.score;

    if (typeof score !== "number") return;

    if (score <= 20) {
      positive.push(`Low ${label} risk`);
    }

    if (score >= 60) {
      negative.push(`High ${label} risk`);
    }
  };

  checkRisk("heat", "heat");
  checkRisk("uv", "UV");
  checkRisk("rain", "rain");
  checkRisk("wind", "wind");
  checkRisk("visibility", "visibility");

  const trendScore = getTrendScore(cityResult);

  if (trendScore <= 35) {
    positive.push("Improving forecast trend");
  }

  if (trendScore >= 65) {
    negative.push("Worsening forecast trend");
  }

  return {
    positive: positive.slice(0, 5),
    negative: negative.slice(0, 5)
  };
};

const generateRecommendation = (winner, activity) => {
  if (!winner) {
    return `No reliable city recommendation is available for ${activity}.`;
  }

  if (winner.suitability.score >= 80) {
    return `${winner.city} is the strongest option for ${activity} under the analyzed conditions.`;
  }

  if (winner.suitability.score >= 65) {
    return `${winner.city} is a good option for ${activity}, although some weather-related limitations remain.`;
  }

  if (winner.suitability.score >= 45) {
    return `${winner.city} is moderately suitable for ${activity}; consider the identified weather risks before deciding.`;
  }

  return `${winner.city} is not an ideal option for ${activity} under the analyzed conditions.`;
};

export const analyzeCityIntelligence = ({
  cities,
  activity = "general"
}) => {
  if (!Array.isArray(cities) || cities.length < 2) {
    return {
      agent: {
        name: "City Intelligence Agent",
        version: "1.0",
        status: "failed"
      },
      success: false,
      message: "At least two cities are required for comparison."
    };
  }

  const validCitiesInput = cities.filter((cityResult) => {
    const actScore = getActivityRiskScore(cityResult);
    const ovrScore = getOverallRiskScore(cityResult);
    return actScore !== null && ovrScore !== null && cityResult?.success !== false;
  });

  if (validCitiesInput.length < 2) {
    return {
      agent: {
        name: "City Intelligence Agent",
        version: "1.0",
        status: "failed"
      },
      success: false,
      message: "Insufficient or invalid weather risk data for city comparison."
    };
  }

  const analyzedCities = validCitiesInput.map((cityResult) => {

    const score = calculateCitySuitability(cityResult);

    const activityRiskScore =
      getActivityRiskScore(cityResult);

    const overallRiskScore =
      getOverallRiskScore(cityResult);

    const trendScore =
      getTrendScore(cityResult);

    const factors =
      generateFactors(cityResult);

    return {
      city: cityResult.city,
      country: cityResult.country,

      suitability: {
        score,
        classification: classifySuitability(score)
      },

      risk: {
        score: round(overallRiskScore),
        level: getRiskLevel(overallRiskScore)
      },

      activityRisk: {
        score: round(activityRiskScore),
        level: getRiskLevel(activityRiskScore)
      },

      trend: {
        score: round(trendScore),
        level: getTrendLevel(trendScore)
      },

      factors,

      coordinates:
        cityResult.coordinates || null
    };
  });

  analyzedCities.sort(
    (a, b) =>
      b.suitability.score -
      a.suitability.score
  );

  const winner = analyzedCities[0];

  const runnerUp = analyzedCities[1];

  const scoreDifference =
    runnerUp
      ? round(
          winner.suitability.score -
          runnerUp.suitability.score
        )
      : null;

  return {
    agent: {
      name: "City Intelligence Agent",
      version: "1.0",
      status: "completed"
    },

    activity,

    citiesAnalyzed:
      analyzedCities.length,

    ranking:
      analyzedCities.map((city, index) => ({
        rank: index + 1,
        city: city.city,
        suitabilityScore:
          city.suitability.score,
        classification:
          city.suitability.classification,
        riskLevel:
          city.risk.level,
        trendLevel:
          city.trend.level
      })),

    winner: {
      city: winner.city,
      score: winner.suitability.score,
      classification:
        winner.suitability.classification,
      scoreDifference
    },

    recommendation:
      generateRecommendation(
        winner,
        activity
      ),

    comparison: analyzedCities
  };
};