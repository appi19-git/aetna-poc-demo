import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads and decorates the footer. The footer content comes from the site's footer page,
 * chosen by the page's "footer" metadata (default /footer); footer.css styles it per site
 * under the page's theme class (e.g. body.florida, body.trinet).
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  if (!fragment) return;
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // name sections by content so CSS can lay them out without positional selectors
  [...footer.children].forEach((section, i) => {
    section.classList.add(`footer-section-${i + 1}`);
    const onlyLogo = section.querySelector('img') && !section.textContent.trim();
    if (i === 0 && onlyLogo) section.classList.add('footer-brand');
    if (section.querySelector('ul')) section.classList.add('footer-links');
    if (/copyright|©/i.test(section.textContent)) section.classList.add('footer-copyright');
  });

  // a paragraph that holds only image links is the social icon row
  footer.querySelectorAll('p').forEach((p) => {
    const links = [...p.querySelectorAll('a')];
    if (links.length > 1 && !p.textContent.trim() && links.every((a) => a.querySelector('img'))) {
      p.classList.add('footer-social');
    }
  });

  // strip button styling that decorateButtons may add to lone links
  footer.querySelectorAll('a.button').forEach((a) => {
    a.className = '';
    a.closest('.button-wrapper')?.classList.remove('button-wrapper');
  });

  block.append(footer);
}
