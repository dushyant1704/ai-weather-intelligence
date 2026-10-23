import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def build_synopsis_pdf(filepath):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=45, leftMargin=45,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        spaceAfter=4
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=body_style,
        fontSize=8.5,
        leading=11.5
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Title & Subtitle
    story.append(Paragraph("PROJECT SYNOPSIS", title_style))
    story.append(Paragraph("AI Weather Intelligence & Autonomous Decision Support System (WeatherPulse)", subtitle_style))
    story.append(Paragraph("<b>Contributors:</b> Dushyant (<font color='#2563EB'>@dushyant1704</font>) &nbsp;|&nbsp; AVI192 (<font color='#2563EB'>@AVI192</font>) &nbsp;|&nbsp; <b>Repository:</b> github.com/dushyant1704/ai-weather-intelligence", table_cell))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=10))

    # 1. Problem Statement
    story.append(Paragraph("1. The Problem", h1_style))
    story.append(Paragraph(
        "Conventional meteorological platforms (e.g., standard weather apps and static widgets) operate as raw data repositories. They report isolated telemetry points—such as 28°C temperature, 82% relative humidity, 1012 hPa pressure, and 6 m/s wind—leaving end users to manually extrapolate whether conditions are safe or practical for their specific tasks. This creates major gaps:",
        body_style
    ))
    story.append(Paragraph("• <b>Cognitive Overload & Data Misinterpretation:</b> Non-meteorologists struggle to calculate compounding biological risks, such as high heat paired with high relative humidity resulting in severe Wet-Bulb heat stress.", bullet_style))
    story.append(Paragraph("• <b>Lack of Contextual Actionability:</b> A generic 'sunny' forecast overlooks peak solar UV indexes that threaten outdoor runners, or sudden gust fronts that jeopardize cyclists and field event organizers.", bullet_style))
    story.append(Paragraph("• <b>Fragmented Decision Making:</b> Users planning travel or outdoor activities must juggle multiple tools to compare cities, inspect multi-day hourly trends, and estimate personal safety thresholds.", bullet_style))

    story.append(Spacer(1, 4))

    # 2. Solution Overview
    story.append(Paragraph("2. Proposed Solution", h1_style))
    story.append(Paragraph(
        "<b>AI Weather Intelligence (WeatherPulse)</b> is an intelligent, multi-agent meteorological analytics and autonomous decision support system. Instead of raw numbers alone, WeatherPulse employs a coordinated multi-agent architecture powered by Groq LLaMA-3.3 70B Versatile inference and live OpenWeatherMap sensor feeds to deliver contextualized, explainable decisions.",
        body_style
    ))
    story.append(Paragraph("• <b>Natural Language User Queries:</b> Users ask freeform questions (e.g., <i>'Should I go for a 10km run in London?'</i> or <i>'Compare Tokyo and Paris for outdoor sightseeing'</i>).", bullet_style))
    story.append(Paragraph("• <b>Autonomous Multi-Agent Pipeline:</b> Dispatches queries through specialized autonomous agents for data quality validation, compound risk scoring, multi-step trend modeling, bio-comfort analysis, and conflict arbitration.", bullet_style))
    story.append(Paragraph("• <b>Actionable Executive Verdicts:</b> Provides an objective 0–100 Suitability Index, categorical safety classifications (EXCELLENT to UNSUITABLE), hazard radar gauges, gear suggestions, and negotiated alternative time windows.", bullet_style))

    story.append(Spacer(1, 4))

    # 3. Target Users
    story.append(Paragraph("3. Target User Personas", h1_style))
    
    table_data = [
        [
            Paragraph("User Group", table_cell_bold),
            Paragraph("Core Needs & Pain Points", table_cell_bold),
            Paragraph("WeatherPulse Value Proposition", table_cell_bold)
        ],
        [
            Paragraph("<b>Athletes & Outdoor Sports Enthusiasts</b><br/>(Runners, Cyclists, Hikers)", table_cell),
            Paragraph("Need to avoid thermal exhaustion, dehydration, wet surfaces, and dangerous UV overexposure.", table_cell),
            Paragraph("Sport-specific Suitability Index (0–100), hydration advice, UV alerts, and wind drag warnings.", table_cell)
        ],
        [
            Paragraph("<b>Travelers & Commuters</b><br/>(Tourists, Road Trippers)", table_cell),
            Paragraph("Require multi-city weather trade-offs and packing recommendations.", table_cell),
            Paragraph("Side-by-side multi-city intelligence ranking with statistical winner spotlights and gear lists.", table_cell)
        ],
        [
            Paragraph("<b>Event Organizers & Operations</b><br/>(Outdoor Dining, Concerts, Fieldwork)", table_cell),
            Paragraph("Need forward temporal trajectory alerts to prevent severe weather disruptions.", table_cell),
            Paragraph("40-horizon slope trend detection, arbitration overrules, and safe replanning time windows.", table_cell)
        ]
    ]
    t = Table(table_data, colWidths=[140, 185, 195])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t)

    story.append(Spacer(1, 6))

    # 4. Project Scope
    story.append(Paragraph("4. Project Scope & Technical Capabilities", h1_style))
    story.append(Paragraph("• <b>In-Scope Capabilities:</b> Global dynamic geocoding across any worldwide city; live current telemetry, UV index, and 5-day / 3-hour forecast ingestion; strict 80% data quality gating; 5-hazard weighted risk matrix with interaction detection; 40-step temporal regression; biothermal comfort indexing (Humidex/Wind Chill); cross-agent conflict resolution; side-by-side city comparison; LLaMA-3.3 70B natural language synthesis; and an interactive live AI Copilot.", bullet_style))
    story.append(Paragraph("• <b>Out-of-Scope (Future Expansion):</b> Direct IoT micro-sensor hardware firmware integration, Doppler radar raw video stream playback, and historical multi-decade climate modeling.", bullet_style))

    doc.build(story)
    print(f"Created synopsis: {filepath}")

def build_design_doc_pdf(filepath):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=35, bottomMargin=35
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=3
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#475569'),
        spaceAfter=10
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=4
    )
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        spaceAfter=3
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=body_style,
        fontSize=8,
        leading=10.5
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    story.append(Paragraph("SYSTEM DESIGN DOCUMENT", title_style))
    story.append(Paragraph("AI Weather Intelligence & Autonomous Decision Support System (WeatherPulse)", subtitle_style))
    story.append(Paragraph("<b>Contributors:</b> Dushyant (<font color='#2563EB'>@dushyant1704</font>) &nbsp;|&nbsp; AVI192 (<font color='#2563EB'>@AVI192</font>) &nbsp;|&nbsp; <b>Repository:</b> github.com/dushyant1704/ai-weather-intelligence", table_cell))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=8))

    # 1. System Architecture
    story.append(Paragraph("1. System Architecture", h1_style))
    story.append(Paragraph(
        "WeatherPulse is architected as a decoupled, multi-tiered AI system comprising a responsive client dashboard (React 19), a resilient REST backend microservice (Node.js/Express 5), an autonomous Multi-Agent Reasoning Engine, and Groq LLaMA 3.3 70B Versatile inference.",
        body_style
    ))

    arch_diagram = """
    [User Client / React 19 Frontend]
           │  (REST API: /api/orchestrator/execute, /api/llm/chat)
           ▼
    [AI Weather Orchestrator Agent (orchestratorAgent.js)]
           │  Intent Detection • Entity Resolution • Dynamic Execution Plan
           ▼
    [Data Intelligence Quality Gate (dataIntelligenceAgent.js)] ─── If Score < 80% ──> [Graceful Reject]
           │ Passed (>80%)
    ┌──────┴──────────────────────────────────────────────────────┐
    ▼                                  ▼                          ▼
[Risk Intelligence Agent]      [Forecast Trend Agent]     [Weather Reasoning Agent]
  • 5-Hazard Risk Model          • 40-step horizon trends   • Humidex & Wind Chill
  • Cross-hazard interactions    • Regression trajectory    • Sensory Comfort Level
    └──────────────┬───────────────────┴──────────────────────────┘
                   ▼
    [Activity Decision Agent (activityDecisionAgent.js)]
      • 0-100 Suitability Index • Green/Amber Factor Breakdown
                   ▼
    [Conflict Arbitration & Replanning Agent (conflictArbitrationAgent.js)]
      • Cross-Agent Inconsistency Detection • Overrule Logic • Safe Time Window Replanning
                   │
                   ├──> [City Intelligence Agent (cityIntelligenceAgent.js)] (If Multi-City query)
                   ▼
    [Live Groq LLM Intelligence Agent (groqService.js)]
      • LLaMA 3.3 70B Versatile Synthesis • Executive Verdict • Optimal Windows • Gear Advice
                   ▼
    [Executive Dashboard Presentation (KPI Cards, Risk Radar, Trajectory Shifts, Recharts)]
    """
    story.append(Paragraph(f"<font face='Courier' size=6.5>{arch_diagram.replace('\n', '<br/>').replace(' ', '&nbsp;')}</font>", body_style))

    story.append(Spacer(1, 4))

    # 2. Agent Roles
    story.append(Paragraph("2. Autonomous Agent Roles & Responsibilities", h1_style))
    
    agent_data = [
        [Paragraph("Agent Name", table_cell_bold), Paragraph("Role & Core Responsibilities", table_cell_bold), Paragraph("Key Algorithmic Output", table_cell_bold)],
        [
            Paragraph("<b>AI Orchestrator</b><br/>(orchestratorAgent.js)", table_cell),
            Paragraph("Natural language intent classification (ACTIVITY, RISK, COMPARISON, TREND), entity/city resolution, dynamic workflow planner, pipeline coordinator.", table_cell),
            Paragraph("Execution plan, routing confidence, resolved coordinates, synthesized state envelope.", table_cell)
        ],
        [
            Paragraph("<b>Data Intelligence Quality Gate</b><br/>(dataIntelligenceAgent.js)", table_cell),
            Paragraph("Validates physical bounds, telemetry completeness, sensor integrity, and detects missing forecast steps.", table_cell),
            Paragraph("Data Quality Score (0–100%), readiness boolean, missing field flags, normalized payload.", table_cell)
        ],
        [
            Paragraph("<b>Risk Intelligence Agent</b><br/>(riskIntelligenceAgent.js)", table_cell),
            Paragraph("Calculates compound indices across 5 dimensions: Heat Stress, UV Exposure, Precipitation, Wind, Visibility; identifies non-linear cross-effects.", table_cell),
            Paragraph("Overall & Activity Risk scores (0–100), hazard classifications, active cross-effects list.", table_cell)
        ],
        [
            Paragraph("<b>Forecast Trend Agent</b><br/>(forecastTrendAgent.js)", table_cell),
            Paragraph("Evaluates 40 forecast horizon slices (5 days × 3 hrs) using moving window slopes and delta shifts.", table_cell),
            Paragraph("Trajectory classification (IMPROVING, STABLE, WORSENING), peak shift times, delta metrics.", table_cell)
        ],
        [
            Paragraph("<b>Weather Reasoning Agent</b><br/>(weatherReasoningAgent.js)", table_cell),
            Paragraph("Bio-meteorological modeling via Humidex, Apparent Temperature, and Wind Chill equations.", table_cell),
            Paragraph("Sensory comfort label (Comfortable to Very Uncomfortable), biothermal reasoning narrative.", table_cell)
        ],
        [
            Paragraph("<b>Activity Decision Agent</b><br/>(activityDecisionAgent.js)", table_cell),
            Paragraph("Synthesizes risk scores and trend offsets into activity-specific thresholds across 12 sports/events.", table_cell),
            Paragraph("Suitability Score (0–100), Rating (EXCELLENT to UNSUITABLE), Favorable & Caution points.", table_cell)
        ],
        [
            Paragraph("<b>Conflict Arbitration Agent</b><br/>(conflictArbitrationAgent.js)", table_cell),
            Paragraph("Detects paradoxes (e.g., current sunny skies vs. imminent storm trend). Overrules flawed outputs and discovers alternative safe time windows.", table_cell),
            Paragraph("Arbitrated score, override rationale, negotiated replan window (e.g., '14:00 - 17:00').", table_cell)
        ],
        [
            Paragraph("<b>City Intelligence Agent</b><br/>(cityIntelligenceAgent.js)", table_cell),
            Paragraph("Comparative benchmarking across multiple destination analyses for travel decision support.", table_cell),
            Paragraph("Destination ranking, winner margins, comparative differential matrix.", table_cell)
        ],
        [
            Paragraph("<b>Live Groq LLM Agent</b><br/>(groqService.js)", table_cell),
            Paragraph("Infers executive natural-language summaries, clothing & gear recommendations, and powers the interactive Copilot chat.", table_cell),
            Paragraph("Natural-language Executive Verdict, gear suggestions, conversational chat responses.", table_cell)
        ]
    ]

    at = Table(agent_data, colWidths=[130, 255, 145])
    at.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(at)

    story.append(Spacer(1, 4))

    # 3. Communication Pattern
    story.append(Paragraph("3. Communication Pattern & Orchestration Flow", h1_style))
    story.append(Paragraph("• <b>Orchestrator-Mediated Blackboard Pattern:</b> Agents communicate via a shared memory context object managed strictly by the AI Orchestrator. Agents never write to uncontrolled global variables.", bullet_style))
    story.append(Paragraph("• <b>Serial & Parallel Pipeline Execution:</b> Data Quality is executed serially as a mandatory gate. Upon passing (>80%), independent analytical agents (Risk, Trend, Reasoning) run concurrently, followed by the Activity Decision and Conflict Arbitration agents.", bullet_style))
    story.append(Paragraph("• <b>Arbitration Interception:</b> If the Conflict Arbitration Agent detects diverging signals (e.g., current risk is LOW but 3-hour storm probability surges above 75%), it intercepts and mutates the decision state before passing to Groq LLM.", bullet_style))

    story.append(Spacer(1, 4))

    # 4. Technology Choices
    story.append(Paragraph("4. Technology Stack & Architectural Rationale", h1_style))
    story.append(Paragraph("• <b>Frontend (React 19 + Vite 7):</b> Ultra-fast HMR, concurrent React rendering, responsive component architecture, Lucide iconography, and Recharts interactive trend visualization.", bullet_style))
    story.append(Paragraph("• <b>Backend (Node.js + Express 5 ES Modules):</b> Lightweight, high-throughput asynchronous I/O ideal for orchestrating simultaneous API calls and running analytical pipelines.", bullet_style))
    story.append(Paragraph("• <b>LLM Inference (Groq Cloud SDK - LLaMA 3.3 70B Versatile):</b> Ultra-low latency token generation (sub-second TTFT) enabling real-time conversational co-piloting and verdict synthesis without blocking the UI.", bullet_style))
    story.append(Paragraph("• <b>Telemetry Provider (OpenWeatherMap API 2.5/3.0):</b> Comprehensive global meteorological data covering current weather, 5-day / 3-hour forecasts, UV index, and global geocoding.", bullet_style))

    doc.build(story)
    print(f"Created design doc: {filepath}")

if __name__ == '__main__':
    base_dir = r"c:\Users\Gaming\Downloads\weather-app-completed\weather-app"
    synopsis_path = os.path.join(base_dir, "Project_Synopsis.pdf")
    design_path = os.path.join(base_dir, "Design_Document.pdf")
    build_synopsis_pdf(synopsis_path)
    build_design_doc_pdf(design_path)
