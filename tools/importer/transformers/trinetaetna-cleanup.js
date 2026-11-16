/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: TriNet Aetna cleanup (template trinet-home).
 *
 * beforeTransform:
 *  - remove the global header (#page-header plus its wrapper divs), mobile nav
 *    (#tkMobileNav, dialogs, overlays/backdrops), footer (#page-footer) and
 *    non-content nodes (scripts, styles, noscript, link, iframes, route announcer)
 *  - "Welcome TriNet worksite employees" -> <p><strong>…</strong></p>
 *  - "Benefits and coverage" (section.bg-white > p.text-3xl) -> <h2>
 *
 * afterTransform:
 *  - resolve relative / localhost link hrefs and img srcs against the source site
 *  - strip tracking and data-tina-* attributes
 *
 * Inline SVG data-URI <img> icons are kept: the cards-icon parser needs them.
 * HTML comments are never removed.
 */
const SOURCE_ORIGIN = 'https://www.trinetaetna.com';
const SOURCE_PAGE = 'https://www.trinetaetna.com/home';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

function removeHeader(element) {
  const header = element.querySelector('#page-header');
  if (!header) return;
  // Climb to the outermost wrapper that does not also contain <main>
  let wrapper = header;
  while (
    wrapper.parentElement
    && wrapper.parentElement !== element
    && !wrapper.parentElement.querySelector('main')
  ) {
    wrapper = wrapper.parentElement;
  }
  wrapper.remove();
}

function removeOutsideMain(element, selectors) {
  selectors.forEach((sel) => {
    let nodes = [];
    try {
      nodes = [...element.querySelectorAll(sel)];
    } catch (e) {
      return;
    }
    nodes.forEach((n) => {
      if (!n.closest('main')) n.remove();
    });
  });
}

function resolveUrl(value, base) {
  if (!value) return value;
  const v = value.trim();
  if (!v || v.startsWith('#') || /^(mailto:|tel:|data:|javascript:|blob:)/i.test(v)) return value;
  try {
    const url = new URL(v, base);
    if (LOCAL_HOSTS.includes(url.hostname)) {
      return `${SOURCE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch (e) {
    return value;
  }
}

function isAbsoluteExternal(value) {
  try {
    const url = new URL(value);
    return !LOCAL_HOSTS.includes(url.hostname);
  } catch (e) {
    return false;
  }
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    // Global header and its wrapper divs
    removeHeader(element);

    // Footer, mobile nav, dialogs, scripts and other non-content nodes
    WebImporter.DOMUtils.remove(element, [
      '#page-header',
      '#page-footer',
      '#tkMobileNav',
      'dialog',
      '[role="dialog"]',
      '#headlessui-portal-root',
      '[data-headlessui-portal]',
      'next-route-announcer',
      '#__next-route-announcer__',
      '#onetrust-consent-sdk',
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);

    // Overlays / backdrops are only removed when outside <main> so no content is lost
    removeOutsideMain(element, [
      '[class*="backdrop" i]',
      '.fixed.inset-0',
      '[id*="cookie" i]',
      '[class*="cookie" i]',
    ]);

    // Welcome line: keep as bold paragraph with identical text
    element.querySelectorAll('section.bg-aetna_primary-600 div.text-center > p').forEach((p) => {
      if (p.querySelector('strong, b')) return;
      const strong = doc.createElement('strong');
      while (p.firstChild) strong.append(p.firstChild);
      p.append(strong);
    });

    // "Benefits and coverage" title -> <h2> with identical content
    element.querySelectorAll('section.bg-white > p.text-3xl').forEach((p) => {
      const h2 = doc.createElement('h2');
      while (p.firstChild) h2.append(p.firstChild);
      p.replaceWith(h2);
    });
  }

  if (hookName === 'afterTransform') {
    // Any leftover chrome
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'object',
      'embed',
    ]);

    // Links: resolve relative / localhost hrefs; leave external links untouched
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (isAbsoluteExternal(href)) return;
      a.setAttribute('href', resolveUrl(href, SOURCE_ORIGIN + '/'));
    });

    // Images: resolve relative / localhost srcs against the source page
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      if (isAbsoluteExternal(src)) return;
      img.setAttribute('src', resolveUrl(src, SOURCE_PAGE));
    });

    // Strip tracking / framework attributes (keep data-excat-* used by sections transformer)
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach(({ name }) => {
        if (
          name.startsWith('data-tina')
          || name.startsWith('data-analytics')
          || name.startsWith('data-track')
          || name.startsWith('data-gtm')
          || name.startsWith('data-layer')
          || /^on[a-z]+$/.test(name)
        ) {
          el.removeAttribute(name);
        }
      });
    });
  }
}
