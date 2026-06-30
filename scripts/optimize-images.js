// scripts/optimize-images.js
// Run with: node scripts/optimize-images.js
// Reads from assets/images/staging/{hero,about,gallery}/
// Writes to assets/images/{hero,about,gallery}/

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const ROOT    = path.join(__dirname, '..');
const STAGING = path.join(ROOT, 'assets', 'images', 'staging');
const OUT     = path.join(ROOT, 'assets', 'images');

const HERO_WIDTHS    = [768, 1200, 1920];
const ABOUT_WIDTHS   = [480, 768];
const GALLERY_WIDTHS = [480, 768, 1200];
const QUALITY        = 82;

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|tiff?)$/i;

function readImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => IMAGE_EXTS.test(f) && !f.startsWith('.'))
    .sort();
}

async function resize(src, destDir, baseName, widths) {
  fs.mkdirSync(destDir, { recursive: true });
  const raw = await sharp(src).metadata();

  // EXIF orientations 5-8 rotate the image 90/270°, swapping width and height
  const isRotated90 = [5, 6, 7, 8].includes(raw.orientation);
  const displayWidth  = isRotated90 ? raw.height : raw.width;
  const displayHeight = isRotated90 ? raw.width  : raw.height;

  const results = [];

  for (const w of widths) {
    const opts = displayWidth >= displayHeight
      ? { width: w }
      : { height: w };                    // portrait: interpret 'w' as height cap

    const resized = sharp(src).rotate().resize(opts); // .rotate() applies EXIF orientation

    await resized.clone().webp({ quality: QUALITY })
      .toFile(path.join(destDir, `${baseName}-${w}.webp`));

    await resized.clone().jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(path.join(destDir, `${baseName}-${w}.jpg`));

    const out = await sharp(path.join(destDir, `${baseName}-${w}.jpg`)).metadata();
    results.push({ width: out.width, height: out.height, breakpoint: w });
  }
  return { isPortrait: displayHeight > displayWidth, sizes: results };
}

function heroHTML(info) {
  const widths = info.sizes.map(s => s.breakpoint);
  const srcsetWebp = widths.map(w => `assets/images/hero/hero-${w}.webp ${w}w`).join(',\n                    ');
  const srcsetJpg  = widths.map(w => `assets/images/hero/hero-${w}.jpg ${w}w`).join(',\n                 ');
  const largest = info.sizes[info.sizes.length - 1];
  return `
<!-- PASTE THIS inside #hero section, before .hero-overlay div -->
<picture class="hero-bg-picture" aria-hidden="true">
  <source type="image/webp"
          srcset="${srcsetWebp}"
          sizes="100vw">
  <img class="hero-bg-img"
       src="assets/images/hero/hero-${largest.breakpoint}.jpg"
       srcset="${srcsetJpg}"
       sizes="100vw"
       alt=""
       width="${largest.width}" height="${largest.height}"
       fetchpriority="high">
</picture>`;
}

function aboutHTML(info) {
  const s480 = info.sizes.find(s => s.breakpoint === 480) || info.sizes[0];
  const s768 = info.sizes.find(s => s.breakpoint === 768) || info.sizes[info.sizes.length - 1];
  return `
<!-- PASTE THIS to replace the existing <picture> in #about -->
<picture>
  <source type="image/webp"
          srcset="assets/images/about/about-480.webp 480w,
                  assets/images/about/about-768.webp 768w"
          sizes="(max-width: 768px) 480px, 768px">
  <img src="assets/images/about/about-768.jpg"
       srcset="assets/images/about/about-480.jpg 480w,
               assets/images/about/about-768.jpg 768w"
       sizes="(max-width: 768px) 480px, 768px"
       loading="lazy"
       width="${s768.width}" height="${s768.height}"
       alt="Команда евакуаторного сервісу Кропивницький"
       class="about-img img-fluid rounded-3">
</picture>`;
}

function gallerySlideHTML(name, info) {
  const largest = info.sizes[info.sizes.length - 1];
  const cls = info.isPortrait ? 'swiper-slide portrait-slide' : 'swiper-slide';
  const srcsetWebp = info.sizes.map(s => `assets/images/gallery/${name}-${s.breakpoint}.webp ${s.breakpoint}w`).join(',\n                    ');
  const srcsetJpg  = info.sizes.map(s => `assets/images/gallery/${name}-${s.breakpoint}.jpg ${s.breakpoint}w`).join(',\n                 ');
  return `
          <div class="${cls}">
            <picture>
              <source type="image/webp"
                      srcset="${srcsetWebp}"
                      sizes="(max-width: 576px) 480px, (max-width: 992px) 768px, 1200px">
              <img src="assets/images/gallery/${name}-1200.jpg"
                   srcset="${srcsetJpg}"
                   sizes="(max-width: 576px) 480px, (max-width: 992px) 768px, 1200px"
                   loading="lazy"
                   width="${largest.width}" height="${largest.height}"
                   alt="Евакуатор Кропивницький — фото роботи">
            </picture>
          </div>`;
}

(async () => {
  // --- HERO ---
  const heroFiles = readImages(path.join(STAGING, 'hero'));
  if (heroFiles.length === 0) {
    console.error('ERROR: No image found in assets/images/staging/hero/. Add exactly 1 landscape photo.');
    process.exit(1);
  }
  if (heroFiles.length > 1) {
    console.warn(`WARNING: Found ${heroFiles.length} images in staging/hero/. Only the first (${heroFiles[0]}) will be used.`);
  }
  console.log(`\nProcessing HERO: ${heroFiles[0]}`);
  const heroInfo = await resize(
    path.join(STAGING, 'hero', heroFiles[0]),
    path.join(OUT, 'hero'),
    'hero',
    HERO_WIDTHS
  );
  console.log('  → Generated:', HERO_WIDTHS.map(w => `hero-${w}.{webp,jpg}`).join(', '));

  // --- ABOUT ---
  const aboutFiles = readImages(path.join(STAGING, 'about'));
  if (aboutFiles.length === 0) {
    console.error('ERROR: No image found in assets/images/staging/about/. Add exactly 1 photo.');
    process.exit(1);
  }
  console.log(`\nProcessing ABOUT: ${aboutFiles[0]}`);
  const aboutInfo = await resize(
    path.join(STAGING, 'about', aboutFiles[0]),
    path.join(OUT, 'about'),
    'about',
    ABOUT_WIDTHS
  );
  console.log('  → Generated:', ABOUT_WIDTHS.map(w => `about-${w}.{webp,jpg}`).join(', '));

  // --- GALLERY ---
  const galleryFiles = readImages(path.join(STAGING, 'gallery'));
  if (galleryFiles.length === 0) {
    console.error('ERROR: No images found in assets/images/staging/gallery/. Add gallery photos.');
    process.exit(1);
  }
  console.log(`\nProcessing GALLERY: ${galleryFiles.length} images`);
  const galleryInfos = [];
  for (let i = 0; i < galleryFiles.length; i++) {
    const name = `img-${String(i + 1).padStart(2, '0')}`;
    process.stdout.write(`  [${i + 1}/${galleryFiles.length}] ${galleryFiles[i]} → ${name} ... `);
    const info = await resize(
      path.join(STAGING, 'gallery', galleryFiles[i]),
      path.join(OUT, 'gallery'),
      name,
      GALLERY_WIDTHS
    );
    galleryInfos.push({ name, ...info });
    console.log(info.isPortrait ? 'portrait' : 'landscape');
  }

  // --- OUTPUT HTML SNIPPETS ---
  const snippetFile = path.join(ROOT, 'assets', 'images', 'html-snippets.txt');
  const snippets = [
    '=== HERO <picture> snippet (replace CSS background, put inside #hero before .hero-overlay) ===',
    heroHTML(heroInfo),
    '',
    '=== ABOUT <picture> snippet (replace existing <picture> in #about) ===',
    aboutHTML(aboutInfo),
    '',
    '=== GALLERY slides (replace entire .swiper-wrapper content in #gallery) ===',
    galleryInfos.map(g => gallerySlideHTML(g.name, g)).join('\n'),
  ].join('\n');

  fs.writeFileSync(snippetFile, snippets, 'utf8');

  console.log('\n=== DONE ===');
  console.log(`Hero:    ${heroFiles.length} source → 6 files`);
  console.log(`About:   ${aboutFiles.length} source → 4 files`);
  console.log(`Gallery: ${galleryFiles.length} sources → ${galleryFiles.length * GALLERY_WIDTHS.length * 2} files`);
  console.log(`\nPortrait gallery images (will get .portrait-slide class):`);
  galleryInfos.filter(g => g.isPortrait).forEach(g => console.log(`  ${g.name}`));
  console.log(`\nHTML snippets written to: assets/images/html-snippets.txt`);
  console.log('Paste them into index.html per the instructions in each snippet header.');
})();
