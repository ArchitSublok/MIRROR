
// Navigation Logic
function goTab(id, btn) {
    document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
    document.getElementById('pg-' + id).classList.add('on');
    btn.classList.add('on');
    // ... animation triggers ...
}

// ML Simulation & Radar Charts
function drawRadar() {
    // ... your canvas logic ...
}

// ... rest of your JS functions ...
