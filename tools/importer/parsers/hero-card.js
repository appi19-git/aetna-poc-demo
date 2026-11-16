/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (hero-card).
 * Source: https://www.trinetaetna.com/home
 * Selector: main div.container:has(> div > .hero-card)
 * Output: row 1 = hero photo (absolute URL); row 2 = H1 + H3 subheading + paragraph.
 */
export default function parse(element, { document }) {
  const ORIGIN = 'https://www.trinetaetna.com';
  const cells = [];

  const lastFromSrcset = (srcset) => (srcset || '')
    .split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || '';

  // Row 1: hero image from the media wrapper (the child that does not hold the card)
  const media = [...element.children].find((c) => !c.querySelector('.hero-card')) || element;
  const srcImg = media.querySelector('img');
  let src = '';
  if (srcImg) {
    src = srcImg.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) {
      src = srcImg.getAttribute('data-src') || lastFromSrcset(srcImg.getAttribute('srcset')) || src;
    }
  }
  if (!src) {
    const source = media.querySelector('picture source[srcset]');
    if (source) src = lastFromSrcset(source.getAttribute('srcset'));
  }
  if (!src) {
    // Live DOM renders the photo as an inline background (image-set(url(...) 1x, ...))
    const bgEl = [media, ...media.querySelectorAll('[style]')]
      .find((el) => /url\(/i.test(el.getAttribute('style') || ''));
    if (bgEl) {
      const m = bgEl.getAttribute('style').match(/url\(\s*(?:&quot;|['"])?([^'")&]+(?:&amp;[^'")&]+)*)/i);
      if (m) src = m[1].replace(/&amp;/g, '&');
    }
  }

  if (src) {
    // Make absolute and unwrap Next.js optimizer URLs (/_next/image?url=...) to the original asset
    try {
      const u = new URL(src, ORIGIN);
      const inner = u.pathname.startsWith('/_next/image') && u.searchParams.get('url');
      src = inner ? new URL(inner, ORIGIN).href : u.href;
    } catch (e) { /* keep src as-is */ }
    const img = document.createElement('img');
    img.src = src;
    const titleHolder = srcImg && srcImg.closest('[title]');
    img.alt = ((srcImg && srcImg.getAttribute('alt')) || '').trim()
      || ((titleHolder && titleHolder.getAttribute('title')) || '').trim()
      || (media.getAttribute('title') || '').trim();
    cells.push([img]);
  } else {
    cells.push(['']);
  }

  // Row 2: text content from the hero card, headings kept at source level
  const card = element.querySelector('.hero-card') || element;
  const root = card.querySelector('.rich-text-markdown') || card;
  const contentCell = [];
  root.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((srcEl) => {
    const text = srcEl.textContent.trim();
    if (!text) return;
    const tag = srcEl.tagName.toLowerCase();
    const el = document.createElement(tag);
    if (tag === 'p') {
      el.innerHTML = srcEl.innerHTML.trim();
    } else {
      el.textContent = text;
    }
    contentCell.push(el);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero (hero-card)', cells });
  element.replaceWith(block);
}
