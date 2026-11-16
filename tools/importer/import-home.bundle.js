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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-card.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const lastFromSrcset = (srcset) => (srcset || "").split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
    const bgUrl = (el) => {
      const style = (el.getAttribute("style") || "") + (typeof window !== "undefined" && window.getComputedStyle && el.ownerDocument === window.document ? `;${window.getComputedStyle(el).backgroundImage}` : "");
      const m = style.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m ? m[1] : "";
    };
    const media = [...element.children].find((c) => !c.querySelector(".hero-card")) || element;
    const srcImg = media.querySelector("img") || element.querySelector("img:not(.hero-card img)");
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
      const bgEl = [media, ...media.querySelectorAll("*")].find((el) => bgUrl(el));
      if (bgEl) src = bgUrl(bgEl);
    }
    if (src) {
      try {
        const u = new URL(src, "https://www.trinetaetna.com");
        const inner = u.pathname.startsWith("/_next/image") && u.searchParams.get("url");
        src = inner ? new URL(inner, "https://www.trinetaetna.com").href : u.href;
      } catch (e) {
      }
      const img = document2.createElement("img");
      img.src = src;
      const wrapperTitle = srcImg && srcImg.parentElement && srcImg.parentElement.getAttribute("title") || media.getAttribute("title");
      img.alt = (srcImg && srcImg.getAttribute("alt") || "").trim() || (srcImg && srcImg.getAttribute("title") || "").trim() || (wrapperTitle || "").trim() || "Women commuting together";
      cells.push([img]);
    } else {
      cells.push([""]);
    }
    const card = element.querySelector(".hero-card") || element;
    const contentCell = [];
    const srcH1 = card.querySelector("h1");
    if (srcH1) {
      const h1 = document2.createElement("h1");
      h1.textContent = srcH1.textContent.trim();
      contentCell.push(h1);
    }
    const srcSub = card.querySelector("h2, h3");
    if (srcSub) {
      const h2 = document2.createElement("h2");
      h2.textContent = srcSub.textContent.trim();
      contentCell.push(h2);
    }
    card.querySelectorAll("p").forEach((srcP) => {
      if (!srcP.textContent.trim()) return;
      const p = document2.createElement("p");
      p.innerHTML = srcP.innerHTML.trim();
      contentCell.push(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "Hero (hero-card)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-divider.js
  function parse2(element, { document: document2 }) {
    function copyInline(src, target) {
      src.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          target.append(document2.createTextNode(node.textContent));
          return;
        }
        if (node.nodeType !== 1) return;
        const tag = node.tagName.toLowerCase();
        if (tag === "a") {
          const a = document2.createElement("a");
          a.href = node.getAttribute("href") || "";
          a.textContent = node.textContent.trim();
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
    function buildList(srcList) {
      const list = document2.createElement(srcList.tagName.toLowerCase());
      srcList.querySelectorAll(":scope > li").forEach((srcLi) => {
        const li = document2.createElement("li");
        copyInline(srcLi, li);
        li.normalize();
        li.childNodes.forEach((n) => {
          if (n.nodeType === 3) n.textContent = n.textContent.replace(/\s+/g, " ");
        });
        if (li.firstChild && li.firstChild.nodeType === 3) li.firstChild.textContent = li.firstChild.textContent.replace(/^\s+/, "");
        if (li.lastChild && li.lastChild.nodeType === 3) li.lastChild.textContent = li.lastChild.textContent.replace(/\s+$/, "");
        const nested = srcLi.querySelector("ul, ol");
        if (nested) li.append(buildList(nested));
        list.append(li);
      });
      return list;
    }
    function buildColumn(col) {
      const out = [];
      const root = col.querySelector(".rich-text-markdown") || col;
      [...root.children].forEach((child) => {
        const tag = child.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          const h = document2.createElement(tag);
          h.textContent = child.textContent.trim();
          out.push(h);
        } else if (tag === "p") {
          if (!child.textContent.trim()) return;
          const p = document2.createElement("p");
          copyInline(child, p);
          p.innerHTML = p.innerHTML.trim();
          out.push(p);
        } else if (tag === "ul" || tag === "ol") {
          out.push(buildList(child));
        } else {
          const links = child.querySelectorAll("a[href]");
          if (links.length) {
            links.forEach((srcA) => {
              const p = document2.createElement("p");
              const strong = document2.createElement("strong");
              const a = document2.createElement("a");
              a.href = srcA.getAttribute("href");
              a.textContent = srcA.textContent.trim();
              strong.append(a);
              p.append(strong);
              out.push(p);
            });
          } else if (child.textContent.trim()) {
            const p = document2.createElement("p");
            copyInline(child, p);
            p.innerHTML = p.innerHTML.trim();
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
    function iconAlt(srcImg) {
      const alt = (srcImg.getAttribute("alt") || "").trim();
      if (alt) return alt;
      const src = srcImg.getAttribute("src") || "";
      const m = src.match(/^data:image\/svg\+xml;base64,(.+)$/);
      if (m) {
        try {
          const svg = atob(m[1]);
          const t = svg.match(/<title>([^<]+)<\/title>/i);
          if (t) return t[1].trim();
        } catch (e) {
        }
      }
      return "";
    }
    const cards = element.querySelectorAll(":scope > div.bg-gray-100");
    const cells = [];
    cards.forEach((card) => {
      const imageCell = [];
      const srcImg = card.querySelector("img");
      const srcSvg = !srcImg && card.querySelector("svg");
      if (srcSvg) {
        const svgClone = srcSvg.cloneNode(true);
        if (!svgClone.getAttribute("xmlns")) svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        const titleEl = svgClone.querySelector("title");
        const markup = svgClone.outerHTML;
        const img = document2.createElement("img");
        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(markup)))}`;
        img.alt = titleEl ? titleEl.textContent.trim() : "";
        imageCell.push(img);
      } else if (srcImg) {
        const img = document2.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = iconAlt(srcImg);
        imageCell.push(img);
      }
      const bodyCell = [];
      const title = card.querySelector(".title-font, h2, h3, h4");
      if (title && title.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = title.textContent.trim();
        bodyCell.push(h3);
      }
      const rich = card.querySelector(".rich-text-markdown");
      if (rich) {
        rich.querySelectorAll(":scope > p").forEach((srcP) => {
          if (!srcP.textContent.trim() || srcP.querySelector("a")) return;
          const p = document2.createElement("p");
          p.textContent = srcP.textContent.trim();
          bodyCell.push(p);
        });
      }
      card.querySelectorAll("a[href]").forEach((srcA) => {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.href = srcA.getAttribute("href");
        a.textContent = srcA.textContent.trim();
        strong.append(a);
        p.append(strong);
        bodyCell.push(p);
      });
      cells.push([imageCell.length ? imageCell : "", bodyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (cards-icon)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/trinetaetna-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "div.min-h-screen.flex > div:nth-child(1)",
        "#page-header",
        "#page-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "next-route-announcer",
        "#__next-route-announcer__",
        "iframe",
        "dialog",
        '[role="dialog"]',
        '[id*="cookie" i]',
        '[class*="cookie" i]',
        "#onetrust-consent-sdk"
      ]);
      element.querySelectorAll("section > p.text-3xl.font-bold").forEach((p) => {
        const h2 = element.ownerDocument.createElement("h2");
        h2.innerHTML = p.innerHTML;
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
        "source",
        "object",
        "embed"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach(({ name }) => {
          if (name.startsWith("on") || name === "data-tina-field" || name.startsWith("data-analytics") || name.startsWith("data-track") || name.startsWith("data-gtm")) {
            el.removeAttribute(name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/trinetaetna-sections.js
  var MARKER = "data-excat-section-id";
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
          if (isFirst) hr.setAttribute("data-excat-first", "true");
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
        } else {
          let next = hr.nextElementSibling;
          while (next && next.tagName !== "HR") next = next.nextElementSibling;
          if (next) next.before(meta);
          else hr.parentElement.append(meta);
        }
        if (sectionEl) sectionEl.removeAttribute(MARKER);
        if (hr) {
          if (hr.getAttribute("data-excat-first") === "true") hr.remove();
          else hr.removeAttribute(MARKER);
        }
      }
      element.querySelectorAll(`[${MARKER}]`).forEach((el) => el.removeAttribute(MARKER));
      element.querySelectorAll("hr[data-excat-first]").forEach((el) => el.remove());
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    name: "home",
    urls: [
      "https://www.trinetaetna.com/home"
    ],
    representativeUrl: "https://www.trinetaetna.com/home",
    description: "TriNet Aetna homepage: welcome banner, hero with overlapping text card, two-column member info, benefit icon cards",
    urlPattern: "/*",
    blocks: [
      {
        name: "hero-card",
        instances: [
          "main div.container:has(> div > .hero-card)"
        ]
      },
      {
        name: "columns-divider",
        instances: [
          "main section > div.container.md\\:flex-row"
        ]
      },
      {
        name: "cards-icon",
        instances: [
          "main section > div.container.flex-wrap:has(> div.bg-gray-100)"
        ]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Welcome banner",
        selector: [
          "main > div:has(> section.bg-aetna_primary-600)"
        ],
        style: "purple, center",
        blocks: [],
        defaultContent: [
          "section.bg-aetna_primary-600 div.text-center > p"
        ]
      },
      {
        id: "rc2",
        name: "Hero with overlapping text card",
        selector: [
          "main > div:has(.hero-card)"
        ],
        style: null,
        blocks: [
          "hero-card"
        ],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Member website / Already a member",
        selector: [
          "main > div:has(> section.bg-aetna_gray-50 > div.container.md\\:flex-row)"
        ],
        style: "light-grey",
        blocks: [
          "columns-divider"
        ],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Benefits and coverage",
        selector: [
          "main > div:has(> section.bg-white)"
        ],
        style: null,
        blocks: [
          "cards-icon"
        ],
        defaultContent: [
          "section.bg-white > p.text-3xl"
        ]
      }
    ]
  };
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
