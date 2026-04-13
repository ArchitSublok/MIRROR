# 🪞 MIRROR — AI Behavioral Bias Coach for Retail Investors

> **"89% of retail traders in India lose money. Not because of bad stocks — because of their own mind."**

MIRROR is an AI-powered behavioral finance platform that detects cognitive biases in real-time before a trade executes — and intervenes before the investor makes an emotionally-driven financial mistake.

Built for the **Finvasia Innovation Hackathon 2026** | Track 1 — Problem Statement 3: Investing Fear

**Team No Name** | Chitkara University | CSE Department

---

## 📌 Problem Statement

SEBI's own data confirms that **89% of retail F&O traders in India lose money**. The root cause is not a lack of information — retail investors have access to real-time data, charts, and research. The root cause is **emotion**.

Five cognitive biases drive the majority of retail losses:

| Bias | Description | Avg Loss Impact |
|------|-------------|-----------------|
| Panic Selling | Selling during dips out of fear | Misses average 14% recovery |
| FOMO Buying | Buying after a stock already spiked | 74% of late entries lose money |
| Disposition Effect | Selling winners early, holding losers | Reduces win rate by 18% |
| Overtrading | Excessive trading under volatility | Increases transaction costs 3x |
| Recency Bias | Chasing last month's top performers | Leads to momentum chasing |

No existing Indian trading platform intervenes at the moment of emotional decision. They show you the red numbers — and let you destroy yourself.

**MIRROR changes that.**

---

## 💡 Solution Overview

MIRROR is a **cognitive firewall** — a behavioral intervention layer that:

1. **Monitors** — Builds a personal Bias Radar Profile from the user's own trade history using Isolation Forest anomaly detection
2. **Detects** — Identifies which of 5 cognitive biases is driving the current trade decision in real-time
3. **Intervenes** — Fires the BiasBrake alert before execution with specific evidence from the user's own history
4. **Educates** — Uses Claude AI to generate plain-language coaching messages with personalized numbers
5. **Simulates** — Shows the exact rupee cost of the emotional decision vs the rational alternative (What-If Simulator)

---

## ✨ Key Features

### 🧠 Bias Radar Profile
A personalized radar chart built from the user's trade history, showing their psychological fingerprint across all 5 bias dimensions. Updated after every trade.

### 🛑 BiasBrake Engine
Real-time bias detection that fires before trade execution. Powered by Isolation Forest anomaly detection. Outputs:
- Anomaly score (0–1, threshold 0.60)
- Bias classification (Panic Sell / FOMO / Disposition / Overtrading / Recency)
- AI confidence percentage
- Historical evidence from user's own past trades

### 💸 Emotion Tax Simulator
A backtested What-If chart showing:
- **If Sold (Panic):** −₹8,420 — locked in loss, missed rally
- **If Held (Rational):** +₹3,180 — average 18-day recovery of 12.4%

Based on INFY historical data, March 2020 crash period, Yahoo Finance API.

### 🤖 Claude AI Coaching
Live LLM-generated behavioral coaching messages — personalized with the user's actual numbers, delivered in plain language. No jargon. No generic advice.

### 📋 Behavioral Audit Log
Complete history of every trade, every bias detected, every anomaly score, and every outcome. Full transparency for the investor.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Browser)            │
│  React-style Vanilla JS + HTML Canvas  │
│  Dashboard | Simulator | Audit Log      │
└──────────────┬──────────────────────────┘
               │ Trade Intent
               ▼
┌─────────────────────────────────────────┐
│         Bias Detection Engine           │
│  Stage 1: Isolation Forest (anomaly?)   │
│  Stage 2: Logistic Regression (which?)  │
│  Output: anomaly_score + bias_type      │
└──────────────┬──────────────────────────┘
               │ If anomalous
               ▼
┌─────────────────────────────────────────┐
│         BiasBrake Alert System          │
│  - Blocks trade execution               │
│  - Shows confidence + past evidence     │
│  - Calls Claude API for explanation     │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌────────────┐    ┌───────────────────┐
│ Claude API │    │  What-If Engine   │
│ (coaching) │    │  (Yahoo Finance   │
│            │    │   historical data)│
└────────────┘    └───────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Dashboard, Trade Simulator, Audit Log |
| **Charts** | HTML5 Canvas API | Bias Radar, What-If chart |
| **ML Core** | Python, scikit-learn | Isolation Forest + Logistic Regression |
| **AI Coach** | Claude API (claude-sonnet-4) | Plain-language behavioral explanations |
| **Market Data** | Yahoo Finance API | Historical stock data for backtesting |
| **Styling** | CSS Custom Properties, Google Fonts | Dark-mode professional UI |

---

## 📁 Project Structure

```
MIRROR/
├── src/
│   ├── index.html      # Main application UI
│   ├── style.css       # All styles and design tokens
│   ├── app.js          # Core logic, ML engine, Claude API
│   └── config.js       # API key configuration
│
├── ml/
│   ├── bias_detector.py    # Isolation Forest + Logistic Regression
│   └── requirements.txt    # Python dependencies
│
├── docs/
│   └── architecture.md     # Detailed technical architecture
│
└── README.md
```

---

## 🚀 How to Run

### Option 1 — Open directly in browser (Quickest)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/MIRROR.git

# Navigate to the project
cd MIRROR

# Open in browser — no build step needed
open src/index.html          # macOS
start src/index.html         # Windows
xdg-open src/index.html      # Linux
```

> The prototype runs entirely in the browser with no server required.

---

### Option 2 — Open in VS Code with Live Server

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/MIRROR.git

# 2. Open in VS Code
code MIRROR

# 3. Install the Live Server extension
#    (Extensions panel → search "Live Server" → Install)

# 4. Right-click src/index.html → "Open with Live Server"
#    App opens at http://127.0.0.1:5500/src/index.html
```

---

### Option 3 — Enable Claude AI Coaching

To enable live AI-generated coaching messages:

```bash
# 1. Open src/config.js
# 2. Replace 'YOUR_ANTHROPIC_API_KEY_HERE' with your actual key

window.MIRROR_CONFIG = {
  apiKey: 'sk-ant-...'     # Your Anthropic API key
};

# Get your key at: https://console.anthropic.com
```

> **Note:** The prototype works fully without an API key. BiasBrake detection, What-If Simulator, Radar Chart, and Audit Log all function offline. The API key only enables the live AI coaching message in the Trade Simulator.

---

### Option 4 — Run the ML model (Python)

```bash
# Navigate to ml directory
cd MIRROR/ml

# Install dependencies
pip install -r requirements.txt

# Run the bias detector demo
python bias_detector.py
```

**Expected output:**
```
MIRROR — Bias Detection Engine Demo
===================================================
✅ MIRROR ML engine trained successfully.
   Isolation Forest: contamination=0.15
   Classifier classes: ['FOMO' 'NONE' 'PANIC_SELL']

── Test Cases ─────────────────────────────────────

[SELL during crash]
  Anomaly Score : 0.84 (threshold: 0.60)
  Bias Detected : PANIC_SELL
  Confidence    : 91.0%

[BUY after +22% spike]
  Anomaly Score : 0.76 (threshold: 0.60)
  Bias Detected : FOMO
  Confidence    : 83.0%

[Normal rational trade]
  Anomaly Score : 0.12 (threshold: 0.60)
  Bias Detected : NONE
  Confidence    : 12.0%
```

---

## 🧪 Demo Walkthrough

1. **Open the Dashboard** — watch the Bias Score ring animate to 72 (HIGH RISK)
2. **Examine the Bias Radar** — 5 cognitive biases plotted against user history
3. **Go to Trade Simulator** — select INFY, Qty 80, Market Crash scenario
4. **Click SELL** — BiasBrake fires instantly at 91% confidence
5. **Read the What-If** — see −₹8,420 (panic) vs +₹3,180 (rational)
6. **Check the Audit Log** — full behavioral history with anomaly scores

---

## 📊 Judging Criteria Alignment

| Criterion | MIRROR's Implementation |
|-----------|------------------------|
| **Technical Innovation** | Isolation Forest anomaly detection + LLM coaching — novel combination for retail bias detection |
| **Problem Solving** | Directly addresses SEBI-documented 89% retail loss rate via behavioral intervention |
| **Code Quality** | Separated HTML/CSS/JS, documented ML module, clear variable naming |
| **Commit History** | Multiple commits showing iterative development |
| **Demo Functionality** | Fully working prototype — all features functional in browser |
| **Future Scalability** | API-first architecture, FastAPI backend designed, broker API integration planned |

---

## 🔮 Future Scope

| Phase | Feature | Timeline |
|-------|---------|----------|
| **Phase 1** | FastAPI backend connecting real Isolation Forest model | 2 months |
| **Phase 2** | Zerodha/Finvasia broker API integration for live trade interception | 4 months |
| **Phase 3** | Crypto and Global Forex support | 6 months |
| **Phase 4** | Voice AI coaching during live trades | 9 months |
| **Phase 5** | B2B SaaS licensing to brokerages | 12 months |

---

## 👥 Team No Name

| Member | Role |
|--------|------|
| Nipun Singh | Team Lead |
| Hardik Latka | ML Engineer |
| Akshit Sharma | Full Stack |
| Archit Sublok | UI / Vision |

**Institution:** Chitkara University, Punjab  
**Department:** Computer Science and Engineering  
**Hackathon:** Finvasia Innovation Hackathon 2026 | Track 1 — PS3

---

## 📄 License

MIT License — open for review and educational use.

---

*Built with ❤️ at Finvasia Innovation Hackathon 2026*  
*Powered by Anthropic Claude · scikit-learn · HTML5 Canvas*
