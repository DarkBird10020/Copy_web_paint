# Code Review Notes

## Summary
Overall, the UI is visually polished, but the JavaScript has a few security, reliability, and quality issues that should be addressed before shipping.

## Findings

1. **Exposed API credential**
   - `src/js/script.js` embeds a Google PageSpeed Insights API key directly in client-side code, which makes the credential publicly visible and easy to abuse or exhaust. Move the call behind a backend proxy or inject the key via a server-side secret store instead of shipping it in the bundle.【F:src/js/script.js†L16-L17】

2. **Missing error handling for PageSpeed responses**
   - `renderDashboard` assumes `data.lighthouseResult` is always present. PageSpeed returns a 200 with an `error` payload for invalid URLs, quota exhaustion, or authentication issues; in those cases the page will throw when dereferencing `lighthouse.categories.performance`. Guard against missing/erroneous responses and surface a user-friendly error state.【F:src/js/script.js†L37-L40】

3. **Opportunity list uses unsanitized HTML injection**
   - The code writes audit titles and display values into `innerHTML` without escaping. While PageSpeed data is normally safe, directly inserting unsanitized strings increases XSS risk if the API ever echoes user-controlled input (e.g., URL) or is replaced with another data source. Prefer `textContent` or sanitize the strings before insertion.【F:src/js/script.js†L81-L88】

4. **Benchmark score is unbounded and CPU-weighted**
   - `calculateFinalScore` scales linearly with the requested element count, so running with 5,000 nodes produces scores hundreds of times higher than a modest run, regardless of actual performance. The metric should be normalized (e.g., capped element counts, weighted by duration) to remain comparable across runs.【F:src/js/benchmark.js†L157-L163】

5. **FPS history grows without bounds**
   - `updateChart` trims the chart data to 50 points but keeps pushing values into `state.fpsHistory`, which is used for the final average. Long-running tests will accumulate a large array and skew averages toward more recent points, since older chart samples are removed but still counted in the mean. Limit the stored history to the same window or compute a rolling average.【F:src/js/benchmark.js†L200-L211】

## Recommendations
- Move PageSpeed calls to a backend endpoint that injects the API key securely and validates URLs.
- Add guards around `lighthouseResult` parsing and show actionable error messages when API responses fail.
- Replace `innerHTML` with DOM node creation plus `textContent` when rendering opportunity titles/metrics.
- Redefine the benchmark scoring to normalize for run length and element count, and bound the stored FPS samples to prevent memory bloat.
