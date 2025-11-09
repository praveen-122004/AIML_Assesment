# Frontend

A tiny static UI to select a file, upload to the backend, and export JSON.

Files:
- `index.html` — simple UI
- `scripts.js` — client logic (uses fetch to POST to `/upload`)
- `styles.css` — minimal styles

To use locally during development, you can serve the folder with a simple static server (e.g., `python -m http.server`) and point the JS upload to the backend URL if the backend runs separately.
