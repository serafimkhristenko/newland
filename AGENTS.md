# Landing 2 project notes

## Page architecture

- `single.html` is the one-screen promo landing.
- `assets/css/single.css` owns all poster and responsive styling.
- `assets/js/single.js` owns the bonus count-up and must stay dependency-free.
- `index.html` routes visitors to the promo page; do not merge the panorama page into `single.html` unless explicitly requested.

## Preview and visual checks

- Preview locally with `python -m http.server 8099 --bind 127.0.0.1` from the project root.
- Treat mobile as the primary layout. Check at least 390×663, 390×844, and 360×800 after visual changes.
- For exact mobile captures, use a temporary `_mobcap.html` iframe harness and remove it after verification.
- Keep the main amount centered, the single CTA in the thumb zone, and all mandatory trust/payment content inside the first screen on short mobile viewports.

## Brand and implementation conventions

- Preserve the GTA-inspired casino art direction, gold secondary emphasis, and lime as the only CTA accent.
- The approved desktop H1 is the original PC rendering from commit `24ab1a4`: `Impact` first, without `font-synthesis` or text stroke. On mobile, use the bundled `Roboto Condensed Local` Cyrillic face with the same heavy condensed treatment so the appearance stays stable on devices without system Impact.
- Keep offer text as live HTML, never baked into raster art.
- Mobile decorative assets must not compete with the offer or cause avoidable above-the-fold downloads.
- Maintain visible keyboard focus, at least 44×44px touch targets, safe-area padding, and `prefers-reduced-motion` behavior.
- Use static HTML/CSS/vanilla JS. Do not introduce a framework or build system.

## Cache and git

- When CSS or JS changes, bump the `?v=` query string for both files in `single.html` in the same change.
- Do not publish, commit, or push unless explicitly requested. Before any git operation, confirm this project root and inspect remote divergence; never force-push.
