/**
 * Hero block.
 * - base, article, hero-card: the picture and the content cell are lifted to the top
 *   level of the block (picture first, then one content div), so CSS can lay them out
 *   (overlay for the base, overlapping text card for hero-card).
 * - hero-callout: an inline icon above centered text; the image is never a background.
 */
function decorateCallout(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const cells = rows.flatMap((row) => [...row.querySelectorAll(':scope > div')]);

  // Authors may put the icon in its own row, in the content cell, or omit it
  const img = block.querySelector('picture img, img');
  const picture = img ? (img.closest('picture') || img) : null;

  const icon = document.createElement('div');
  icon.className = 'hero-callout-icon';
  if (picture) {
    const holder = picture.parentElement;
    icon.append(picture);
    // drop the now-empty <p> that wrapped the image
    if (holder && holder.tagName === 'P' && !holder.textContent.trim() && !holder.children.length) {
      holder.remove();
    }
    if (img && !img.getAttribute('alt')) img.setAttribute('alt', '');
  }

  const content = document.createElement('div');
  content.className = 'hero-callout-content';
  cells.forEach((cell) => {
    if (cell.textContent.trim() || cell.querySelector('a, picture, img')) {
      content.append(...cell.childNodes);
    }
  });

  block.textContent = '';
  if (picture) block.append(icon);
  if (content.textContent.trim()) block.append(content);
}

function decorateDefault(block) {
  const img = block.querySelector('picture img, img');
  let picture = null;
  if (img) {
    picture = img.closest('picture');
    if (!picture) {
      picture = document.createElement('picture');
      img.replaceWith(picture);
      picture.append(img);
    }
    const holder = picture.parentElement;
    if (holder && holder.tagName === 'P' && !holder.textContent.trim()) holder.replaceWith(picture);
  }

  // collect every text cell (authors may add or merge rows) into one content div
  const content = document.createElement('div');
  content.className = 'hero-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    if (cell.contains(picture)) picture.remove();
    if (cell.textContent.trim() || cell.querySelector('a')) content.append(...cell.childNodes);
  });

  block.textContent = '';
  if (picture) block.append(picture);
  if (content.childNodes.length) block.append(content);
}

export default function decorate(block) {
  if (block.classList.contains('hero-callout')) decorateCallout(block);
  else decorateDefault(block);
}
