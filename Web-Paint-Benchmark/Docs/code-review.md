# Code Review - Web Paint Benchmark

## Summary
This review highlights key issues in the current implementation of the audit dashboard powered by Google PageSpeed Insights.

## Findings
1. **Exposed Google API key in client-side code**
   - The PageSpeed Insights API key is embedded directly in `src/js/script.js`, making it publicly visible to anyone loading the page. This enables unauthorized reuse of the key, which could exhaust quota or incur charges. API keys should be kept server-side or protected via a proxy and restricted to allowed hosts.
2. **Insufficient URL validation and error handling**
   - `runAudit` only checks that the input is non-empty before calling the API. Invalid or unsupported URLs will surface as generic fetch failures, leading to poor user feedback and potentially unnecessary API calls. Validate URLs with stricter patterns and provide user-friendly error messages before sending requests.
3. **Assumption that Lighthouse data is always present**
   - `renderDashboard` accesses `lighthouse.categories.performance.score` and multiple audit fields without null checks. If the API response is incomplete or an audit is missing, the code will throw and leave the UI in a broken state. Defensive checks with fallbacks (e.g., optional chaining, default strings) would improve resilience.
4. **Opportunity list may show irrelevant items**
   - Opportunities are selected purely by `audit.score < 0.9`, even though the PageSpeed API may omit scores for certain audits. Missing scores (null) will pass the filter and can surface unhelpful entries. Consider explicitly checking numeric scores and prioritizing estimated savings from `details.overallSavingsMs` instead.

## Recommendations
- Move API interactions behind a backend endpoint or proxy that keeps the API key private and enforces domain restrictions.
- Add robust URL validation, including protocol checks and a clearer error display for invalid inputs.
- Guard against missing `lighthouseResult` data before updating the DOM, and show a friendly error state if parsing fails.
- Refine opportunity ranking to prefer highest potential savings and ignore audits without actionable data.
