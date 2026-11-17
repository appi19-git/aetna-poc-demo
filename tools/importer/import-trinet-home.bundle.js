/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-trinet-home.js
  var import_trinet_home_exports = {};
  __export(import_trinet_home_exports, {
    default: () => import_trinet_home_default
  });

  // tools/importer/parsers/hero-card.js
  function parse(element, { document: document2 }) {
    const ORIGIN = "https://www.trinetaetna.com";
    const cells = [];
    const lastFromSrcset = (srcset) => (srcset || "").split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
    const media = [...element.children].find((c) => !c.querySelector(".hero-card")) || element;
    const srcImg = media.querySelector("img");
    let src = "";
    if (srcImg) {
      src = srcImg.getAttribute("src") || "";
      if (!src || src.startsWith("data:")) {
        src = srcImg.getAttribute("data-src") || lastFromSrcset(srcImg.getAttribute("srcset")) || src;
      }
    }
    if (!src) {
      const source = media.querySelector("picture source[srcset]");
      if (source) src = lastFromSrcset(source.getAttribute("srcset"));
    }
    if (!src) {
      const bgEl = [media, ...media.querySelectorAll("[style]")].find((el) => /url\(/i.test(el.getAttribute("style") || ""));
      if (bgEl) {
        const m = bgEl.getAttribute("style").match(/url\(\s*(?:&quot;|['"])?([^'")&]+(?:&amp;[^'")&]+)*)/i);
        if (m) src = m[1].replace(/&amp;/g, "&");
      }
    }
    if (src) {
      try {
        const u = new URL(src, ORIGIN);
        const inner = u.pathname.startsWith("/_next/image") && u.searchParams.get("url");
        src = inner ? new URL(inner, ORIGIN).href : u.href;
      } catch (e) {
      }
      const img = document2.createElement("img");
      img.src = src;
      const titleHolder = srcImg && srcImg.closest("[title]");
      img.alt = (srcImg && srcImg.getAttribute("alt") || "").trim() || (titleHolder && titleHolder.getAttribute("title") || "").trim() || (media.getAttribute("title") || "").trim();
      cells.push([img]);
    } else {
      cells.push([""]);
    }
    const card = element.querySelector(".hero-card") || element;
    const root = card.querySelector(".rich-text-markdown") || card;
    const contentCell = [];
    root.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((srcEl) => {
      const text = srcEl.textContent.trim();
      if (!text) return;
      const tag = srcEl.tagName.toLowerCase();
      const el = document2.createElement(tag);
      if (tag === "p") {
        el.innerHTML = srcEl.innerHTML.trim();
      } else {
        el.textContent = text;
      }
      contentCell.push(el);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "Hero (hero-card)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-divider.js
  function parse2(element, { document: document2 }) {
    const squash = (s) => s.replace(/[ \t\r\n]+/g, " ");
    function copyInline(src, target) {
      src.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          target.append(document2.createTextNode(squash(node.textContent)));
          return;
        }
        if (node.nodeType !== 1) return;
        const tag = node.tagName.toLowerCase();
        if (tag === "a") {
          const a = document2.createElement("a");
          a.setAttribute("href", node.getAttribute("href") || "");
          a.textContent = squash(node.textContent).trim();
          target.append(a);
        } else if (["strong", "b", "em", "i", "code", "sup", "sub"].includes(tag)) {
          const el = document2.createElement(tag === "b" ? "strong" : tag === "i" ? "em" : tag);
          copyInline(node, el);
          target.append(el);
        } else if (tag === "br") {
          target.append(document2.createElement("br"));
        } else if (tag === "ul" || tag === "ol") {
        } else {
          copyInline(node, target);
        }
      });
    }
    function trimEdges(el) {
      el.normalize();
      const first = el.firstChild;
      if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^[ \t\r\n]+/, "");
      const last = el.lastChild;
      if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/[ \t\r\n]+$/, "");
    }
    function buildList(srcList) {
      const list = document2.createElement(srcList.tagName.toLowerCase());
      srcList.querySelectorAll(":scope > li").forEach((srcLi) => {
        const li = document2.createElement("li");
        copyInline(srcLi, li);
        trimEdges(li);
        const nested = [...srcLi.querySelectorAll("ul, ol")].find((l) => l.parentElement.closest("li") === srcLi);
        if (nested) li.append(buildList(nested));
        list.append(li);
      });
      return list;
    }
    function buttonParagraph(srcA) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.setAttribute("href", srcA.getAttribute("href") || "");
      a.textContent = squash(srcA.textContent).trim();
      strong.append(a);
      p.append(strong);
      return p;
    }
    function buildColumn(col) {
      const out = [];
      const root = col.querySelector(".rich-text-markdown") || col;
      [...root.children].forEach((child) => {
        const tag = child.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          const h = document2.createElement(tag);
          h.textContent = squash(child.textContent).trim();
          out.push(h);
        } else if (tag === "p") {
          if (!child.textContent.trim()) return;
          const p = document2.createElement("p");
          copyInline(child, p);
          trimEdges(p);
          out.push(p);
        } else if (tag === "ul" || tag === "ol") {
          out.push(buildList(child));
        } else {
          const links = child.querySelectorAll("a[href]");
          if (links.length) {
            links.forEach((srcA) => out.push(buttonParagraph(srcA)));
          } else if (child.textContent.trim()) {
            const p = document2.createElement("p");
            copyInline(child, p);
            trimEdges(p);
            out.push(p);
          }
        }
      });
      return out;
    }
    let columns = [...element.querySelectorAll(":scope > div.flex-1")];
    if (!columns.length) {
      columns = [...element.children].filter((c) => c.textContent.trim());
    }
    const row = columns.map((col) => buildColumn(col));
    while (row.length < 2) row.push("");
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Columns (columns-divider)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse3(element, { document: document2 }) {
    const ICONS = { stethoscope: "stethoscope", tooth: "tooth", eye: "eye" };
    function decodeDataSvg(src) {
      const m = (src || "").match(/^data:image\/svg\+xml(;base64)?,(.*)$/i);
      if (!m) return "";
      try {
        return m[1] ? atob(m[2]) : decodeURIComponent(m[2]);
      } catch (e) {
        return "";
      }
    }
    function iconLabel(card) {
      const svg = card.querySelector("svg");
      if (svg) {
        const t = svg.querySelector("title");
        if (t && t.textContent.trim()) return t.textContent.trim();
        const aria = svg.getAttribute("aria-label");
        if (aria) return aria.trim();
      }
      const img = card.querySelector("img");
      if (img) {
        const alt = (img.getAttribute("alt") || "").trim();
        if (alt) return alt;
        const t = decodeDataSvg(img.getAttribute("src")).match(/<title>([^<]+)<\/title>/i);
        if (t) return t[1].trim();
      }
      return "";
    }
    const cards = element.querySelectorAll(":scope > div.bg-gray-100");
    const cells = [];
    cards.forEach((card) => {
      const iconName = ICONS[iconLabel(card).toLowerCase()];
      let iconCell = "";
      if (iconName) {
        const p = document2.createElement("p");
        p.textContent = `:${iconName}:`;
        iconCell = [p];
      }
      const bodyCell = [];
      const title = card.querySelector(".title-font, h2, h3, h4");
      if (title && title.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = title.textContent.trim();
        bodyCell.push(h3);
      }
      card.querySelectorAll("a[href]").forEach((srcA) => {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.setAttribute("href", srcA.getAttribute("href"));
        a.textContent = srcA.textContent.trim();
        strong.append(a);
        p.append(strong);
        bodyCell.push(p);
      });
      cells.push([iconCell, bodyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (cards-icon)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/trinetaetna-cleanup.js
  var SOURCE_ORIGIN = "https://www.trinetaetna.com";
  var SOURCE_PAGE = "https://www.trinetaetna.com/home";
  var LOCAL_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"];
  function removeHeader(element) {
    const header = element.querySelector("#page-header");
    if (!header) return;
    let wrapper = header;
    while (wrapper.parentElement && wrapper.parentElement !== element && !wrapper.parentElement.querySelector("main")) {
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
        if (!n.closest("main")) n.remove();
      });
    });
  }
  function resolveUrl(value, base) {
    if (!value) return value;
    const v = value.trim();
    if (!v || v.startsWith("#") || /^(mailto:|tel:|data:|javascript:|blob:)/i.test(v)) return value;
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
  function transform(hookName, element, payload) {
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      removeHeader(element);
      WebImporter.DOMUtils.remove(element, [
        "#page-header",
        "#page-footer",
        "#tkMobileNav",
        "dialog",
        '[role="dialog"]',
        "#headlessui-portal-root",
        "[data-headlessui-portal]",
        "next-route-announcer",
        "#__next-route-announcer__",
        "#onetrust-consent-sdk",
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
      removeOutsideMain(element, [
        '[class*="backdrop" i]',
        ".fixed.inset-0",
        '[id*="cookie" i]',
        '[class*="cookie" i]'
      ]);
      element.querySelectorAll("section.bg-aetna_primary-600 div.text-center > p").forEach((p) => {
        if (p.querySelector("strong, b")) return;
        const strong = doc.createElement("strong");
        while (p.firstChild) strong.append(p.firstChild);
        p.append(strong);
      });
      element.querySelectorAll("section.bg-white > p.text-3xl").forEach((p) => {
        const h2 = doc.createElement("h2");
        while (p.firstChild) h2.append(p.firstChild);
        p.replaceWith(h2);
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        "script",
        "style",
        "noscript",
        "link",
        "iframe",
        "object",
        "embed"
      ]);
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        if (isAbsoluteExternal(href)) return;
        a.setAttribute("href", resolveUrl(href, SOURCE_ORIGIN + "/"));
      });
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        if (isAbsoluteExternal(src)) return;
        img.setAttribute("src", resolveUrl(src, SOURCE_PAGE));
      });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach(({ name }) => {
          if (name.startsWith("data-tina") || name.startsWith("data-analytics") || name.startsWith("data-track") || name.startsWith("data-gtm") || name.startsWith("data-layer") || /^on[a-z]+$/.test(name)) {
            el.removeAttribute(name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/trinetaetna-sections.js
  var MARKER = "data-excat-section-id";
  var FIRST = "data-excat-first";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      const found = sections.map((section) => ({ section, el: findSectionElement(element, section) })).filter(({ el }) => el);
      for (let i = found.length - 1; i >= 0; i -= 1) {
        const { section, el } = found[i];
        const isFirst = i === 0;
        if (section.style) el.setAttribute(MARKER, section.id);
        if (!isFirst || section.style) {
          const hr = doc.createElement("hr");
          if (section.style) hr.setAttribute(MARKER, section.id);
          if (isFirst) hr.setAttribute(FIRST, "true");
          el.before(hr);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const sectionEl = element.querySelector(`:not(hr)[${MARKER}="${section.id}"]`);
        const hr = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (!sectionEl && !hr) continue;
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (sectionEl) {
          sectionEl.after(meta);
          sectionEl.removeAttribute(MARKER);
        } else {
          let next = hr.nextElementSibling;
          while (next && next.tagName !== "HR") next = next.nextElementSibling;
          if (next) next.before(meta);
          else hr.parentElement.append(meta);
        }
        if (hr) {
          if (hr.getAttribute(FIRST) === "true") hr.remove();
          else hr.removeAttribute(MARKER);
        }
      }
      element.querySelectorAll(`[${MARKER}]`).forEach((el) => el.removeAttribute(MARKER));
      element.querySelectorAll(`hr[${FIRST}]`).forEach((el) => el.remove());
    }
  }

  // tools/importer/import-trinet-home.js
  var PAGE_TEMPLATE = {
    "name": "trinet-home",
    "urls": [
      "https://www.trinetaetna.com/home"
    ],
    "representativeUrl": "https://www.trinetaetna.com/home",
    "description": "TriNet Aetna homepage: purple welcome band, hero photo with overlapping text card, two-column member info with divider, benefit icon cards",
    "blocks": [
      {
        "name": "hero-card",
        "instances": [
          "main div.container:has(> div > .hero-card)"
        ]
      },
      {
        "name": "columns-divider",
        "instances": [
          "main section > div.container.md\\:flex-row"
        ]
      },
      {
        "name": "cards-icon",
        "instances": [
          "main section > div.container.flex-wrap:has(> div.bg-gray-100)"
        ]
      }
    ],
    "urlPattern": "/home",
    "sections": [
      {
        "id": "rc1",
        "name": "Welcome band",
        "selector": [
          "main > div:has(> section.bg-aetna_primary-600)"
        ],
        "style": "purple, centered",
        "blocks": [],
        "defaultContent": [
          "section.bg-aetna_primary-600 div.text-center > p"
        ]
      },
      {
        "id": "rc2",
        "name": "Hero with overlapping text card",
        "selector": [
          "main > div:has(.hero-card)"
        ],
        "style": null,
        "blocks": [
          "hero-card"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "Member website and TriNet contact",
        "selector": [
          "main > div:has(> section.bg-aetna_gray-50 > div.container.md\\:flex-row)"
        ],
        "style": "light",
        "blocks": [
          "columns-divider"
        ],
        "defaultContent": []
      },
      {
        "id": "rc4",
        "name": "Benefits and coverage",
        "selector": [
          "main > div:has(> section.bg-white)"
        ],
        "style": "centered",
        "blocks": [
          "cards-icon"
        ],
        "defaultContent": [
          "section.bg-white > p.text-3xl"
        ]
      }
    ]
  };
  var SITE_METADATA = { Theme: "trinet", Nav: "/trinet/nav", Footer: "/trinet/footer" };
  var parsers = {
    "hero-card": parse,
    "columns-divider": parse2,
    "cards-icon": parse3
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var transformers = [transform, ...lateTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document2.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document: document2, params } = payload;
    executeTransformers("beforeTransform", document2.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document2, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document2.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_trinet_home_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document2.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      const meta = __spreadValues(__spreadValues({}, WebImporter.Blocks.getMetadata(document2)), SITE_METADATA);
      main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document2);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_trinet_home_exports);
})();
