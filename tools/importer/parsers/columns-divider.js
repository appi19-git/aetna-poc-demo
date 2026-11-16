/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-divider).
 * Source: https://www.trinetaetna.com/home
 * Selector: main section > div.container.md\:flex-row
 * Output: 1 row x 2 cells. The decorative vertical divider div is skipped (the variant CSS draws it).
 * Tailwind wrappers are flattened into clean semantic HTML; text and hrefs are kept verbatim.
 */
export default function parse(element, { document }) {
  // Collapse source indentation whitespace only (keeps &nbsp; and other text verbatim)
  const squash = (s) => s.replace(/[ \t\r\n]+/g, ' ');

  // Copy inline content (text, links, strong/em, br) without source classes/wrappers
  function copyInline(src, target) {
    src.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        target.append(document.createTextNode(squash(node.textContent)));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if (tag === 'a') {
        const a = document.createElement('a');
        a.setAttribute('href', node.getAttribute('href') || '');
        a.textContent = squash(node.textContent).trim();
        target.append(a);
      } else if (['strong', 'b', 'em', 'i', 'code', 'sup', 'sub'].includes(tag)) {
        const el = document.createElement(tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag);
        copyInline(node, el);
        target.append(el);
      } else if (tag === 'br') {
        target.append(document.createElement('br'));
      } else if (tag === 'ul' || tag === 'ol') {
        // nested lists are handled by buildList
      } else {
        // span/div wrappers: unwrap
        copyInline(node, target);
      }
    });
  }

  // Trim leading/trailing whitespace text of an element built by copyInline
  function trimEdges(el) {
    el.normalize();
    const first = el.firstChild;
    if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^[ \t\r\n]+/, '');
    const last = el.lastChild;
    if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/[ \t\r\n]+$/, '');
  }

  function buildList(srcList) {
    const list = document.createElement(srcList.tagName.toLowerCase());
    srcList.querySelectorAll(':scope > li').forEach((srcLi) => {
      const li = document.createElement('li');
      copyInline(srcLi, li);
      trimEdges(li);
      // nested list: the first ul/ol under this li that is not inside a deeper li
      const nested = [...srcLi.querySelectorAll('ul, ol')]
        .find((l) => l.parentElement.closest('li') === srcLi);
      if (nested) li.append(buildList(nested));
      list.append(li);
    });
    return list;
  }

  function buttonParagraph(srcA) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.setAttribute('href', srcA.getAttribute('href') || '');
    a.textContent = squash(srcA.textContent).trim();
    strong.append(a);
    p.append(strong);
    return p;
  }

  function buildColumn(col) {
    const out = [];
    const root = col.querySelector('.rich-text-markdown') || col;
    [...root.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        const h = document.createElement(tag);
        h.textContent = squash(child.textContent).trim();
        out.push(h);
      } else if (tag === 'p') {
        if (!child.textContent.trim()) return;
        const p = document.createElement('p');
        copyInline(child, p);
        trimEdges(p);
        out.push(p);
      } else if (tag === 'ul' || tag === 'ol') {
        out.push(buildList(child));
      } else {
        // Button wrapper divs -> <p><strong><a></a></strong></p> (EDS primary button)
        const links = child.querySelectorAll('a[href]');
        if (links.length) {
          links.forEach((srcA) => out.push(buttonParagraph(srcA)));
        } else if (child.textContent.trim()) {
          const p = document.createElement('p');
          copyInline(child, p);
          trimEdges(p);
          out.push(p);
        }
      }
    });
    return out;
  }

  // Content columns only (the divider is an empty div without .flex-1)
  let columns = [...element.querySelectorAll(':scope > div.flex-1')];
  if (!columns.length) {
    columns = [...element.children].filter((c) => c.textContent.trim());
  }

  const row = columns.map((col) => buildColumn(col));
  while (row.length < 2) row.push('');

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (columns-divider)', cells });
  element.replaceWith(block);
}
