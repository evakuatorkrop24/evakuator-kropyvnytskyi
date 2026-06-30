# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static frontend website for **Евакуатор Кропивницький** — a 24/7 car towing service in Kropyvnytskyi, Ukraine. No build tool, no backend, no framework. The site works by opening `index.html` directly in a browser or via a local static server.

Phone: `+380990004114` (display format: `+38 (099) 000-41-14`)
Instagram: `https://www.instagram.com/evakuator_krop_0990004114`
TikTok: `https://www.tiktok.com/@sergey3214?_r=1`
Canonical URL: `https://evakuator-krop.com.ua/`

## Tech Stack

- **HTML5** + **vanilla JavaScript (ES2020+)** — no framework
- **Bootstrap 5.3.8** via jsDelivr CDN (with SRI integrity hashes)
- **Swiper 11.1.9** via CDN — one shared instance for both the reviews and gallery carousels
- **Montserrat** Google Font (Cyrillic subset via `&display=swap`)
- **sharp** (Node.js, devDependency) — one-shot image optimization script; not part of the served site
- Deployed to **Cloudflare Pages** (auto-deploy on push to `main`)

## Commands

```bash
# Install dependencies (Playwright + serve + sharp)
npm install
npx playwright install chromium

# Run all e2e tests (auto-starts local server on port 3000)
npm test

# Run tests with interactive UI
npm test:ui

# Start local dev server manually
npx serve . -p 3000

# Optimize new customer photos (see Image Optimization section below)
node scripts/optimize-images.js
```

To run a single test by name:
```bash
npx playwright test -g "floating call button"
```

## Test Architecture

All tests are in `tests/e2e/site.spec.js`. Playwright's `webServer` config in `playwright.config.js` automatically starts `npx serve . -p 3000` before tests and tears it down after. Tests use `baseURL: http://localhost:3000` and hit the real static files.

The test suite drives the implementation: the spec file defines expected IDs, class names, and content that the HTML must satisfy. Key IDs: `#header`, `#hero`, `#services`, `#reviews`, `#gallery`, `#about`, `#faq`, `#floating-call-btn`.

## HTML Structure

`index.html` is the sole page; `terms.html` and `privacy.html` are legal stub pages. Each page must have `lang="uk"`, a unique `<title>`, `<meta name="description">`, Open Graph tags, and the `LocalBusiness` JSON-LD block.

Sections in order: `#header` (sticky) → `#hero` → `#services` → `#reviews` → `#gallery` → `#about` → `#faq` → `<footer>` → `#floating-call-btn` (fixed).

## CSS Architecture

All custom styles live in `css/main.css`. The design token system uses CSS custom properties on `:root`:

| Variable | Value | Role |
|---|---|---|
| `--color-primary` | `#FFD600` | CTA buttons, stars, highlights |
| `--color-primary-dark` | `#1A1A2E` | Header, footer, dark sections |
| `--color-accent` | `#FF6B00` | Hover states |
| `--color-text-body` | `#212121` | Body text |
| `--color-surface-light` | `#F5F5F5` | Light section backgrounds |
| `--btn-radius` | `8px` | All button corners |
| `--speed` | `0.25s` | All CSS transitions |

Button classes: `.btn-cta` (primary filled), `.btn-outline-cta` (secondary outline), `.btn-sm-cta` (size modifier). Section wrapper classes: `.section`, `.section-dark`, `.section-light`.

Section background alternation: Hero (dark) → Services (light) → Reviews (dark) → Gallery (light) → About (dark) → FAQ (light) → Footer (dark).

## SRI Integrity Hashes

Every CDN resource must have `integrity` and `crossorigin="anonymous"` attributes — there is a dedicated Playwright test for this. When upgrading CDN library versions, regenerate hashes:

```bash
# Example for Bootstrap CSS (sha384)
curl -s https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css | openssl dgst -sha384 -binary | openssl base64 -A
```

Use `sha384-` prefix for Bootstrap, `sha256-` prefix for Swiper.

## Image Optimization

All site images are processed by `scripts/optimize-images.js` (Node.js + sharp). It reads source photos from a **gitignored** staging area and writes WebP + JPEG at each required breakpoint.

**Staging folders** (never committed):
- `assets/images/staging/hero/` — exactly 1 source photo
- `assets/images/staging/about/` — exactly 1 source photo
- `assets/images/staging/gallery/` — all gallery photos, named `01-photo.jpg`, `02-photo.jpg`, … (sort order = display order)

**Output folders** (committed to git):
- `assets/images/hero/` — `hero-768.{webp,jpg}`, `hero-1200.{webp,jpg}`, `hero-1920.{webp,jpg}`
- `assets/images/about/` — `about-480.{webp,jpg}`, `about-768.{webp,jpg}`
- `assets/images/gallery/` — `img-NN-480.{webp,jpg}`, `img-NN-768.{webp,jpg}`, `img-NN-1200.{webp,jpg}`

**Key behaviours:**
- EXIF orientation is applied automatically via `sharp().rotate()` — phone photos always appear upright.
- Portrait vs. landscape is detected from post-rotation dimensions.
- Quality is 82 for all outputs (adjust `QUALITY` constant at the top of the script).
- After running, `assets/images/html-snippets.txt` is written with ready-to-paste `<picture>` HTML including correct `width`/`height` attributes. This file is gitignored.

When adding new photos: drop into staging → run script → paste snippets into `index.html` → commit output images.

## Content Swapping

Placeholder assets are in `assets/images/` (hero, gallery, about subdirs) and `assets/icons/logo.svg`. When the customer provides real assets, swap the files and update references. The phone number appears in many places — search for `+380990004114` and `099) 000-41-14` to find all occurrences.

## Deployment

Push to `main` triggers Cloudflare Pages auto-deploy. No build command — Cloudflare serves the static files as-is. The `_redirects` file handles 404 routing. Cloudflare's dashboard minification (HTML/CSS/JS) is enabled separately in the Cloudflare UI.
