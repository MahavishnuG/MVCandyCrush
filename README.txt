
CandyPop — Friendly Match-3 PWA
Files:
- index.html, style.css, app.js
- manifest.json, sw.js
- assets/candies/*.svg (5 candy images)
- assets/icons/icon-192.png, icon-512.png
- assets/sounds/bg_loop.wav and snd_0..snd_4.wav

How to run locally:
1. Unzip and open index.html in a browser.
2. For full PWA features (service worker), host via a static server (e.g., python -m http.server) and open via http(s).
3. Install as PWA from browser install prompt.

Notes:
- This is a lightweight starter game. You can replace SVGs and WAVs with richer assets.
- The game shows an overlay popup when a match of 3+ is found (requirement satisfied).
