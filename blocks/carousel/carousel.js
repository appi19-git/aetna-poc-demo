import { createOptimizedPicture } from '../../scripts/aem.js';

const AUTOPLAY_DELAY = 6000;
let carouselId = 0;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    // Only optimize same-origin, non-SVG images; keep the authored picture otherwise
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    img.closest('picture').replaceWith(optimized);
  });
}

/** Wrap a bare <img> (no picture) so slide images are always picture > img. */
function normalizeImage(cell) {
  const img = cell.querySelector('img');
  if (!img || img.closest('picture')) return;
  const picture = document.createElement('picture');
  img.replaceWith(picture);
  picture.append(img);
}

function setActive(block, index, announce = false) {
  const slides = [...block.querySelectorAll('.carousel-slide')];
  if (!slides.length) return;
  const active = ((index % slides.length) + slides.length) % slides.length;
  block.dataset.activeSlide = active;

  slides.forEach((slide, idx) => {
    const isActive = idx === active;
    slide.classList.toggle('active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
    if (isActive) slide.removeAttribute('inert');
    else slide.setAttribute('inert', '');
  });

  block.querySelectorAll('.carousel-slide-indicator button').forEach((button, idx) => {
    if (idx === active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });

  const live = block.querySelector('.carousel-status');
  if (live && announce) live.textContent = `Slide ${active + 1} of ${slides.length}`;
}

function createSlide(row, index, total, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-slide';
  slide.id = `carousel-${id}-slide-${index}`;
  slide.dataset.slideIndex = index;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${total}`);

  const cells = [...row.querySelectorAll(':scope > div')];
  // Find the image cell by content (authors may swap or omit cells)
  const imageCell = cells.find((cell) => cell.querySelector('picture, img')
    && !cell.querySelector('h1, h2, h3, h4, h5, h6'));
  const contentCells = cells.filter((cell) => cell !== imageCell
    && (cell.textContent.trim() || cell.children.length));

  if (imageCell) {
    normalizeImage(imageCell);
    imageCell.className = 'carousel-slide-image';
    slide.append(imageCell);
  } else {
    slide.classList.add('no-image');
  }

  if (contentCells.length) {
    const content = document.createElement('div');
    content.className = 'carousel-slide-content';
    contentCells.forEach((cell) => {
      // A content cell might also carry the picture when there is a single cell
      if (!imageCell) {
        const pic = cell.querySelector('picture');
        if (pic) {
          const imgWrap = document.createElement('div');
          imgWrap.className = 'carousel-slide-image';
          (pic.closest('p') || pic).remove();
          imgWrap.append(pic);
          slide.classList.remove('no-image');
          slide.prepend(imgWrap);
        }
      }
      content.append(...cell.childNodes);
    });
    if (content.textContent.trim()) slide.append(content);
  }

  return slide;
}

function buildButton(className, label, html = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  button.innerHTML = html;
  return button;
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = block.id || `carousel-${id}`;

  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.textContent.trim() || row.querySelector('picture, img'));
  if (!rows.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.getAttribute('aria-label')) block.setAttribute('aria-label', 'Highlights');

  const container = document.createElement('div');
  container.className = 'carousel-slides-container';

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-slides';
  slidesWrapper.id = `carousel-${id}-slides`;

  rows.forEach((row, idx) => slidesWrapper.append(createSlide(row, idx, rows.length, id)));
  container.append(slidesWrapper);

  block.textContent = '';
  block.append(container);
  optimizeImages(slidesWrapper);

  // Eager-load the first slide image (LCP), lazy-load the rest
  slidesWrapper.querySelectorAll('.carousel-slide').forEach((slide, idx) => {
    const img = slide.querySelector('img');
    if (!img) return;
    img.loading = idx === 0 ? 'eager' : 'lazy';
    if (idx === 0) img.setAttribute('fetchpriority', 'high');
  });

  const total = rows.length;
  if (total < 2) {
    block.classList.add('single-slide');
    setActive(block, 0);
    return;
  }

  // Previous / next arrows
  const nav = document.createElement('div');
  nav.className = 'carousel-navigation-buttons';
  const prev = buildButton('slide-prev', 'Previous slide');
  const next = buildButton('slide-next', 'Next slide');
  prev.setAttribute('aria-controls', slidesWrapper.id);
  next.setAttribute('aria-controls', slidesWrapper.id);
  nav.append(prev, next);
  container.append(nav);

  // Controls: pause/play + dots
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  const indicatorsNav = document.createElement('nav');
  indicatorsNav.setAttribute('aria-label', 'Carousel slide controls');
  const indicators = document.createElement('ol');
  indicators.className = 'carousel-slide-indicators';
  for (let i = 0; i < total; i += 1) {
    const li = document.createElement('li');
    li.className = 'carousel-slide-indicator';
    li.dataset.targetSlide = i;
    const dot = buildButton('', `Show slide ${i + 1} of ${total}`);
    dot.setAttribute('aria-controls', `carousel-${id}-slide-${i}`);
    li.append(dot);
    indicators.append(li);
  }
  indicatorsNav.append(indicators);

  const pause = buildButton('carousel-pause', 'Pause slide rotation');
  pause.setAttribute('aria-pressed', 'false');

  const status = document.createElement('div');
  status.className = 'carousel-status';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');

  controls.append(indicatorsNav, pause);
  block.append(controls, status);

  // Autoplay state
  let timer = null;
  let userPaused = prefersReducedMotion();
  let hoverPaused = false;
  let focusPaused = false;

  const current = () => parseInt(block.dataset.activeSlide || '0', 10);
  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    if (userPaused || hoverPaused || focusPaused) return;
    timer = window.setInterval(() => setActive(block, current() + 1), AUTOPLAY_DELAY);
  };
  const syncPauseButton = () => {
    block.classList.toggle('paused', userPaused);
    pause.setAttribute('aria-pressed', String(userPaused));
    pause.setAttribute('aria-label', userPaused ? 'Play slide rotation' : 'Pause slide rotation');
  };
  const goTo = (index) => {
    // User-driven changes are announced; autoplay ticks are not
    setActive(block, index, true);
    start(); // restart the interval so a manual change gets a full delay
  };

  prev.addEventListener('click', () => goTo(current() - 1));
  next.addEventListener('click', () => goTo(current() + 1));
  indicators.querySelectorAll('button').forEach((button, idx) => {
    button.addEventListener('click', () => goTo(idx));
  });
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    syncPauseButton();
    start();
  });

  // Keyboard: arrow keys / Home / End when focus is inside the carousel
  block.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    const keys = {
      ArrowLeft: () => goTo(current() - 1),
      ArrowRight: () => goTo(current() + 1),
      Home: () => goTo(0),
      End: () => goTo(total - 1),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  });

  // Pause while hovered or while keyboard focus is inside (WCAG 2.2.2)
  block.addEventListener('mouseenter', () => { hoverPaused = true; stop(); });
  block.addEventListener('mouseleave', () => { hoverPaused = false; start(); });
  block.addEventListener('focusin', () => { focusPaused = true; stop(); });
  block.addEventListener('focusout', (e) => {
    if (block.contains(e.relatedTarget)) return;
    focusPaused = false;
    start();
  });

  // Swipe on touch devices
  let touchX = null;
  slidesWrapper.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  slidesWrapper.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) goTo(current() + (dx < 0 ? 1 : -1));
  });

  // Stop rotating when off-screen or the tab is hidden
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start(); else stop();
    }).observe(block);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  setActive(block, 0);
  syncPauseButton();
  start();
}
