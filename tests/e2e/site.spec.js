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

test('hero has h1 with Кропивницький', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('#hero h1');
  await expect(h1).toContainText('Кропивниц');
});

test('hero CTA button links to tel:+380990004114', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('#hero a.btn-cta');
  await expect(cta).toHaveAttribute('href', 'tel:+380990004114');
  await expect(cta).toContainText('+38 (099) 000-41-14');
});

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

test('reviews section has 10 slides', async ({ page }) => {
  await page.goto('/');
  const slides = page.locator('#reviews .swiper-slide:not(.swiper-slide-duplicate)');
  expect(await slides.count()).toBeGreaterThanOrEqual(10);
});

test('first review slide has 5-star rating', async ({ page }) => {
  await page.goto('/');
  const firstSlide = page.locator('#reviews .swiper-slide').first();
  await expect(firstSlide).toContainText('★★★★★');
});

test('gallery has 20 or more lazy-loaded images', async ({ page }) => {
  await page.goto('/');
  const imgs = page.locator('#gallery .swiper-slide:not(.swiper-slide-duplicate) picture img[loading="lazy"]');
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

test('about section visible with tel link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about')).toBeVisible();
  await expect(
    page.locator('#about a[href="tel:+380990004114"]')
  ).toBeVisible();
});

test('FAQ has 10 accordion items', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('#faq .accordion-item');
  await expect(items).toHaveCount(10);
});

test('first FAQ item is pre-expanded on load', async ({ page }) => {
  await page.goto('/');
  const firstBody = page.locator('#faq .accordion-collapse').first();
  await expect(firstBody).toHaveClass(/show/);
});

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
