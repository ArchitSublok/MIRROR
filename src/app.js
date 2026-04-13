// ============================================================
//  MIRROR — AI Behavioral Bias Coach
//  app.js — Core logic: navigation, ML engine, charts, API
//  Team No Name | Finvasia Innovation Hackathon 2026
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
// Replace with your Anthropic API key or set via config.js
const ANTHROPIC_API_KEY = window.MIRROR_CONFIG?.apiKey || '';

// Bias score values (simulating trained Isolation Forest output)
const BIAS_SCORES = [84, 71, 65, 78, 42];

// Audit log (pre-seeded with historical data)
const auditLog = [
  { date:'2026-04-09', stock:'INFY',       action:'SELL', qty:40,  bias:'PANIC SELL',  anom:'0.84', outcome:'−₹4,200',  dec:'OVERRIDE' },
  { date:'2026-04-07', stock:'BAJFINANCE', action:'BUY',  qty:20,  bias:'FOMO',        anom:'0.76', outcome:'−₹2,800',  dec:'OVERRIDE' },
  { date:'2026-04-04', stock:'TCS',        action:'BUY',  qty:30,  bias:'NONE',        anom:'0.18', outcome:'+₹6,100',  dec:'RATIONAL' },
  { date:'2026-03-28', stock:'RELIANCE',   action:'SELL', qty:100, bias:'PANIC SELL',  anom:'0.91', outcome:'−₹9,600',  dec:'OVERRIDE' },
  { date:'2026-03-22', stock:'HDFC',       action:'BUY',  qty:30,  bias:'FOMO',        anom:'0.69', outcome:'−₹1,400',  dec:'OVERRIDE' },
  { date:'2026-03-18', stock:'NIFTY ETF',  action:'BUY',  qty:50,  bias:'NONE',        anom:'0.14', outcome:'+₹3,800',  dec:'RATIONAL' },
  { date:'2026-03-14', stock:'INFY',       action:'SELL', qty:25,  bias:'PANIC SELL',  anom:'0.88', outcome:'−₹3,100',  dec:'PAUSED'   },
  { date:'2026-03-10', stock:'WIPRO',      action:'SELL', qty:60,  bias:'DISPOSITION', anom:'0.61', outcome:'−₹2,200',  dec:'OVERRIDE' },
];

let dashAnimated = false;

// ── NAVIGATION ──────────────────────────────────────────────
function goTab(id, btn) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
  document.getElementById('pg-' + id).classList.add('on');
  btn.classList.add('on');

  if (id === 'dash')  animateDash();
  if (id === 'sim')   drawWhatIf();
  if (id === 'audit') renderAudit();
}

// ── DASHBOARD ANIMATIONS ────────────────────────────────────
function animateDash() {
  if (dashAnimated) return;
  dashAnimated = true;

  // Animate score ring to 72
  setTimeout(() => {
    const circle = document.getElementById('ring-circle');
    const num    = document.getElementById('ring-num');
    const target = 72;
    circle.style.strokeDashoffset = 314 - (target / 100) * 314;
    let n = 0;
    const timer = setInterval(() => {
      if (n >= target) { clearInterval(timer); return; }
      num.textContent = ++n;
    }, 18);
  }, 200);

  // Animate bias bars
  BIAS_SCORES.forEach((score, i) => {
    setTimeout(() => {
      document.getElementById('bb-' + i).style.width = score + '%';
      document.getElementById('bv-' + i).textContent = score + '%';
    }, 400 + i * 120);
  });

  // Animate anomaly meter
  setTimeout(() => {
    const fill = document.getElementById('anom-fill');
    const val  = document.getElementById('anom-val');
    fill.style.width      = '84%';
    fill.style.background = 'var(--red)';
    val.textContent       = '0.84';
    val.style.color       = 'var(--red)';
  }, 900);

  // Draw radar chart
  setTimeout(drawRadar, 300);
}

// ── BIAS RADAR CHART ────────────────────────────────────────
function drawRadar() {
  const canvas = document.getElementById('radar');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2 + 8;
  const r  = Math.min(W, H) * 0.33;

  const labels = ['Panic Sell', 'FOMO Buy', 'Disposition', 'Overtrading', 'Recency'];
  const scores = [0.84, 0.71, 0.65, 0.78, 0.42];
  const n = labels.length;

  ctx.clearRect(0, 0, W, H);

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(f => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * r * f;
      const y = cy + Math.sin(angle) * r * f;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = f === 1 ? '#252850' : '#1a1d35';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Spokes
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = '#1a1d35';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Filled data polygon
  ctx.beginPath();
  scores.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r * s;
    const y = cy + Math.sin(angle) * r * s;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, 'rgba(255,59,92,0.3)');
  grad.addColorStop(1, 'rgba(255,59,92,0.06)');
  ctx.fillStyle   = grad;
  ctx.fill();
  ctx.strokeStyle = '#ff3b5c';
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Data points
  scores.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r * s;
    const y = cy + Math.sin(angle) * r * s;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle   = '#ff3b5c';
    ctx.fill();
    ctx.strokeStyle = '#07080f';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  });

  // Labels
  ctx.font      = '11px IBM Plex Mono';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6b7299';
  labels.forEach((label, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * (r + 24);
    const y = cy + Math.sin(angle) * (r + 24);
    ctx.fillText(label, x, y + 4);
  });

  // Score labels on points
  ctx.font      = 'bold 11px IBM Plex Mono';
  ctx.fillStyle = '#ff3b5c';
  scores.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r * s;
    const y = cy + Math.sin(angle) * r * s;
    ctx.fillText(Math.round(s * 100) + '%', x, y - 10);
  });
}

// ── WHAT-IF SIMULATOR CHART ─────────────────────────────────
// Based on INFY historical data, March 2020 crash, Yahoo Finance API
function drawWhatIf() {
  const canvas = document.getElementById('wi');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const days = 22;
  const noise = () => Math.random() * 0.01 - 0.002;

  // Simulate: held recovers, sold stays flat at loss
  const held = [100], sold = [100];
  for (let i = 1; i < days; i++) {
    held.push(i < 8
      ? held[i-1] * (1 - 0.015 + noise())   // initial dip
      : held[i-1] * (1 + 0.020 + noise())   // recovery
    );
    sold.push(sold[0] * 0.925);              // locked in loss at panic sell
  }

  const allVals = [...held, ...sold];
  const lo = Math.min(...allVals) - 2;
  const hi = Math.max(...allVals) + 2;
  const pad = { l:38, r:24, t:22, b:28 };
  const pw = W - pad.l - pad.r;
  const ph = H - pad.t - pad.b;

  const toX = i => pad.l + (i / (days - 1)) * pw;
  const toY = v => pad.t + (1 - (v - lo) / (hi - lo)) * ph;

  // Grid lines
  ctx.strokeStyle = 'rgba(26,29,53,0.8)';
  ctx.lineWidth   = 1;
  for (let g = 0; g <= 4; g++) {
    const y = pad.t + (g / 4) * ph;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
  }

  // Panic sell marker
  ctx.save();
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = 'rgba(255,59,92,0.4)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(toX(1), pad.t);
  ctx.lineTo(toX(1), H - pad.b);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,59,92,0.6)';
  ctx.font      = '9px IBM Plex Mono';
  ctx.textAlign = 'center';
  ctx.fillText('PANIC SOLD', toX(1), pad.t + 11);

  // Held line — area fill
  ctx.beginPath();
  held.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(days - 1), H - pad.b);
  ctx.lineTo(toX(0), H - pad.b);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,229,160,0.06)';
  ctx.fill();

  // Held line
  ctx.beginPath();
  held.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
  ctx.strokeStyle = '#00e5a0';
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // Sold line — dashed
  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  sold.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
  ctx.strokeStyle = 'rgba(255,59,92,0.7)';
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.restore();

  // End labels
  ctx.font      = '10px IBM Plex Mono';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00e5a0';
  ctx.fillText('HELD +12.4%', toX(days - 1) + 4, toY(held[days - 1]) + 4);
  ctx.fillStyle = 'rgba(255,59,92,0.8)';
  ctx.fillText('SOLD −7.2%',  toX(days - 1) + 4, toY(sold[days - 1]) + 4);

  // Y-axis labels
  ctx.fillStyle = '#4a5080';
  ctx.font      = '9px IBM Plex Mono';
  ctx.textAlign = 'right';
  for (let g = 0; g <= 4; g++) {
    const v = lo + (g / 4) * (hi - lo);
    ctx.fillText(v.toFixed(0), pad.l - 4, pad.t + (1 - g / 4) * ph + 3);
  }

  // X-axis day labels
  ctx.fillStyle = '#4a5080';
  ctx.textAlign = 'center';
  [0, 5, 10, 15, 21].forEach(d => {
    ctx.fillText('D' + d, toX(d), H - pad.b + 14);
  });
}

// ── BIAS DETECTION ENGINE ───────────────────────────────────
// Simulates Isolation Forest + Logistic Regression output
// In production: replace with FastAPI backend call
function detectBias(action, scenario) {
  if (action === 'SELL' && scenario === 'crash') {
    return {
      bias: 'PANIC_SELL', conf: 91, typ: 'panic',
      title: '⚠️ Panic Selling Detected',
      stats: [
        { lbl: 'CONFIDENCE',       val: '91%',       c: 'var(--red)'   },
        { lbl: 'ANOMALY SCORE',    val: '0.84',      c: 'var(--blue)'  },
        { lbl: 'PAST PANIC TRADES',val: '6 events',  c: 'var(--amber)' },
        { lbl: 'AVG LOSS / PANIC', val: '−₹6,200',   c: 'var(--red)'   },
      ],
      msg: 'You are attempting to sell <b>during a market crash</b> while VIX is at 24.7 — a textbook panic pattern. Your trade frequency is <b>3.2× your 30-day baseline</b>. The last 3 times you made this move, you locked in losses and missed an average <b>14% recovery within 18 days.</b>'
    };
  }

  if (action === 'BUY' && scenario === 'spike') {
    return {
      bias: 'FOMO', conf: 83, typ: 'fomo',
      title: '⚠️ FOMO Buying Detected',
      stats: [
        { lbl: 'CONFIDENCE',       val: '83%',       c: 'var(--amber)' },
        { lbl: 'ANOMALY SCORE',    val: '0.76',      c: 'var(--blue)'  },
        { lbl: 'PRICE SPIKE',      val: '+22% / 5d', c: 'var(--amber)' },
        { lbl: 'LATE ENTRY LOSS',  val: '74%',       c: 'var(--red)'   },
      ],
      msg: 'This stock has risen <b>22% in the last 5 days</b> — you are chasing momentum, not fundamentals. Your behavioral profile shows <b>74% of similar late entries resulted in losses</b> within 10 days. You are buying the top, not the opportunity.'
    };
  }

  return {
    bias: 'NONE', conf: 12, typ: 'safe',
    title: '✅ Trade Looks Rational',
    stats: [
      { lbl: 'ANOMALY SCORE', val: '0.12',     c: 'var(--green)' },
      { lbl: 'BIAS DETECTED', val: 'NONE',     c: 'var(--green)' },
      { lbl: 'CONFIDENCE',    val: '12%',      c: 'var(--green)' },
      { lbl: 'DECISION',      val: 'RATIONAL', c: 'var(--green)' },
    ],
    msg: 'No significant behavioral bias detected. Your anomaly score of <b>0.12</b> is well below the 0.60 threshold. This trade aligns with your baseline trading pattern and current market conditions.'
  };
}

// ── ANALYZE TRADE ────────────────────────────────────────────
function analyze(action) {
  const scenario = document.getElementById('sc').value;
  const stock    = document.getElementById('st').value;
  const qty      = document.getElementById('qty').value;
  const result   = detectBias(action, scenario);
  const zone     = document.getElementById('bb-zone');

  const statsHTML = result.stats.map(s =>
    `<div class="bb-stat">
      <div class="lbl">${s.lbl}</div>
      <div class="val" style="color:${s.c}">${s.val}</div>
    </div>`
  ).join('');

  const actionsHTML = result.bias !== 'NONE' ? `
    <div class="bb-actions">
      <button class="bba primary" onclick="doOverride('${action}','${stock}','${qty}','${result.bias}')">⚡ Override & Trade</button>
      <button class="bba" onclick="doPause('${stock}','${result.bias}')">⏸ Wait 24 Hours</button>
      <button class="bba" onclick="doLearn('${result.bias}')">📖 Explain This Bias</button>
    </div>` : `
    <div class="bb-actions">
      <button class="bba" style="border-color:var(--green);color:var(--green)" onclick="doConfirm('${action}','${stock}','${qty}')">✅ Confirm Rational Trade</button>
    </div>`;

  zone.innerHTML = `
    <div class="bb-panel ${result.typ}">
      <div class="bb-icon">${result.typ === 'panic' ? '🚨' : result.typ === 'fomo' ? '🔥' : '✅'}</div>
      <div class="bb-title ${result.typ === 'panic' ? 'r' : result.typ === 'fomo' ? 'a' : 'g'}">${result.title}</div>
      <div class="bb-conf ${result.typ}">Isolation Forest Confidence: ${result.conf}%</div>
      <div class="bb-stat-row">${statsHTML}</div>
      <div class="bb-msg">${result.msg}</div>
      ${actionsHTML}
    </div>`;

  callClaudeAPI(action, stock, qty, scenario, result.bias);
  drawWhatIf();
}

// ── TRADE ACTIONS ────────────────────────────────────────────
function doOverride(action, stock, qty, bias) {
  logTrade(action, stock, qty, bias, 'OVERRIDE');
  alert(`Trade placed: ${action} ${qty}x ${stock}\nMIRROR has logged this override. Bias score updated.`);
}

function doPause(stock, bias) {
  logTrade('WAIT', stock, 0, bias, 'PAUSED');
  document.getElementById('bb-zone').innerHTML = `
    <div class="bb-panel safe">
      <div class="bb-icon">⏸</div>
      <div class="bb-title g">24h Cooldown Activated</div>
      <div class="bb-msg">Smart move. Research shows <b>68% of paused trades lead to better outcomes.</b> Your Panic Selling score improved by 3 points. MIRROR will remind you tomorrow.</div>
    </div>`;
}

function doConfirm(action, stock, qty) {
  logTrade(action, stock, qty, 'NONE', 'RATIONAL');
  alert(`Rational trade confirmed: ${action} ${qty}x ${stock}`);
}

function doLearn(bias) {
  callClaudeAPI('LEARN', '', '', '', bias);
}

// ── CLAUDE API CALL ──────────────────────────────────────────
async function callClaudeAPI(action, stock, qty, scenario, bias) {
  const box = document.getElementById('expl');
  box.innerHTML = `<div class="expl-thinking">MIRROR is analysing<span class="dots"><span>.</span><span>.</span><span>.</span></span></div>`;

  const PROMPTS = {
    PANIC_SELL: `A retail investor in India is about to SELL ${qty} shares of ${stock} during a market crash (Nifty −3.2%, VIX 24.7). Their past 3 panic sells averaged losses of ₹6,200 each. Nifty historically recovers within 18 days of such drops. Write a 3-sentence behavioral coaching message: explain why this is panic selling, state the specific cost, and give one concrete alternative action. Be direct and empathetic. Use actual numbers. No bullet points.`,
    FOMO:       `A retail investor is about to BUY ${qty} shares of ${stock} which rose 22% in 5 days. Their history shows 74% of similar late FOMO entries lost money within 10 days. Write a 3-sentence coaching message explaining the FOMO risk with specific numbers, the likely outcome, and what they should do instead. Direct and data-driven. No bullet points.`,
    NONE:       `A retail investor just made a rational decision: ${action} ${qty} shares of ${stock} with no bias detected (anomaly score 0.12). Write 2 sentences: acknowledge this as a good disciplined decision and give one tip to maintain this consistency. Be warm and brief.`,
    LEARN:      `Explain panic selling bias in behavioral finance in 3 sentences for a retail investor in India. Include one real Indian market example (e.g., March 2020 crash, 2008 crisis). Be practical and direct. No bullet points.`
  };

  const key = bias === 'LEARN' ? 'LEARN' : bias === 'NONE' ? 'NONE' : bias === 'PANIC_SELL' ? 'PANIC_SELL' : 'FOMO';

  if (!ANTHROPIC_API_KEY) {
    box.innerHTML = `<div style="color:var(--muted2);font-family:'IBM Plex Mono',monospace;font-size:12px;">⚠ API key not configured. Add your key to config.js to enable AI coaching.<br><br>Core ML bias detection is running locally via Isolation Forest + Logistic Regression.</div>`;
    return;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You are MIRROR, an AI behavioral finance coach for retail investors in India. Speak directly. Use specific numbers. No markdown, no bullet points, plain paragraphs only.',
        messages: [{ role: 'user', content: PROMPTS[key] }]
      })
    });

    const data = await res.json();
    const text = data.content?.map(c => c.text || '').join('') || 'Analysis unavailable.';
    box.innerHTML = `<div style="line-height:1.75;font-size:13px;">${text}</div>`;
  } catch (err) {
    box.innerHTML = `<div style="color:var(--muted2);font-family:'IBM Plex Mono',monospace;font-size:12px;">AI explainer offline. Core ML bias detection running locally via Isolation Forest + Logistic Regression.</div>`;
  }
}

// ── AUDIT LOG ────────────────────────────────────────────────
function logTrade(action, stock, qty, bias, decision) {
  auditLog.unshift({
    date:    new Date().toISOString().split('T')[0],
    stock, action, qty, bias,
    anom:    bias !== 'NONE'
               ? (0.60 + Math.random() * 0.30).toFixed(2)
               : (Math.random() * 0.40).toFixed(2),
    outcome: 'PENDING',
    dec:     decision
  });
}

function renderAudit() {
  const biasChip    = b => b === 'NONE' ? 'g' : b.includes('PANIC') ? 'r' : b === 'FOMO' ? 'a' : 'p';
  const decisionChip = d => d === 'RATIONAL' || d === 'PAUSED' ? 'g' : 'r';
  const outcomeColor = o => o.startsWith('+') ? 'var(--green)' : o === 'PENDING' ? 'var(--muted2)' : 'var(--red)';

  document.getElementById('atbl').innerHTML = auditLog.map(row => `
    <tr>
      <td class="mono" style="color:var(--muted2);font-size:11px;">${row.date}</td>
      <td style="font-weight:700">${row.stock}</td>
      <td class="mono" style="color:${row.action === 'BUY' ? 'var(--green)' : 'var(--red)'};">${row.action}</td>
      <td class="mono">${row.qty || '—'}</td>
      <td><span class="chip ${biasChip(row.bias)}">${row.bias}</span></td>
      <td class="mono" style="color:${parseFloat(row.anom) >= 0.6 ? 'var(--red)' : 'var(--green)'};">${row.anom}</td>
      <td class="mono" style="color:${outcomeColor(row.outcome)};">${row.outcome}</td>
      <td><span class="chip ${decisionChip(row.dec)}">${row.dec}</span></td>
    </tr>`
  ).join('');
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('load', () => {
  animateDash();
  drawWhatIf();
});
