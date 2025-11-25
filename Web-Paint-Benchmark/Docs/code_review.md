# Code Review

## Web Paint Auditor (`src/js/script.js`)
- The Google PageSpeed Insights API key is embedded directly in the client bundle, which exposes the key publicly and allows quota abuse without restrictions. Consider moving the request server-side or loading the key from a protected configuration source instead of shipping it in the browser bundle. 【F:src/js/script.js†L16-L34】
- `renderDashboard` assumes `data.lighthouseResult` and every audit metric are present. If the API returns an error payload or a missing audit (e.g., throttled or invalid category), the code will dereference `undefined` and throw before the UI can display a helpful message. Add guards around `lighthouseResult`, `categories.performance`, and each audit object before reading `score` or `displayValue`. 【F:src/js/script.js†L37-L89】

## Benchmark Lab (`src/js/benchmark.js`)
- `calculateFinalScore` calls `reduce` on `state.fpsHistory` without an initial accumulator. Stopping immediately or encountering a scenario where no FPS samples were recorded will throw a `TypeError`, preventing the stop action from completing cleanly. Provide an initial value or short-circuit when the history is empty. 【F:src/js/benchmark.js†L157-L163】
- The benchmark loop derives FPS from the previous frame’s timestamp but never clamps or validates `deltaTime`. A zero or extremely small delta could inflate FPS and the derived score. Safeguard by bounding `deltaTime` or skipping the update when it falls below a realistic threshold. 【F:src/js/benchmark.js†L104-L163】
