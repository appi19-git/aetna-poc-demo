/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (hero-callout).
 * Source: https://www.aetnastateflorida.com/ (template florida-home)
 * Selector: div.textbar-callout-purple
 * Output: row 1 = icon image; row 2 = H3 (text before the <br>, spans as <strong>) + p (text after the <br>).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: icon image (alt kept verbatim)
  const srcImg = element.querySelector('img');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    cells.push([img]);
  }

  // Row 2: split the source heading on its <br>
  const contentCell = [];
  const srcHeading = element.querySelector('h1, h2, h3, h4, h5, h6');
  if (srcHeading) {
    const h3 = document.createElement('h3');
    const after = [];
    let pastBreak = false;

    srcHeading.childNodes.forEach((node) => {
      if (node.nodeType === 1 && node.tagName === 'BR') {
        pastBreak = true;
        return;
      }
      if (pastBreak) {
        after.push(node.textContent);
        return;
      }
      if (node.nodeType === 3) {
        h3.append(document.createTextNode(node.textContent.replace(/\s+/g, ' ')));
      } else if (node.nodeType === 1) {
        const text = node.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;
        const strong = document.createElement('strong');
        strong.textContent = text;
        h3.append(strong);
      }
    });

    // Trim leading/trailing whitespace text nodes
    while (h3.firstChild && h3.firstChild.nodeType === 3 && !h3.firstChild.textContent.trim()) h3.firstChild.remove();
    while (h3.lastChild && h3.lastChild.nodeType === 3 && !h3.lastChild.textContent.trim()) h3.lastChild.remove();
    if (h3.firstChild && h3.firstChild.nodeType === 3) h3.firstChild.textContent = h3.firstChild.textContent.replace(/^\s+/, '');
    if (h3.lastChild && h3.lastChild.nodeType === 3) h3.lastChild.textContent = h3.lastChild.textContent.replace(/\s+$/, '');

    if (h3.textContent.trim()) contentCell.push(h3);

    const afterText = after.join('').replace(/\s+/g, ' ').trim();
    if (afterText) {
      const p = document.createElement('p');
      p.textContent = afterText;
      contentCell.push(p);
    }
  }

  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero (hero-callout)', cells });
  element.replaceWith(block);
}
