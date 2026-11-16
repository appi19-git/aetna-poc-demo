/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel (carousel-hero).
 * Source: https://www.aetnastateflorida.com/ (template florida-home)
 * Selector: div.masthead-container > section.masthead
 * Output: one row per real slide (slick clones skipped) -> [image cell, text cell].
 * Title/subtitle heading levels are kept as in the source (slide 1: H1 + H2; others: H2 + p).
 */
export default function parse(element, { document }) {
  const cells = [];

  const slides = [...element.querySelectorAll('.masthead-item')]
    .filter((slide) => !slide.classList.contains('slick-cloned'));

  slides.forEach((slide) => {
    // Image cell
    const imageCell = [];
    const srcImg = slide.querySelector('.masthead-background-container img, img.masthead-background-image');
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = srcImg.getAttribute('alt') || '';
      imageCell.push(img);
    }

    // Text cell: title + subtitle(s), keeping source tag names
    const textCell = [];
    const textRoot = slide.querySelector('.masthead-text');
    if (textRoot) {
      const parts = textRoot.querySelectorAll('.masthead-text-title, .masthead-sub-content > h1, .masthead-sub-content > h2, .masthead-sub-content > h3, .masthead-sub-content > p');
      parts.forEach((src) => {
        const text = src.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;
        const el = document.createElement(src.tagName.toLowerCase());
        el.textContent = text;
        textCell.push(el);
      });
    }

    if (!imageCell.length && !textCell.length) return;
    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel (carousel-hero)', cells });
  element.replaceWith(block);
}
