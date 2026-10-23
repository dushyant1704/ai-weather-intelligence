/**
 * Conflict Arbitration & Replanning Agent
 * 
 * Specialized multi-agent arbiter that actively monitors agent interactions,
 * detects direct disagreements between specialist agents (e.g., Risk Intelligence
 * flagging an acute hazard while Activity Decision scores favorably), adjudicates
 * the conflict using safety invariance principles, and negotiates a dynamic replan.
 */

const clamp = (val, min = 0, max = 100) => Math.min(Math.max(val, min), max);

/**
 * Activity-specific critical hazard thresholds where risk must overrule general suitability.
 */
const HAZARD_THRESHOLDS = {
  cycling: {
    wind: { threshold: 38, name: "Wind Speed / Gusts", unit: "km/h", reason: "Severe crosswind tipping & bike handling hazard" },
    rain: { threshold: 60, name: "Precipitation Risk", unit: "%", reason: "Loss of tire traction and reduced brake responsiveness" }
  },
  running: {
    heat: { threshold: 65, name: "Heat / Humidity Index", unit: "risk score", reason: "Elevated risk of heat exhaustion and impaired thermoregulation" },
    wind: { threshold: 45, name: "High Wind Resistance", unit: "km/h", reason: "High physical resistance and airborne debris hazard" },
    rain: { threshold: 70, name: "Heavy Rain / Storm", unit: "%", reason: "Hypothermia risk and slick asphalt hazard" }
  },
  hiking: {
    wind: { threshold: 45, name: "Exposed Ridge Winds", unit: "km/h", reason: "Fall hazard on steep or exposed mountain terrain" },
    rain: { threshold: 60, name: "Mountain Storm / Rain", unit: "%", reason: "Flash flood, slick rock, and rapid temperature drop hazard" }
  },
  swimming: {
    wind: { threshold: 30, name: "Surface Choppiness & Rip Currents", unit: "km/h", reason: "Dangerous open water chop and unmonitored currents" },
    rain: { threshold: 50, name: "Precipitation / Convective Storm", unit: "%", reason: "Lightning strike hazard on open water bodies" }
  },
  general: {
    wind: { threshold: 50, name: "Gale-force Wind", unit: "km/h", reason: "Structural hazard and falling branches" },
    rain: { threshold: 70, name: "Severe Downpour", unit: "%", reason: "Flooding and severe travel delay" }
  }
};

/**
 * Dynamic Replanning Strategy Generator
 */
const generateReplannedStrategy = ({
  activity,
  conflictReason: _conflictReason,
  hazardCategory,
  forecastList = [],
  currentWeather: _currentWeather = {}
}) => {
  const normActivity = (activity || "general").toLowerCase();

  // 1. Activity / Venue Substitutions
  const substitutions = {
    cycling: [
      "Indoor stationary trainer / smart bike session (Zwift/Peloton)",
      "Low-wind sheltered urban circuit or indoor velodrome",
      "Off-bike functional mobility & lower-body strength session"
    ],
    running: [
      "Indoor treadmill interval workout with incline simulation",
      "Sheltered park loop protected by dense tree canopy or leeward ridge",
      "Indoor track or cross-training low-impact session (elliptical/pool)"
    ],
    hiking: [
      "Low-elevation forested trail below the wind-exposed tree line",
      "Indoor climbing gym or visitor center interpretive trail",
      "Reschedule summit trek for stable high-pressure atmospheric window"
    ],
    swimming: [
      "Indoor heated 25m/50m lap pool facility",
      "Dry-land swim conditioning and resistance band shoulder work",
      "Postpone open-water swim until surf, tide, and storm indices clear"
    ],
    general: [
      "Indoor fitness or cultural venue activity",
      "Sheltered covered pavilion or indoor recreation facility",
      "Reschedule outdoor portion until atmospheric risk subsides"
    ]
  };

  // 2. Temporal Window Re-evaluation: Scan forecast steps to find when hazard clears
  let optimalReplannedWindow = null;
  if (Array.isArray(forecastList) && forecastList.length > 0) {
    for (let i = 0; i < Math.min(forecastList.length, 8); i++) {
      const step = forecastList[i];
      const stepWind = step?.wind?.speed ? step.wind.speed * 3.6 : 0; // m/s to km/h
      const stepPop = typeof step?.pop === "number" ? step.pop * 100 : 0;
      const stepDt = step?.dt_txt || "";

      let isSafe = true;
      if (hazardCategory === "wind" && stepWind > 30) isSafe = false;
      if (hazardCategory === "rain" && stepPop > 35) isSafe = false;

      if (isSafe && stepDt) {
        optimalReplannedWindow = `Favorable opening predicted around ${stepDt.split(" ")[1]?.slice(0, 5) || stepDt} (Wind ~${Math.round(stepWind)} km/h, Rain Prob ~${Math.round(stepPop)}%)`;
        break;
      }
    }
  }

  if (!optimalReplannedWindow) {
    optimalReplannedWindow = "Recommended delay: 3 to 5 hours or tomorrow morning for next stable meteorological window.";
  }

  // 3. Compensatory Safeguards if User Insists on Proceeding
  const safeguards = {
    cycling: ["Equip low-profile wheels (avoid deep-dish rims)", "Ride on leeward side of hills", "Wear high-vis windproof shell", "Carry charged beacon"],
    running: ["Reduce planned pace by 15-20%", "Stay on well-lit urban sidewalk", "Wear waterproof breathable shell", "Carry electrolyte hydration"],
    hiking: ["Carry emergency bivvy sack and waterproof layers", "Avoid exposed ridgelines", "Share GPS trail tracking with family"],
    swimming: ["Stay strictly within designated supervised lifeguard zones", "Never swim solo in open water", "Check local beach warning flags"],
    general: ["Monitor radar alerts every 30 minutes", "Identify immediate indoor shelters along route"]
  };

  return {
    activitySubstitution: substitutions[normActivity] || substitutions.general,
    optimalReplannedWindow,
    compensatorySafeguards: safeguards[normActivity] || safeguards.general
  };
};

/**
 * Analyze multi-agent outputs, detect disagreements, arbitrate conflicts, and replan.
 */
export const arbitrateAgentDisagreements = ({
  activity = "general",
  activityDecision = null,
  riskResult = null,
  trendResult = null,
  reasoningResult = null,
  forecastList = [],
  current = {}
}) => {
  // If activityDecision or riskResult are missing, arbitration cannot find an active conflict
  if (!activityDecision || !riskResult) {
    return {
      agent: {
        name: "Conflict Arbitration & Replanning Agent",
        version: "2.0.0",
        status: "idle"
      },
      hasConflict: false,
      status: "insufficient_data",
      message: "Arbitration requires both Activity Decision and Risk Assessment outputs."
    };
  }

  const initialScore = Number(activityDecision?.suitability?.score ?? 0);
  const initialClassification = activityDecision?.suitability?.classification || "UNKNOWN";
  const risks = riskResult?.risks || {};
  const trendLevel = trendResult?.overallTrend?.level || "STABLE";

  const conflictsDetected = [];

  // =========================================================================
  // CONFLICT PATTERN 1: Acute Hazard vs Favorable Activity (The Reviewer's Case)
  // Activity Decision scored favorably (>= 60), but Risk Intelligence flagged
  // an acute severe hazard in a specific dimension (wind, rain, heat, uv).
  // =========================================================================
  if (initialScore >= 60 || initialClassification === "GOOD" || initialClassification === "EXCELLENT") {
    // Check Wind Hazard
    const windRisk = risks.wind;
    if (windRisk && (windRisk.score >= 60 || windRisk.level === "HIGH" || windRisk.level === "VERY HIGH")) {
      conflictsDetected.push({
        conflictType: "ACUTE_HAZARD_VS_ACTIVITY",
        hazardCategory: "wind",
        opposingAgent: {
          name: "Risk Intelligence Agent",
          stance: "HAZARD_OBJECTION",
          metric: "Wind Risk Score",
          value: windRisk.score,
          factors: windRisk.factors || ["High wind gusts detected"]
        },
        favoredAgent: {
          name: "Activity Decision Agent",
          stance: "FAVORABLE_PROPOSAL",
          metric: "Initial Suitability Score",
          value: initialScore,
          rationale: `Evaluated ${activity} as ${initialClassification} (${initialScore}/100) based on overall atmospheric comfort.`
        },
        arbitrationPrinciple: "Kinematic Safety Invariance: Lateral wind shear and gust destabilization overrule thermal comfort for outdoor activities."
      });
    }

    // Check Rain / Storm Hazard
    const rainRisk = risks.rain;
    if (rainRisk && (rainRisk.score >= 60 || rainRisk.level === "HIGH" || rainRisk.level === "VERY HIGH")) {
      conflictsDetected.push({
        conflictType: "ACUTE_HAZARD_VS_ACTIVITY",
        hazardCategory: "rain",
        opposingAgent: {
          name: "Risk Intelligence Agent",
          stance: "HAZARD_OBJECTION",
          metric: "Precipitation / Storm Risk",
          value: rainRisk.score,
          factors: rainRisk.factors || ["Heavy precipitation or convective cells"]
        },
        favoredAgent: {
          name: "Activity Decision Agent",
          stance: "FAVORABLE_PROPOSAL",
          metric: "Initial Suitability Score",
          value: initialScore,
          rationale: `Evaluated ${activity} as ${initialClassification} (${initialScore}/100).`
        },
        arbitrationPrinciple: "Precipitation Invariance Axiom: Active convective storm cells present non-negotiable lightning and hydroplaning hazards."
      });
    }

    // Check Extreme Heat / UV Hazard
    const heatRisk = risks.heat;
    const uvRisk = risks.uv;
    if ((heatRisk && heatRisk.score >= 70) || (uvRisk && uvRisk.score >= 75)) {
      const dominant = (heatRisk?.score || 0) >= (uvRisk?.score || 0) ? { cat: "heat", obj: heatRisk } : { cat: "uv", obj: uvRisk };
      conflictsDetected.push({
        conflictType: "ACUTE_HAZARD_VS_ACTIVITY",
        hazardCategory: dominant.cat,
        opposingAgent: {
          name: "Risk Intelligence Agent",
          stance: "HAZARD_OBJECTION",
          metric: dominant.cat === "heat" ? "Heat Strain Score" : "UV Radiation Score",
          value: dominant.obj.score,
          factors: dominant.obj.factors || ["Extreme radiation or thermal stress"]
        },
        favoredAgent: {
          name: "Activity Decision Agent",
          stance: "FAVORABLE_PROPOSAL",
          metric: "Initial Suitability Score",
          value: initialScore,
          rationale: `Activity Decision scored ${activity} favorably (${initialScore}/100).`
        },
        arbitrationPrinciple: "Physiological Thermoregulation Axiom: Hyperthermic and actinic damage risks overrule clear-sky recreational feasibility."
      });
    }
  }

  // =========================================================================
  // CONFLICT PATTERN 2: Deceptive Present vs Worsening Trend Trajectory
  // Current conditions are rated acceptable, but Forecast Trend Agent reports
  // steep worsening conditions in upcoming intervals.
  // =========================================================================
  if (initialScore >= 55 && trendLevel === "WORSENING") {
    const trendReason = trendResult?.overallTrend?.reason || "Rapid frontal deterioration detected";
    conflictsDetected.push({
      conflictType: "TEMPORAL_DIVERGENCE",
      hazardCategory: "trend",
      opposingAgent: {
        name: "Forecast Trend Agent",
        stance: "TEMPORAL_OBJECTION",
        metric: "Trend Direction",
        value: "WORSENING",
        factors: [trendReason]
      },
      favoredAgent: {
        name: "Activity Decision Agent",
        stance: "FAVORABLE_PROPOSAL",
        metric: "Initial Suitability Score",
        value: initialScore,
        rationale: "Current instantaneous sensor readings appear viable."
      },
      arbitrationPrinciple: "Temporal Trajectory Axiom: Immediate favorable metrics are invalidated by high-confidence imminent frontal onset."
    });
  }

  // =========================================================================
  // CONFLICT PATTERN 3: Bio-Thermal Stress vs Activity Demands
  // Weather Reasoning Agent flags high metabolic heat dissipation failure.
  // =========================================================================
  if (reasoningResult?.thermalComfort?.comfortLevel === "VERY UNCOMFORTABLE" && initialScore >= 60) {
    conflictsDetected.push({
      conflictType: "BIO_THERMAL_DIVERGENCE",
      hazardCategory: "reasoning",
      opposingAgent: {
        name: "Weather Reasoning Agent",
        stance: "PHYSIOLOGICAL_OBJECTION",
        metric: "Bio-Thermal Comfort",
        value: "VERY UNCOMFORTABLE",
        factors: [reasoningResult.thermalComfort.explanation || "Severe vapor pressure / heat dissipation impediment"]
      },
      favoredAgent: {
        name: "Activity Decision Agent",
        stance: "FAVORABLE_PROPOSAL",
        metric: "Initial Suitability Score",
        value: initialScore,
        rationale: "Ambient temperature alone was within broad recreational range."
      },
      arbitrationPrinciple: "Bio-Thermal Limiting Factor: Elevated relative humidity prevents evaporative cooling during sustained exertion."
    });
  }

  // If no conflict detected, return consensus
  if (conflictsDetected.length === 0) {
    return {
      agent: {
        name: "Conflict Arbitration & Replanning Agent",
        version: "2.0.0",
        status: "completed"
      },
      hasConflict: false,
      status: "consensus",
      activity,
      initialScore,
      finalScore: initialScore,
      consensusSummary: `Consensus verified: Risk Intelligence, Forecast Trend, and Activity Decision agents are in complete alignment for ${activity}. No cross-agent arbitration required.`
    };
  }

  // Primary active conflict selected for adjudication
  const primaryConflict = conflictsDetected[0];
  const hazardCat = primaryConflict.hazardCategory;

  // Dynamically calculate Arbitrated Score Penalty proportional to hazard intensity
  const hazardSeverity = Number(primaryConflict.opposingAgent.value) || 60;
  const penalty = Math.round(hazardSeverity * 0.65);

  const arbitratedScore = clamp(Math.round(initialScore - penalty), 5, 48);

  let arbitratedClassification = "POOR";
  if (arbitratedScore < 25) arbitratedClassification = "UNSUITABLE";
  else if (arbitratedScore <= 45) arbitratedClassification = "POOR";
  else arbitratedClassification = "MODERATE";

  // Dynamic replanning execution
  const replan = generateReplannedStrategy({
    activity,
    conflictReason: primaryConflict.opposingAgent.factors[0],
    hazardCategory: hazardCat,
    forecastList,
    currentWeather: current
  });

  const rulingRationale =
    `Arbitration Ruling: ${primaryConflict.opposingAgent.name} successfully overrules ${primaryConflict.favoredAgent.name}. ` +
    `While ${primaryConflict.favoredAgent.name} proposed a favorable suitability score (${initialScore}/100), ` +
    `${primaryConflict.opposingAgent.name} identified an overriding safety hazard: ${primaryConflict.opposingAgent.factors.join("; ")}. ` +
    `Under the ${primaryConflict.arbitrationPrinciple}, physical hazard containment strictly takes precedence. ` +
    `Suitability score has been recalibrated from ${initialScore} to ${arbitratedScore} (${arbitratedClassification}).`;

  return {
    agent: {
      name: "Conflict Arbitration & Replanning Agent",
      version: "2.0.0",
      status: "completed"
    },
    hasConflict: true,
    status: "arbitrated",
    activity,
    conflictType: primaryConflict.conflictType,
    primaryHazardCategory: hazardCat,
    partiesInvolved: [
      {
        agent: primaryConflict.favoredAgent.name,
        role: "Proponent",
        stance: primaryConflict.favoredAgent.stance,
        score: primaryConflict.favoredAgent.value,
        claim: primaryConflict.favoredAgent.rationale
      },
      {
        agent: primaryConflict.opposingAgent.name,
        role: "Objector",
        stance: primaryConflict.opposingAgent.stance,
        metric: primaryConflict.opposingAgent.metric,
        score: primaryConflict.opposingAgent.value,
        claim: primaryConflict.opposingAgent.factors.join(", ")
      }
    ],
    arbitrationDecision: {
      ruling: "SAFETY_OVERRULE",
      winner: primaryConflict.opposingAgent.name,
      governingPrinciple: primaryConflict.arbitrationPrinciple,
      initialScore,
      arbitratedScore,
      arbitratedClassification,
      rationale: rulingRationale
    },
    negotiatedReplan: {
      status: "ACTIVE_REPLAN",
      optimalTimeWindow: replan.optimalReplannedWindow,
      recommendedSubstitutions: replan.activitySubstitution,
      safeguardProtocols: replan.compensatorySafeguards
    },
    conflictsDetectedCount: conflictsDetected.length,
    allConflicts: conflictsDetected
  };
};

export default {
  arbitrateAgentDisagreements
};
