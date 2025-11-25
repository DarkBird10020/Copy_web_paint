const state = {
    isRunning: false,
    frameCount: 0,
    startTime: 0,
    lastFrameTime: 0,
    fpsHistory: [],
    particles: [],
    animationId: null,
    elementsToRender: 1000
};

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const stage = document.getElementById('renderStage');
const fpsDisplay = document.getElementById('fpsCounter');
const scoreDisplay = document.getElementById('scoreDisplay');
const countInput = document.getElementById('elementCount');
const countValue = document.getElementById('countValue');

function init() {
    document.getElementById('cpuCores').textContent = navigator.hardwareConcurrency || 'Unknown';
    document.getElementById('ram').textContent = navigator.deviceMemory || 'Unknown';

    const ua = navigator.userAgent;
    let browserName = "Unknown";
    if (ua.indexOf("Chrome") > -1) browserName = "Chrome";
    else if (ua.indexOf("Safari") > -1) browserName = "Safari";
    else if (ua.indexOf("Firefox") > -1) browserName = "Firefox";
    document.getElementById('browser').textContent = browserName;

    initChart();
}

countInput.addEventListener('input', (e) => {
    state.elementsToRender = parseInt(e.target.value);
    countValue.textContent = `${state.elementsToRender} elements`;
});

startBtn.addEventListener('click', startBenchmark);
stopBtn.addEventListener('click', stopBenchmark);

function startBenchmark() {
    if (state.isRunning) return;

    state.isRunning = true;
    state.frameCount = 0;
    state.startTime = performance.now();
    state.lastFrameTime = performance.now();
    state.fpsHistory = [];

    startBtn.disabled = true;
    stopBtn.disabled = false;
    stopBtn.classList.add('active');
    stage.innerHTML = '';
    resetChart();

    const scenario = document.getElementById('scenarioSelect').value;
    createParticles(scenario);

    requestAnimationFrame(loop);
}

function stopBenchmark() {
    state.isRunning = false;
    cancelAnimationFrame(state.animationId);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    stopBtn.classList.remove('active');

    calculateFinalScore();
}

function createParticles(type) {
    const fragment = document.createDocumentFragment();
    const width = stage.clientWidth;
    const height = stage.clientHeight;

    for (let i = 0; i < state.elementsToRender; i++) {
        const div = document.createElement('div');
        div.className = `particle scenario-${type}`;

        const x = Math.random() * (width - 20);
        const y = Math.random() * (height - 20);

        div.style.left = `${x}px`;
        div.style.top = `${y}px`;

        if (type === 'layout' || type === 'transform') {
            div.dataset.vx = (Math.random() - 0.5) * 5;
            div.dataset.vy = (Math.random() - 0.5) * 5;
            div.dataset.x = x;
            div.dataset.y = y;
        }

        fragment.appendChild(div);
    }
    stage.appendChild(fragment);
    state.particles = Array.from(stage.children);
}

function loop(timestamp) {
    if (!state.isRunning) return;

    const deltaTime = timestamp - state.lastFrameTime;
    state.lastFrameTime = timestamp;

    const currentFPS = Math.round(1000 / deltaTime);
    state.frameCount++;

    if (state.frameCount % 10 === 0) {
        fpsDisplay.textContent = currentFPS;
        document.getElementById('frameTotal').textContent = state.frameCount;

        fpsDisplay.style.color = currentFPS < 30 ? '#ff5252' : '#69f0ae';

        updateChart(currentFPS);
    }

    const scenario = document.getElementById('scenarioSelect').value;
    if (scenario === 'layout' || scenario === 'transform') {
        animateJS(scenario);
    }

    state.animationId = requestAnimationFrame(loop);
}

function animateJS(type) {
    const width = stage.clientWidth;
    const height = stage.clientHeight;

    state.particles.forEach(p => {
        let x = parseFloat(p.dataset.x);
        let y = parseFloat(p.dataset.y);
        let vx = parseFloat(p.dataset.vx);
        let vy = parseFloat(p.dataset.vy);

        if (x + 20 > width || x < 0) vx *= -1;
        if (y + 20 > height || y < 0) vy *= -1;

        x += vx;
        y += vy;

        p.dataset.x = x;
        p.dataset.y = y;
        p.dataset.vx = vx;
        p.dataset.vy = vy;

        if (type === 'layout') {
            p.style.top = `${y}px`;
            p.style.left = `${x}px`;
        } else {
            p.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
    });
}

function calculateFinalScore() {
    const avgFPS = state.fpsHistory.reduce((a, b) => a + b, 0) / state.fpsHistory.length || 0;
    const rawScore = (avgFPS / 60) * (state.elementsToRender / 10);

    scoreDisplay.textContent = Math.round(rawScore);
    alert(`Benchmark Finished!\nAverage FPS: ${Math.round(avgFPS)}\nScore: ${Math.round(rawScore)}`);
}

let chart;
function initChart() {
    const ctx = document.getElementById('perfChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'FPS',
                data: [],
                borderColor: '#7c4dff',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(124, 77, 255, 0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: {
                    min: 0,
                    max: 70,
                    grid: { color: '#333' }
                },
                x: { display: false }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function updateChart(fps) {
    state.fpsHistory.push(fps);

    if (state.fpsHistory.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.data.labels.push(state.frameCount);
    chart.data.datasets[0].data.push(fps);
    chart.update();
}

function resetChart() {
    if (chart) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.update();
    }
}

init();
