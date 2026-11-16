/* eslint-disable */
/* global WebImporter */

// TriNet Aetna "home" template import script.
// Separate from the WKND importer (tools/importer/import.js), which is left untouched.

import heroCardParser from './parsers/hero-card.js';
import columnsDividerParser from './parsers/columns-divider.js';
import cardsIconParser from './parsers/cards-icon.js';
import cleanupTransformer from './transformers/trinetaetna-cleanup.js';
import sectionsTransformer from './transformers/trinetaetna-sections.js';

const PAGE_TEMPLATE = {
  name: 'home',
  urls: [
    'https://www.trinetaetna.com/home',
  ],
  representativeUrl: 'https://www.trinetaetna.com/home',
  description: 'TriNet Aetna homepage: welcome banner, hero with overlapping text card, two-column member info, benefit icon cards',
  urlPattern: '/*',
  blocks: [
    {
      name: 'hero-card',
      instances: [
        'main div.container:has(> div > .hero-card)',
      ],
    },
    {
      name: 'columns-divider',
      instances: [
        'main section > div.container.md\\:flex-row',
      ],
    },
    {
      name: 'cards-icon',
      instances: [
        'main section > div.container.flex-wrap:has(> div.bg-gray-100)',
      ],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'Welcome banner',
      selector: [
        'main > div:has(> section.bg-aetna_primary-600)',
      ],
      style: 'purple, center',
      blocks: [],
      defaultContent: [
        'section.bg-aetna_primary-600 div.text-center > p',
      ],
    },
    {
      id: 'rc2',
      name: 'Hero with overlapping text card',
      selector: [
        'main > div:has(.hero-card)',
      ],
      style: null,
      blocks: [
        'hero-card',
      ],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'Member website / Already a member',
      selector: [
        'main > div:has(> section.bg-aetna_gray-50 > div.container.md\\:flex-row)',
      ],
      style: 'light-grey',
      blocks: [
        'columns-divider',
      ],
      defaultContent: [],
    },
    {
      id: 'rc4',
      name: 'Benefits and coverage',
      selector: [
        'main > div:has(> section.bg-white)',
      ],
      style: null,
      blocks: [
        'cards-icon',
      ],
      defaultContent: [
        'section.bg-white > p.text-3xl',
      ],
    },
  ],
};

const parsers = {
  'hero-card': heroCardParser,
  'columns-divider': columnsDividerParser,
  'cards-icon': cardsIconParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [cleanupTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
