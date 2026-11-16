/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-icon).
 * Source: https://www.trinetaetna.com/home
 * Selector: main section > div.container.flex-wrap:has(> div.bg-gray-100)
 * Output: one row per card -> [icon cell, body cell].
 * Icon cell: EDS icon token paragraph (e.g. ":stethoscope:") resolved from the inline SVG <title>
 * (live DOM <svg> or cached data-URI <img>); the SVG itself is not emitted (icons/*.svg exist in the project).
 * Body cell: H3 card title (source p.title-font) + "Learn more" primary button <p><strong><a>.
 */
export default function parse(element, { document }) {
  const ICONS = { stethoscope: 'stethoscope', tooth: 'tooth', eye: 'eye' };

  function decodeDataSvg(src) {
    const m = (src || '').match(/^data:image\/svg\+xml(;base64)?,(.*)$/i);
    if (!m) return '';
    try {
      return m[1] ? atob(m[2]) : decodeURIComponent(m[2]);
    } catch (e) {
      return '';
    }
  }

  // Icon label from inline <svg><title>, or img alt, or the data-URI SVG <title>
  function iconLabel(card) {
    const svg = card.querySelector('svg');
    if (svg) {
      const t = svg.querySelector('title');
      if (t && t.textContent.trim()) return t.textContent.trim();
      const aria = svg.getAttribute('aria-label');
      if (aria) return aria.trim();
    }
    const img = card.querySelector('img');
    if (img) {
      const alt = (img.getAttribute('alt') || '').trim();
      if (alt) return alt;
      const t = decodeDataSvg(img.getAttribute('src')).match(/<title>([^<]+)<\/title>/i);
      if (t) return t[1].trim();
    }
    return '';
  }

  const cards = element.querySelectorAll(':scope > div.bg-gray-100');
  const cells = [];

  cards.forEach((card) => {
    // Icon cell: icon token text
    const iconName = ICONS[iconLabel(card).toLowerCase()];
    let iconCell = '';
    if (iconName) {
      const p = document.createElement('p');
      p.textContent = `:${iconName}:`;
      iconCell = [p];
    }

    // Body cell: H3 title + Learn more button
    const bodyCell = [];
    const title = card.querySelector('.title-font, h2, h3, h4');
    if (title && title.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      bodyCell.push(h3);
    }

    card.querySelectorAll('a[href]').forEach((srcA) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.setAttribute('href', srcA.getAttribute('href'));
      a.textContent = srcA.textContent.trim();
      strong.append(a);
      p.append(strong);
      bodyCell.push(p);
    });

    cells.push([iconCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (cards-icon)', cells });
  element.replaceWith(block);
}
