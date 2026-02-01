const ctx = document.getElementById('radarChart').getContext('2d');
const data = {
    labels: ['Happiness', 'Health', 'Productivity', 'Social', 'Stress'],
    datasets: [{
        label: 'Your Ratings',
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
                max: 5
            }
        }
    }
};

const radarChart = new Chart(ctx, config);

function updateChart() {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    const q4 = document.querySelector('input[name="q4"]:checked');
    const q5 = document.querySelector('input[name="q5"]:checked');

    data.datasets[0].data = [
        q1 ? parseInt(q1.value) : 0,
        q2 ? parseInt(q2.value) : 0,
        q3 ? parseInt(q3.value) : 0,
        q4 ? parseInt(q4.value) : 0,
        q5 ? parseInt(q5.value) : 0
    ];

    radarChart.update();
}

document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', updateChart);
});