import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Header block — shared by every site in this project.
 * The nav content (logo, tagline, links, menu label) comes from the site's nav page,
 * chosen by the page's "nav" metadata (default /nav). Site look-and-feel is applied by
 * header.css under the page's theme class (e.g. body.florida, body.trinet).
 *
 * Nav page sections (top-level <div>s), in order:
 *   1. brand    — logo link
 *   2. tagline  — optional text sections before the link list
 *   3. sections — the section that holds the link list (<ul>)
 *   4. tools    — optional sections after the list; a lone short paragraph is used
 *                 as the mobile menu button label (e.g. "Menu")
 */

/** Mobile mode is decided by CSS: the menu button is only displayed on small screens. */
function isMobile(nav) {
  const hamburger = nav.querySelector('.nav-hamburger');
  return !!hamburger && getComputedStyle(hamburger).display !== 'none';
}

function setMenuOpen(nav, open, { focusButton = false } = {}) {
  const button = nav.querySelector('.nav-hamburger button');
  const mobile = isMobile(nav);
  const expanded = mobile && open;
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  if (button) {
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  }
  const sections = nav.querySelector('.nav-sections');
  // lock page scroll only when the open menu is a fixed overlay panel
  const overlay = expanded && sections && getComputedStyle(sections).position === 'fixed';
  document.body.style.overflowY = overlay ? 'hidden' : '';
  if (expanded) {
    const first = sections?.querySelector('a, button');
    if (overlay && first) first.focus();
  } else if (focusButton && button) {
    button.focus();
  }
}

function buildHamburger(nav, label) {
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-controls', 'nav-sections');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open navigation');
  if (label) {
    const text = document.createElement('span');
    text.className = 'nav-hamburger-label';
    text.textContent = label;
    button.append(text);
  }
  const icon = document.createElement('span');
  icon.className = 'nav-hamburger-icon';
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);
  button.addEventListener('click', () => {
    setMenuOpen(nav, nav.getAttribute('aria-expanded') !== 'true');
  });
  hamburger.append(button);
  return hamburger;
}

function buildCloseButton(nav) {
  const close = document.createElement('div');
  close.className = 'nav-close';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Close navigation');
  button.innerHTML = '<span class="nav-close-icon" aria-hidden="true"></span>';
  button.addEventListener('click', () => setMenuOpen(nav, false, { focusButton: true }));
  close.append(button);
  return close;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // classify the nav sections by content (authors may add or omit sections)
  const sectionEls = [...nav.children];
  const listIndex = sectionEls.findIndex((s) => s.querySelector('ul'));
  sectionEls.forEach((section, i) => {
    if (i === 0 && i !== listIndex) section.classList.add('nav-brand');
    else if (i === listIndex) section.classList.add('nav-sections');
    else if (listIndex === -1 || i < listIndex) section.classList.add('nav-tagline');
    else section.classList.add('nav-tools');
  });

  // brand link: strip button styling that decorateButtons may have added
  nav.querySelectorAll('.nav-brand .button').forEach((a) => {
    a.className = '';
    a.closest('.button-wrapper')?.classList.remove('button-wrapper');
  });
  nav.querySelector('.nav-brand a')?.classList.add('nav-brand-link');

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.id = 'nav-sections';
    navSections.querySelectorAll(':scope .default-content-wrapper > ul').forEach((ul) => ul.classList.add('nav-list'));
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
      li.classList.add('nav-item');
      li.querySelector(':scope > a')?.classList.add('nav-trigger');
    });
  }

  // a lone short paragraph in the tools section labels the mobile menu button
  let menuLabel = '';
  const tools = nav.querySelector('.nav-tools');
  if (tools && !tools.querySelector('a, img')) {
    menuLabel = tools.textContent.trim();
    if (menuLabel.length <= 24) tools.remove();
    else menuLabel = '';
  }

  // the menu button sits right before the link list it toggles
  const hamburger = buildHamburger(nav, menuLabel);
  if (navSections) navSections.before(hamburger);
  else nav.append(hamburger);
  if (navSections) navSections.prepend(buildCloseButton(nav));

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.addEventListener('click', () => setMenuOpen(nav, false, { focusButton: true }));
  nav.append(backdrop);

  // Escape closes the mobile menu; focus leaving the nav closes it too
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(nav, false, { focusButton: true });
    }
  });
  nav.addEventListener('focusout', (e) => {
    if (nav.getAttribute('aria-expanded') === 'true' && e.relatedTarget && !nav.contains(e.relatedTarget)) {
      setMenuOpen(nav, false);
    }
  });

  // crossing the breakpoint (resize/rotate) resets the menu to its closed state
  let wasMobile = null;
  const syncMode = () => {
    const mobile = isMobile(nav);
    if (mobile !== wasMobile) {
      wasMobile = mobile;
      setMenuOpen(nav, false);
    }
  };
  window.addEventListener('resize', syncMode);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  nav.setAttribute('aria-expanded', 'false');
  requestAnimationFrame(syncMode);
}
