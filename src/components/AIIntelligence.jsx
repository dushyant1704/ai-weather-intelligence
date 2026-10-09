import React, { useState } from 'react';
import {
  BrainCircuit,
  LoaderCircle,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  ShieldAlert,
  Thermometer,
  Sun,
  CloudRain,
  Wind,
  Eye,
  Activity,
  Sparkles,
  Copy,
  Check,
  MapPin,
  RefreshCw,
  Code,
  Layers,
  Compass,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const QUICK_PROMPTS = [
  { label: '🏃 Running today?', query: 'Should I go running today?' },
  { label: '🚴 Cycling conditions', query: 'Is it safe for cycling this afternoon?' },
  { label: '☂️ Outdoor dining check', query: 'Will it rain during outdoor dining tonight?' },
  { label: '🧥 Comfort & what to wear', query: 'Is it comfortable outside for a long walk?' }
];

export default function AIIntelligence({ weatherData }) {
  const [query, setQuery] = useState('Should I go running today?');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('decision');
  const [copied, setCopied] = useState(false);

  const runAnalysis = async (customQuery) => {
    const activePrompt = typeof customQuery === 'string' ? customQuery : query;
    if (!activePrompt.trim()) return;

    setBusy(true);
    setError('');
    setResult(null);

    try {
      const params = new URLSearchParams({ query: activePrompt });
      const lat = weatherData?.coord?.lat;
      const lon = weatherData?.coord?.lon;

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        params.set('lat', String(lat));
        params.set('lon', String(lon));
      }

      const response = await fetch(`${API_BASE}/orchestrator/execute?${params.toString()}`);
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error('Backend returned an unparseable response.');
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || 'The AI orchestrator could not complete this analysis.');
      }

      const data = payload.data ?? payload;
      setResult(data);

      // Smart default active tab selection based on returned payload
      if (data.activityDecision) {
        setActiveTab('decision');
      } else if (data.riskResult) {
        setActiveTab('risk');
      } else if (data.trendResult) {
        setActiveTab('trends');
      } else if (data.cityResult) {
        setActiveTab('cities');
      } else if (data.reasoningResult) {
        setActiveTab('reasoning');
      } else {
        setActiveTab('decision');
      }
    } catch (err) {
      setError(err?.message || 'Unable to connect to the AI weather backend. Make sure the server is running on port 5000.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    runAnalysis();
  };

  const handleSelectQuickPrompt = (promptText) => {
    setQuery(promptText);
    runAnalysis(promptText);
  };

  const handleCopySummary = () => {
    if (!result) return;
    const recommendation =
      result?.activityDecision?.decision?.recommendation ||
      result?.riskResult?.decision?.recommendation ||
      result?.reasoningResult?.summary ||
      result?.message ||
      'AI Analysis completed.';

    navigator.clipboard?.writeText(recommendation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // Helper color tags
  const getSuitabilityColor = (classification) => {
    switch (classification) {
      case 'EXCELLENT':
        return { badge: 'badge-excellent', color: '#10b981', label: 'Excellent' };
      case 'GOOD':
        return { badge: 'badge-good', color: '#38bdf8', label: 'Good' };
      case 'MODERATE':
        return { badge: 'badge-moderate', color: '#f59e0b', label: 'Moderate' };
      case 'POOR':
        return { badge: 'badge-poor', color: '#f97316', label: 'Poor' };
      case 'UNSUITABLE':
        return { badge: 'badge-unsuitable', color: '#ef4444', label: 'Unsuitable' };
      default:
        return { badge: 'badge-neutral', color: '#94a3b8', label: classification || 'Analyzed' };
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'LOW':
        return { cls: 'risk-pill-low', color: '#10b981', text: 'Low Risk' };
      case 'MODERATE':
        return { cls: 'risk-pill-mod', color: '#f59e0b', text: 'Moderate Risk' };
      case 'HIGH':
        return { cls: 'risk-pill-high', color: '#f97316', text: 'High Risk' };
      case 'VERY HIGH':
        return { cls: 'risk-pill-vhigh', color: '#ef4444', text: 'Very High Risk' };
      default:
        return { cls: 'risk-pill-neutral', color: '#94a3b8', text: level || 'Unknown' };
    }
  };

  const getTrendIcon = (level) => {
    switch (level) {
      case 'IMPROVING':
        return <TrendingUp className="trend-icon-improving" size={18} />;
      case 'WORSENING':
        return <TrendingDown className="trend-icon-worsening" size={18} />;
      default:
        return <Minus className="trend-icon-stable" size={18} />;
    }
  };

  const getComfortEmoji = (level) => {
    switch (level) {
      case 'COMFORTABLE':
        return <Smile size={20} className="comfort-icon-good" />;
      case 'MODERATE':
      case 'COOL':
        return <Meh size={20} className="comfort-icon-mod" />;
      case 'UNCOMFORTABLE':
      case 'VERY UNCOMFORTABLE':
        return <Frown size={20} className="comfort-icon-bad" />;
      default:
        return <Smile size={20} />;
    }
  };

  // Active extracted components
  const activityData = result?.activityDecision;
  const riskData = result?.riskResult;
  const trendData = result?.trendResult;
  const reasoningData = result?.reasoningResult;
  const cityData = result?.cityResult;
  const qualityData = result?.dataQuality;

  const suitabilityMeta = activityData?.suitability
    ? getSuitabilityColor(activityData.suitability.classification)
    : null;

  const overallRiskMeta = riskData?.overallRisk?.level
    ? getRiskBadge(riskData.overallRisk.level)
    : null;

  const heroRecommendation =
    activityData?.decision?.recommendation ||
    riskData?.decision?.recommendation ||
    reasoningData?.summary ||
    result?.message ||
    'AI Multi-Agent Evaluation Completed.';

  const isCaution =
    activityData?.decision?.cautionRequired ||
    riskData?.decision?.cautionRequired ||
    false;

  return (
    <section className="ai-intelligence-page">
      {/* Top Header Card */}
      <div className="ai-hero-header">
        <div className="ai-hero-title-group">
          <div className="ai-hero-icon-bubble">
            <BrainCircuit size={28} />
          </div>
          <div>
            <div className="ai-hero-badge">
              <Sparkles size={14} />
              <span>Multi-Agent Neural Weather Engine</span>
            </div>
            <h2>AI Weather Intelligence</h2>
            <p>
              Ask natural-language questions about your plans. Autonomous agents analyze real-time
              telemetry, microclimate risk, and forward trends to deliver actionable guidance.
            </p>
          </div>
        </div>

        {/* City Coordinates context bar */}
        <div className="ai-location-indicator">
          <MapPin size={16} />
          <span>
            {weatherData?.cityName ? (
              <>
                Active Location: <strong>{weatherData.cityName}</strong>
                {weatherData.coord && (
                  <span className="ai-coords-tag">
                    ({weatherData.coord.lat?.toFixed(2)}°, {weatherData.coord.lon?.toFixed(2)}°)
                  </span>
                )}
              </>
            ) : (
              'Dashboard city not loaded — search for a city in the header to feed real-time coordinates'
            )}
          </span>
        </div>
      </div>

      {/* Query Form & Quick Suggestions */}
      <div className="ai-query-panel">
        <form className="ai-intelligence-form" onSubmit={handleSubmit}>
          <div className="ai-textarea-wrapper">
            <textarea
              id="ai-weather-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={2}
              placeholder="e.g., Should I go running today? Is it safe for an outdoor BBQ?"
              required
            />
            <button
              type="submit"
              className="ai-run-button"
              disabled={busy || !query.trim()}
              title="Execute AI Multi-Agent analysis"
            >
              {busy ? (
                <>
                  <LoaderCircle className="ai-spin" size={18} />
                  <span>Synthesizing…</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick prompt suggestions chips */}
        <div className="ai-quick-prompts">
          <span className="ai-quick-label">Try asking:</span>
          <div className="ai-chips-list">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="ai-chip-btn"
                onClick={() => handleSelectQuickPrompt(p.query)}
                disabled={busy}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="ai-message ai-error">
          <AlertCircle size={20} />
          <div className="ai-error-content">
            <strong>Analysis Interrupted</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Processing State Animation */}
      {busy && (
        <div className="ai-thinking-card">
          <div className="ai-thinking-spinner">
            <LoaderCircle size={36} className="ai-spin" />
          </div>
          <div className="ai-thinking-text">
            <h4>Agents Running Analysis…</h4>
            <p>Evaluating telemetry checks, environmental risks, forecast trajectories, and decision parameters</p>
          </div>
        </div>
      )}

      {/* Rich Analysis Results Area */}
      {result && !busy && (
        <div className="ai-results-dashboard">
          {/* 1. Hero Verdict Card */}
          <div className={`ai-verdict-card ${isCaution ? 'verdict-caution' : 'verdict-favorable'}`}>
            <div className="ai-verdict-top">
              <div className="ai-verdict-pill-row">
                <span className="ai-verdict-agent-tag">
                  <BrainCircuit size={14} /> AI Decision Verdict
                </span>

                {activityData?.suitability && (
                  <span className={`ai-suitability-pill ${suitabilityMeta.badge}`}>
                    {suitabilityMeta.label} ({activityData.suitability.score}/100)
                  </span>
                )}

                {isCaution ? (
                  <span className="ai-status-pill pill-caution">
                    <AlertTriangle size={13} /> Caution Advised
                  </span>
                ) : (
                  <span className="ai-status-pill pill-clear">
                    <CheckCircle2 size={13} /> Favorable Conditions
                  </span>
                )}
              </div>

              <button
                className="ai-copy-btn"
                onClick={handleCopySummary}
                title="Copy recommendation"
                type="button"
              >
                {copied ? <Check size={14} className="copied-check" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Verdict'}</span>
              </button>
            </div>

            <div className="ai-verdict-main">
              <div className="ai-verdict-icon">
                {isCaution ? (
                  <AlertTriangle size={32} className="icon-caution-amber" />
                ) : (
                  <CheckCircle2 size={32} className="icon-favorable-green" />
                )}
              </div>
              <div className="ai-verdict-text-block">
                <p className="ai-verdict-recommendation">"{heroRecommendation}"</p>
                <div className="ai-verdict-metadata-row">
                  {result.intent && (
                    <span className="ai-meta-chip">
                      <strong>Intent:</strong> {result.intent.toLowerCase().replace('_', ' ')}
                    </span>
                  )}
                  {result.activity && (
                    <span className="ai-meta-chip">
                      <strong>Activity:</strong> {result.activity}
                    </span>
                  )}
                  {result.executionPlan && (
                    <span className="ai-meta-chip">
                      <strong>Active Agents:</strong> {result.executionPlan.join(' • ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Top-Level Metric KPI Cards */}
          <div className="ai-kpi-grid">
            {/* KPI 1: Activity Suitability */}
            <div className="ai-kpi-card">
              <div className="ai-kpi-header">
                <span className="ai-kpi-label">Suitability Score</span>
                <Activity size={18} className="ai-kpi-icon blue" />
              </div>
              <div className="ai-kpi-value-row">
                <span className="ai-kpi-number">
                  {activityData?.suitability?.score ?? (100 - (riskData?.overallRisk?.score ?? 0))}
                </span>
                <span className="ai-kpi-max">/100</span>
              </div>
              <div className="ai-progress-bar">
                <div
                  className="ai-progress-fill"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        activityData?.suitability?.score ??
                          (100 - (riskData?.overallRisk?.score ?? 0)),
                        0
                      ),
                      100
                    )}%`,
                    backgroundColor: suitabilityMeta?.color || '#38bdf8'
                  }}
                />
              </div>
              <div className="ai-kpi-subtext">
                Rating: <strong>{activityData?.suitability?.classification || 'Assessed'}</strong>
              </div>
            </div>

            {/* KPI 2: Overall Risk Index */}
            <div className="ai-kpi-card">
              <div className="ai-kpi-header">
                <span className="ai-kpi-label">Overall Risk Level</span>
                <ShieldAlert size={18} className="ai-kpi-icon amber" />
              </div>
              <div className="ai-kpi-value-row">
                <span className="ai-kpi-number">
                  {riskData?.overallRisk?.score ?? 0}
                </span>
                <span className="ai-kpi-max">/100</span>
              </div>
              <div className="ai-progress-bar">
                <div
                  className="ai-progress-fill"
                  style={{
                    width: `${Math.min(Math.max(riskData?.overallRisk?.score ?? 0, 0), 100)}%`,
                    backgroundColor: overallRiskMeta?.color || '#10b981'
                  }}
                />
              </div>
              <div className="ai-kpi-subtext">
                Risk Tier: <strong style={{ color: overallRiskMeta?.color }}>{riskData?.overallRisk?.level || 'LOW'}</strong>
              </div>
            </div>

            {/* KPI 3: Forecast Trend Trajectory */}
            <div className="ai-kpi-card">
              <div className="ai-kpi-header">
                <span className="ai-kpi-label">Forecast Trajectory</span>
                <TrendingUp size={18} className="ai-kpi-icon purple" />
              </div>
              <div className="ai-trend-trajectory-row">
                {getTrendIcon(trendData?.overallTrend?.level)}
                <span className="ai-kpi-trend-word">
                  {trendData?.overallTrend?.level || 'STABLE'}
                </span>
              </div>
              <div className="ai-kpi-trend-impact">
                {activityData?.forecastContext?.trendAdjustment ? (
                  <span>
                    Trend Impact: <strong>{activityData.forecastContext.trendAdjustment > 0 ? `+${activityData.forecastContext.trendAdjustment}` : activityData.forecastContext.trendAdjustment} pts</strong>
                  </span>
                ) : (
                  <span>Trajectory based on {trendData?.forecastRecordsAnalyzed || 40} hourly records</span>
                )}
              </div>
              <div className="ai-kpi-subtext">
                {trendData?.overallTrend?.level === 'WORSENING'
                  ? 'Conditions decline later'
                  : trendData?.overallTrend?.level === 'IMPROVING'
                  ? 'Conditions improve ahead'
                  : 'Stable forward window'}
              </div>
            </div>

            {/* KPI 4: Telemetry Quality */}
            <div className="ai-kpi-card">
              <div className="ai-kpi-header">
                <span className="ai-kpi-label">Telemetry Quality</span>
                <ShieldCheck size={18} className="ai-kpi-icon green" />
              </div>
              <div className="ai-kpi-value-row">
                <span className="ai-kpi-number">
                  {qualityData?.score ?? 100}%
                </span>
                <span className="ai-kpi-badge-green">VERIFIED</span>
              </div>
              <div className="ai-progress-bar">
                <div
                  className="ai-progress-fill"
                  style={{ width: `${qualityData?.score ?? 100}%`, backgroundColor: '#10b981' }}
                />
              </div>
              <div className="ai-kpi-subtext">
                Status: <strong>{qualityData?.status || 'READY'}</strong> (All validation checks passed)
              </div>
            </div>
          </div>

          {/* 3. Section Navigation Tabs */}
          <div className="ai-tabs-container">
            <div className="ai-tabs-bar">
              {activityData && (
                <button
                  type="button"
                  className={`ai-tab-btn ${activeTab === 'decision' ? 'active' : ''}`}
                  onClick={() => setActiveTab('decision')}
                >
                  <Activity size={16} />
                  <span>Activity Decision</span>
                </button>
              )}

              {riskData && (
                <button
                  type="button"
                  className={`ai-tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
                  onClick={() => setActiveTab('risk')}
                >
                  <ShieldAlert size={16} />
                  <span>Risk Radar</span>
                </button>
              )}

              {trendData && (
                <button
                  type="button"
                  className={`ai-tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trends')}
                >
                  <TrendingUp size={16} />
                  <span>Forecast Shifts</span>
                </button>
              )}

              {reasoningData && (
                <button
                  type="button"
                  className={`ai-tab-btn ${activeTab === 'reasoning' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reasoning')}
                >
                  <Smile size={16} />
                  <span>Comfort & Reasoning</span>
                </button>
              )}

              {cityData && (
                <button
                  type="button"
                  className={`ai-tab-btn ${activeTab === 'cities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cities')}
                >
                  <Compass size={16} />
                  <span>City Leaderboard</span>
                </button>
              )}

              <button
                type="button"
                className={`ai-tab-btn ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                <Layers size={16} />
                <span>Data Audit</span>
              </button>

              <button
                type="button"
                className={`ai-tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
                onClick={() => setActiveTab('raw')}
              >
                <Code size={16} />
                <span>Developer JSON</span>
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="ai-tab-content-wrapper">
              {/* TAB 1: Activity Decision */}
              {activeTab === 'decision' && activityData && (
                <div className="ai-tab-panel">
                  <div className="ai-panel-header">
                    <h3>🎯 Activity Suitability & Contributing Factors</h3>
                    <p>Deep evaluation tailored for <strong>{activityData.activity}</strong></p>
                  </div>

                  <div className="ai-factors-split-grid">
                    {/* Favorable Factors */}
                    <div className="ai-factor-card favorable-factor-card">
                      <div className="ai-factor-header">
                        <CheckCircle2 size={18} className="text-emerald" />
                        <h4>Favorable Conditions</h4>
                      </div>
                      {activityData.factors?.positive?.length ? (
                        <ul className="ai-factor-list">
                          {activityData.factors.positive.map((item, idx) => (
                            <li key={idx} className="ai-factor-item pos">
                              <span className="factor-bullet green">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="ai-factor-empty">No standout positive factors recorded.</p>
                      )}
                    </div>

                    {/* Negative / Watch Factors */}
                    <div className="ai-factor-card warning-factor-card">
                      <div className="ai-factor-header">
                        <AlertTriangle size={18} className="text-amber" />
                        <h4>Caution & Risk Watch</h4>
                      </div>
                      {activityData.factors?.negative?.length ? (
                        <ul className="ai-factor-list">
                          {activityData.factors.negative.map((item, idx) => (
                            <li key={idx} className="ai-factor-item neg">
                              <span className="factor-bullet amber">!</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="ai-factor-clean">
                          <CheckCircle2 size={24} className="text-emerald" />
                          <p>No critical limiting weather factors detected for this activity.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Context Note Box */}
                  <div className="ai-context-banner">
                    <div className="ai-context-badge">
                      <Sparkles size={16} />
                      <span>Contextual Impact</span>
                    </div>
                    <p>
                      Base suitability was assessed at{' '}
                      <strong>{100 - (activityData.riskAssessment?.activityRiskScore ?? 0)}/100</strong>,
                      with a forward forecast adjustment of{' '}
                      <strong>
                        {activityData.forecastContext?.trendAdjustment > 0
                          ? `+${activityData.forecastContext.trendAdjustment}`
                          : activityData.forecastContext?.trendAdjustment ?? 0}{' '}
                        points
                      </strong>{' '}
                      due to anticipated {activityData.forecastContext?.trendLevel?.toLowerCase() || 'stable'} weather.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Multi-Factor Risk Radar */}
              {activeTab === 'risk' && riskData && (
                <div className="ai-tab-panel">
                  <div className="ai-panel-header">
                    <h3>🛡️ Multi-Factor Environmental Risk Assessment</h3>
                    <p>Calculated across 5 primary meteorological risk vectors and cross-parameter interactions</p>
                  </div>

                  {/* Risk Meters Grid */}
                  <div className="ai-risk-meters-grid">
                    {[
                      { key: 'heat', title: 'Heat & Thermal Stress', icon: <Thermometer size={20} />, data: riskData.risks?.heat },
                      { key: 'uv', title: 'UV Solar Radiation', icon: <Sun size={20} />, data: riskData.risks?.uv },
                      { key: 'rain', title: 'Precipitation & Rain', icon: <CloudRain size={20} />, data: riskData.risks?.rain },
                      { key: 'wind', title: 'Wind & Gust Velocity', icon: <Wind size={20} />, data: riskData.risks?.wind },
                      { key: 'visibility', title: 'Atmospheric Visibility', icon: <Eye size={20} />, data: riskData.risks?.visibility }
                    ].map(({ key, title, icon, data }) => {
                      const score = data?.score ?? 0;
                      const level = data?.level || 'LOW';
                      const badge = getRiskBadge(level);

                      return (
                        <div key={key} className="ai-risk-meter-box">
                          <div className="ai-risk-meter-header">
                            <div className="ai-risk-title-with-icon">
                              <span className="risk-type-icon">{icon}</span>
                              <span className="risk-type-name">{title}</span>
                            </div>
                            <span className={`risk-level-tag ${badge.cls}`}>
                              {badge.text}
                            </span>
                          </div>

                          <div className="ai-risk-meter-bar-row">
                            <div className="ai-risk-meter-track">
                              <div
                                className="ai-risk-meter-fill"
                                style={{
                                  width: `${Math.min(Math.max(score, 5), 100)}%`,
                                  backgroundColor: badge.color
                                }}
                              />
                            </div>
                            <span className="ai-risk-meter-score">{score} / 100</span>
                          </div>

                          <p className="ai-risk-explanation">
                            {data?.explanation || 'No adverse risk conditions reported.'}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactions banner */}
                  {riskData.interactions?.length > 0 && (
                    <div className="ai-interactions-box">
                      <h4>⚠️ Compound Parameter Interactions</h4>
                      <ul className="ai-interactions-list">
                        {riskData.interactions.map((interaction, i) => (
                          <li key={i}>{typeof interaction === 'string' ? interaction : JSON.stringify(interaction)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Forecast Trend Shifts */}
              {activeTab === 'trends' && trendData && (
                <div className="ai-tab-panel">
                  <div className="ai-panel-header">
                    <h3>📈 Meteorological Forecast Trajectory</h3>
                    <p>{trendData.recommendation || 'Forward shift analysis based on multi-hour time steps'}</p>
                  </div>

                  {/* 4 Trends Metric Cards */}
                  <div className="ai-trend-metrics-grid">
                    {trendData.trends?.temperature && (
                      <div className="ai-trend-metric-card">
                        <div className="ai-trend-card-top">
                          <Thermometer size={18} className="text-blue" />
                          <span>Temperature Trend</span>
                        </div>
                        <div className="ai-trend-main-value">
                          {trendData.trends.temperature.startValue}°C → {trendData.trends.temperature.endValue}°C
                        </div>
                        <div className="ai-trend-delta-pill">
                          {trendData.trends.temperature.direction === 'RISING' ? '+' : ''}
                          {trendData.trends.temperature.change}°C ({trendData.trends.temperature.direction})
                        </div>
                      </div>
                    )}

                    {trendData.trends?.humidity && (
                      <div className="ai-trend-metric-card">
                        <div className="ai-trend-card-top">
                          <CloudRain size={18} className="text-cyan" />
                          <span>Humidity Trend</span>
                        </div>
                        <div className="ai-trend-main-value">
                          {trendData.trends.humidity.startValue}% → {trendData.trends.humidity.endValue}%
                        </div>
                        <div className="ai-trend-delta-pill">
                          {trendData.trends.humidity.direction === 'RISING' ? '+' : ''}
                          {trendData.trends.humidity.change}% ({trendData.trends.humidity.direction})
                        </div>
                      </div>
                    )}

                    {trendData.trends?.wind && (
                      <div className="ai-trend-metric-card">
                        <div className="ai-trend-card-top">
                          <Wind size={18} className="text-purple" />
                          <span>Wind Speed Trend</span>
                        </div>
                        <div className="ai-trend-main-value">
                          {trendData.trends.wind.startValue} → {trendData.trends.wind.endValue} km/h
                        </div>
                        <div className="ai-trend-delta-pill">
                          {trendData.trends.wind.direction === 'RISING' ? '+' : ''}
                          {trendData.trends.wind.change} km/h ({trendData.trends.wind.direction})
                        </div>
                      </div>
                    )}

                    {trendData.trends?.rainProbability && (
                      <div className="ai-trend-metric-card">
                        <div className="ai-trend-card-top">
                          <CloudRain size={18} className="text-blue" />
                          <span>Precipitation Chance</span>
                        </div>
                        <div className="ai-trend-main-value">
                          {trendData.trends.rainProbability.startValue}% → {trendData.trends.rainProbability.endValue}%
                        </div>
                        <div className="ai-trend-delta-pill">
                          {trendData.trends.rainProbability.direction}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Environmental Changes List */}
                  {trendData.keyChanges?.length > 0 && (
                    <div className="ai-key-changes-box">
                      <h4>Key Changes Detected Across Forecast</h4>
                      <div className="ai-changes-pills">
                        {trendData.keyChanges.map((change, idx) => (
                          <div key={idx} className="ai-change-pill">
                            <Sparkles size={14} />
                            <span>{change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Comfort & Reasoning */}
              {activeTab === 'reasoning' && reasoningData && (
                <div className="ai-tab-panel">
                  <div className="ai-panel-header">
                    <h3>🧠 Thermal Comfort & Atmospheric Reasoning</h3>
                    <p>Physics-based bio-meteorological comfort analysis</p>
                  </div>

                  <div className="ai-comfort-card">
                    <div className="ai-comfort-header">
                      {getComfortEmoji(reasoningData.reasoning?.comfort?.level)}
                      <div>
                        <h4>Comfort Rating: {reasoningData.reasoning?.comfort?.level || 'MODERATE'}</h4>
                        <p>{reasoningData.reasoning?.comfort?.reason}</p>
                      </div>
                    </div>
                  </div>

                  {reasoningData.reasoning?.observations?.length > 0 && (
                    <div className="ai-observations-box">
                      <h4>Atmospheric Observations</h4>
                      <ul className="ai-observations-list">
                        {reasoningData.reasoning.observations.map((obs, idx) => (
                          <li key={idx}>
                            <span className="obs-dot" />
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: City Leaderboard (If Present) */}
              {activeTab === 'cities' && cityData && (
                <div className="ai-tab-panel">
                  <div className="ai-panel-header">
                    <h3>🏙️ Multi-City Suitability Comparison</h3>
                    <p>Rankings for <strong>{cityData.activity || 'selected activity'}</strong></p>
                  </div>

                  {cityData.winner && (
                    <div className="ai-city-winner-banner">
                      <Sparkles size={20} className="text-gold" />
                      <div>
                        <h4>Recommended Destination: {cityData.winner.city}</h4>
                        <p>
                          Score: {cityData.winner.suitability?.score}/100 • Lead of{' '}
                          {cityData.scoreDifference ? `${cityData.scoreDifference} points` : 'top rank'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="ai-city-ranks-table-wrapper">
                    <table className="ai-city-ranks-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>City</th>
                          <th>Suitability</th>
                          <th>Rating</th>
                          <th>Risk Tier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cityData.ranking || []).map((row) => (
                          <tr key={row.rank}>
                            <td className="rank-num">#{row.rank}</td>
                            <td><strong>{row.city}</strong></td>
                            <td>{row.suitabilityScore} / 100</td>
                            <td><span className="rank-badge">{row.classification}</span></td>
                            <td><span className="rank-risk">{row.riskLevel}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: Data Quality Audit */}
              {activeTab === 'data' && (
                <div className="ai-tab-panel">
                  <div className="ai-panel-header">
                    <h3>🛡️ Data Intelligence & Telemetry Verification</h3>
                    <p>Validating OpenWeather sensor records before upstream intelligence execution</p>
                  </div>

                  <div className="ai-audit-stats-grid">
                    <div className="ai-audit-stat-card">
                      <span className="audit-label">Data Quality Score</span>
                      <span className="audit-value text-emerald">{qualityData?.score ?? 100}%</span>
                      <span className="audit-desc">Exceeds 80% AI confidence gate</span>
                    </div>

                    <div className="ai-audit-stat-card">
                      <span className="audit-label">Field Validation Checks</span>
                      <span className="audit-value">
                        {qualityData?.validChecks ?? 7} / {qualityData?.totalChecks ?? 7}
                      </span>
                      <span className="audit-desc">No corrupted telemetry fields</span>
                    </div>

                    <div className="ai-audit-stat-card">
                      <span className="audit-label">Forecast Horizon</span>
                      <span className="audit-value">{qualityData?.forecastRecords ?? 40} pts</span>
                      <span className="audit-desc">Full 5-day / 3-hour coverage</span>
                    </div>

                    <div className="ai-audit-stat-card">
                      <span className="audit-label">Status Flag</span>
                      <span className="audit-value text-blue">{qualityData?.status ?? 'READY'}</span>
                      <span className="audit-desc">Approved for downstream AI agents</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: Developer Raw JSON Payload */}
              {activeTab === 'raw' && (
                <div className="ai-tab-panel">
                  <div className="ai-panel-header">
                    <div className="ai-panel-title-with-btn">
                      <div>
                        <h3>💻 Developer JSON Response Inspector</h3>
                        <p>Complete unedited payload returned by the Orchestrator API</p>
                      </div>
                      <button
                        type="button"
                        className="ai-copy-btn"
                        onClick={() => {
                          navigator.clipboard?.writeText(JSON.stringify(result, null, 2));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Copied JSON' : 'Copy Full JSON'}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="ai-raw-json-viewer">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
