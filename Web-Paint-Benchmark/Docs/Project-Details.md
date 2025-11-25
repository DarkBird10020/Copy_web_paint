# OJT Project Design Document: Web Performance Insights Dashboard

**Student Name(s):** Atul Chahar, Anant Sharma  
**Roll No(s):** Atul Chahar - 251810700198, Anant Sharma - 251810700035  
**Year & Section:** 2025,Sem-1A 
**Project Title:** Web Paint Benchmark (Performance Insights Dashboard)
**Project Type:** (Product Developement)  
**Stack / Framework:** HTML, CSS, JavaScript (PerformanceObserver, rAF)

---

## 1. Problem Understanding

### 1.1 What is the problem statement in your own words
Web developers often struggle to identify exactly why their webpages feel "slow" or "laggy" because standard debugging tools are too complex. We need to build a simplified, professional audit tool—similar to Google Lighthouse—that analyzes CSS rendering performance (paint times and latency) and presents it as an easy-to-understand "Health Score" rather than just raw numbers.

### 1.2 Why does this problem exist or matter?
This matters because user experience relies on smooth animations (60fps). Developers need a quick way to verify if their visual effects (like filters or shadows) are too expensive for the browser to render efficiently[cite: 11].

### 1.3 Key inputs and expected outputs:

| Inputs | Process | Expected Outputs |
| :--- | :--- | :--- |
| **User Target:** A user provides a test case, code snippet, or selects a demo URL scenario. | **Audit Engine:** The system runs a stress test using `PerformanceObserver` to measure paint costs and input latency. | **Dashboard Report:** A professional UI displaying a "0-100" Performance Score, red/green status indicators, and metric charts. |

---

## 2. Functional Scope

### 2.1 What are the core features you plan to build (must-haves)?
1.  **Audit Landing Page:** A clean input interface where users can initiate the performance test (Lighthouse-style start screen).
2.  **Scoring Engine:** An algorithm that converts raw millisecond timings into a readable 0-100 score.
3.  **Results Dashboard:** A visual report card featuring a circular score gauge, stability metrics, and actionable suggestions.

### 2.2 What stretch goals could you attempt if time permits?
1.  **Comparative Mode:** Ability to run two tests side-by-side (e.g., "Opacity vs. Display: None") and see a direct winner in the dashboard.
2.  **Export Function:** allow users to download their performance report as a JSON or PDF file.

### 2.3 Which libraries or tools will you use?
* **Frontend:** HTML5, CSS3 (focusing on modern Flexbox/Grid for layout).
* **Logic:** Vanilla JavaScript, `requestAnimationFrame`, `PerformanceObserver` API.
* **Visualization:** Chart.js (for rendering performance graphs).

---

## 3. System & Design Thinking 

### 3.1 Sketch or describe your app flow / pipeline:
1.  **Input:** User lands on Home Page → Selects "Run Audit."
2.  **Processing:** The UI shows a "Testing..." loader → The background engine stresses the browser renderer → Captures paint timestamps.
3.  **Output:** Redirects to the Dashboard → Calculates Score → Animates the Gauge and plots the charts.

### 3.2 What data structures or algorithms are central to this project?
* **Data Structures:** Arrays to store frame durations (e.g., `frameTimes = [16.7, 16.8, 32.5]`). Objects to map scores to labels (e.g., `{score: 90, label: "Good"}`).
* **Algorithms:** Statistical Mean (Average Paint Time) and Standard Deviation (to measure visual stability/jitter).

### 3.3 How will you test correctness or performance?
We will use "Golden Master" testing. We will create a "Known Bad" scenario (heavy usage of `box-shadow` and `backdrop-filter`) which *must* result in a Red score (<50). We will create a "Known Good" scenario (using only `transform` and `opacity`) which *must* result in a Green score (>90).

---

## 4. Timeline & Milestones (4 Weeks)

| Week | Planned Deliverables | Mentor Checkpoint |
| :--- | :--- | :--- |
| **W1** | **UI & Harness:** Design the "Lighthouse" landing page and the Results Dashboard structure (HTML/CSS). | ☐ |
| **W2** | **Logic & Scoring:** Implement `PerformanceObserver` to capture real data and feed it into a basic scoring algorithm. | ☐ |
| **W3** | **Evaluation & Charts:** Integrate Chart.js to visualize the data and fine-tune the scoring math to be accurate. | ☐ |
| **W4** | **Polish & Gallery:** Add UI polish (animations, transitions), create preset scenarios, and finalize documentation. | ☐ |

---

## 5. Risks & Dependencies

### 5.1 What's the hardest part technically for you right now? 
Developing a fair "Scoring Algorithm." Deciding exactly how many milliseconds of lag results in a score drop from 100 to 90 is difficult to standardize across different computers (e.g., a fast laptop vs. a slow phone).

### 5.2 What dependencies or help do you need from mentors? 
We may need assistance understanding browser security restrictions (CORS) if we attempt to test external URLs, and guidance on how to interpret specific `PerformanceObserver` entries correctly.

---

## 6. Evaluation Readiness 

### 6.1 How will you prove that your project "works"?
We will perform a live demo:
1.  Open the Dashboard.
2.  Run a "High Performance" test -> **Expect Green Score (90+).**
3.  Run a "Low Performance" test -> **Expect Red Score (<50).**
The distinct difference in scores proves the tool accurately measures performance costs.

### 6.2 What success metric or goal will you aim for? 
* **Visual Quality:** The dashboard must look professional (clean typography, proper spacing), resembling existing tools like Lighthouse or GTmetrix.
* **Reliability:** The score should not fluctuate wildly between two identical runs (variance < 5%).

---

## 7. Responsibilities 

| Task | Student 1 | Student 2 |
| :--- | :--- | :--- |
| **Dashboard UI Design (HTML/CSS)** | ☐ | ☐ |
| **Performance Logic (JS)** | ☐ | ☐ |
| **Chart Integration** | ☐ | ☐ |
| **Documentation & Testing** | ☐ | ☐ |