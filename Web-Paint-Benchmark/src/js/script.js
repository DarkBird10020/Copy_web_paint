const selectors = {
    urlInput: document.getElementById('urlInput'),
    runButton: document.getElementById('runBtn'),
    dashboard: document.getElementById('dashboard'),
    loader: document.getElementById('loader'),
    status: document.getElementById('statusMessage'),
};

const METRIC_KEYS = {
    'first-contentful-paint': 'metric-fcp',
    'largest-contentful-paint': 'metric-lcp',
    'total-blocking-time': 'metric-tbt',
    'cumulative-layout-shift': 'metric-cls',
};

async function runAudit() {
    const rawUrl = selectors.urlInput.value.trim();

    if (!rawUrl) {
        updateStatus('Please enter a URL to audit.', 'error');
        return;
    }

    const normalizedUrl = normalizeUrl(rawUrl);
    if (!normalizedUrl) {
        updateStatus('Enter a valid URL starting with http or https.', 'error');
        return;
    }

    toggleLoading(true);
    updateStatus('Contacting Google PageSpeed API...', 'info');

    const apiKey = 'AIzaSyBZVHlMfA5Yn7SYb3LsuEUEhMvXHvEGF4A';
    const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&category=PERFORMANCE&strategy=mobile&key=${apiKey}`;

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error('Failed to fetch data. Verify the URL and try again.');
        }

        const data = await response.json();
        renderDashboard(data);
        updateStatus('Audit complete. Explore your results below.', 'success');
    } catch (error) {
        console.error(error);
        updateStatus(error.message || 'An unexpected error occurred while fetching results.', 'error');
    } finally {
        toggleLoading(false);
    }
}

function normalizeUrl(url) {
    try {
        const value = url.startsWith('http') ? url : `https://${url}`;
        return new URL(value).href;
    } catch (error) {
        return null;
    }
}

function toggleLoading(isLoading) {
    selectors.dashboard.classList.toggle('hidden', isLoading);
    selectors.loader.classList.toggle('hidden', !isLoading);
    selectors.runButton.disabled = isLoading;
    selectors.urlInput.disabled = isLoading;
}

function updateStatus(message, variant = 'info') {
    selectors.status.textContent = message;
    selectors.status.className = `status ${variant}`;
}

function renderDashboard(data) {
    const lighthouse = data.lighthouseResult;

    if (!lighthouse || !lighthouse.categories || !lighthouse.categories.performance) {
        throw new Error('The response did not include performance data.');
    }

    const score = Math.round((lighthouse.categories.performance.score || 0) * 100);
    const gaugeCircle = document.querySelector('.circle');
    const scoreText = document.querySelector('.percentage');

    scoreText.textContent = score;
    gaugeCircle.style.strokeDasharray = `${score}, 100`;

    gaugeCircle.classList.remove('pass', 'average', 'fail');
    if (score >= 90) gaugeCircle.classList.add('pass');
    else if (score >= 50) gaugeCircle.classList.add('average');
    else gaugeCircle.classList.add('fail');

    Object.entries(METRIC_KEYS).forEach(([key, elementId]) => {
        const audit = lighthouse.audits[key];
        const el = document.getElementById(elementId);
        const valueEl = el.querySelector('.value');
        const dotEl = el.querySelector('.dot');

        const displayValue = audit?.displayValue || 'N/A';
        const scoreValue = typeof audit?.score === 'number' ? audit.score : 0;

        valueEl.textContent = displayValue;

        dotEl.className = 'dot';
        if (scoreValue >= 0.9) dotEl.classList.add('pass');
        else if (scoreValue >= 0.5) dotEl.classList.add('average');
        else dotEl.classList.add('fail');
    });

    const list = document.getElementById('opportunityList');
    list.innerHTML = '';

    const opportunities = Object.values(lighthouse.audits || {})
        .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 0.9)
        .sort((a, b) => (a.score - b.score))
        .slice(0, 4);

    if (!opportunities.length) {
        const li = document.createElement('li');
        li.classList.add('empty');
        li.textContent = 'No major opportunities found. Nice work!';
        list.appendChild(li);
        return;
    }

    opportunities.forEach(op => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <p class="title">${op.title}</p>
                <p class="description">${op.description || ''}</p>
            </div>
            <span class="save-metric">${op.displayValue || ''}</span>
        `;
        list.appendChild(li);
    });
}
