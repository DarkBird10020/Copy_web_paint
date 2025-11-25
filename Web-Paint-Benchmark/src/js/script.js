function runAudit() {
    const url = document.getElementById('urlInput').value;
    const dashboard = document.getElementById('dashboard');
    const loader = document.getElementById('loader');
    const status = document.getElementById('statusMessage');

    if (!url) {
        alert("Please enter a valid URL");
        return;
    }

    dashboard.classList.add('hidden');
    loader.classList.remove('hidden');
    status.textContent = "Contacting Google PageSpeed API...";

   const apiKey = 'AIzaSyBZVHlMfA5Yn7SYb3LsuEUEhMvXHvEGF4A'; 
   const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&strategy=mobile&key=${apiKey}`;
    
    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch data. Check URL.");
            return response.json();
        })
        .then(data => {
            loader.classList.add('hidden');
            dashboard.classList.remove('hidden');
            status.textContent = "";
            renderDashboard(data);
        })
        .catch(err => {
            loader.classList.add('hidden');
            status.textContent = "Error: " + err.message;
            console.error(err);
        });
}

function renderDashboard(data) {
    const lighthouse = data.lighthouseResult;
    
    const score = lighthouse.categories.performance.score * 100;
    const gaugeCircle = document.querySelector('.circle');
    const scoreText = document.querySelector('.percentage');
    
    scoreText.textContent = Math.round(score);
    gaugeCircle.style.strokeDasharray = `${score}, 100`;
    
    gaugeCircle.classList.remove('pass', 'average', 'fail');
    if (score >= 90) gaugeCircle.classList.add('pass');
    else if (score >= 50) gaugeCircle.classList.add('average');
    else gaugeCircle.classList.add('fail');

    const metrics = {
        'first-contentful-paint': 'metric-fcp',
        'largest-contentful-paint': 'metric-lcp',
        'total-blocking-time': 'metric-tbt',
        'cumulative-layout-shift': 'metric-cls'
    };

    for (const [key, elementId] of Object.entries(metrics)) {
        const audit = lighthouse.audits[key];
        const el = document.getElementById(elementId);
        const valueEl = el.querySelector('.value');
        const dotEl = el.querySelector('.dot');

        valueEl.textContent = audit.displayValue;
        
        dotEl.className = 'dot'; 
        if (audit.score >= 0.9) dotEl.classList.add('pass');
        else if (audit.score >= 0.5) dotEl.classList.add('average');
        else dotEl.classList.add('fail');
    }

    const list = document.getElementById('opportunityList');
    list.innerHTML = ''; 

    const opportunities = Object.values(lighthouse.audits)
        .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 0.9)
        .sort((a, b) => (a.score - b.score)) 
        .slice(0, 4); 

    opportunities.forEach(op => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${op.title}</span>
            <span class="save-metric">${op.displayValue || ''}</span>
        `;
        list.appendChild(li);
    });
}
