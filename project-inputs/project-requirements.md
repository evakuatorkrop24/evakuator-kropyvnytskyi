# Insight Portal

**Goal:** Deliver a working MVP that demonstrates end-to-end product implementation (frontend application) with Claude Code assistance.

**Business scenario:** A user can open a website to find details of a company that provides car towing service, and click a button to call the company. On Android and iPhone the `tel:` URI scheme must be used (`<a href="tel:+380XXXXXXXXX">`) so the native dialer opens immediately. On desktop the same link opens whatever phone app the user has configured (this is standard browser behavior — no special handling needed).

---

## 1. Core Rules

- Static frontend only — no backend, no server-side rendering, no build tool required. The site must open by double-clicking `index.html` in a browser and also work when served from Cloudflare Pages.
- **Tech stack:** HTML5, vanilla JavaScript (ES2020+), Bootstrap 5 (via CDN). No frameworks (React, Vue, Angular). Additional utility libraries (e.g., Swiper.js for carousels) are allowed via CDN if they reduce custom code significantly.
- **Browser targets:** Last 2 versions of Chrome, Firefox, Safari, Edge. No IE support.
- **Language:** All user-facing text must be in Ukrainian (`<html lang="uk">`). Use phone number `+380990004114` (`+38 (099) 000-41-14` in display format).
- Basic SEO optimization (see Section 3 for specifics).
- Asset stubs (placeholder text, images, logo) can be generated or sourced from free stock photo sites (e.g., Unsplash, Pexels). Real assets will be provided by the customer later and must be swappable by replacing files and/or updating a single config section.

---

## 2. Functional Requirements

### 2.0 Development Scope

- Frontend only — no backend, no API calls, no user data stored.
- All content is static (hardcoded or loaded from a local JSON file for easy editing).

### 2.1 Reference Site

- `https://turbo-evik-dnipro.onepage.me/` — visual reference only, not a template to copy.

### 2.2. No Accounts or Authentication

No login, no registration, no session management.

### 2.3. PAGE SECTIONS (top to bottom)

0. All sections can be seen at `https://turbo-evik-dnipro.onepage.me/` for visual reference only.

1. **Header** — sticky, visible on scroll. Contains: logo (SVG or PNG), phone number as a `tel:` link, "Call now" CTA button (also a `tel:` link), tagline text (e.g., "працюємо цілодобово"), icon links to Instagram and TikTok. Header collapses to a hamburger menu on mobile.

2. **Hero / Main screen** (головний екран) — full-viewport-height section with a background image and centered text banner. Recommended banner structure (prioritizes time + trust + area in 3 seconds):
   > **[H1]** Евакуатор 24/7 у Кропивницькому  
   > **[H2]** Приїдемо за 20–30 хвилин  
   > **[Subtext]** Кропивницький, область та вся Україна

   Include a prominent primary CTA button (`tel:` link) with the number visible directly in the label: "📞 Зателефонувати — +38 (099) 000-41-14". Showing the number in the button removes one tap for a user in an emergency.

3. **Services / Product-service** (продукт-/-послуга) — detailed services section with icon list, a `tel:` call button, and icon links to Instagram and TikTok. Content example:
   > Працюємо цілодобово! БЕЗ ВИХІДНИХ!  
   > Ми здійснюємо перевезення автомобілів по м.Кропивницький та всій Україні  
   > Допомогаємо при ДТП

   Include a pricing-signal line to reduce hesitation before the CTA: "Ціна залежить від відстані — дізнайтесь вартість за 30 секунд."

4. **Feedbacks** (відгуки) — positioned before the gallery to establish social proof early in the scroll. Swiper.js carousel (same library as section 5, one import), up to 10 reviews. Each review must include: 5-star rating displayed as ★★★★★ (Unicode, styled in CSS, static), review text in Ukrainian, and reviewer first name + last initial. Example:
   > ★★★★★  
   > Потрапив у неприємну ситуацію на проспекті — машина заглухла прямо в годину пік. Викликав евакуатор, приїхали за 20 хвилин! Усе чітко, акуратно, водій допоміг закотити авто в сервіс. Дуже дякую!  
   > Костянтин В.

   Generate 9 more positive Ukrainian-language reviews.

5. **Photo Carousel** — image slider of evacuation/towing work photos (20+ images). Use Swiper.js (via CDN) for the carousel. Use `loading="lazy"` on all carousel images. Use `<picture>` with WebP and JPEG fallback. Use `srcset` for responsive image sizes (mobile: 480px, tablet: 768px, desktop: 1200px). Placeholder images can be sourced from Unsplash/Pexels with towing/truck themes.

6. **About Us** (про нас) — text block with a supporting image and a `tel:` call button. Text example:
   > 🚗 Евакуатор Кропивницький — приїдемо тоді, коли інші тільки обіцяють  
   > Працюємо цілодобово, без вихідних, по Кропивницькому, області та всій Україні.  
   > (full text as originally specified)

7. **FAQ** — accordion component (Bootstrap 5 `accordion` component). Include an urgency prompt at the **top** of the section (above the accordion): "Не знайшли відповідь? Зателефонуйте — відповімо за 30 секунд." with a `tel:` link styled as a secondary button. Repeat a shorter prompt below the accordion as well. Generate up to 10 question-answer pairs in Ukrainian. Example Q: "Скільки коштує виклик евакуатора в Кропивницькому?" — Example A: "Вартість послуги залежить від місця подачі, типу транспортного засобу..."

8. **Footer** — contains: company tagline, navigation links (Про компанію, Послуги, Контакти), legal links (Умови користування → `terms.html`, Політика конфіденційності → `privacy.html`), phone number as a `tel:` link, Instagram and TikTok icon links, copyright line. Text example:
   > Цілодобовий евакуатор у Кропивницькому — швидка допомога на дорозі 24/7.

10. **Floating Call Button** (global, fixed — required on all breakpoints) — a fixed `tel:` call button pinned to the bottom-right of the viewport. Must sit above all other elements (`z-index` higher than header and Swiper controls). Style as a pill or circle using the primary button color. Include `aria-label="Зателефонувати"`. This is a required element, not optional.

---

## 3. SEO Requirements

- `<html lang="uk">` on every page.
- Unique, descriptive `<title>` and `<meta name="description">` tags.
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
- Semantic HTML structure: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. One `<h1>` per page.
- Schema.org `LocalBusiness` JSON-LD structured data block in `<head>` (name, telephone, address, areaServed, openingHours).
- `robots.txt` and `sitemap.xml` in the project root.
- All images must have meaningful `alt` text in Ukrainian.
- Canonical `<link rel="canonical">` tag.
- Favicon (`favicon.ico` + `<link rel="icon">`) and Apple touch icon.

---

## 4. UI Requirements

**Responsive — mobile first:**

- Breakpoints follow Bootstrap 5 defaults (xs/sm/md/lg/xl/xxl).
- Test at 375px (iPhone SE), 768px (iPad), 1440px (desktop).
- Touch targets minimum 44×44px.

**Accessibility (a11y):**

- All interactive elements reachable via keyboard (`Tab`/`Enter`/`Space`).
- Visible focus ring on all focusable elements (do not use `outline: none` without a replacement).
- ARIA labels on icon-only buttons (e.g., `aria-label="Зателефонувати"`).
- Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text (WCAG AA).

**Visual quality:**

- Consistent spacing using Bootstrap 5 spacing utilities or a custom CSS variable scale.
- Visible hover and focus states for all interactive elements.
- Smooth scroll behavior (`scroll-behavior: smooth`).
- CSS transitions on interactive elements (≤ 300ms).

**Localization:**

- All user-facing text in Ukrainian.
- Phone numbers displayed in Ukrainian format: `+38 (099) 000-41-14` (real number: `+380990004114`).
- Date formatting if needed: `DD.MM.YYYY`.

**Button System:**

| Type | Style | Usage |
|------|-------|-------|
| Primary | Filled, brand color (`#FFD600` yellow on dark, or `#FF6B00` orange — match logo when provided), font-weight 600 | All `tel:` call CTAs |
| Secondary | Outline, same brand color border, transparent fill | Social links (Instagram, TikTok), non-urgent actions |
| Floating | Circle or pill, primary color, fixed position | Bottom-right floating call button |

Rules: one primary button visible per screen section at most. Border-radius 8px. Min-height 48px on mobile. Hover/focus: brightness shift + `box-shadow`, transition ≤ 300ms.

**Color Palette (starter — align to final logo/brand when provided):**

| Role | Value | Usage |
|------|-------|-------|
| Primary | `#FFD600` | CTA buttons, star ratings, highlights |
| Primary Dark | `#1A1A2E` | Header, footer backgrounds |
| Accent | `#FF6B00` | Hover states, icon fills |
| Text Body | `#212121` | All body text |
| Text Inverse | `#FFFFFF` | Text on dark backgrounds |
| Surface Light | `#F5F5F5` | Alternating light section backgrounds |
| Border | `#E0E0E0` | Card borders, dividers |

Alternate light/dark section backgrounds for visual rhythm: Hero (dark) → Services (light) → Feedbacks (dark) → Gallery (light) → About (dark) → FAQ (light) → Map (light) → Footer (dark).

**Typography Scale:**

| Element | Mobile | Desktop | Weight | Notes |
|---------|--------|---------|--------|-------|
| H1 | 28px | 48px | 700 | One per page |
| H2 | 22px | 36px | 700 | Section headings |
| H3 | 18px | 24px | 600 | Card/item headings |
| Body | 16px | 18px | 400 | |
| Caption | 14px | 14px | 400 | Review names, labels |
| Button | 16px | 16px | 600 | Sentence-case throughout |

Use one Google Font family (e.g., Inter or Montserrat). Load via `<link rel="preconnect">` + `<link rel="stylesheet">` with `&subset=latin,cyrillic` to include Cyrillic glyphs.

---

## 5. Optimization

- Load Bootstrap 5 CSS and JS via jsDelivr CDN with `integrity` and `crossorigin` attributes.
- Load Swiper.js via CDN for carousels — one shared instance, not two separate imports.
- Defer non-critical JS: `<script defer src="...">` or `<script type="module">`.
- Use `loading="lazy"` on all below-the-fold images.
- Use WebP images with JPEG fallback via `<picture>` element.
- Use `srcset` / `sizes` for responsive images (serve appropriately sized images per viewport).
- Minify custom CSS and JS (can be done manually or via Cloudflare's built-in minification toggle in the dashboard — no build tool required).
- Preconnect to CDN origins: `<link rel="preconnect" href="https://cdn.jsdelivr.net">`.
- Inline critical above-the-fold CSS in `<style>` in `<head>` to avoid render-blocking.
- Target Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms on a mid-range mobile device.

---

## 6. File Structure

```
/
├── index.html
├── terms.html             ← stub until customer provides legal text
├── privacy.html           ← stub until customer provides legal text
├── robots.txt
├── sitemap.xml
├── favicon.ico
├── _redirects             ← Cloudflare Pages 404 handling
├── css/
│   └── main.css
├── js/
│   └── main.js
└── assets/
    ├── images/
    │   ├── hero/          ← 1 stub image
    │   ├── gallery/       ← 20+ stub images
    │   └── about/         ← 1 stub image
    └── icons/
        └── logo.svg       ← stub SVG until real logo provided
```

---

## 7. Deliverables

- GitHub repository with frontend source.
- Cloudflare Pages deployment (static hosting, connected to GitHub repo for auto-deploy on push to `main`).
- Custom Ukrainian domain name will be purchased by the customer and pointed to Cloudflare Pages.
- `README.md` that includes:
  - How to open locally (just open `index.html` in a browser, or `npx serve .` for a local dev server)
  - How to deploy to Cloudflare Pages
  - List of CDN libraries used and their versions
  - How to swap placeholder content (images, phone number, text)
- A `_redirects` file for Cloudflare Pages (handles 404 → custom 404 page if added later).
- Placeholder assets (logo, hero image, gallery photos) included in the repo until the customer provides real ones.

---

## 8. DevOps Setup Guide

Must include step-by-step instructions for:

1. Create a dedicated Gmail account for this project.
2. Create a GitHub account/organization and repository using that Gmail.
3. Create a Cloudflare account using that Gmail.
4. Connect GitHub repository to Cloudflare Pages (auto-deploy on push to `main`).
5. How to point a custom domain (purchased separately) to Cloudflare Pages.
6. Enable Cloudflare's built-in minification (HTML/CSS/JS) in the dashboard.

---

## 9. Open Items (customer to provide)

1. ✅ Real phone number: `+380990004114` (`+38 (099) 000-41-14` display format).
2. Logo file (SVG preferred) — **in progress, use stub**.
3. Hero background image — **in progress, use stub**.
4. 20+ gallery photos of evacuation/towing work — **in progress, use stubs**.
5. About-us photo — **in progress, use stub**.
6. ✅ TikTok: `https://www.tiktok.com/@sergey3214?_r=1`
7. ✅ Instagram: `https://www.instagram.com/evakuator_krop_0990004114`
8. ✅ Company name confirmed: **Евакуатор Кропивницький**.
9. ✅ `terms.html` — generate default Ukrainian-language Terms of Use content appropriate for a local service business.
10. ✅ `privacy.html` — generate default Ukrainian-language Privacy Policy content appropriate for a local service business (no user data collected, contact form if added later).
11. ~~Google Maps embed URL~~ — **out of scope for MVP**. Map section removed from Section 2.3.

---