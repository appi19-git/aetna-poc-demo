# Two-Site Aetna Migration Plan: Exact Headers and Footers, plus the TriNet Homepage Redo

**Sites:**
- Aetna State of Florida: https://www.aetnastateflorida.com/ (already migrated, shown as the homepage)
- TriNet Aetna: https://www.trinetaetna.com/home (to be redone from scratch at `/home`)

**Mode:** this is a plan only. Running it needs Execute mode.

## Goal
1. **Top priority (your latest request):** replace the starter template's header, navigation and footer with exact copies of each original site's. Florida pages show the Aetna State of Florida header and footer. TriNet pages show the TriNet Aetna header and footer. "Exact" means the same logo, menu items and order, link targets, mobile menu, footer columns, social icons, legal and language-assistance text, and copyright line.
2. Re-migrate the TriNet Aetna homepage from scratch, with reusable blocks, responsive layout, preserved links and PDFs, and no changes to benefit information.
3. Finish the Florida design pass you asked for earlier.

## Decisions (from your answers)
- **Redo TriNet from scratch.** Analysis, blocks, mapping, import scripts and content are all regenerated.
- **Separate header and footer per site.** Each page points to its own site's header and footer through its page settings (metadata). The project's header and footer code already supports this.

## What I found
- Both pages currently show the starter template: a "Boilerplate" logo, "Example Content / Getting Started / Documentation" menus, and an Adobe copyright footer. Nothing from either original site has been migrated into the header or footer yet.
- The header and footer code each read an optional page setting naming which header or footer page to load. Without it, they fall back to the default (the starter content).
- **Preview caveat:** the default header and footer in the local preview are the starter ones. Before choosing the header and footer page locations for each site, I'll confirm which paths the preview actually loads and pick locations that work both in the preview and on the published site.

## Approach

### 1. Prepare (keep both sites safe)
- Back up the current Florida analysis files, the old TriNet page, and the starter header and footer pages to the migration work area.
- Keep the `florida-home` page template and add `trinet-home` next to it, so the two never collide.

### 2. Headers and footers matching each original site (first priority)
For each site, migrate the header (navigation) and the footer by comparing the original at desktop and mobile widths:

**Aetna State of Florida**
- **Header:** the Aetna logo with the "State of Florida" title text, the main menu items in their original order and with their original links, and the mobile menu (hamburger) behavior.
- **Footer:** the Aetna logo linking to aetna.com, every footer link column, the social icons (Facebook, Twitter, YouTube, LinkedIn), the language-assistance link and icon, the legal and disclaimer text, and the copyright line. All links and PDF references point where they did before.

**TriNet Aetna**
- **Header:** the Aetna/TriNet logo and the navigation menu with its original items, any dropdowns and links, plus the mobile menu.
- **Footer:** all footer links, the legal text and the copyright line from the original page footer, with links kept exactly.

**For both sites:**
- Give each site its own header and footer pages, and set each homepage to load its own.
- Style the header and footer to match the originals: logo size, colors (Aetna purple), menu typography, spacing, and footer layout on desktop, tablet and mobile.
- Hover, dropdown and mobile-menu behavior matches each original. Menus can be opened with the keyboard and closed with Escape.
- Footer and menu text is copied word-for-word. Legal and benefit wording is never rewritten.

### 3. TriNet homepage pipeline (redo)
1. **Project setup:** confirm Document Authoring is recorded.
2. **Page template:** classify the TriNet URL into `trinet-home`, merged in next to `florida-home`.
3. **Page analysis:** fresh analysis, reusing existing blocks wherever they're at least 80% similar. Expected sections:
   - Purple welcome banner
   - Hero photo with an overlapping text card
   - Two-column member info with a divider
   - "Benefits and coverage" heading with three icon cards
4. **Blocks:** generate or update only what TriNet needs (hero, columns, cards). Florida's blocks stay unchanged.
5. **Block mapping:** TriNet selectors and section styles (purple + center, light-grey).
6. **Import scripts:** new TriNet converters and a dedicated import script.
   - Turn the inline benefit icons into reusable icon files.
   - Point relative links at `https://www.trinetaetna.com/...`. External links (Aetna member login, login.TriNet.com) stay unchanged.
   - Set the page to load TriNet's own header and footer.
7. **Content import:** import the page to `/home` and pass the text-completeness check (≥ 90%).

### 4. Section styles and design
- Add the TriNet "light-grey" and "center" section styles. Check that "purple" fits both the TriNet banner and the Florida phone banner, and split it into per-site variations if needed.
- Run the Florida design migration: fonts, colors, button styles and spacing.
- Offer the same design pass for TriNet afterwards.

### 5. Verify in the preview
- Compare both pages with their originals at 1280px (desktop), about 800px (tablet) and 390px (mobile).
- Check the header and footer on each page: right logo, menu items, links, mobile menu, footer columns and social icons.
- Check the main content: blocks load, images show, no sideways scrolling, links and PDFs are correct.

## Checklist
- [ ] Back up the Florida analysis files, the old TriNet page, and the starter header and footer pages
- [ ] Confirm how the preview resolves header and footer pages, and choose per-site locations that also work once published
- [ ] Migrate the Aetna State of Florida header (logo, "State of Florida" title, menu, mobile menu) to match the original exactly
- [ ] Migrate the Aetna State of Florida footer (logo, link columns, social icons, language assistance, legal text, copyright) to match the original exactly
- [ ] Set the Florida homepage to load the Florida header and footer
- [ ] Migrate the TriNet Aetna header (logo, menu with any dropdowns, mobile menu) to match the original exactly
- [ ] Migrate the TriNet Aetna footer (links, legal text, copyright) to match the original exactly
- [ ] Style both headers and footers for desktop, tablet and mobile, and check keyboard and Escape handling for the menus
- [ ] Classify the TriNet URL into a new `trinet-home` template, keeping `florida-home`
- [ ] Run a fresh page analysis of https://www.trinetaetna.com/home
- [ ] Generate or update the hero, columns and cards styles for TriNet without changing Florida's
- [ ] Map TriNet blocks and sections (purple + center, light-grey)
- [ ] Build the TriNet converters and import script (reusable icon files, absolute links, TriNet header and footer settings)
- [ ] Import the TriNet page to `/home` and pass the completeness check (≥ 90%)
- [ ] Add the light-grey and center section styles, and check purple for both sites
- [ ] Run the design migration for the Florida page
- [ ] Compare both pages with their originals in the preview at desktop, tablet and mobile widths
- [ ] Report the results, with any content discrepancies for the content owner (such as the Florida TDD number mismatch), and offer the TriNet design pass

## Constraints and notes
- All changes are local only. Nothing is uploaded to Document Authoring, previewed or published unless you ask for that explicitly.
- Header, footer, legal and benefit text is copied word-for-word. Source typos and inconsistencies are kept and reported.
- The project's core script file is not edited. Header and footer changes go in the project's own header and footer blocks and styles.
- Execution needs Execute mode. Switch to it and I'll start with the headers and footers.
