/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Aetna State of Florida sections.
 * Uses payload.template.sections (selectors tried in order); sections not found
 * on the page are skipped.
 *
 * beforeTransform: insert <hr> breaks before every non-first section while parser
 *   targets still exist; mark styled sections (element + hr) with a temporary
 *   data-excat-section-id. A styled first section gets a temporary marked <hr>.
 * afterTransform: insert Section Metadata after the surviving section element
 *   (or at the end of the section that starts at the marker <hr>), remove
 *   markers, and drop the first section's temporary <hr>.
 */
const MARKER = 'data-excat-section-id';
const FIRST = 'data-excat-first';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // selector unsupported in this DOM; try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    const found = sections
      .map((section) => ({ section, el: findSectionElement(element, section) }))
      .filter(({ el }) => el);

    for (let i = found.length - 1; i >= 0; i -= 1) {
      const { section, el } = found[i];
      const isFirst = i === 0;
      if (section.style) el.setAttribute(MARKER, section.id);
      if (!isFirst || section.style) {
        const hr = doc.createElement('hr');
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (isFirst) hr.setAttribute(FIRST, 'true');
        el.before(hr);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const sectionEl = element.querySelector(`:not(hr)[${MARKER}="${section.id}"]`);
      const hr = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!sectionEl && !hr) continue;

      const meta = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (sectionEl) {
        sectionEl.after(meta);
        sectionEl.removeAttribute(MARKER);
      } else {
        // Section element was replaced by a parser: place metadata before the next break
        let next = hr.nextElementSibling;
        while (next && next.tagName !== 'HR') next = next.nextElementSibling;
        if (next) next.before(meta);
        else hr.parentElement.append(meta);
      }

      if (hr) {
        if (hr.getAttribute(FIRST) === 'true') hr.remove();
        else hr.removeAttribute(MARKER);
      }
    }
    element.querySelectorAll(`[${MARKER}]`).forEach((el) => el.removeAttribute(MARKER));
    element.querySelectorAll(`hr[${FIRST}]`).forEach((el) => el.remove());
  }
}
