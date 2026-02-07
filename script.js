const ctx = document.getElementById('radarChart').getContext('2d');
const data = {
    labels: ['Frozen shoulder', 'Tend. Calc.', 'Lesione Cuffia', 'Appresione', 'Interd. Reg.'],
    datasets: [{
        label: 'Il tuo punteggio',
        data: [0, 0, 0, 0, 0],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
    }]
};

const config = {
    type: 'radar',
    data: data,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                pointLabels: {
                    font: {
                        size: 14
                    }
                }
            }
        }
    }
};

const radarChart = new Chart(ctx, config);

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
    const lc_avg = lc_percs.reduce((a, b) => a + b, 0) / lc_percs.length;
    let lc_value = 0;
    if (lc_avg > 10) {
        if (lc_avg >= 50) {
            lc_value = 90;
        } else {
            lc_value = (lc_avg - 10) / 40 * 90;
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
    const test_ids = ['ta-erls-dx', 'ta-erls-sn', 'ta-drop-dx', 'ta-drop-sn', 'ta-belly-dx', 'ta-belly-sn', 'ta-lift-dx', 'ta-lift-sn'];
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

    data.datasets[0].data = [
        Math.max(Math.round(segment), 5),
        5,
        lc_segment,
        5,
        5
    ];

    // Change point color to red if that value is 100
    data.datasets[0].pointBackgroundColor = data.datasets[0].data.map((val, i) => {
        if (i === 2) {
            return (prom_condition && arom_condition && test_condition) ? 'red' : 'blue';
        }
        return val === 100 ? 'red' : 'blue';
    });
    data.datasets[0].pointRadius = data.datasets[0].data.map(val => val === 100 ? 6 : 3);

    radarChart.update();
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

updateChart();