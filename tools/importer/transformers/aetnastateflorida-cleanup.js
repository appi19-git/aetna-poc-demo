/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Aetna State of Florida cleanup.
 * Selectors come from migration-work/cleaned.html (https://www.aetnastateflorida.com/).
 *
 * beforeTransform: remove chrome and carousel UI that would interfere with block
 *   matching (header, skip link, #main anchor, slick arrows/dots/clones,
 *   play-pause toggle, decorative rules, empty spacers).
 * afterTransform: remove footer, scripts/styles/tracking leftovers.
 * HTML comments are intentionally left alone.
 */

const MEDIA_SELECTOR = 'img, picture, video, iframe, svg, a, hr, table, input, button';

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

function isEmpty(el) {
  return el.textContent.trim() === '' && !el.querySelector(MEDIA_SELECTOR);
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    removeAll(element, [
      // site chrome
      'header',
      'a.skip-main',
      '#main',
      // carousel UI chrome (not content)
      'img.slick-arrow',
      'ul.slick-dots',
      'a.play-pause-toggle',
      '.slick-cloned',
      // decorative rule
      'div.utility-simple-rule',
      // scripts / tracking
      'script',
      'noscript',
      'style',
      'link',
      'iframe[src*="googletagmanager"]',
      'iframe[src*="doubleclick"]',
      '[id*="onetrust"]',
      '[class*="cookie"]',
    ]);

    // Source images use bare relative paths (e.g. "img/icon-phone.png") that the importer's
    // adjustImageUrls rule cannot resolve (it drops them). Resolve them against the source page.
    const imgBase = payload?.params?.originalURL || 'https://www.aetnastateflorida.com/';
    element.querySelectorAll('img[src]').forEach((img) => {
      const raw = img.getAttribute('src').trim();
      if (!raw || /^(https?:|data:|\/\/)/i.test(raw)) return;
      try { img.setAttribute('src', new URL(raw, imgBase).href); } catch (e) { /* keep as-is */ }
    });

    // Source CTA buttons (<center><a class="button">) become EDS primary buttons:
    // <p><strong><a></a></strong></p>. Link text and href are unchanged.
    element.querySelectorAll('center > a.button, p > a.button:only-child').forEach((a) => {
      const holder = a.parentElement;
      const p = element.ownerDocument.createElement('p');
      const strong = element.ownerDocument.createElement('strong');
      holder.replaceWith(p);
      strong.append(a);
      p.append(strong);
    });

    // Empty <p>&nbsp;</p> spacers
    element.querySelectorAll('p').forEach((p) => {
      if (!p.children.length && p.textContent.trim() === '') p.remove();
    });

    // Empty spacer divs (including wrappers left empty after removing the rule).
    // Deepest first so emptied parents are caught too.
    const divs = Array.from(element.querySelectorAll('div')).reverse();
    divs.forEach((div) => {
      if (div.isConnected && isEmpty(div)) div.remove();
    });
  }

  if (hookName === 'afterTransform') {
    removeAll(element, [
      'footer.footer',
      'footer',
      'header',
      'nav',
      'script',
      'noscript',
      'style',
      'link',
    ]);

    // Keep every link (internal .php pages, PDFs) pointing at the original site:
    // resolve relative or localhost hrefs against the source page URL.
    const base = payload?.params?.originalURL || 'https://www.aetnastateflorida.com/';
    element.querySelectorAll('a[href]').forEach((a) => {
      const raw = a.getAttribute('href').trim();
      if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return;
      try {
        const u = new URL(raw, base);
        if (/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) {
          const src = new URL(base);
          u.protocol = src.protocol; u.host = src.host;
        }
        a.setAttribute('href', u.href);
      } catch (e) { /* leave href as-is */ }
    });

    // Strip tracking/inline-handler attributes
    element.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const n = attr.name;
        if (n.startsWith('on') || n.startsWith('data-track') || n.startsWith('data-analytics')
          || n === 'data-slick-index' || n === 'aria-hidden' || n === 'tabindex') {
          el.removeAttribute(n);
        }
      });
    });
  }
}
