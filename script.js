const outcomeScales = {
    dash:      { name: 'DASH',           max: 100,  inverted: false },
    quickdash: { name: 'QuickDASH',      max: 100,  inverted: false },
    ases:      { name: 'ASES',           max: 100,  inverted: true  },
    spadi:     { name: 'SPADI',          max: 100,  inverted: false },
    oss:       { name: 'OSS',            max: 48,   inverted: true  },
    wosi:      { name: 'WOSI',           max: 2100, inverted: false },
    worc:      { name: 'WORC',           max: 2100, inverted: false },
    cms:       { name: 'Constant Murley',max: 100,  inverted: true  },
};

let selectedOutcome = null;
let outcomeSliderPos = 0;

const ctx = document.getElementById('radarChart').getContext('2d');
const chartLabels = ['Frozen shoulder', 'Inter. Regionale', 'Lesione di cuffia', 'Apprensione', 'PSEQ', 'PCS', 'TSK13', 'Metabolica', 'Lifestyle factors', 'None'];
const chartDataset = {
    label: 'Il tuo punteggio',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    fill: true,
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgba(54, 162, 235, 1)',
    borderWidth: 1,
    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
};

const chartOptions = {
    animation: { duration: 0 },
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        r: {
            beginAtZero: true,
            max: 100,
            pointLabels: { font: { size: 14 } }
        }
    }
};

let radarChart = new Chart(ctx, {
    type: 'radar',
    data: { labels: [...chartLabels], datasets: [chartDataset] },
    options: chartOptions
});

function updateChart() {
    // Calculate Frozen Shoulder
    const ids = ['ir-add', 'er-add', 'ir-aber', 'er-aber', 'ea', 'abd'];
    const ranges = [45, 90, 90, 90, 180, 180];
    let percs = [];
    ids.forEach((id, i) => {
        const dx = parseFloat(document.getElementById(id + '-dx').value) || 0;
        const sn = parseFloat(document.getElementById(id + '-sn').value) || 0;
        const diff = Math.abs(dx - sn);
        const maxVal = Math.max(dx, sn) || ranges[i];
        const perc = maxVal > 0 ? (diff / maxVal) * 100 : 0;
        document.getElementById(id + '-perc').textContent = Math.round(perc) + '%';
        percs.push(perc);
    });

    // Sum two highest excluding ER braccio addotto (index 1), each capped at 25%
    const others = percs.filter((_, i) => i !== 1).sort((a,b) => b - a);
    const capped1 = Math.min(others[0], 25);
    const capped2 = Math.min(others[1], 25);
    const sumTwoHighest = capped1 + capped2;
    // ER capped at 50%
    const er = Math.min(percs[1], 50);
    const total = sumTwoHighest + er;
    const segment = Math.min(total, 100);
    document.getElementById('marker').textContent = total >= 100 ? '*' : '';

    // Calculate Lesione Cuffia
    const lc_ids = ['lc-ir-add', 'lc-er-add', 'lc-ir-aber', 'lc-er-aber', 'lc-ea', 'lc-abd'];
    const lc_ranges = [40, 40, 40, 40, 40, 40];
    let lc_percs = [];
    lc_ids.forEach((id, i) => {
        const dx = parseFloat(document.getElementById(id + '-dx').value) || 1;
        const sn = parseFloat(document.getElementById(id + '-sn').value) || 1;
        const diff = Math.abs(dx - sn);
        const maxVal = Math.max(dx, sn) || lc_ranges[i];
        const perc = maxVal > 0 ? (diff / maxVal) * 100 : 0;
        document.getElementById(id + '-perc').textContent = Math.round(perc) + '%';
        lc_percs.push(perc);
    });

    // Calculate Lesione Cuffia influence from Test di Forza
    const sorted_percs = lc_percs.sort((a, b) => b - a);
    const top2_avg = (sorted_percs[0] + sorted_percs[1]) / 2;
    let lc_value = 0;
    if (top2_avg > 10) {
        if (top2_avg >= 50) {
            lc_value = 90;
        } else {
            lc_value = (top2_avg - 10) / 40 * 90;
        }
    }

    const prom_ea_dx = parseFloat(document.getElementById('ea-dx').value) || 0;
    const prom_ea_sn = parseFloat(document.getElementById('ea-sn').value) || 0;
    const prom_abd_dx = parseFloat(document.getElementById('abd-dx').value) || 0;
    const prom_abd_sn = parseFloat(document.getElementById('abd-sn').value) || 0;
    const arom_ea_dx = parseFloat(document.getElementById('arom-ea-dx').value) || 0;
    const arom_ea_sn = parseFloat(document.getElementById('arom-ea-sn').value) || 0;
    const arom_abd_dx = parseFloat(document.getElementById('arom-abd-dx').value) || 0;
    const arom_abd_sn = parseFloat(document.getElementById('arom-abd-sn').value) || 0;
    const test_ids = ['ta-erls-dx', 'ta-drop-dx', 'ta-belly-dx', 'ta-lift-dx'];
    const test_condition = test_ids.some(id => document.getElementById(id).value === 'not passed');
    const prom_condition = prom_ea_dx >= 120 && prom_ea_sn >= 120 && prom_abd_dx >= 120 && prom_abd_sn >= 120;
    const prom_level = prom_condition ? 1 : 0;
    const min_arom_ea = Math.min(arom_ea_dx, arom_ea_sn);
    const min_arom_abd = Math.min(arom_abd_dx, arom_abd_sn);
    const ea_contrib = Math.min(49, 49 * (180 - min_arom_ea) / 90);
    const abd_contrib = Math.min(49, 49 * (180 - min_arom_abd) / 90);
    const arom_condition = ea_contrib > 0 && abd_contrib > 0;
    const arom_add = (ea_contrib + abd_contrib) * prom_level;
    let lc_segment_value = lc_value;
    if (prom_condition) lc_segment_value += arom_add;
    if (test_condition) lc_segment_value += 2;
    lc_segment_value = Math.min(lc_segment_value, 100);
    const lc_segment = Math.max(Math.round(lc_segment_value), 5);

    // Calculate Appresione
    const apprensione_positive = ['ta-apprensione-dx'].some(id => document.getElementById(id).value === 'not passed');
    const dynamic_positive = ['ta-dynamic-dx'].some(id => document.getElementById(id).value === 'not passed');
    let apprensione_value = 0;
    if (apprensione_positive) {
        apprensione_value = 100;
    } else if (dynamic_positive) {
        apprensione_value = 50;
    }
    apprensione_value = Math.max(apprensione_value, 5);

    // Calculate Interdipendenza Regionale
    const ulnt1_positive = ['ta-ulnt1-dx'].some(id => document.getElementById(id).value === 'not passed');
    const movimenti_positive = ['ta-movimenti-dx'].some(id => document.getElementById(id).value === 'not passed');
    let interd_value = 0;
    if (ulnt1_positive) {
        interd_value = 100;
    } else if (movimenti_positive) {
        interd_value = 50;
    }
    interd_value = Math.max(interd_value, 5);

    // Calculate PSEQ (Pain Self-Efficacy Questionnaire)
    const pseq_score = parseFloat(document.getElementById('pseq-score').value) || 0;
    const pseq_value = Math.max(5, 100 - (pseq_score * 95 / 60));

    // Calculate PCS (Pain Catastrophizing Scale)
    const pcs_score = parseFloat(document.getElementById('pcs-score').value) || 0;
    const pcs_value = Math.max(5, 5 + (pcs_score * 95 / 52));

    // Calculate TSK13 (Tampa Scale of Kinesiophobia)
    const tsk_score = parseFloat(document.getElementById('tsk-score').value) || 13;
    const tsk_value = Math.max(5, 5 + ((tsk_score - 13) * 95 / 39));

    // Calculate METABOLICA
    const meta_conditions = ['meta-diabete', 'meta-tiroide', 'meta-reumatica', 'meta-cardiovascolare', 'meta-osteoporosi'];
    const meta_count = meta_conditions.filter(id => document.getElementById(id).checked).length;
    const meta_value = Math.max(5, 5 + (meta_count * 95 / 5));

    // Calculate Lifestyle factors
    const lifestyle_factors = ['lifestyle-bmi', 'lifestyle-insonnia', 'lifestyle-stress', 'lifestyle-sedentarieta'];
    const lifestyle_count = lifestyle_factors.filter(id => document.getElementById(id).checked).length;
    const lifestyle_value = Math.max(5, 5 + (lifestyle_count * 95 / 4));

    // Dynamic labels for index 0 and 2
    const frozen_is_red = Math.max(Math.round(segment), 5) === 100;
    const cuffia_is_red = prom_condition && arom_condition && test_condition;
    chartLabels[0] = frozen_is_red ? 'Frozen shoulder' : 'Rigidità';
    chartLabels[2] = cuffia_is_red ? 'Lesione di cuffia' : 'Debolezza';

    // Calculate Outcome Score ({variable} point)
    let outcome_value = 5;
    let outcome_is_red = false;
    chartLabels[9] = 'None';
    if (selectedOutcome) {
        const scale = outcomeScales[selectedOutcome];
        outcome_value = Math.max(5, Math.round((outcomeSliderPos / scale.max) * 100));
        outcome_is_red = outcomeSliderPos >= scale.max;
        chartLabels[9] = scale.name;
    }

    // Calculate AROM
    const arom_ids = ['arom-ir-add', 'arom-er-add', 'arom-ir-aber', 'arom-er-aber', 'arom-ea', 'arom-abd'];
    const arom_ranges = [45, 90, 90, 90, 180, 180];
    let arom_percs = [];
    arom_ids.forEach((id, i) => {
        const dx = parseFloat(document.getElementById(id + '-dx').value) || 0;
        const sn = parseFloat(document.getElementById(id + '-sn').value) || 0;
        const diff = Math.abs(dx - sn);
        const maxVal = Math.max(dx, sn) || arom_ranges[i];
        const perc = maxVal > 0 ? (diff / maxVal) * 100 : 0;
        document.getElementById(id + '-perc').textContent = Math.round(perc) + '%';
        arom_percs.push(perc);
    });

    // Same calculation for AROM
    const arom_others = arom_percs.filter((_, i) => i !== 1).sort((a,b) => b - a);
    const arom_capped1 = Math.min(arom_others[0], 25);
    const arom_capped2 = Math.min(arom_others[1], 25);
    const arom_sumTwo = arom_capped1 + arom_capped2;
    const arom_er = Math.min(arom_percs[1], 50);
    const arom_total = arom_sumTwo + arom_er;
    const arom_segment = Math.min(arom_total, 100);

    chartDataset.data = [
        Math.max(Math.round(segment), 5),
        Math.max(interd_value, 5),
        Math.max(lc_segment, 5),
        Math.max(apprensione_value, 5),
        Math.max(Math.round(pseq_value), 5),
        Math.max(Math.round(pcs_value), 5),
        Math.max(Math.round(tsk_value), 5),
        Math.max(Math.round(meta_value), 5),
        Math.max(Math.round(lifestyle_value), 5),
        outcome_value
    ];

    chartDataset.pointBackgroundColor = chartDataset.data.map((val, i) => {
        if (i === 1) return ulnt1_positive ? 'red' : 'blue';
        if (i === 2) return (prom_condition && arom_condition && test_condition) ? 'red' : 'blue';
        if (i === 3) return apprensione_positive ? 'red' : 'blue';
        if (i === 5) return pcs_score >= 52 ? 'red' : 'blue';
        if (i === 6) return tsk_score >= 52 ? 'red' : 'blue';
        if (i === 7) return meta_count >= 5 ? 'red' : 'blue';
        if (i === 8) return lifestyle_count >= 4 ? 'red' : 'blue';
        if (i === 9) return outcome_is_red ? 'red' : 'blue';
        return val === 100 ? 'red' : 'blue';
    });
    chartDataset.pointRadius = chartDataset.data.map((val, i) => {
        if (i === 1 && ulnt1_positive) return 6;
        if (i === 3 && apprensione_positive) return 6;
        if (i === 5 && pcs_score >= 52) return 6;
        if (i === 6 && tsk_score >= 52) return 6;
        if (i === 7 && meta_count >= 5) return 6;
        if (i === 8 && lifestyle_count >= 4) return 6;
        if (i === 9 && outcome_is_red) return 6;
        return val === 100 ? 6 : 3;
    });

    if (radarChart.data.labels[0] !== chartLabels[0] ||
        radarChart.data.labels[2] !== chartLabels[2] ||
        radarChart.data.labels[9] !== chartLabels[9]) {
        radarChart.destroy();
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: { labels: [...chartLabels], datasets: [chartDataset] },
            options: chartOptions
        });
    } else {
        radarChart.update();
    }
}

document.querySelectorAll('.frozen-shoulder input, .frozen-shoulder select').forEach(el => {
    el.addEventListener('input', updateChart);
    el.addEventListener('change', updateChart);
});

document.querySelectorAll('.lesione-cuffia input').forEach(input => {
    input.addEventListener('input', updateChart);
});

document.querySelectorAll('.frozen-shoulder select').forEach(select => {
    select.addEventListener('change', updateChart);
});

// Resizer functionality
const resizer = document.getElementById('resizer');
const chart = document.querySelector('.chart');
const questions = document.querySelector('.questions');
let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'ns-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const newHeight = e.clientY;
    if (newHeight > 100 && newHeight < window.innerHeight - 100) {
        chart.style.height = newHeight + 'px';
        questions.style.height = `calc(100vh - ${newHeight + 5}px)`;
    }
});

document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
});

document.querySelectorAll('input[name="outcome-score"]').forEach(radio => {
    radio.addEventListener('change', function () {
        selectedOutcome = this.value;
        outcomeSliderPos = 0;
        const scale = outcomeScales[selectedOutcome];
        const slider = document.getElementById('outcome-slider');
        slider.max = scale.max;
        slider.value = 0;
        slider.disabled = false;
        const displayScore = scale.inverted ? scale.max : 0;
        document.getElementById('outcome-score-display').textContent = displayScore;
        updateChart();
    });
});

document.getElementById('outcome-slider').addEventListener('input', function () {
    outcomeSliderPos = parseInt(this.value);
    const scale = outcomeScales[selectedOutcome];
    const displayScore = scale.inverted ? (scale.max - outcomeSliderPos) : outcomeSliderPos;
    document.getElementById('outcome-score-display').textContent = displayScore;
    updateChart();
});

function downloadState() {
    const state = {};
    document.querySelectorAll('input[id], select[id]').forEach(el => {
        if (el.id === 'upload-input' || el.type === 'radio') return;
        state[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    state._outcome = { selected: selectedOutcome, sliderPos: outcomeSliderPos };
    state._date = new Date().toISOString().slice(0, 10);
    const name = document.getElementById('patient-name').value.trim() || 'paziente';
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_${state._date}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function uploadState(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const state = JSON.parse(e.target.result);
        Object.entries(state).forEach(([id, value]) => {
            if (id.startsWith('_')) return;
            const el = document.getElementById(id);
            if (!el) return;
            if (el.type === 'checkbox') el.checked = value;
            else el.value = value;
        });
        const outcome = state._outcome || {};
        selectedOutcome = outcome.selected || null;
        outcomeSliderPos = outcome.sliderPos || 0;
        if (selectedOutcome) {
            const scale = outcomeScales[selectedOutcome];
            const radio = document.querySelector(`input[name="outcome-score"][value="${selectedOutcome}"]`);
            const slider = document.getElementById('outcome-slider');
            if (radio) radio.checked = true;
            slider.max = scale.max;
            slider.value = outcomeSliderPos;
            slider.disabled = false;
            const displayScore = scale.inverted ? (scale.max - outcomeSliderPos) : outcomeSliderPos;
            document.getElementById('outcome-score-display').textContent = displayScore;
        }
        updateChart();
    };
    reader.readAsText(file);
}

updateChart();