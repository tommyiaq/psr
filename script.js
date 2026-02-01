const ctx = document.getElementById('radarChart').getContext('2d');
const data = {
    labels: ['Frozen shoulder', 'Tendinopatia Calcifica', 'Lesione Cuffia', 'Appresione', 'Interdipendenza Regionale'],
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
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                pointLabels: {
                    font: {
                        size: 18
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
        const maxVal = Math.max(dx, sn, ranges[i]); // use the range max if both 0
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

    // Other questions
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    const q4 = document.querySelector('input[name="q4"]:checked');
    const q5 = document.querySelector('input[name="q5"]:checked');

    data.datasets[0].data = [
        Math.max(Math.round(segment), 5),
        Math.max(q2 ? parseInt(q2.value) : 0, 5),
        Math.max(q3 ? parseInt(q3.value) : 0, 5),
        Math.max(q4 ? parseInt(q4.value) : 0, 5),
        Math.max(q5 ? parseInt(q5.value) : 0, 5)
    ];

    // Change point color to red if that value is 100
    data.datasets[0].pointBackgroundColor = data.datasets[0].data.map(val => val === 100 ? 'red' : 'blue');
    data.datasets[0].pointRadius = data.datasets[0].data.map(val => val === 100 ? 6 : 3);

    radarChart.update();
}

document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', updateChart);
});

document.querySelectorAll('.frozen-shoulder input').forEach(input => {
    input.addEventListener('input', updateChart);
});

updateChart();