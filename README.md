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

## Adding or Replacing Photos

All images are optimized through `scripts/optimize-images.js` (uses [sharp](https://sharp.pixelplumbing.com/)).
It reads source images from a gitignored staging area and outputs WebP + JPEG at multiple responsive sizes.

### One-time setup

```bash
npm install   # installs sharp along with other dev deps
```

### Workflow

1. **Drop source images into the staging folders** (these are gitignored — never committed):

   | Folder | Contents |
   |---|---|
   | `assets/images/staging/hero/` | Exactly 1 landscape photo (1600×720 or wider is ideal) |
   | `assets/images/staging/about/` | Exactly 1 photo (portrait works best in the side column) |
   | `assets/images/staging/gallery/` | All remaining photos, named `01-photo.jpg`, `02-photo.jpg`, … so they sort in display order |

2. **Run the script:**

   ```bash
   node scripts/optimize-images.js
   ```

   Output:
   - `assets/images/hero/hero-768.{webp,jpg}`, `hero-1200.{webp,jpg}`, `hero-1920.{webp,jpg}`
   - `assets/images/about/about-480.{webp,jpg}`, `about-768.{webp,jpg}`
   - `assets/images/gallery/img-01-480.{webp,jpg}` … `img-NN-1200.{webp,jpg}`
   - `assets/images/html-snippets.txt` — ready-to-paste `<picture>` HTML with correct `width`/`height` values

3. **Paste the snippets into `index.html`** — the snippets file has three labelled sections (hero, about, gallery).

4. **Commit the generated images** (not the staging sources):
   ```bash
   git add assets/images/hero/ assets/images/about/ assets/images/gallery/
   git commit -m "feat: update real customer images"
   ```

### Notes
- EXIF orientation is applied automatically — photos taken in portrait mode on a phone will appear upright.
- Portrait images are detected automatically; they are cropped via `object-fit: cover` to the same card height as landscape images in the gallery carousel.
- Quality is set to 82 for all outputs. Adjust `QUALITY` at the top of the script if needed.

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
├── scripts/
│   └── optimize-images.js   Resizes + converts source photos to WebP+JPEG (run with Node.js)
├── assets/
│   ├── icons/
│   │   ├── logo.svg         Company logo
│   │   └── apple-touch-icon.png  iOS home-screen icon
│   └── images/
│       ├── hero/            Optimized hero images (hero-768/1200/1920.{webp,jpg})
│       ├── gallery/         Optimized gallery images (img-NN-480/768/1200.{webp,jpg})
│       ├── about/           Optimized about image (about-480/768.{webp,jpg})
│       └── staging/         Source photos (gitignored — never committed)
├── tests/
│   └── e2e/
│       └── site.spec.js     Playwright E2E tests
├── package.json
└── playwright.config.js
```
