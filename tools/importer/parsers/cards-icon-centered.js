/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-icon-centered).
 * Source: https://www.aetnastateflorida.com/ (template florida-home)
 * Selector: div.homepage-threeiconlinks
 * Output: one row per item -> [icon image cell, body cell (H3 wrapping the item link + description p)].
 */
const SOURCE_ORIGIN = 'https://www.aetnastateflorida.com/';

function absoluteHref(href) {
  if (!href) return '';
  try {
    const url = new URL(href, SOURCE_ORIGIN);
    // The importer may resolve relative links against the local proxy; map back to the source site
    if (/^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
      return new URL(`${url.pathname}${url.search}${url.hash}`, SOURCE_ORIGIN).href;
    }
    return url.href;
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  const cells = [];
  const items = element.querySelectorAll(':scope > div.cell');

  items.forEach((item) => {
    const srcLink = item.querySelector('a[href]');

    // Icon cell
    const imageCell = [];
    const srcImg = item.querySelector('img');
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = srcImg.getAttribute('alt') || '';
      imageCell.push(img);
    }

    // Body cell
    const bodyCell = [];
    const srcTitle = item.querySelector('h1, h2, h3, h4, h5, h6');
    const titleText = srcTitle ? srcTitle.textContent.replace(/\s+/g, ' ').trim() : '';
    if (titleText) {
      const h3 = document.createElement('h3');
      if (srcLink) {
        const a = document.createElement('a');
        a.href = absoluteHref(srcLink.getAttribute('href'));
        a.textContent = titleText;
        h3.append(a);
      } else {
        h3.textContent = titleText;
      }
      bodyCell.push(h3);
    }

    item.querySelectorAll('p').forEach((srcP) => {
      const text = srcP.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const p = document.createElement('p');
      p.textContent = text;
      bodyCell.push(p);
    });

    if (!imageCell.length && !bodyCell.length) return;
    cells.push([imageCell.length ? imageCell : '', bodyCell.length ? bodyCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (cards-icon-centered)', cells });
  element.replaceWith(block);
}
