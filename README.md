# Son Pencere — The Last Window

A time capsule made of light for **Eyüp DevArt** ([eyupdevart.com](https://eyupdevart.com/)).

Live: **https://sonpencere.pages.dev**

The night's sealed works orbit a central light above a procedural İstanbul skyline: Aksu Oto Çekici, the premium brand, WHIRLWIND • T and Shotglass. Each tap makes the machine write the next line of a letter in light-particles, launched from the work it speaks of. Move the cursor to stir the dust into a small whirlwind and to scatter the letters, which spring back into place. When İstanbul's clock strikes 00:00, the light answers.

- A single `src/index.html`: inline CSS and JS, canvas only, no fonts, no libraries and no third-party requests.
- `node build.mjs` writes `dist/`, which holds a strict hash-based CSP plus a Pages `_worker.js` that serves the page.
- JSON-LD ties into the `https://eyupdevart.com/#person` and `#devart` entity graph.
