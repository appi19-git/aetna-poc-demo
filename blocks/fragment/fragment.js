/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

// eslint-disable-next-line import/no-cycle
import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(originalPath) {
  let path = originalPath;
  // Local migration preview serves imported pages under /content/: load fragments
  // (nav, footer, …) from the same folder so they match the local content.
  // Never applies on aem.page / aem.live.
  const LOCAL_PREFIX = '/content';
  const isLocalPreview = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    && window.location.pathname.startsWith(`${LOCAL_PREFIX}/`);
  if (path && isLocalPreview && path.startsWith('/') && !path.startsWith(`${LOCAL_PREFIX}/`)) {
    path = `${LOCAL_PREFIX}${path}`;
  }
  if (path && path.startsWith('/') && !path.startsWith('//')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      // parse without a live document so relative image paths are not requested
      // against the page URL before they are rebased below
      const parsed = new DOMParser().parseFromString(await resp.text(), 'text/html');
      const main = document.createElement('main');
      main.append(...parsed.body.childNodes);

      // reset base path for media to fragment base: ./media_* and plain relative
      // paths (e.g. images/logo.svg) resolve next to the fragment, not the page
      const fragmentBase = new URL(path, window.location);
      const isRelative = (value) => value && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(value);
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}]`).forEach((elem) => {
          const value = elem.getAttribute(attr);
          if (isRelative(value)) elem[attr] = new URL(value, fragmentBase).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      // local preview only: keep site-relative links inside the local content folder
      if (isLocalPreview) {
        main.querySelectorAll('a[href^="/"]:not([href^="//"])').forEach((a) => {
          const href = a.getAttribute('href');
          if (!href.startsWith(`${LOCAL_PREFIX}/`)) a.setAttribute('href', `${LOCAL_PREFIX}${href === '/' ? '/index' : href}`);
        });
      }

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (!fragment) return;

  const wrapper = block.closest('.fragment-wrapper');
  const section = wrapper.closest('.section');

  if (section && section.children.length === 1) {
    // fragment is the ONLY child of its section; replace the whole section
    section.replaceWith(...fragment.childNodes);
  } else {
    // fragment shares section with other children; flatten children into it
    fragment.querySelectorAll(':scope > .section').forEach((fragSection) => {
      [...fragSection.childNodes].forEach((child) => wrapper.before(child));
    });
    wrapper.remove();
  }
}
