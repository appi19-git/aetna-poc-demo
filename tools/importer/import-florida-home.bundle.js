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

  // tools/importer/import-florida-home.js
  var import_florida_home_exports = {};
  __export(import_florida_home_exports, {
    default: () => import_florida_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const slides = [...element.querySelectorAll(".masthead-item")].filter((slide) => !slide.classList.contains("slick-cloned"));
    slides.forEach((slide) => {
      const imageCell = [];
      const srcImg = slide.querySelector(".masthead-background-container img, img.masthead-background-image");
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = srcImg.getAttribute("alt") || "";
        imageCell.push(img);
      }
      const textCell = [];
      const textRoot = slide.querySelector(".masthead-text");
      if (textRoot) {
        const parts = textRoot.querySelectorAll(".masthead-text-title, .masthead-sub-content > h1, .masthead-sub-content > h2, .masthead-sub-content > h3, .masthead-sub-content > p");
        parts.forEach((src) => {
          const text = src.textContent.replace(/\s+/g, " ").trim();
          if (!text) return;
          const el = document2.createElement(src.tagName.toLowerCase());
          el.textContent = text;
          textCell.push(el);
        });
      }
      if (!imageCell.length && !textCell.length) return;
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Carousel (carousel-hero)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-centered.js
  var SOURCE_ORIGIN = "https://www.aetnastateflorida.com/";
  function absoluteHref(href) {
    if (!href) return "";
    try {
      const url = new URL(href, SOURCE_ORIGIN);
      if (/^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
        return new URL(`${url.pathname}${url.search}${url.hash}`, SOURCE_ORIGIN).href;
      }
      return url.href;
    } catch (e) {
      return href;
    }
  }
  function parse2(element, { document: document2 }) {
    const cells = [];
    const items = element.querySelectorAll(":scope > div.cell");
    items.forEach((item) => {
      const srcLink = item.querySelector("a[href]");
      const imageCell = [];
      const srcImg = item.querySelector("img");
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = srcImg.getAttribute("alt") || "";
        imageCell.push(img);
      }
      const bodyCell = [];
      const srcTitle = item.querySelector("h1, h2, h3, h4, h5, h6");
      const titleText = srcTitle ? srcTitle.textContent.replace(/\s+/g, " ").trim() : "";
      if (titleText) {
        const h3 = document2.createElement("h3");
        if (srcLink) {
          const a = document2.createElement("a");
          a.href = absoluteHref(srcLink.getAttribute("href"));
          a.textContent = titleText;
          h3.append(a);
        } else {
          h3.textContent = titleText;
        }
        bodyCell.push(h3);
      }
      item.querySelectorAll("p").forEach((srcP) => {
        const text = srcP.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        const p = document2.createElement("p");
        p.textContent = text;
        bodyCell.push(p);
      });
      if (!imageCell.length && !bodyCell.length) return;
      cells.push([imageCell.length ? imageCell : "", bodyCell.length ? bodyCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (cards-icon-centered)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-callout.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    const srcImg = element.querySelector("img");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      cells.push([img]);
    }
    const contentCell = [];
    const srcHeading = element.querySelector("h1, h2, h3, h4, h5, h6");
    if (srcHeading) {
      const h3 = document2.createElement("h3");
      const after = [];
      let pastBreak = false;
      srcHeading.childNodes.forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "BR") {
          pastBreak = true;
          return;
        }
        if (pastBreak) {
          after.push(node.textContent);
          return;
        }
        if (node.nodeType === 3) {
          h3.append(document2.createTextNode(node.textContent.replace(/\s+/g, " ")));
        } else if (node.nodeType === 1) {
          const text = node.textContent.replace(/\s+/g, " ").trim();
          if (!text) return;
          const strong = document2.createElement("strong");
          strong.textContent = text;
          h3.append(strong);
        }
      });
      while (h3.firstChild && h3.firstChild.nodeType === 3 && !h3.firstChild.textContent.trim()) h3.firstChild.remove();
      while (h3.lastChild && h3.lastChild.nodeType === 3 && !h3.lastChild.textContent.trim()) h3.lastChild.remove();
      if (h3.firstChild && h3.firstChild.nodeType === 3) h3.firstChild.textContent = h3.firstChild.textContent.replace(/^\s+/, "");
      if (h3.lastChild && h3.lastChild.nodeType === 3) h3.lastChild.textContent = h3.lastChild.textContent.replace(/\s+$/, "");
      if (h3.textContent.trim()) contentCell.push(h3);
      const afterText = after.join("").replace(/\s+/g, " ").trim();
      if (afterText) {
        const p = document2.createElement("p");
        p.textContent = afterText;
        contentCell.push(p);
      }
    }
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "Hero (hero-callout)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aetnastateflorida-cleanup.js
  var MEDIA_SELECTOR = "img, picture, video, iframe, svg, a, hr, table, input, button";
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function isEmpty(el) {
    return el.textContent.trim() === "" && !el.querySelector(MEDIA_SELECTOR);
  }
  function transform(hookName, element, payload) {
    var _a, _b;
    if (hookName === "beforeTransform") {
      removeAll(element, [
        // site chrome
        "header",
        "a.skip-main",
        "#main",
        // carousel UI chrome (not content)
        "img.slick-arrow",
        "ul.slick-dots",
        "a.play-pause-toggle",
        ".slick-cloned",
        // decorative rule
        "div.utility-simple-rule",
        // scripts / tracking
        "script",
        "noscript",
        "style",
        "link",
        'iframe[src*="googletagmanager"]',
        'iframe[src*="doubleclick"]',
        '[id*="onetrust"]',
        '[class*="cookie"]'
      ]);
      const imgBase = ((_a = payload == null ? void 0 : payload.params) == null ? void 0 : _a.originalURL) || "https://www.aetnastateflorida.com/";
      element.querySelectorAll("img[src]").forEach((img) => {
        const raw = img.getAttribute("src").trim();
        if (!raw || /^(https?:|data:|\/\/)/i.test(raw)) return;
        try {
          img.setAttribute("src", new URL(raw, imgBase).href);
        } catch (e) {
        }
      });
      element.querySelectorAll("center > a.button, p > a.button:only-child").forEach((a) => {
        const holder = a.parentElement;
        const p = element.ownerDocument.createElement("p");
        const strong = element.ownerDocument.createElement("strong");
        holder.replaceWith(p);
        strong.append(a);
        p.append(strong);
      });
      element.querySelectorAll("p").forEach((p) => {
        if (!p.children.length && p.textContent.trim() === "") p.remove();
      });
      const divs = Array.from(element.querySelectorAll("div")).reverse();
      divs.forEach((div) => {
        if (div.isConnected && isEmpty(div)) div.remove();
      });
    }
    if (hookName === "afterTransform") {
      removeAll(element, [
        "footer.footer",
        "footer",
        "header",
        "nav",
        "script",
        "noscript",
        "style",
        "link"
      ]);
      const base = ((_b = payload == null ? void 0 : payload.params) == null ? void 0 : _b.originalURL) || "https://www.aetnastateflorida.com/";
      element.querySelectorAll("a[href]").forEach((a) => {
        const raw = a.getAttribute("href").trim();
        if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return;
        try {
          const u = new URL(raw, base);
          if (/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) {
            const src = new URL(base);
            u.protocol = src.protocol;
            u.host = src.host;
          }
          a.setAttribute("href", u.href);
        } catch (e) {
        }
      });
      element.querySelectorAll("*").forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("on") || n.startsWith("data-track") || n.startsWith("data-analytics") || n === "data-slick-index" || n === "aria-hidden" || n === "tabindex") {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/aetnastateflorida-sections.js
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

  // tools/importer/import-florida-home.js
  var PAGE_TEMPLATE = {
    "name": "florida-home",
    "urls": [
      "https://www.aetnastateflorida.com/"
    ],
    "representativeUrl": "https://www.aetnastateflorida.com/",
    "description": "Aetna State of Florida homepage: masthead photo carousel, three icon links, centered welcome/temporary ID card text, purple phone callout",
    "urlPattern": "/",
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          "div.masthead-container > section.masthead"
        ]
      },
      {
        "name": "cards-icon-centered",
        "instances": [
          "div.homepage-threeiconlinks"
        ]
      },
      {
        "name": "hero-callout",
        "instances": [
          "div.textbar-callout-purple"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Masthead carousel",
        "selector": [
          "div.masthead-container"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Three icon links",
        "selector": [
          "section:has(div.homepage-threeiconlinks)"
        ],
        "style": null,
        "blocks": [
          "cards-icon-centered"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "Welcome and temporary ID card",
        "selector": [
          "section:has(div.content-panel)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          "div.content-panel h3.bigtext-one",
          "div.content-panel p.text-section-p-big",
          "div.content-panel h3.text-section-h3:not(.bigtext-one)",
          "div.content-panel p.text-section-p",
          "div.content-panel center > a.button"
        ]
      },
      {
        "id": "section-4",
        "name": "Phone callout",
        "selector": [
          "div.textbar-callout-purple"
        ],
        "style": "purple",
        "blocks": [
          "hero-callout"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "cards-icon-centered": parse2,
    "hero-callout": parse3
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
  var import_florida_home_default = {
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
      WebImporter.rules.createMetadata(main, document2);
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
  return __toCommonJS(import_florida_home_exports);
})();
