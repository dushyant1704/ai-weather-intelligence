import { Router } from "express";
import { arbitrateAgentDisagreements } from "../agents/conflictArbitrationAgent.js";

const router = Router();

/**
 * POST /api/arbitration/analyze
 * Directly analyze multi-agent outputs for contradictions, arbitrate disagreements, and return dynamic replan.
 */
router.post("/analyze", (req, res) => {
  try {
    const {
      activity = "cycling",
      activityDecision,
      riskResult,
      trendResult,
      reasoningResult,
      forecastList = [],
      current = {}
    } = req.body;

    const result = arbitrateAgentDisagreements({
      activity,
      activityDecision,
      riskResult,
      trendResult,
      reasoningResult,
      forecastList,
      current
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Arbitration route error:", error);
    res.status(500).json({
      success: false,
      message: "Arbitration analysis failed.",
      error: error.message
    });
  }
});

/**
 * GET /api/arbitration/simulate-conflict
 * Pre-configured interactive conflict simulation demonstrating:
 * Activity Decision Agent (Optimistic for cycling, 78/100) vs
 * Risk Intelligence Agent (Objecting due to 48 km/h wind gusts).
 * Ideal for evaluator testing and live demonstrations.
 */
router.get("/simulate-conflict", (req, res) => {
  try {
    const activity = req.query.activity || "cycling";

    // Synthetic agent outputs illustrating real cross-agent tension
    const simulatedActivityDecision = {
      agent: { name: "Activity Decision Agent", version: "1.0", status: "completed" },
      activity,
      suitability: {
        score: 78,
        classification: "GOOD"
      },
      factors: {
        positive: ["Pleasant ambient temperature of 21°C", "Clear visibility (10 km)", "Zero chance of precipitation"],
        negative: ["Moderate wind resistance"]
      },
      decision: {
        recommendation: `${activity} appears suitable under current analyzed conditions with normal precautions.`,
        cautionRequired: false
      }
    };

    const simulatedRiskResult = {
      agent: { name: "Risk Intelligence Agent", version: "2.0.0", status: "completed" },
      overallRisk: { score: 72, level: "HIGH" },
      activityRisk: { score: 75, level: "HIGH" },
      risks: {
        wind: {
          score: 75,
          level: "HIGH",
          factors: ["Severe crosswind gusts up to 48 km/h exceeding aerodynamic bike handling threshold (38 km/h)"]
        },
        rain: { score: 10, level: "LOW", factors: [] },
        heat: { score: 20, level: "LOW", factors: [] },
        uv: { score: 30, level: "LOW", factors: [] }
      }
    };

    const simulatedTrendResult = {
      overallTrend: { level: "WORSENING", score: 65, reason: "Wind velocity projected to accelerate over next 90 minutes" }
    };

    const simulatedForecastList = [
      { dt_txt: "Today 14:00", wind: { speed: 13.5 }, pop: 0.1 },
      { dt_txt: "Today 17:00", wind: { speed: 4.8 }, pop: 0.05 },
      { dt_txt: "Today 20:00", wind: { speed: 3.5 }, pop: 0.0 }
    ];

    const result = arbitrateAgentDisagreements({
      activity,
      activityDecision: simulatedActivityDecision,
      riskResult: simulatedRiskResult,
      trendResult: simulatedTrendResult,
      forecastList: simulatedForecastList,
      current: { windSpeedKmh: 48, temperatureCelsius: 21 }
    });

    res.json({
      success: true,
      simulated: true,
      scenario: "Cross-Agent Disagreement: Activity Decision (Favorable: 78/100) vs Risk Intelligence (Hazard: 48 km/h Gusts)",
      data: result
    });
  } catch (error) {
    console.error("Conflict simulation route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to run conflict simulation.",
      error: error.message
    });
  }
});

export default router;
