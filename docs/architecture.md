# MIRROR — Technical Architecture

## System Design

MIRROR is architected as a two-layer system:

### Layer 1 — Frontend (Prototype)
A single-page application built with Vanilla JS and HTML5 Canvas.
No framework dependency — runs in any modern browser with zero build steps.

**Tabs:**
- Dashboard — Bias Score Ring, Portfolio Health, Live Alerts, Radar Chart, Bias Bars
- Trade Simulator — BiasBrake Engine, Claude AI Coaching, What-If Simulator, Bias History
- Audit Log — Full behavioral history table

### Layer 2 — ML Engine (Python)
`ml/bias_detector.py` — implements the two-stage detection pipeline:

**Stage 1 — Isolation Forest (anomaly detection)**
- Input: 7-feature trade vector (amount, frequency, VIX, momentum, timing, drawdown, P&L)
- Output: anomaly_score (0–1), threshold = 0.60
- Purpose: Is this trade behaviorally anomalous vs user's baseline?

**Stage 2 — Logistic Regression (bias classification)**
- Input: same 7-feature vector (only if anomaly_score > 0.60)
- Output: bias_detected (PANIC_SELL / FOMO / DISPOSITION / NONE) + confidence %
- Purpose: Which specific bias is driving this trade?

## Data Flow

```
User initiates trade
        ↓
Feature extraction (7 behavioral signals)
        ↓
Stage 1: Isolation Forest
  anomaly_score < 0.60  →  "No bias detected" → Allow trade
  anomaly_score ≥ 0.60  →  Proceed to Stage 2
        ↓
Stage 2: Logistic Regression
  → bias_detected + confidence
        ↓
BiasBrake Alert fired
        ↓
Claude API → personalized coaching message
        ↓
What-If Simulator → rupee cost comparison
        ↓
User decision: Override / Pause / Confirm
        ↓
Audit Log entry created
```

## Feature Vector Definition

| Index | Feature | Description |
|-------|---------|-------------|
| 0 | trade_amount_zscore | How large is this trade vs user's average (z-score) |
| 1 | frequency_delta | Trades/day ratio vs 30-day baseline |
| 2 | vix_level | India VIX at time of trade |
| 3 | price_momentum_5d | Stock % change over last 5 trading days |
| 4 | time_since_last_trade | Hours elapsed since previous trade |
| 5 | market_drawdown | Nifty50 % drop from recent peak |
| 6 | portfolio_pnl_pct | Current session P&L % |

## What-If Simulator Data Source

Backtested using INFY historical data from Yahoo Finance API.
Reference period: March 2020 crash (March 12–April 7, 2020).

- Panic sell scenario: Exit at day 1 of crash, miss recovery
- Rational hold scenario: Hold through dip, capture 18-day recovery
- Nifty50 historical 18-day recovery: average +12.4% from similar VIX spikes

## Production Architecture (Planned)

```
Browser → FastAPI Backend → Isolation Forest Model
                         → Logistic Regression Model
                         → Yahoo Finance API
                         → Claude API
                         → PostgreSQL (trade history)
```

The current prototype simulates all backend logic client-side for demo purposes.
