# ============================================================
#  MIRROR — ML Backend
#  bias_detector.py — Isolation Forest Anomaly Detection
#  Team No Name | Finvasia Innovation Hackathon 2026
# ============================================================
#
#  This module implements the core ML engine that powers
#  MIRROR's BiasBrake system. It uses:
#    - Isolation Forest for behavioral anomaly detection
#    - Logistic Regression for bias classification
#
#  In the prototype, this logic runs client-side via JS.
#  This file represents the production ML backend.
# ============================================================

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


# ── FEATURE ENGINEERING ────────────────────────────────────
# Each trade is represented as a feature vector:
#
#  [0] trade_amount_zscore   — how large vs user's avg trade
#  [1] frequency_delta       — trades/day vs 30-day baseline
#  [2] vix_level             — India VIX at time of trade
#  [3] price_momentum_5d     — stock % change in last 5 days
#  [4] time_since_last_trade — hours since previous trade
#  [5] market_drawdown       — Nifty % drop from recent peak
#  [6] portfolio_pnl_pct     — current session P&L %


# ── SYNTHETIC TRAINING DATA ─────────────────────────────────
# Represents 200 simulated "normal" trading sessions.
# In production: replace with real user trade history.
np.random.seed(42)

def generate_normal_trades(n=200):
    """Generate synthetic normal (non-biased) trading behavior."""
    return np.column_stack([
        np.random.normal(0, 1, n),          # trade size — around average
        np.random.uniform(0.8, 1.2, n),     # frequency — near baseline
        np.random.uniform(12, 18, n),       # VIX — normal range
        np.random.uniform(-5, 5, n),        # price momentum — neutral
        np.random.uniform(4, 48, n),        # time since last trade — hours
        np.random.uniform(-2, 2, n),        # market drawdown — small
        np.random.uniform(-3, 3, n),        # portfolio P&L — balanced
    ])

def generate_panic_trades(n=50):
    """Generate synthetic panic-selling behavior."""
    return np.column_stack([
        np.random.normal(2.5, 0.5, n),      # large trade size — panic
        np.random.uniform(2.5, 4.0, n),     # 3x+ frequency spike
        np.random.uniform(22, 35, n),       # VIX elevated
        np.random.uniform(-8, -3, n),       # strong negative momentum
        np.random.uniform(0, 2, n),         # rapid succession trades
        np.random.uniform(-5, -3, n),       # significant market drawdown
        np.random.uniform(-8, -3, n),       # heavy session losses
    ])

def generate_fomo_trades(n=50):
    """Generate synthetic FOMO buying behavior."""
    return np.column_stack([
        np.random.normal(2.0, 0.5, n),      # larger than usual trade
        np.random.uniform(1.8, 3.0, n),     # elevated frequency
        np.random.uniform(14, 20, n),       # moderate VIX
        np.random.uniform(15, 30, n),       # strong recent upswing
        np.random.uniform(0.5, 3, n),       # quick decision
        np.random.uniform(-1, 1, n),        # market broadly OK
        np.random.uniform(2, 8, n),         # FOMO after seeing gains
    ])


# ── MODEL TRAINING ──────────────────────────────────────────
class MIRRORBiasDetector:
    """
    Two-stage bias detection:
    Stage 1 — Isolation Forest: Is this trade anomalous?
    Stage 2 — Logistic Regression: Which bias is it?
    """

    def __init__(self, contamination=0.15):
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            n_estimators=100,
            random_state=42
        )
        self.classifier = LogisticRegression(
            multi_class='ovr',
            max_iter=1000,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False

    def train(self):
        """Train both models on synthetic behavioral data."""
        # Generate training data
        normal_trades = generate_normal_trades(200)
        panic_trades  = generate_panic_trades(50)
        fomo_trades   = generate_fomo_trades(50)

        all_trades = np.vstack([normal_trades, panic_trades, fomo_trades])
        labels     = (
            ['NONE'] * 200 +
            ['PANIC_SELL'] * 50 +
            ['FOMO'] * 50
        )

        # Scale features
        X_scaled = self.scaler.fit_transform(all_trades)

        # Train Isolation Forest on normal data only
        self.isolation_forest.fit(self.scaler.transform(normal_trades))

        # Train bias classifier on all labeled data
        self.classifier.fit(X_scaled, labels)

        self.is_trained = True
        print("✅ MIRROR ML engine trained successfully.")
        print(f"   Isolation Forest: contamination={self.isolation_forest.contamination}")
        print(f"   Classifier classes: {self.classifier.classes_}")

    def predict(self, trade_features: dict) -> dict:
        """
        Analyze a single trade and return bias detection result.

        Args:
            trade_features: dict with keys:
                - trade_amount_zscore
                - frequency_delta
                - vix_level
                - price_momentum_5d
                - time_since_last_trade
                - market_drawdown
                - portfolio_pnl_pct

        Returns:
            dict with anomaly_score, bias_detected, confidence
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call .train() first.")

        feature_vector = np.array([[
            trade_features.get('trade_amount_zscore',   0),
            trade_features.get('frequency_delta',       1),
            trade_features.get('vix_level',            15),
            trade_features.get('price_momentum_5d',     0),
            trade_features.get('time_since_last_trade', 24),
            trade_features.get('market_drawdown',        0),
            trade_features.get('portfolio_pnl_pct',      0),
        ]])

        X_scaled = self.scaler.transform(feature_vector)

        # Stage 1: Anomaly detection
        # Isolation Forest: -1 = anomaly, 1 = normal
        raw_score     = self.isolation_forest.decision_function(X_scaled)[0]
        anomaly_score = max(0, min(1, 0.5 - raw_score))  # normalize to 0-1
        is_anomalous  = anomaly_score > 0.60

        # Stage 2: Bias classification (only if anomalous)
        bias_detected = 'NONE'
        confidence    = round(anomaly_score * 100, 1)

        if is_anomalous:
            proba         = self.classifier.predict_proba(X_scaled)[0]
            class_idx     = np.argmax(proba)
            bias_detected = self.classifier.classes_[class_idx]
            confidence    = round(float(proba[class_idx]) * 100, 1)

        return {
            'anomaly_score': round(float(anomaly_score), 2),
            'is_anomalous':  bool(is_anomalous),
            'bias_detected': bias_detected,
            'confidence':    confidence,
            'threshold':     0.60
        }


# ── DEMO ────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 55)
    print("  MIRROR — Bias Detection Engine Demo")
    print("=" * 55)

    detector = MIRRORBiasDetector()
    detector.train()

    print("\n── Test Cases ──────────────────────────────────────")

    # Test 1: Panic sell during crash
    panic_trade = {
        'trade_amount_zscore':   2.8,
        'frequency_delta':       3.2,
        'vix_level':            24.7,
        'price_momentum_5d':    -3.2,
        'time_since_last_trade': 0.5,
        'market_drawdown':       -3.8,
        'portfolio_pnl_pct':    -6.2,
    }
    result = detector.predict(panic_trade)
    print(f"\n[SELL during crash]")
    print(f"  Anomaly Score : {result['anomaly_score']} (threshold: {result['threshold']})")
    print(f"  Bias Detected : {result['bias_detected']}")
    print(f"  Confidence    : {result['confidence']}%")

    # Test 2: FOMO buy after spike
    fomo_trade = {
        'trade_amount_zscore':   2.1,
        'frequency_delta':       2.4,
        'vix_level':            16.2,
        'price_momentum_5d':    22.0,
        'time_since_last_trade': 1.2,
        'market_drawdown':        0.5,
        'portfolio_pnl_pct':     3.1,
    }
    result = detector.predict(fomo_trade)
    print(f"\n[BUY after +22% spike]")
    print(f"  Anomaly Score : {result['anomaly_score']} (threshold: {result['threshold']})")
    print(f"  Bias Detected : {result['bias_detected']}")
    print(f"  Confidence    : {result['confidence']}%")

    # Test 3: Normal rational trade
    rational_trade = {
        'trade_amount_zscore':   0.2,
        'frequency_delta':       0.9,
        'vix_level':            13.5,
        'price_momentum_5d':    -0.5,
        'time_since_last_trade': 18.0,
        'market_drawdown':       -0.8,
        'portfolio_pnl_pct':     1.2,
    }
    result = detector.predict(rational_trade)
    print(f"\n[Normal rational trade]")
    print(f"  Anomaly Score : {result['anomaly_score']} (threshold: {result['threshold']})")
    print(f"  Bias Detected : {result['bias_detected']}")
    print(f"  Confidence    : {result['confidence']}%")

    print("\n" + "=" * 55)
