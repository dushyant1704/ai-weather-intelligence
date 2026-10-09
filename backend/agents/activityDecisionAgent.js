const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const getClassification = (score) => {
  if (score >= 80) return "EXCELLENT";
  if (score >= 65) return "GOOD";
  if (score >= 45) return "MODERATE";
  if (score >= 25) return "POOR";
  return "UNSUITABLE";
};

const getTrendAdjustment = (trend) => {
  if (!trend) return 0;

  if (trend.level === "IMPROVING") {
    return 5;
  }

  if (trend.level === "WORSENING") {
    return -5;
  }

  return 0;
};

const getRiskFactors = (risks) => {
  const positive = [];
  const negative = [];

  Object.entries(risks || {}).forEach(
    ([factor, data]) => {
      const rawScore = data?.score;

      if (
        rawScore === null ||
        rawScore === undefined ||
        rawScore === "" ||
        typeof rawScore === "boolean" ||
        !Number.isFinite(Number(rawScore))
      ) {
        return;
      }

      const score = Number(rawScore);

      const name =
        factor.charAt(0).toUpperCase() +
        factor.slice(1);

      if (score <= 20) {
        positive.push(
          `Low ${name} risk`
        );
      }

      if (score >= 60) {
        negative.push(
          `High ${name} risk`
        );
      }
    }
  );

  return {
    positive,
    negative
  };
};

const generateRecommendation = ({
  activity,
  classification,
  score,
  trendLevel,
  negativeFactors,
  interactions
}) => {
  if (classification === "EXCELLENT") {
    return `${activity} appears highly suitable under the analyzed conditions.`;
  }

  if (classification === "GOOD") {
    if (trendLevel === "WORSENING") {
      return `${activity} is currently suitable, but conditions may become less favorable later.`;
    }

    return `${activity} appears suitable under the analyzed conditions with normal precautions.`;
  }

  if (classification === "MODERATE") {
    return `${activity} is possible, but consider the identified weather factors before proceeding.`;
  }

  if (classification === "POOR") {
    return `Consider postponing ${activity} or choosing a more favorable time window.`;
  }

  return `The analyzed conditions are not favorable for ${activity}.`;
};

export const analyzeActivityDecision = ({
  activity = "general",
  riskResult,
  trendResult
}) => {
  if (!riskResult) {
    return {
      agent: {
        name: "Activity Decision Agent",
        version: "1.0",
        status: "failed"
      },

      success: false,

      message:
        "Risk assessment data is required."
    };
  }

  const activityRisk =
    riskResult.activityRisk;

  if (!activityRisk) {
    return {
      agent: {
        name: "Activity Decision Agent",
        version: "1.0",
        status: "failed"
      },

      success: false,

      message:
        "Activity-specific risk data is missing."
    };
  }

  const rawRiskScore = activityRisk?.score;

  const isInvalidScore =
    rawRiskScore === null ||
    rawRiskScore === undefined ||
    rawRiskScore === "" ||
    typeof rawRiskScore === "boolean" ||
    !Number.isFinite(Number(rawRiskScore)) ||
    Number(rawRiskScore) < 0 ||
    Number(rawRiskScore) > 100;

  if (isInvalidScore) {
    return {
      agent: {
        name: "Activity Decision Agent",
        version: "1.0",
        status: "failed"
      },

      success: false,

      message:
        "Valid activity-specific risk score is required."
    };
  }

  const riskScore = Number(rawRiskScore);

  const baseSuitability =
    100 - riskScore;

  const trendLevel =
    trendResult?.overallTrend?.level ||
    "STABLE";

  const trendAdjustment =
    getTrendAdjustment(
      trendResult?.overallTrend
    );

  const finalScore = Math.round(
    clamp(
      baseSuitability +
        trendAdjustment
    )
  );

  const classification =
    getClassification(
      finalScore
    );

  const factorAnalysis =
    getRiskFactors(
      riskResult.risks
    );

  const interactions =
    riskResult.interactions || [];

  const recommendation =
    generateRecommendation({
      activity,
      classification,
      score: finalScore,
      trendLevel,
      negativeFactors:
        factorAnalysis.negative,
      interactions
    });

  return {
    agent: {
      name: "Activity Decision Agent",
      version: "1.0",
      status: "completed"
    },

    activity,

    suitability: {
      score: finalScore,
      classification
    },

    riskAssessment: {
      activityRiskScore: riskScore,
      activityRiskLevel:
        activityRisk.level,

      overallRiskScore:
        riskResult.overallRisk?.score ??
        null,

      overallRiskLevel:
        riskResult.overallRisk?.level ??
        null
    },

    forecastContext: {
      trendLevel,
      trendScore:
        trendResult?.overallTrend?.score ??
        null,

      trendAdjustment
    },

    factors: {
      positive:
        factorAnalysis.positive,

      negative:
        factorAnalysis.negative
    },

    interactions,

    decision: {
      recommendation,

      cautionRequired:
        finalScore < 65
    }
  };
};