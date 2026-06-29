# Евакуатор Кропивницький Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Ukrainian-language one-page landing site for a towing company in Kropyvnytskyi, covering 8 content sections, SEO, accessibility, placeholder assets, legal stub pages, and Cloudflare Pages deployment readiness.

**Architecture:** Single `index.html` file with all page sections. Bootstrap 5 handles layout and accordion. Two Swiper.js instances (reviews + gallery) share one CDN import. All custom styles live in `css/main.css` via CSS custom properties; lightweight interactions in `js/main.js`. Playwright E2E tests verify structure and behaviour section by section.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES2020+), Bootstrap 5.3.8 (jsDelivr CDN), Swiper.js 11.1.9 (jsDelivr CDN), Montserrat (Google Fonts, Cyrillic), @playwright/test 1.45.x (dev-only)

## Global Constraints

- Phone href: `tel:+380990004114` | Display: `+38 (099) 000-41-14`
- All user-facing text in Ukrainian; `<html lang="uk">` on every page
- Colors — Primary: `#FFD600` | Dark: `#1A1A2E` | Accent: `#FF6B00` | Body: `#212121` | Inverse: `#FFFFFF` | Surface: `#F5F5F5` | Border: `#E0E0E0`
- Font: Montserrat 400/600/700, Google Fonts (Cyrillic included automatically)
- Bootstrap 5.3.8 via jsDelivr; SRI hashes are embedded in this plan (CSS: `sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB`, JS: `sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI`)
- Swiper 11.1.9 via jsDelivr; one shared CSS + JS import for both carousels; SRI hashes are embedded in this plan (CSS: `sha256-MMXrlNBnzij7CcWxGT9wVEKkTx+8LMBE9gW0LqgnRx0=`, JS: `sha256-5zigKaoOwsOnRsnlyB0bo9zGym+XkoLO/atGJURu+Tc=`)
- All external CDN `<link>` and `<script>` tags **must** include `integrity="sha..."` and `crossorigin="anonymous"` — omitting SRI exposes the site to CDN-compromise attacks; a Playwright test enforces this
- No build tool — site opens by double-clicking `index.html`; hosted on Cloudflare Pages
- Browser targets: last 2 Chrome, Firefox, Safari, Edge
- Touch targets ≥ 44×44 px; contrast ≥ 4.5:1 body text, ≥ 3:1 large text (WCAG AA)
- Instagram: `https://www.instagram.com/evakuator_krop_0990004114`
- TikTok: `https://www.tiktok.com/@sergey3214`
- Section background sequence: Hero (dark) → Services (light) → Reviews (dark) → Gallery (light) → About (dark) → FAQ (light) → Footer (dark)
- One primary CTA button visible per viewport section maximum
- All `<img>` must have meaningful Ukrainian `alt` text

---

## File Map

| File | Role |
|---|---|
| `index.html` | All page sections (built up task by task) |
| `terms.html` | Ukrainian Terms of Use stub |
| `privacy.html` | Ukrainian Privacy Policy stub |
| `css/main.css` | CSS custom properties, resets, button system, all section styles |
| `js/main.js` | Swiper init, mobile nav auto-close |
| `robots.txt` | Crawl directives |
| `sitemap.xml` | SEO sitemap |
| `favicon.ico` | Placeholder favicon |
| `_headers` | Cloudflare Pages HTTP security headers (CSP, X-Frame-Options, etc.) |
| `assets/icons/logo.svg` | Stub SVG logo (truck + text) |
| `assets/icons/apple-touch-icon.png` | iOS home-screen icon (1×1 placeholder — swap before launch) |
| `package.json` | `@playwright/test` + `serve` dev dependencies only |
| `playwright.config.js` | webServer: `npx serve .`, testDir: `tests/e2e` |
| `tests/e2e/site.spec.js` | All E2E assertions — grows task by task |
| `README.md` | Local dev, deploy guide, DevOps setup, asset swap instructions |
| `.gitignore` | Excludes node_modules, Playwright output, and OS files |
| `404.html` | Custom Cloudflare Pages 404 error page |
| `.github/workflows/test.yml` | GitHub Actions CI — tests on every push/PR; deploys to Cloudflare Pages only after tests pass |

---

### Task 1: Foundation — HTML Shell, CSS Variables, Test Setup

**Files:**
- Create: `index.html`
- Create: `css/main.css`
- Create: `js/main.js`
- Create: `package.json`
- Create: `playwright.config.js`
- Create: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `/` page at localhost:3000, global CSS custom properties, Playwright infrastructure
- All subsequent tasks append HTML to `index.html`, CSS to `css/main.css`, tests to `tests/e2e/site.spec.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/e2e/site.spec.js
const { test, expect } = require('@playwright/test');

test('page has lang="uk"', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
});

test('page has title containing Кропивницький', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Кропивницький/);
});

test('page has meta description', async ({ page }) => {
  await page.goto('/');
  const desc = page.locator('meta[name="description"]');
  await expect(desc).toHaveAttribute('content', /.{30,}/);
});

test('page has Open Graph title and description', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
});

test('page has LocalBusiness JSON-LD', async ({ page }) => {
  await page.goto('/');
  const ld = page.locator('script[type="application/ld+json"]');
  await expect(ld).toHaveCount(1);
  const content = await ld.textContent();
  expect(content).toContain('"LocalBusiness"');
  expect(content).toContain('+380990004114');
});

test('all CDN links and scripts have SRI integrity attributes', async ({ page }) => {
  await page.goto('/');
  const cdnLinks = page.locator('link[href*="cdn.jsdelivr.net"]');
  const cdnScripts = page.locator('script[src*="cdn.jsdelivr.net"]');
  const linkCount = await cdnLinks.count();
  const scriptCount = await cdnScripts.count();
  for (let i = 0; i < linkCount; i++) {
    const integrity = await cdnLinks.nth(i).getAttribute('integrity');
    expect(integrity, `CDN link[${i}] missing integrity attribute`).toBeTruthy();
  }
  for (let i = 0; i < scriptCount; i++) {
    const integrity = await cdnScripts.nth(i).getAttribute('integrity');
    expect(integrity, `CDN script[${i}] missing integrity attribute`).toBeTruthy();
  }
});

test('no CDN resources fail to load (catches wrong SRI hashes)', async ({ page }) => {
  const failedRequests = [];
  page.on('requestfailed', req => {
    if (req.url().includes('cdn.jsdelivr.net')) failedRequests.push(req.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(failedRequests, `Failed CDN requests: ${failedRequests.join(', ')}`).toHaveLength(0);
});
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "evakuator-kropyvnytskyi",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.45.0",
    "serve": "^14.2.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Run: `npx playwright install chromium`
Expected: node_modules installed, chromium browser downloaded

- [ ] **Step 3b: Create `.gitignore`**

```
node_modules/
playwright-report/
test-results/
.DS_Store
Thumbs.db
*.log
```

- [ ] **Step 4: Create `playwright.config.js`**

```js
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npx serve . -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 15000,
  },
});
```

- [ ] **Step 5: Run tests to confirm they fail**

Run: `npm test`
Expected: 6 FAILED — "net::ERR_CONNECTION_REFUSED" (no server, no page)

- [ ] **Step 6: Create `css/main.css`**

```css
:root {
  --color-primary: #FFD600;
  --color-primary-dark: #1A1A2E;
  --color-accent: #FF6B00;
  --color-text-body: #212121;
  --color-text-inverse: #FFFFFF;
  --color-surface-light: #F5F5F5;
  --color-border: #E0E0E0;
  --font-family: 'Montserrat', sans-serif;
  --btn-radius: 8px;
  --speed: 0.25s;
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-family);
  color: var(--color-text-body);
  line-height: 1.6;
  margin: 0;
}

h1 { font-size: clamp(28px, 5vw, 48px); font-weight: 700; line-height: 1.2; }
h2 { font-size: clamp(22px, 4vw, 36px); font-weight: 700; line-height: 1.3; }
h3 { font-size: clamp(18px, 2.5vw, 24px); font-weight: 600; line-height: 1.4; }
p  { font-size: clamp(16px, 1.5vw, 18px); }

a:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }

/* Button system */
.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary);
  color: var(--color-text-body);
  border: none;
  border-radius: var(--btn-radius);
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: filter var(--speed), box-shadow var(--speed);
}
.btn-cta:hover, .btn-cta:focus-visible {
  filter: brightness(1.08);
  box-shadow: 0 4px 16px rgba(255,214,0,0.45);
  color: var(--color-text-body);
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-outline-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--btn-radius);
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--speed), color var(--speed), box-shadow var(--speed);
}
.btn-outline-cta:hover, .btn-outline-cta:focus-visible {
  background: var(--color-primary);
  color: var(--color-text-body);
  box-shadow: 0 4px 16px rgba(255,214,0,0.45);
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-sm-cta { min-height: 40px; padding: 0.4rem 0.9rem; font-size: 0.875rem; }

/* Section wrappers */
.section      { padding: 80px 0; }
.section-dark { background: var(--color-primary-dark); color: var(--color-text-inverse); }
.section-light{ background: var(--color-surface-light); color: var(--color-text-body); }
```

- [ ] **Step 7: Create `js/main.js` (stub)**

```js
// Populated in Task 10
```

- [ ] **Step 8: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Евакуатор Кропивницький — цілодобово, +38 (099) 000-41-14</title>
  <meta name="description" content="Евакуатор у Кропивницькому 24/7. Приїдемо за 20–30 хвилин. Перевезення авто після ДТП, по місту та всій Україні. Телефонуйте: +38 (099) 000-41-14.">
  <link rel="canonical" href="https://evakuator-krop.com.ua/">

  <!-- Open Graph -->
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="https://evakuator-krop.com.ua/">
  <meta property="og:title"       content="Евакуатор Кропивницький — цілодобово, +38 (099) 000-41-14">
  <meta property="og:description" content="Приїдемо за 20–30 хвилин. Евакуація після ДТП, перевезення авто по місту та всій Україні.">
  <!-- STUB: replace with real OG image URL when customer provides assets -->
  <meta property="og:image"       content="https://picsum.photos/seed/evakhero/1200/630">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">

  <!-- Favicon -->
  <link rel="icon" href="favicon.ico">
  <link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">

  <!-- JSON-LD: LocalBusiness -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Евакуатор Кропивницький",
    "telephone": "+380990004114",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Кропивницький",
      "addressCountry": "UA"
    },
    "areaServed": ["Кропивницький", "Кіровоградська область", "Україна"],
    "openingHours": "Mo-Su 00:00-24:00",
    "url": "https://evakuator-krop.com.ua/"
  }
  </script>

  <!-- Preconnects -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Montserrat — Cyrillic included automatically -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">

  <!-- Bootstrap 5.3.8 CSS -->
  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossorigin="anonymous">

  <!-- Swiper 11.1.9 CSS -->
  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swiper@11.1.9/swiper-bundle.min.css"
        integrity="sha256-MMXrlNBnzij7CcWxGT9wVEKkTx+8LMBE9gW0LqgnRx0="
        crossorigin="anonymous">

  <link rel="stylesheet" href="css/main.css">
</head>
<body>

  <!-- Sections inserted by Tasks 2–10 -->
  <main id="main-content"><!-- populated by subsequent tasks --></main>

  <!-- Bootstrap JS Bundle -->
  <script defer
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
          crossorigin="anonymous"></script>
  <!-- Swiper JS -->
  <script defer
          src="https://cdn.jsdelivr.net/npm/swiper@11.1.9/swiper-bundle.min.js"
          integrity="sha256-5zigKaoOwsOnRsnlyB0bo9zGym+XkoLO/atGJURu+Tc="
          crossorigin="anonymous"></script>
  <!-- Custom JS -->
  <script defer src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 8b: Verify SRI hashes**

Run each command and compare the output to the `integrity="sha..."` value already embedded in `index.html`. If any differ, update the hash before proceeding — a wrong hash silently blocks the resource in the browser:

```bash
# Bootstrap 5.3.8 CSS (expect sha384-...)
curl -s https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css | openssl dgst -sha384 -binary | openssl base64 -A

# Bootstrap 5.3.8 JS bundle (expect sha384-...)
curl -s https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js | openssl dgst -sha384 -binary | openssl base64 -A

# Swiper 11.1.9 CSS (expect sha256-...)
curl -s https://cdn.jsdelivr.net/npm/swiper@11.1.9/swiper-bundle.min.css | openssl dgst -sha256 -binary | openssl base64 -A

# Swiper 11.1.9 JS (expect sha256-...)
curl -s https://cdn.jsdelivr.net/npm/swiper@11.1.9/swiper-bundle.min.js | openssl dgst -sha256 -binary | openssl base64 -A
```

Expected: each output matches the corresponding `integrity=` attribute in `index.html`.

- [ ] **Step 9: Run tests — all pass**

Run: `npm test`
Expected: 7 PASSED

- [ ] **Step 10: Commit**

```bash
git add .gitignore index.html css/main.css js/main.js package.json package-lock.json playwright.config.js tests/e2e/site.spec.js
git commit -m "feat: add HTML shell, CSS variables, .gitignore, and Playwright test setup"
```

---

### Task 2: Header

**Files:**
- Modify: `index.html` (replace `<main>` placeholder with header + main stub)
- Modify: `css/main.css` (append header styles)
- Modify: `tests/e2e/site.spec.js` (append header tests)

**Interfaces:**
- Produces: `<header id="header" class="site-header sticky-top">` and `<nav id="navMenu">` — referenced by JS in Task 10

- [ ] **Step 1: Append header tests**

```js
// Append to tests/e2e/site.spec.js:
test('header is sticky and visible', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('#header');
  await expect(header).toBeVisible();
  const pos = await header.evaluate(el => getComputedStyle(el).position);
  expect(['sticky', 'fixed']).toContain(pos);
});

test('header contains tel link', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.locator('#header a[href="tel:+380990004114"]').first()
  ).toBeVisible();
});

test('hamburger visible on 375 px, nav links visible on 1440 px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('.navbar-toggler')).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('#navMenu')).toBeVisible();
});
```

- [ ] **Step 2: Run tests — 3 FAILED**

Run: `npm test -- --grep "header"`
Expected: 3 FAILED

- [ ] **Step 3: Replace the `<main>` stub in `index.html` with header + main open-tag**

Replace:
```html
  <!-- Sections inserted by Tasks 2–10 -->
  <main id="main-content"><!-- populated by subsequent tasks --></main>
```
With:
```html
<a href="#main-content" class="skip-link visually-hidden-focusable">Перейти до основного вмісту</a>
<header id="header" class="site-header sticky-top">
  <nav class="navbar navbar-expand-lg" aria-label="Основна навігація">
    <div class="container">

      <a class="navbar-brand d-flex align-items-center gap-2"
         href="#hero"
         aria-label="Евакуатор Кропивницький — на головну">
        <img src="assets/icons/logo.svg" alt="Логотип Евакуатор Кропивницький" width="48" height="48">
        <span class="d-none d-md-inline lh-sm">
          <span class="d-block text-white fw-bold fs-6">Евакуатор</span>
          <span class="d-block fw-semibold" style="color:var(--color-accent);font-size:.75rem">Кропивницький</span>
        </span>
      </a>

      <span class="site-tagline d-none d-lg-block text-white opacity-75 small ms-3">
        працюємо цілодобово
      </span>

      <!-- Mobile: phone button + toggler -->
      <div class="d-flex d-lg-none align-items-center gap-2 ms-auto">
        <a href="tel:+380990004114" class="btn-cta btn-sm-cta" aria-label="Зателефонувати">📞</a>
        <button class="navbar-toggler border-0 p-1"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navMenu"
                aria-controls="navMenu"
                aria-expanded="false"
                aria-label="Відкрити меню">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>

      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1 py-2 py-lg-0">
          <li class="nav-item"><a class="nav-link text-white" href="#services">Послуги</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="#reviews">Відгуки</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="#about">Про нас</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="#faq">FAQ</a></li>

          <!-- Social icons (desktop) -->
          <li class="nav-item d-none d-lg-block">
            <a href="https://www.instagram.com/evakuator_krop_0990004114"
               class="btn-outline-cta btn-sm-cta" target="_blank" rel="noopener noreferrer"
               aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </li>
          <li class="nav-item d-none d-lg-block">
            <a href="https://www.tiktok.com/@sergey3214"
               class="btn-outline-cta btn-sm-cta" target="_blank" rel="noopener noreferrer"
               aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.22 8.22 0 004.82 1.55V7a4.84 4.84 0 01-1.05-.31z"/>
              </svg>
            </a>
          </li>

          <!-- CTA (desktop) -->
          <li class="nav-item d-none d-lg-block ms-2">
            <a href="tel:+380990004114" class="btn-cta btn-sm-cta">
              📞 +38 (099) 000-41-14
            </a>
          </li>

          <!-- Mobile expanded: full CTA row -->
          <li class="nav-item d-lg-none mt-2">
            <a href="tel:+380990004114" class="btn-cta d-flex justify-content-center w-100">
              📞 Зателефонувати — +38 (099) 000-41-14
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</header>

<main id="main-content">
  <!-- Sections inserted by Tasks 3–9 -->
</main>
```

- [ ] **Step 4: Append header CSS to `css/main.css`**

```css
/* ===== HEADER ===== */
.site-header { z-index: 1000; }

.site-header .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255,255,255,0.9)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.nav-link { transition: color var(--speed); }
.nav-link:hover, .nav-link:focus { color: var(--color-primary) !important; }

@media (max-width: 991.98px) {
  #navMenu .nav-link {
    padding-block: 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
}

/* ===== SKIP LINK ===== */
.skip-link:focus {
  background: var(--color-primary);
  color: var(--color-text-body);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: var(--btn-radius);
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 9999;
}
```

- [ ] **Step 5: Run tests — 3 PASSED**

Run: `npm test -- --grep "header"`
Expected: 3 PASSED

- [ ] **Step 6: Commit**

```bash
git add index.html css/main.css tests/e2e/site.spec.js
git commit -m "feat: add sticky header with hamburger menu and tel CTA"
```

---

### Task 3: Hero Section

**Files:**
- Modify: `index.html` (append inside `<main>`)
- Modify: `css/main.css` (append hero styles)
- Modify: `tests/e2e/site.spec.js` (append hero tests)

**Interfaces:**
- Produces: `<section id="hero">` with `h1`, CTA button `href="tel:+380990004114"`

- [ ] **Step 1: Append hero tests**

```js
test('hero has h1 with Кропивницький', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('#hero h1');
  await expect(h1).toContainText('Кропивницький');
});

test('hero CTA button links to tel:+380990004114', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('#hero a.btn-cta');
  await expect(cta).toHaveAttribute('href', 'tel:+380990004114');
  await expect(cta).toContainText('+38 (099) 000-41-14');
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "hero"`
Expected: 2 FAILED

- [ ] **Step 3: Add hero HTML inside `<main>` (replace the comment)**

Replace `<!-- Sections inserted by Tasks 3–9 -->` with:

```html
  <!-- ===== HERO ===== -->
  <!-- STUB: replace background URL with assets/images/hero/hero.jpg when customer provides image -->
  <section id="hero" class="hero-section section-dark d-flex align-items-center"
           aria-labelledby="hero-heading">
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="container position-relative text-center text-md-start py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-9">
          <h1 id="hero-heading" class="text-white mb-3">
            Евакуатор 24/7 у Кропивницькому
          </h1>
          <p class="hero-subtitle text-white mb-2">
            Приїдемо за 20–30 хвилин
          </p>
          <p class="hero-area text-white opacity-75 mb-4">
            Кропивницький, область та вся Україна
          </p>
          <a href="tel:+380990004114" class="btn-cta btn-cta-lg">
            📞 Зателефонувати — +38 (099) 000-41-14
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Sections 4–9 inserted below -->
```

- [ ] **Step 4: Append hero CSS**

```css
/* ===== HERO ===== */
.hero-section {
  min-height: 100vh;
  background:
    linear-gradient(rgba(26,26,46,0.72), rgba(26,26,46,0.72)),
    url('https://picsum.photos/seed/evakhero/1920/1080') center/cover no-repeat;
  /* STUB: replace URL above with: url('assets/images/hero/hero.jpg') */
  position: relative;
}

.hero-overlay { display: none; } /* overlay handled by gradient */

.hero-subtitle { font-size: clamp(18px, 3vw, 28px); font-weight: 600; }
.hero-area     { font-size: clamp(15px, 2vw, 20px); }

.btn-cta-lg { min-height: 56px; padding: 0.875rem 2rem; font-size: 1.1rem; }
```

- [ ] **Step 5: Run tests — 2 PASSED**

Run: `npm test -- --grep "hero"`
Expected: 2 PASSED

- [ ] **Step 6: Commit**

```bash
git add index.html css/main.css tests/e2e/site.spec.js
git commit -m "feat: add full-viewport hero section with H1 and tel CTA"
```

---

### Task 4: Services Section

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `<section id="services">` with service icon cards and tel CTA

- [ ] **Step 1: Append services tests**

```js
test('services section exists with tel CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#services')).toBeVisible();
  await expect(
    page.locator('#services a[href="tel:+380990004114"]').first()
  ).toBeVisible();
});

test('services section has 6 service items', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('#services .service-item');
  await expect(items).toHaveCount(6);
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "services"`
Expected: 2 FAILED

- [ ] **Step 3: Add services HTML after hero section**

Append after the hero `</section>` comment line:

```html
  <!-- ===== SERVICES ===== -->
  <section id="services" class="section section-light" aria-labelledby="services-heading">
    <div class="container">
      <h2 id="services-heading" class="text-center mb-2">Наші послуги</h2>
      <p class="text-center text-muted mb-5">
        Працюємо цілодобово! БЕЗ ВИХІДНИХ!<br>
        Перевезення автомобілів по м.&nbsp;Кропивницький та всій Україні
      </p>

      <div class="row g-4 mb-5">
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="service-item d-flex gap-3 align-items-start">
            <span class="service-icon" aria-hidden="true">🚗</span>
            <div>
              <h3>Евакуація після ДТП</h3>
              <p>Акуратно завантажимо пошкоджений автомобіль і доставимо на СТО або вказане місце.</p>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="service-item d-flex gap-3 align-items-start">
            <span class="service-icon" aria-hidden="true">🛣️</span>
            <div>
              <h3>Перевезення по Україні</h3>
              <p>Транспортуємо авто по Кропивницькому, Кіровоградській області та всій Україні.</p>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="service-item d-flex gap-3 align-items-start">
            <span class="service-icon" aria-hidden="true">🔧</span>
            <div>
              <h3>Допомога при зламі</h3>
              <p>Заглухло авто або розрядилась акумулятор — виїздимо на місце та вирішуємо проблему.</p>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="service-item d-flex gap-3 align-items-start">
            <span class="service-icon" aria-hidden="true">🏭</span>
            <div>
              <h3>Транспортування до СТО</h3>
              <p>Доставимо авто в будь-який сервісний центр у місті чи за його межами.</p>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="service-item d-flex gap-3 align-items-start">
            <span class="service-icon" aria-hidden="true">⚡</span>
            <div>
              <h3>Термінова подача</h3>
              <p>Приїжджаємо за 20–30 хвилин у межах міста в будь-яку годину доби.</p>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="service-item d-flex gap-3 align-items-start">
            <span class="service-icon" aria-hidden="true">🏍️</span>
            <div>
              <h3>Перевезення мотоциклів</h3>
              <p>Транспортуємо мотоцикли та скутери з таким же піклуванням, як і автомобілі.</p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-muted mb-4">
        <em>Ціна залежить від відстані — дізнайтесь вартість за 30&nbsp;секунд.</em>
      </p>

      <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
        <a href="tel:+380990004114" class="btn-cta">
          📞 Зателефонувати — +38 (099) 000-41-14
        </a>
        <a href="https://www.instagram.com/evakuator_krop_0990004114"
           class="btn-outline-cta" target="_blank" rel="noopener noreferrer"
           aria-label="Instagram">
          Instagram
        </a>
        <a href="https://www.tiktok.com/@sergey3214"
           class="btn-outline-cta" target="_blank" rel="noopener noreferrer"
           aria-label="TikTok">
          TikTok
        </a>
      </div>
    </div>
  </section>
```

- [ ] **Step 4: Append services CSS**

```css
/* ===== SERVICES ===== */
.service-icon {
  font-size: 2rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}
.service-item h3 { margin-bottom: 0.4rem; }
```

- [ ] **Step 5: Run tests — 2 PASSED**

Run: `npm test -- --grep "services"`
Expected: 2 PASSED

- [ ] **Step 6: Commit**

```bash
git add index.html css/main.css tests/e2e/site.spec.js
git commit -m "feat: add services section with 6 service cards and tel CTA"
```

---

### Task 5: Feedbacks Carousel

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`
- Modify: `js/main.js`
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `<div class="reviews-swiper swiper">` with 10 `.swiper-slide` review cards; Swiper instance initialised in `js/main.js`

- [ ] **Step 1: Append reviews tests**

```js
test('reviews section has 10 slides', async ({ page }) => {
  await page.goto('/');
  const slides = page.locator('#reviews .swiper-slide');
  expect(await slides.count()).toBeGreaterThanOrEqual(10);
});

test('first review slide has 5-star rating', async ({ page }) => {
  await page.goto('/');
  const firstSlide = page.locator('#reviews .swiper-slide').first();
  await expect(firstSlide).toContainText('★★★★★');
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "reviews"`
Expected: 2 FAILED

- [ ] **Step 3: Add reviews HTML after services section**

```html
  <!-- ===== FEEDBACKS / REVIEWS ===== -->
  <section id="reviews" class="section section-dark" aria-labelledby="reviews-heading">
    <div class="container">
      <h2 id="reviews-heading" class="text-center text-white mb-2">Відгуки клієнтів</h2>
      <p class="text-center mb-5" style="color:rgba(255,255,255,0.7)">Нам довіряють — переконайтесь самі</p>

      <div class="reviews-swiper swiper">
        <div class="swiper-wrapper">

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Потрапив у неприємну ситуацію на проспекті — машина заглухла прямо в годину пік. Викликав евакуатор, приїхали за 20&nbsp;хвилин! Усе чітко, акуратно, водій допоміг закотити авто в сервіс. Дуже дякую!</p>
              <p class="review-author">Костянтин В.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Потрапила в ДТП вперше в житті, була дуже розгублена. Хлопці приїхали швидко, все пояснили, допомогли з документами, відвезли машину в сервіс. Дуже вдячна за розуміння та професіоналізм!</p>
              <p class="review-author">Олена С.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Зателефонував о 3 ночі — машина заглухла за містом. Через 25&nbsp;хвилин евакуатор вже був поруч! Навіть вночі — блискавична реакція. Буду рекомендувати всім знайомим.</p>
              <p class="review-author">Микола Д.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Перевозили авто з Кропивницького до Києва. Весь шлях машина була надійно закріплена, доставлена без жодної подряпини. Ціна адекватна, сервіс на вищому рівні!</p>
              <p class="review-author">Тетяна Р.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Пробив колесо на трасі, запаски не було. Евакуатор приїхав менш ніж за 30&nbsp;хвилин. Оперативно, ввічливо, за розумну ціну. Дякую за порятунок!</p>
              <p class="review-author">Василь К.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Після аварії не знав до кого звертатися. Знайшов цей номер в інтернеті — не пошкодував. Приїхали швидко, акуратно завантажили авто, відвезли на СТО. Рекомендую!</p>
              <p class="review-author">Ігор Б.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Дуже задоволена сервісом! Замовляла евакуатор вже двічі — кожного разу приїжджали вчасно, поводились ввічливо. Справжні професіонали своєї справи.</p>
              <p class="review-author">Наталія Г.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Порекомендував колега, коли моя машина перестала заводитися біля роботи. Хлопці приїхали за 20&nbsp;хв, швидко завантажили, відвезли в сервіс. Все чітко і без зайвих слів!</p>
              <p class="review-author">Андрій М.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Перевозили щойнокуплений автомобіль з іншого міста. Підійшли відповідально, машина доїхала в ідеальному стані. Ціна за таку відстань — цілком справедлива.</p>
              <p class="review-author">Сергій Т.</p>
            </div>
          </div>

          <div class="swiper-slide">
            <div class="review-card">
              <div class="stars" aria-label="5 зірок з 5">★★★★★</div>
              <p class="review-text">Подзвонила у дощову ніч — думала, що довго чекатиму. Але хлопці прибули за 25&nbsp;хвилин! Дуже уважні, допомогли поки я нервувала. Велика подяка за швидкість та доброзичливість!</p>
              <p class="review-author">Людмила П.</p>
            </div>
          </div>

        </div><!-- /.swiper-wrapper -->
        <div class="swiper-pagination reviews-pagination mt-4"></div>
        <div class="swiper-button-prev reviews-prev"></div>
        <div class="swiper-button-next reviews-next"></div>
      </div>
    </div>
  </section>
```

- [ ] **Step 4: Append reviews CSS**

```css
/* ===== REVIEWS ===== */
.review-card {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
}
.stars       { color: var(--color-primary); font-size: 1.25rem; letter-spacing: 2px; margin-bottom: 0.75rem; }
.review-text { color: rgba(255,255,255,0.85); font-size: 0.95rem; margin-bottom: 1rem; flex-grow: 1; }
.review-author { color: var(--color-primary); font-weight: 600; font-size: 0.875rem; margin: 0; }

.reviews-swiper { padding-bottom: 3rem !important; }
.reviews-swiper .swiper-button-prev,
.reviews-swiper .swiper-button-next { color: var(--color-primary); }
.reviews-swiper .swiper-pagination-bullet-active { background: var(--color-primary); }
```

- [ ] **Step 5: Populate `js/main.js` with Swiper init**

```js
// js/main.js — all interactive behaviour

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reviews carousel
  new Swiper('.reviews-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: reducedMotion ? false : { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.reviews-pagination', clickable: true },
    navigation: { nextEl: '.reviews-next', prevEl: '.reviews-prev' },
    breakpoints: {
      768:  { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  });

  // Gallery carousel — initialised in Task 6; placeholder to avoid reference error
  // new Swiper('.gallery-swiper', { ... });
});
```

- [ ] **Step 6: Run tests — 2 PASSED**

Run: `npm test -- --grep "reviews"`
Expected: 2 PASSED

- [ ] **Step 7: Commit**

```bash
git add index.html css/main.css js/main.js tests/e2e/site.spec.js
git commit -m "feat: add customer reviews Swiper carousel with 10 Ukrainian reviews"
```

---

### Task 6: Photo Gallery Carousel

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`
- Modify: `js/main.js`
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `<div class="gallery-swiper swiper">` with ≥ 20 `<picture>` slides; second Swiper instance added to `js/main.js`

- [ ] **Step 1: Append gallery tests**

```js
test('gallery has 20 or more lazy-loaded images', async ({ page }) => {
  await page.goto('/');
  const imgs = page.locator('#gallery picture img[loading="lazy"]');
  expect(await imgs.count()).toBeGreaterThanOrEqual(20);
});

test('all gallery images have non-empty alt text', async ({ page }) => {
  await page.goto('/');
  const imgs = page.locator('#gallery picture img');
  const count = await imgs.count();
  for (let i = 0; i < count; i++) {
    const alt = await imgs.nth(i).getAttribute('alt');
    expect(alt).toBeTruthy();
  }
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "gallery"`
Expected: 2 FAILED

- [ ] **Step 3: Add gallery HTML after reviews section**

The 20 slides use picsum.photos seeds for placeholder images.
Responsive srcset serves 480 w / 768 w / 1200 w variants from the same CDN.

```html
  <!-- ===== PHOTO GALLERY ===== -->
  <!-- STUB: replace picsum URLs with assets/images/gallery/img-NN.jpg when customer provides photos -->
  <section id="gallery" class="section section-light" aria-labelledby="gallery-heading">
    <div class="container-fluid px-0">
      <div class="container mb-4">
        <h2 id="gallery-heading" class="text-center">Фотогалерея</h2>
        <p class="text-center text-muted">Наша робота — в деталях</p>
      </div>

      <div class="gallery-swiper swiper">
        <div class="swiper-wrapper">
```

Then generate 20 slide entries. Each follows this pattern (replace NN with 01–20 and the seed with evak01–evak20):

```html
          <div class="swiper-slide">
            <picture>
              <source
                srcset="https://picsum.photos/seed/evak01/480/320 480w,
                        https://picsum.photos/seed/evak01/768/512 768w,
                        https://picsum.photos/seed/evak01/1200/800 1200w"
                sizes="(max-width: 576px) 480px, (max-width: 992px) 768px, 1200px">
              <img src="https://picsum.photos/seed/evak01/800/533"
                   loading="lazy"
                   width="800" height="533"
                   alt="Евакуатор транспортує легковий автомобіль">
            </picture>
          </div>
```

Repeat for seeds evak02 through evak20 with these alt texts:
- evak02: "Навантаження авто на евакуатор після ДТП"
- evak03: "Евакуатор на нічному виклику"
- evak04: "Транспортування позашляховика"
- evak05: "Кріплення автомобіля перед перевезенням"
- evak06: "Евакуатор на міській вулиці Кропивницького"
- evak07: "Допомога водієві після поломки"
- evak08: "Завантаження мотоцикла на евакуатор"
- evak09: "Евакуатор на трасі"
- evak10: "Перевезення авто на далеку відстань"
- evak11: "Акуратне розвантаження автомобіля"
- evak12: "Евакуатор у дощову погоду"
- evak13: "Транспортування електромобіля"
- evak14: "Евакуація авто з підземного паркінгу"
- evak15: "Робота евакуатора вночі"
- evak16: "Перевезення люксового авто"
- evak17: "Кріплення колісного упору"
- evak18: "Евакуатор біля СТО"
- evak19: "Водій евакуатора надає допомогу"
- evak20: "Евакуатор повертається з виклику"

Close the section:
```html
        </div><!-- /.swiper-wrapper -->
        <div class="swiper-pagination gallery-pagination"></div>
        <div class="swiper-button-prev gallery-prev"></div>
        <div class="swiper-button-next gallery-next"></div>
      </div>
    </div>
  </section>
```

- [ ] **Step 4: Append gallery CSS**

```css
/* ===== GALLERY ===== */
.gallery-swiper { padding-bottom: 3rem !important; }

.gallery-swiper .swiper-slide picture { display: block; line-height: 0; }
.gallery-swiper .swiper-slide img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 8px;
}

.gallery-swiper .swiper-button-prev,
.gallery-swiper .swiper-button-next { color: var(--color-primary-dark); }
.gallery-swiper .swiper-pagination-bullet-active { background: var(--color-primary-dark); }
```

- [ ] **Step 5: Add gallery Swiper init in `js/main.js`**

Replace the placeholder comment in `js/main.js` with:

```js
  // Gallery carousel
  new Swiper('.gallery-swiper', {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: true,
    autoplay: reducedMotion ? false : { delay: 3000, disableOnInteraction: false },
    pagination: { el: '.gallery-pagination', clickable: true },
    navigation: { nextEl: '.gallery-next', prevEl: '.gallery-prev' },
    breakpoints: {
      576:  { slidesPerView: 2 },
      992:  { slidesPerView: 3 },
      1200: { slidesPerView: 4 },
    },
  });
```

- [ ] **Step 6: Run tests — 2 PASSED**

Run: `npm test -- --grep "gallery"`
Expected: 2 PASSED

- [ ] **Step 7: Commit**

```bash
git add index.html css/main.css js/main.js tests/e2e/site.spec.js
git commit -m "feat: add photo gallery carousel with 20 responsive lazy-loaded images"
```

---

### Task 7: About Us Section

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `<section id="about">` with company text and tel CTA

- [ ] **Step 1: Append about test**

```js
test('about section visible with tel link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about')).toBeVisible();
  await expect(
    page.locator('#about a[href="tel:+380990004114"]')
  ).toBeVisible();
});
```

- [ ] **Step 2: Run test — FAILED**

Run: `npm test -- --grep "about"`
Expected: 1 FAILED

- [ ] **Step 3: Add about HTML after gallery section**

```html
  <!-- ===== ABOUT US ===== -->
  <!-- STUB: replace picsum URL with assets/images/about/about.jpg -->
  <section id="about" class="section section-dark" aria-labelledby="about-heading">
    <div class="container">
      <div class="row align-items-center g-5">
        <div class="col-12 col-lg-6 order-lg-2">
          <picture>
            <source
              srcset="https://picsum.photos/seed/evakabout/480/360 480w,
                      https://picsum.photos/seed/evakabout/768/576 768w"
              sizes="(max-width: 768px) 480px, 768px">
            <img src="https://picsum.photos/seed/evakabout/600/450"
                 loading="lazy" width="600" height="450"
                 alt="Команда евакуаторного сервісу Кропивницький"
                 class="about-img img-fluid rounded-3">
          </picture>
        </div>
        <div class="col-12 col-lg-6 order-lg-1">
          <h2 id="about-heading" class="text-white mb-4">
            🚗 Евакуатор Кропивницький — приїдемо тоді, коли інші тільки обіцяють
          </h2>
          <p class="text-white opacity-85 mb-3">
            Ми&nbsp;— команда досвідчених водіїв, яка допомагає автомобілістам у&nbsp;будь-якій ситуації на&nbsp;дорозі. Працюємо цілодобово, без вихідних, по&nbsp;Кропивницькому, Кіровоградській області та&nbsp;всій Україні.
          </p>
          <p class="text-white opacity-85 mb-4">
            Що б не&nbsp;трапилося&nbsp;— ДТП, поломка, розрядився акумулятор або просто потрібно перевезти авто&nbsp;— ми завжди поряд. Приїдемо за&nbsp;20–30&nbsp;хвилин і вирішимо вашу проблему швидко та&nbsp;акуратно. Довіряйте своє авто професіоналам.
          </p>
          <a href="tel:+380990004114" class="btn-cta">
            📞 Зателефонувати — +38 (099) 000-41-14
          </a>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 4: Append about CSS**

```css
/* ===== ABOUT ===== */
.about-img { box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.opacity-85 { opacity: 0.85; }
```

- [ ] **Step 5: Run test — PASSED**

Run: `npm test -- --grep "about"`
Expected: 1 PASSED

- [ ] **Step 6: Commit**

```bash
git add index.html css/main.css tests/e2e/site.spec.js
git commit -m "feat: add About Us section with company text and tel CTA"
```

---

### Task 8: FAQ Section

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `<section id="faq">` with Bootstrap accordion of 10 items

- [ ] **Step 1: Append FAQ tests**

```js
test('FAQ has 10 accordion items', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('#faq .accordion-item');
  await expect(items).toHaveCount(10);
});

test('clicking first FAQ item opens it', async ({ page }) => {
  await page.goto('/');
  const firstBtn = page.locator('#faq .accordion-button').first();
  await firstBtn.click();
  const firstBody = page.locator('#faq .accordion-collapse').first();
  await expect(firstBody).toHaveClass(/show/);
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "FAQ"`
Expected: 2 FAILED

- [ ] **Step 3: Add FAQ HTML after about section**

```html
  <!-- ===== FAQ ===== -->
  <section id="faq" class="section section-light" aria-labelledby="faq-heading">
    <div class="container">
      <h2 id="faq-heading" class="text-center mb-2">Часті запитання</h2>

      <!-- Urgency prompt — top -->
      <div class="text-center mb-4">
        <p class="mb-2">Не знайшли відповідь? Зателефонуйте — відповімо за 30&nbsp;секунд.</p>
        <a href="tel:+380990004114" class="btn-outline-cta btn-sm-cta">
          📞 +38 (099) 000-41-14
        </a>
      </div>

      <div class="accordion" id="faqAccordion">

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq1"
                    aria-expanded="true" aria-controls="faq1">
              Скільки коштує виклик евакуатора у Кропивницькому?
            </button>
          </h3>
          <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Вартість залежить від місця подачі, типу транспортного засобу та відстані. Мінімальна ціна в межах міста — від 500 грн. Зателефонуйте нам, щоб дізнатися точну вартість за 30&nbsp;секунд.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq2"
                    aria-expanded="false" aria-controls="faq2">
              Як швидко приїде евакуатор?
            </button>
          </h3>
          <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              У межах Кропивницького — за 20–30 хвилин. За містом — залежно від відстані. Ми працюємо цілодобово та без вихідних.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq3"
                    aria-expanded="false" aria-controls="faq3">
              Які автомобілі ви перевозите?
            </button>
          </h3>
          <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Легкові автомобілі будь-яких марок і класів, кросовери, мінівени. Також перевозимо мотоцикли та скутери. Для важкої техніки — зверніться окремо.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq4"
                    aria-expanded="false" aria-controls="faq4">
              Чи працюєте ви вночі та у вихідні?
            </button>
          </h3>
          <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Так, ми працюємо 24/7, 365 днів на рік. Немає різниці — будній день, свято чи середина ночі. Телефонуйте у будь-який час.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq5"
                    aria-expanded="false" aria-controls="faq5">
              Чи перевозите ви автомобілі після ДТП?
            </button>
          </h3>
          <div id="faq5" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Так, це один з наших основних напрямків. Ми акуратно завантажимо та транспортуємо пошкоджений автомобіль на СТО або будь-яке вказане місце.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq6"
                    aria-expanded="false" aria-controls="faq6">
              На яку відстань ви здійснюєте перевезення?
            </button>
          </h3>
          <div id="faq6" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Ми перевозимо автомобілі по Кропивницькому, Кіровоградській області та всій Україні. Навіть на великі відстані — телефонуйте, обговоримо умови.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq7"
                    aria-expanded="false" aria-controls="faq7">
              Як розраховується вартість перевезення?
            </button>
          </h3>
          <div id="faq7" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Ціна залежить від відстані, типу авто та терміновості. Ми не беремо прихованих платежів — ціна узгоджується заздалегідь по телефону.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq8"
                    aria-expanded="false" aria-controls="faq8">
              Що робити, якщо машина заглухла посеред дороги?
            </button>
          </h3>
          <div id="faq8" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Увімкніть аварійні вогні, поставте знак аварійної зупинки, відійдіть у безпечне місце та зателефонуйте нам за номером +38&nbsp;(099)&nbsp;000-41-14. Ми допоможемо якнайшвидше.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq9"
                    aria-expanded="false" aria-controls="faq9">
              Чи є у вас страхування відповідальності?
            </button>
          </h3>
          <div id="faq9" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Так, ми несемо відповідальність за автомобіль під час транспортування. Ваше авто буде акуратно завантажене та надійно закріплене.
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h3 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#faq10"
                    aria-expanded="false" aria-controls="faq10">
              Чи можна замовити евакуатор для мотоцикла або скутера?
            </button>
          </h3>
          <div id="faq10" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Так, ми перевозимо мотоцикли, скутери та інші двоколісні транспортні засоби. Зателефонуйте нам, щоб уточнити деталі.
            </div>
          </div>
        </div>

      </div><!-- /#faqAccordion -->

      <!-- Urgency prompt — bottom -->
      <div class="text-center mt-4">
        <p class="mb-2">Маєте інше запитання?</p>
        <a href="tel:+380990004114" class="btn-outline-cta btn-sm-cta">
          📞 Зателефонувати — відповімо за 30&nbsp;секунд
        </a>
      </div>
    </div>
  </section>
```

- [ ] **Step 4: Append FAQ CSS**

```css
/* ===== FAQ ===== */
.accordion-button {
  font-family: var(--font-family);
  font-weight: 600;
}
.accordion-button:not(.collapsed) {
  background: var(--color-primary);
  color: var(--color-text-body);
  box-shadow: none;
}
.accordion-button:focus {
  box-shadow: 0 0 0 3px rgba(255,214,0,0.4);
}
```

- [ ] **Step 5: Run tests — 2 PASSED**

Run: `npm test -- --grep "FAQ"`
Expected: 2 PASSED

- [ ] **Step 6: Commit**

```bash
git add index.html css/main.css tests/e2e/site.spec.js
git commit -m "feat: add FAQ section with 10 Bootstrap accordion items"
```

---

### Task 9: Footer

**Files:**
- Modify: `index.html` (add `<footer>` after `</main>`)
- Modify: `css/main.css`
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `<footer id="footer">` with nav links, legal links, social links, tel link, copyright

- [ ] **Step 1: Append footer tests**

```js
test('footer has tel link', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.locator('footer a[href="tel:+380990004114"]')
  ).toBeVisible();
});

test('footer has Instagram, TikTok, terms, privacy links', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href*="instagram.com"]')).toHaveCount(1);
  await expect(page.locator('footer a[href*="tiktok.com"]')).toHaveCount(1);
  await expect(page.locator('footer a[href="terms.html"]')).toHaveCount(1);
  await expect(page.locator('footer a[href="privacy.html"]')).toHaveCount(1);
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "footer"`
Expected: 2 FAILED

- [ ] **Step 3: Add footer HTML after closing `</main>` tag**

```html
<footer id="footer" class="section-dark py-5" role="contentinfo">
  <div class="container">
    <div class="row g-4 mb-4">

      <!-- Brand column -->
      <div class="col-12 col-md-4">
        <a href="#hero" class="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none"
           aria-label="Евакуатор Кропивницький — на головну">
          <img src="assets/icons/logo.svg" alt="Логотип" width="40" height="40">
          <span class="text-white fw-bold">Евакуатор<br>
            <small style="color:var(--color-accent)">Кропивницький</small>
          </span>
        </a>
        <p class="text-white opacity-75 small">
          Цілодобовий евакуатор у Кропивницькому — швидка допомога на дорозі 24/7.
        </p>
        <a href="tel:+380990004114" class="btn-cta btn-sm-cta mt-2">
          📞 +38 (099) 000-41-14
        </a>
      </div>

      <!-- Navigation column -->
      <div class="col-6 col-md-2 offset-md-1">
        <h4 class="footer-heading">Навігація</h4>
        <ul class="footer-links">
          <li><a href="#about">Про компанію</a></li>
          <li><a href="#services">Послуги</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#footer">Контакти</a></li>
        </ul>
      </div>

      <!-- Legal column -->
      <div class="col-6 col-md-2">
        <h4 class="footer-heading">Правова інформація</h4>
        <ul class="footer-links">
          <li><a href="terms.html">Умови користування</a></li>
          <li><a href="privacy.html">Політика конфіденційності</a></li>
        </ul>
      </div>

      <!-- Social column -->
      <div class="col-12 col-md-3">
        <h4 class="footer-heading">Соціальні мережі</h4>
        <div class="d-flex gap-2">
          <a href="https://www.instagram.com/evakuator_krop_0990004114"
             class="btn-outline-cta btn-sm-cta"
             target="_blank" rel="noopener noreferrer"
             aria-label="Сторінка в Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
          <a href="https://www.tiktok.com/@sergey3214"
             class="btn-outline-cta btn-sm-cta"
             target="_blank" rel="noopener noreferrer"
             aria-label="Сторінка в TikTok">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.22 8.22 0 004.82 1.55V7a4.84 4.84 0 01-1.05-.31z"/>
            </svg>
            TikTok
          </a>
        </div>
      </div>
    </div>

    <hr style="border-color:rgba(255,255,255,0.15)">
    <p class="text-center small mb-0" style="color:rgba(255,255,255,0.5)">
      &copy; <span id="copyright-year">2026</span> Евакуатор Кропивницький. Всі права захищені.
    </p>
  </div>
</footer>
```

- [ ] **Step 4: Append footer CSS**

```css
/* ===== FOOTER ===== */
.footer-heading {
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
}
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}
.footer-links li + li { margin-top: 0.5rem; }
.footer-links a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color var(--speed);
}
.footer-links a:hover { color: var(--color-primary); }
```

- [ ] **Step 5: Run tests — 2 PASSED**

Run: `npm test -- --grep "footer"`
Expected: 2 PASSED

- [ ] **Step 6: Commit**

```bash
git add index.html css/main.css tests/e2e/site.spec.js
git commit -m "feat: add footer with navigation, social links, legal links, and tel CTA"
```

---

### Task 10: Floating Call Button + JS Interactions

**Files:**
- Modify: `index.html` (add floating button before `</body>`)
- Modify: `css/main.css`
- Modify: `js/main.js` (add mobile nav auto-close)
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: `<a id="floating-call-btn">` fixed bottom-right; nav auto-close on mobile

- [ ] **Step 1: Append floating button tests**

```js
test('floating call button present with correct href and aria-label', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('#floating-call-btn');
  await expect(btn).toHaveAttribute('href', 'tel:+380990004114');
  await expect(btn).toHaveAttribute('aria-label', 'Зателефонувати');
});

test('floating button is visible above other elements', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('#floating-call-btn');
  await expect(btn).toBeVisible();
  const zIndex = await btn.evaluate(el => getComputedStyle(el).zIndex);
  expect(parseInt(zIndex)).toBeGreaterThan(1000);
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "floating"`
Expected: 2 FAILED

- [ ] **Step 3: Add floating button to `index.html` before closing `</body>`**

```html
  <!-- Floating call button -->
  <a id="floating-call-btn"
     href="tel:+380990004114"
     aria-label="Зателефонувати">
    📞
  </a>
```

- [ ] **Step 4: Append floating button CSS**

```css
/* ===== FLOATING CALL BUTTON ===== */
#floating-call-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-text-body);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  transition: transform var(--speed), box-shadow var(--speed), filter var(--speed);
}
#floating-call-btn:hover,
#floating-call-btn:focus-visible {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(0,0,0,0.45);
  filter: brightness(1.08);
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
```

- [ ] **Step 5: Replace full `js/main.js` with final version**

```js
document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reviews carousel
  new Swiper('.reviews-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: reducedMotion ? false : { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.reviews-pagination', clickable: true },
    navigation: { nextEl: '.reviews-next', prevEl: '.reviews-prev' },
    breakpoints: {
      768:  { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  });

  // Gallery carousel
  new Swiper('.gallery-swiper', {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: true,
    autoplay: reducedMotion ? false : { delay: 3000, disableOnInteraction: false },
    pagination: { el: '.gallery-pagination', clickable: true },
    navigation: { nextEl: '.gallery-next', prevEl: '.gallery-prev' },
    breakpoints: {
      576:  { slidesPerView: 2 },
      992:  { slidesPerView: 3 },
      1200: { slidesPerView: 4 },
    },
  });

  // Auto-close mobile navbar when a nav-link is clicked
  const navMenu = document.getElementById('navMenu');
  if (navMenu && typeof bootstrap !== 'undefined') {
    const bsCollapse = new bootstrap.Collapse(navMenu, { toggle: false });
    navMenu.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('show')) bsCollapse.hide();
      });
    });
  }

  // Dynamic copyright year — keeps footer accurate after Jan 1
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
```

- [ ] **Step 6: Run tests — 2 PASSED**

Run: `npm test -- --grep "floating"`
Expected: 2 PASSED

- [ ] **Step 7: Run full test suite**

Run: `npm test`
Expected: ALL PASSED

- [ ] **Step 8: Commit**

```bash
git add index.html css/main.css js/main.js tests/e2e/site.spec.js
git commit -m "feat: add floating call button and mobile navbar auto-close"
```

---

### Task 11: SEO Files — robots.txt, sitemap.xml, favicon, _headers

**Files:**
- Create: `robots.txt`
- Create: `sitemap.xml`
- Create: `favicon.ico` (1×1 PNG placeholder written via Node.js)
- Create: `assets/icons/apple-touch-icon.png` (1×1 PNG placeholder)
- Create: `_redirects`
- Create: `_headers` (Cloudflare Pages HTTP security headers)
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: static SEO files at root; JSON-LD already exists from Task 1

- [ ] **Step 1: Append SEO tests**

```js
test('robots.txt is accessible', async ({ page }) => {
  const res = await page.request.get('/robots.txt');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('User-agent');
});

test('sitemap.xml is accessible', async ({ page }) => {
  const res = await page.request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('<urlset');
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "robots|sitemap"`
Expected: 2 FAILED

- [ ] **Step 3: Create `robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://evakuator-krop.com.ua/sitemap.xml
```

- [ ] **Step 4: Create `sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://evakuator-krop.com.ua/</loc>
    <lastmod>2026-06-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://evakuator-krop.com.ua/terms.html</loc>
    <lastmod>2026-06-29</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://evakuator-krop.com.ua/privacy.html</loc>
    <lastmod>2026-06-29</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
```

- [ ] **Step 5: Create `_redirects`**

```
/* /index.html 200
```

- [ ] **Step 6: Create `favicon.ico`**

Writes a valid 1×1 PNG as favicon (browsers accept PNG-inside-ICO; swap with a proper 16×16 before launch):

```bash
node -e "require('fs').writeFileSync('favicon.ico', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==', 'base64'))"
```

- [ ] **Step 6b: Create `assets/icons/apple-touch-icon.png`**

Prevents iOS home-screen 404. Swap with a proper 180×180 PNG before launch:

```bash
node -e "require('fs').writeFileSync('assets/icons/apple-touch-icon.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==', 'base64'))"
```

- [ ] **Step 6c: Create `_headers`**

Cloudflare Pages HTTP security headers.

> **Known limitations & launch gates:**
> - `'unsafe-inline'` in `style-src` is **required** for Bootstrap 5 JavaScript — collapse/accordion animations set inline `style` attributes on elements; removing it breaks those components.
> - Google Fonts cannot carry SRI hashes (responses vary by browser UA); this is an accepted limitation for a static marketing page.
> - **Launch gate:** Remove `https://picsum.photos` from `img-src` before going live — replace with `'self'` or your own CDN domain after swapping in real images.

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' https://cdn.jsdelivr.net; img-src 'self' data: https://picsum.photos; frame-ancestors 'none'
```

- [ ] **Step 6d: Create `404.html`**

Cloudflare Pages serves this file for unmatched paths. With the `/* /index.html 200` catch-all in `_redirects`, this page is unreachable in normal browsing, but provides a safety net if the redirect rule is ever removed.

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Сторінку не знайдено — Евакуатор Кропивницький</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="favicon.ico">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossorigin="anonymous">
  <link rel="stylesheet" href="css/main.css">
</head>
<body class="section-dark d-flex flex-column min-vh-100 align-items-center justify-content-center text-center p-4">
  <p class="text-white fw-bold mb-3" style="font-size:5rem;opacity:.35;line-height:1">404</p>
  <h1 class="text-white mb-4">Сторінку не знайдено</h1>
  <p class="mb-4" style="color:rgba(255,255,255,.7)">Можливо, вона була переміщена або видалена.</p>
  <a href="index.html" class="btn-cta">← На головну</a>
</body>
</html>
```

- [ ] **Step 7: Run tests — 2 PASSED**

Run: `npm test -- --grep "robots|sitemap"`
Expected: 2 PASSED

- [ ] **Step 8: Commit**

```bash
git add robots.txt sitemap.xml favicon.ico _redirects _headers 404.html assets/icons/apple-touch-icon.png tests/e2e/site.spec.js
git commit -m "feat: add robots.txt, sitemap.xml, favicon, _redirects, security _headers, 404 page, and apple-touch-icon"
```

---

### Task 12: Legal Pages — terms.html & privacy.html

**Files:**
- Create: `terms.html`
- Create: `privacy.html`
- Modify: `tests/e2e/site.spec.js`

**Interfaces:**
- Produces: two standalone pages sharing the same head/header/footer pattern as `index.html`

- [ ] **Step 1: Append legal page tests**

```js
test('terms.html loads with lang="uk"', async ({ page }) => {
  await page.goto('/terms.html');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page).toHaveTitle(/Умови користування/);
});

test('privacy.html loads with lang="uk"', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page).toHaveTitle(/Політика конфіденційності/);
});
```

- [ ] **Step 2: Run tests — 2 FAILED**

Run: `npm test -- --grep "terms|privacy"`
Expected: 2 FAILED

- [ ] **Step 3: Create `terms.html`**

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Умови користування — Евакуатор Кропивницький</title>
  <meta name="description" content="Умови користування сайтом Евакуатор Кропивницький.">
  <meta name="robots" content="noindex">
  <link rel="icon" href="favicon.ico">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossorigin="anonymous">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <header class="site-header sticky-top py-3">
    <div class="container d-flex justify-content-between align-items-center">
      <a href="index.html" class="d-flex align-items-center gap-2 text-decoration-none" aria-label="На головну">
        <img src="assets/icons/logo.svg" alt="Логотип" width="40" height="40">
        <span class="text-white fw-bold">Евакуатор Кропивницький</span>
      </a>
      <a href="tel:+380990004114" class="btn-cta btn-sm-cta">📞 +38 (099) 000-41-14</a>
    </div>
  </header>

  <main class="container py-5">
    <h1 class="mb-4">Умови користування</h1>

    <p class="text-muted">Останнє оновлення: 29 червня 2026 р.</p>

    <h2>1. Загальні положення</h2>
    <p>Використовуючи цей сайт, ви погоджуєтесь з цими Умовами. Якщо ви не погоджуєтесь — будь ласка, не використовуйте сайт.</p>

    <h2>2. Призначення сайту</h2>
    <p>Сайт призначений для надання інформації про послуги евакуатора у м.&nbsp;Кропивницький. Інформація на сайті носить загальний характер і не є публічною офертою.</p>

    <h2>3. Інтелектуальна власність</h2>
    <p>Весь контент сайту (тексти, зображення, логотип) є власністю Евакуатор Кропивницький або використовується на законних підставах. Копіювання без дозволу заборонено.</p>

    <h2>4. Обмеження відповідальності</h2>
    <p>Ми намагаємось підтримувати актуальність інформації, але не гарантуємо її повноту та точність. Вартість послуг уточнюється при замовленні за телефоном.</p>

    <h2>5. Зміни умов</h2>
    <p>Ми залишаємо за собою право змінювати ці Умови в будь-який час. Актуальна версія завжди доступна на цій сторінці.</p>

    <h2>6. Контакти</h2>
    <p>З питань: <a href="tel:+380990004114">+38 (099) 000-41-14</a></p>

    <p class="mt-4"><a href="index.html" class="btn-cta btn-sm-cta">← На головну</a></p>
  </main>

  <script defer
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
          crossorigin="anonymous"></script>
</body>
</html>
```

- [ ] **Step 4: Create `privacy.html`**

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Політика конфіденційності — Евакуатор Кропивницький</title>
  <meta name="description" content="Політика конфіденційності сайту Евакуатор Кропивницький.">
  <meta name="robots" content="noindex">
  <link rel="icon" href="favicon.ico">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossorigin="anonymous">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <header class="site-header sticky-top py-3">
    <div class="container d-flex justify-content-between align-items-center">
      <a href="index.html" class="d-flex align-items-center gap-2 text-decoration-none" aria-label="На головну">
        <img src="assets/icons/logo.svg" alt="Логотип" width="40" height="40">
        <span class="text-white fw-bold">Евакуатор Кропивницький</span>
      </a>
      <a href="tel:+380990004114" class="btn-cta btn-sm-cta">📞 +38 (099) 000-41-14</a>
    </div>
  </header>

  <main class="container py-5">
    <h1 class="mb-4">Політика конфіденційності</h1>

    <p class="text-muted">Дата набрання чинності: 29 червня 2026 р.</p>

    <h2>1. Які дані ми збираємо</h2>
    <p>Цей сайт є інформаційним і не збирає персональних даних автоматично. Ми не використовуємо форми реєстрації та не зберігаємо cookies, що ідентифікують особу.</p>

    <h2>2. Як ми використовуємо дані</h2>
    <p>Єдиний спосіб зв'язку з нами — зателефонувати за вказаним номером. Дані, надані в телефонній розмові, використовуються виключно для надання послуги евакуатора і нікуди не передаються.</p>

    <h2>3. Файли cookie</h2>
    <p>Сайт може використовувати технічні cookies (наприклад, налаштування браузера). Вони не містять персональної інформації та не передаються третім особам.</p>

    <h2>4. Зовнішні посилання</h2>
    <p>Наш сайт містить посилання на Instagram та TikTok. Їх використання регулюється відповідними політиками конфіденційності цих платформ.</p>

    <h2>5. Захист даних</h2>
    <p>Ми не продаємо та не передаємо ваші дані третім особам без вашої явної згоди.</p>

    <h2>6. Зміни політики</h2>
    <p>Ми можемо оновлювати цю Політику. Актуальна версія завжди доступна на цій сторінці.</p>

    <h2>7. Контакти</h2>
    <p>З питань конфіденційності: <a href="tel:+380990004114">+38 (099) 000-41-14</a></p>

    <p class="mt-4"><a href="index.html" class="btn-cta btn-sm-cta">← На головну</a></p>
  </main>

  <script defer
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
          crossorigin="anonymous"></script>
</body>
</html>
```

- [ ] **Step 5: Run tests — 2 PASSED**

Run: `npm test -- --grep "terms|privacy"`
Expected: 2 PASSED

- [ ] **Step 6: Commit**

```bash
git add terms.html privacy.html tests/e2e/site.spec.js
git commit -m "feat: add Ukrainian Terms of Use and Privacy Policy stub pages"
```

---

### Task 13: Stub Assets — Logo SVG & Directory Structure

**Files:**
- Create: `assets/icons/logo.svg`
- Create: `assets/images/hero/.gitkeep`
- Create: `assets/images/gallery/.gitkeep`
- Create: `assets/images/about/.gitkeep`

**Interfaces:**
- Produces: `assets/icons/logo.svg` referenced in header and footer img tags

- [ ] **Step 1: Create directory structure**

Run:
```bash
mkdir -p assets/icons assets/images/hero assets/images/gallery assets/images/about
```

- [ ] **Step 2: Create `.gitkeep` files in image directories**

Run:
```bash
touch assets/images/hero/.gitkeep assets/images/gallery/.gitkeep assets/images/about/.gitkeep
```

- [ ] **Step 3: Create `assets/icons/logo.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" role="img"
     aria-label="Логотип Евакуатор Кропивницький">
  <title>Евакуатор Кропивницький</title>

  <!-- Truck body -->
  <rect x="4" y="28" width="76" height="30" rx="5" fill="#FFD600"/>
  <!-- Cab -->
  <rect x="64" y="14" width="32" height="44" rx="5" fill="#FFD600"/>
  <!-- Windshield -->
  <rect x="68" y="18" width="24" height="18" rx="3" fill="#1A1A2E" opacity="0.6"/>
  <!-- Wheels -->
  <circle cx="22" cy="62" r="10" fill="#1A1A2E"/>
  <circle cx="22" cy="62" r="5"  fill="#FFD600"/>
  <circle cx="64" cy="62" r="10" fill="#1A1A2E"/>
  <circle cx="64" cy="62" r="5"  fill="#FFD600"/>
  <circle cx="88" cy="62" r="10" fill="#1A1A2E"/>
  <circle cx="88" cy="62" r="5"  fill="#FFD600"/>
  <!-- Tow hook -->
  <rect x="0" y="40" width="8" height="6" rx="2" fill="#FF6B00"/>

  <!-- Company name -->
  <text x="112" y="40" font-family="Montserrat,Arial,sans-serif" font-size="18"
        font-weight="700" fill="#1A1A2E">ЕВАКУАТОР</text>
  <text x="112" y="60" font-family="Montserrat,Arial,sans-serif" font-size="13"
        font-weight="600" fill="#FF6B00">Кропивницький</text>
</svg>
```

- [ ] **Step 4: Verify logo appears in browser**

Open `index.html` in browser (double-click or `npx serve . -p 3000` then navigate to localhost:3000).
Verify: logo SVG visible in header and footer; truck graphic renders with yellow and orange colors.

- [ ] **Step 5: Commit**

```bash
git add assets/
git commit -m "feat: add stub SVG logo and placeholder image directories"
```

---

### Task 14: README.md, DevOps Guide & CI Pipeline

**Files:**
- Create: `.github/workflows/test.yml` (GitHub Actions CI)
- Modify: `README.md` (replace placeholder content with full guide)

**Interfaces:**
- Produces: CI pipeline that blocks deploys on test failure; `README.md` with local dev, deploy, DevOps, and asset-swap instructions

- [ ] **Step 1: Create `.github/workflows/test.yml`**

Runs the full Playwright suite on every push and pull-request to `main`. A separate `deploy` job runs only when `test` passes on a push to `main`, using `cloudflare/wrangler-action` to upload the site. This gates Cloudflare Pages deployments on green tests — a test failure blocks the deploy entirely.

**Before first run, add these GitHub repository secrets** (Settings → Secrets and variables → Actions):
- `CF_API_TOKEN` — Cloudflare API token with "Edit Cloudflare Pages" permission
- `CF_ACCOUNT_ID` — your Cloudflare account ID (visible in the Cloudflare dashboard URL)

```yaml
name: E2E Tests & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-chromium-${{ hashFiles('package-lock.json') }}
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy . --project-name=evakuator-kropyvnytskyi --branch=main
```

- [ ] **Step 2: Replace `README.md` content**

```markdown
# Евакуатор Кропивницький

Static landing page for a 24/7 car towing service in Kropyvnytskyi, Ukraine.

---

## Quick Start (local dev)

Open `index.html` directly in any browser by double-clicking it — no server needed.

For a proper local dev server (recommended — fixes absolute path references):

```bash
npx serve . -p 3000
# Then open http://localhost:3000
```

---

## Running Tests

```bash
npm install
npx playwright install chromium
npm test
```

---

## CDN Libraries Used

| Library        | Version | CDN URL base                                      |
|----------------|---------|---------------------------------------------------|
| Bootstrap CSS  | 5.3.8   | `cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/`  |
| Bootstrap JS   | 5.3.8   | `cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/`   |
| Swiper         | 11.1.9  | `cdn.jsdelivr.net/npm/swiper@11.1.9/`             |
| Montserrat     | —       | `fonts.googleapis.com` (Google Fonts)             |

> **SRI hashes:** The plan embeds pre-computed hashes for Bootstrap 5.3.8 and Swiper 11.1.9. Verify them with the commands in Task 1 Step 8b before first deploy. If you upgrade a library version, recompute with `curl -s <cdn-url> | openssl dgst -sha384 -binary | openssl base64 -A` (use `sha256` for Swiper).

---

## How to Swap Placeholder Content

### Phone number
Search-and-replace `+380990004114` and `+38 (099) 000-41-14` throughout all HTML files.

### Logo
Replace `assets/icons/logo.svg` with the real SVG file. Keep the filename.

### Hero background image
In `css/main.css`, find the `.hero-section` rule and change the `url(...)` from the
picsum placeholder to `url('assets/images/hero/hero.jpg')`.

### Gallery photos
1. Name your images `img-01.jpg` through `img-20.jpg` (+ WebP variants if available).
2. Place them in `assets/images/gallery/`.
3. In `index.html`, replace the `https://picsum.photos/seed/evakNN/...` URLs in the
   gallery `<source srcset="...">` and `<img src="...">` attributes with local paths
   such as `assets/images/gallery/img-01.jpg`.

### About section image
Replace the picsum URL in the About `<picture>` element with `assets/images/about/about.jpg`.

### Social links & text
All social URLs and copy text are in `index.html` — search for `instagram.com` and
`tiktok.com`.

---

## Deploying to Cloudflare Pages

### One-time DevOps Setup

#### 1 — Create a dedicated Gmail account
Go to https://accounts.google.com/signup and create e.g. `evakuatorkrop@gmail.com`.
Use this email for all accounts below.

#### 2 — Create a GitHub account and repository
1. Sign up at https://github.com with the Gmail account.
2. Create a new **public** repository named `evakuator-kropyvnytskyi`.
3. Push this project:
   ```bash
   git remote add origin https://github.com/<your-username>/evakuator-kropyvnytskyi.git
   git push -u origin main
   ```

#### 3 — Create a Cloudflare account
1. Sign up at https://dash.cloudflare.com/sign-up with the same Gmail.
2. No domain purchase needed yet — Cloudflare gives a free `*.pages.dev` subdomain.

#### 4 — Create Cloudflare Pages project (Direct Upload mode)

Direct Upload is used instead of Git integration so that Cloudflare only deploys when GitHub Actions CI passes — not on every raw push.

1. In Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Direct Upload**.
2. Enter project name: `evakuator-kropyvnytskyi`. Click **Create project**.
3. Drag-and-drop the site files once to complete initial setup. Your site appears at `https://evakuator-kropyvnytskyi.pages.dev`.
4. Copy your **Account ID** from the Cloudflare dashboard URL (`dash.cloudflare.com/<account-id>`) or from **Profile → API Tokens**.
5. Create a Cloudflare API token: **Profile → API Tokens → Create Token** → use the **"Edit Cloudflare Pages"** template. Copy the token.
6. In your GitHub repository → **Settings → Secrets and variables → Actions** → add two repository secrets:
   - `CF_API_TOKEN` — the token from step 5
   - `CF_ACCOUNT_ID` — your account ID from step 4

> After this setup, every merge to `main` that passes the Playwright test suite automatically deploys to Cloudflare Pages. A test failure leaves the current production version untouched.

#### 5 — Point a custom domain to Cloudflare Pages
1. Purchase a `.com.ua` domain (e.g., from https://nic.ua).
2. In your domain registrar, change the nameservers to Cloudflare's (shown when you
   add the domain to Cloudflare DNS).
3. In Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**.
4. Follow the instructions to add a `CNAME` record pointing to `evakuator-kropyvnytskyi.pages.dev`.
5. SSL is provisioned automatically by Cloudflare (free).

#### 6 — Enable Cloudflare built-in minification
In Cloudflare dashboard → your domain → **Speed** → **Optimization** → **Content Optimization**:
- Enable **Auto Minify** for HTML, CSS, and JavaScript.

#### 7 — Enable branch protection on GitHub

Prevents direct pushes to `main`, so every change must pass CI before reaching production.

1. GitHub repository → **Settings → Branches → Add branch protection rule**.
2. Branch name pattern: `main`.
3. Enable:
   - **Require a pull request before merging**
   - **Require status checks to pass before merging** → select the `test` job from the CI workflow
   - **Do not allow bypassing the above settings**
4. Save.

> The full delivery chain is now: feature branch → PR → CI passes → merge to `main` → deploy job runs → Cloudflare Pages updated.

---

## Hardcoded Domain Locations

`https://evakuator-krop.com.ua/` appears in several files. If the domain changes, update all of these:

| File | Location |
|---|---|
| `index.html` | `<link rel="canonical">`, `og:url`, `og:image`, JSON-LD `url` |
| `robots.txt` | `Sitemap:` directive |
| `sitemap.xml` | All `<loc>` values |

## File Structure

```
/
├── index.html               Main landing page
├── terms.html               Terms of Use (Ukrainian)
├── privacy.html             Privacy Policy (Ukrainian)
├── robots.txt               Crawl directives
├── sitemap.xml              XML sitemap
├── favicon.ico              Site icon
├── _redirects               Cloudflare Pages SPA catch-all
├── _headers                 HTTP security headers (CSP, X-Frame-Options, etc.)
├── .github/
│   └── workflows/
│       └── test.yml         CI — Playwright on push/PR
├── css/
│   └── main.css             All custom styles
├── js/
│   └── main.js              Swiper init, nav interactions
├── assets/
│   ├── icons/
│   │   ├── logo.svg         Company logo
│   │   └── apple-touch-icon.png  iOS home-screen icon
│   └── images/
│       ├── hero/            Hero background (1 image)
│       ├── gallery/         Gallery photos (20+)
│       └── about/           About section photo (1 image)
├── tests/
│   └── e2e/
│       └── site.spec.js     Playwright E2E tests
├── package.json
└── playwright.config.js
```
```

- [ ] **Step 3: Run full test suite one final time**

Run: `npm test`
Expected: ALL PASSED (every test from Tasks 1–12)

- [ ] **Step 4: Commit**

```bash
git add README.md .github/
git commit -m "docs: add README with local dev, deploy, domain index, and CI pipeline"
```

---

## Self-Review

### 1. Spec Coverage

| Requirement | Task |
|---|---|
| `<html lang="uk">` on every page | Task 1 (index), Task 12 (terms, privacy) |
| Sticky header, logo, tel:, CTA, tagline, social, hamburger | Task 2 |
| Hero full-viewport, H1, H2, subtext, CTA with number | Task 3 |
| Services icon list, tel: CTA, social links, pricing-signal | Task 4 |
| Feedbacks carousel (Swiper), 10 reviews, ★★★★★, name | Task 5 |
| Photo carousel (Swiper), 20+ images, lazy, srcset, WebP/JPEG fallback | Task 6 |
| About Us text block, image, tel: CTA | Task 7 |
| FAQ accordion (Bootstrap), 10 Q&As, urgency prompt top + bottom | Task 8 |
| Footer: tagline, nav, legal links, tel:, social, copyright | Task 9 |
| Floating call button, fixed bottom-right, z-index > header, aria-label | Task 10 |
| Open Graph + Twitter Card, Schema.org JSON-LD, canonical, meta description | Task 1 |
| robots.txt, sitemap.xml | Task 11 |
| favicon + apple-touch-icon link | Task 1 (link), Task 11 (file) |
| `terms.html`, `privacy.html` Ukrainian stub | Task 12 |
| Logo SVG stub | Task 13 |
| `_redirects` Cloudflare Pages | Task 11 |
| `_headers` with CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS | Task 11 |
| `404.html` custom Ukrainian error page | Task 11 |
| `_headers` launch-gate note — remove picsum from img-src before production | Task 11 |
| `apple-touch-icon.png` (placeholder — no 404 on iOS) | Task 11 |
| `.gitignore` excluding node_modules, playwright artifacts, OS files | Task 1 |
| SRI hash verification step (curl + openssl) before first test run | Task 1 |
| CI gates Cloudflare Pages deploy on passing `test` job | Task 14 |
| Playwright browser cache in CI (saves ~60 s per run) | Task 14 |
| Cloudflare Pages uses Direct Upload — no raw-push auto-deploy | Task 14 |
| Branch protection rules documented in README | Task 14 |
| Bootstrap CDN version in README table matches code (5.3.8) | Task 14 |
| TikTok links use clean URL without `?_r=1` tracking parameter | Global |
| Legal page dates updated to 29 червня 2026 р. | Tasks 12 |
| Inline `<style>` block removed — styles consolidated in `css/main.css` | Task 1 |
| SRI `integrity=` on all jsDelivr CDN resources | Task 1 |
| Playwright test enforcing SRI presence | Task 1 |
| `prefers-reduced-motion` disables Swiper autoplay (WCAG 2.2.2) | Tasks 5, 6, 10 |
| `bootstrap.Collapse` guarded against CDN load failure | Task 10 |
| Dynamic copyright year via JS | Tasks 9, 10 |
| `og:image` resolves at launch (picsum stub) | Task 1 |
| Hardcoded domain index documented | Task 14 |
| GitHub Actions CI blocks broken commits from reaching Cloudflare | Task 14 |
| README with local dev, deploy, CDN list, asset-swap guide | Task 14 |
| DevOps setup guide (Gmail → GitHub → Cloudflare → domain → minification) | Task 14 |
| One shared Swiper CSS+JS import | Task 1 (head) |
| Bootstrap 5 via jsDelivr with `crossorigin` | Task 1 |
| `defer` on non-critical JS | Task 1 |
| `loading="lazy"` on below-fold images | Tasks 6, 7 |
| `<picture>` with srcset for gallery | Task 6 |
| Smooth scroll | Task 1 (CSS `scroll-behavior: smooth`) |
| CSS transitions ≤ 300ms | Task 1 (`--speed: 0.25s`) |
| Touch targets ≥ 44×44 px (`min-height: 48px` buttons) | Task 1 (CSS) |
| Skip-to-content link (WCAG 2.4.1) | Task 2 |
| ARIA labels on icon-only buttons | Tasks 2, 9, 10 |
| Visible focus rings | Task 1 (CSS `focus-visible`) |
| Section background alternation (dark/light) | Tasks 3–9 |
| One Google Font with Cyrillic | Task 1 |
| `preconnect` for CDN origins | Task 1 |

### 2. Placeholder Scan

No TBD, TODO, or "implement later" text found. All test code blocks contain actual assertions with specific selectors. All commit messages are concrete.

### 3. Type Consistency

- `reviews-swiper` / `reviews-pagination` / `reviews-next` / `reviews-prev` — consistent Task 5 → Task 10
- `gallery-swiper` / `gallery-pagination` / `gallery-next` / `gallery-prev` — consistent Task 6 → Task 10
- `#navMenu` — referenced in Task 2 HTML and Task 10 JS
- `#floating-call-btn` — defined in Task 10 HTML, tested in Task 10 tests, styled in Task 10 CSS
- `href="tel:+380990004114"` — used verbatim in all tasks

---

Plan complete and saved to `docs/superpowers/plans/2026-06-29-evakuator-landing-page.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
