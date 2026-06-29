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
