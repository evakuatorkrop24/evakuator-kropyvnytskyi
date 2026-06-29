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
Go to https://accounts.google.com/signup and create e.g. `evakuatorkrop24@gmail.com`.
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
