/**
 * Hero block.
 * Base, article and hero-card are CSS-only and keep the authored row markup.
 * hero-callout restructures the rows into an inline icon above centered text,
 * so the image is never laid out as a background.
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

export default function decorate(block) {
  if (block.classList.contains('hero-callout')) decorateCallout(block);
}
