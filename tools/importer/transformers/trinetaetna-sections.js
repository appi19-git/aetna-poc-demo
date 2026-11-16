/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: TriNet Aetna sections (template trinet-home).
 * Reads payload.template.sections (rc1 "purple, centered", rc2 none,
 * rc3 "light", rc4 "centered"). Selectors are tried in order; sections not
 * found on the page are skipped.
 *
 * beforeTransform: walk sections in reverse, insert <hr> before every
 *   non-first section while parser targets still exist. Styled sections get a
 *   temporary data-excat-section-id marker on both the <hr> and the section
 *   element; a styled first section gets a temporary marked <hr> too.
 * afterTransform: walk in reverse, insert Section Metadata after the surviving
 *   section element (or at the end of the section run if it was replaced),
 *   remove markers, and drop the first section's temporary <hr>.
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
      // selector unsupported here; try the next one
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
