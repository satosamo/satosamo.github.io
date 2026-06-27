# Compendium — Maintenance Documentation

Everything you need to keep this site running, growing, and looking the way you want. No prior Eleventy knowledge assumed.

---

## 1. Mental model

The site is generated from three inputs:

| Input | What it controls |
| --- | --- |
| `src/content/**` | The pages. Folders are sections, markdown files are articles. |
| `src/_data/order.yaml` | The *map*: tile order, section titles, glyphs, blurbs. |
| `src/_includes/` + `src/assets/` | How everything looks (templates, CSS, glyph SVGs). |

At build time, `eleventy.config.js` walks `src/content/`, builds a tree of every folder, and `src/sections.njk` emits an index page (the tile grid) for each node of that tree. Articles render through `layouts/article.njk`. You never write index pages by hand.

```
src/
├── _data/
│   ├── order.yaml          ← the map of the site (edit often)
│   └── site.json           ← title, subtitle, URL, author  ★ SET url BEFORE FIRST DEPLOY
├── _includes/
│   ├── glyphs/*.svg        ← tile decorations
│   └── layouts/            ← base / section / article templates
├── assets/
│   ├── css/style.css       ← all styling
│   └── js/                 ← theme toggle, Turing machine widget
├── content/                ← YOUR MARKDOWN LIVES HERE
│   └── content.11tydata.js ← layout + clean URLs + git dates for all content
├── sections.njk            ← generates one index page per folder
├── search.njk, tags.njk, tag-pages.njk, sitemap.njk, 404.njk, about.md
eleventy.config.js          ← tree builder, markdown pipeline, all features
.github/workflows/deploy.yml← CI: builds, indexes search, publishes
```

**One-time setup:** put your real site URL and name in `src/_data/site.json` (used by the Atom feed, sitemap, and footer), and your bio in `src/about.md`.

---

## 2. Writing: everything available in a markdown file

### Front matter

```markdown
---
title: Stokes' Theorem        # tile text + heading (falls back to filename)
summary: One sentence.        # tile + page subtitle + meta description
glyph: integral               # SVG from _includes/glyphs/ (optional)
tags: [geometry, topology]    # cross-section topics (optional)
draft: true                   # visible locally, EXCLUDED from deploys (optional)
---
```

### Math

`$...$` inline, `$$...$$` display — KaTeX, rendered at build time. Markdown is never run through the template engine, so LaTeX braces are always safe. Shorthand macros `\R \C \Z \N` are predefined; add more in `eleventy.config.js` under `katexOptions.macros`.

### Theorem-style environments

```markdown
::: theorem Stokes
Let $M$ be a compact oriented manifold …
:::

::: proof
Expand in coordinates …
:::
```

Available: `theorem`, `lemma`, `proposition`, `corollary`, `definition`, `example`, `remark`, `proof`. The word after the name becomes the parenthesized label. Proofs get an automatic ∎.

### Wiki-links and backlinks

- `[[vector-fields]]` → links to the article with that filename, using its title as text.
- `[[vector-fields|the flows article]]` → custom text.
- `[[mathematics/articles/algebra/vector-spaces]]` → full-path form; **required** when two files share a filename (ambiguity prints a build warning and picks one).
- Every article automatically shows a **"Linked from"** box listing pages that wiki-link to it.
- Unresolvable links render as dashed grey text instead of breaking — and note the link graph is scanned when the dev server **starts**, so links to a brand-new file need a server restart to resolve.
- Regular markdown links (`[text](/full/path/)`) always work too and need no restart.

### Code

Fenced blocks with a language get build-time syntax highlighting (Prism, themed to the site, both modes):

````markdown
```python
def f(x): ...
```
````

### Diagrams (Mermaid)

````markdown
```mermaid
flowchart LR
    A --> B
```
````

Rendered **at build time** to static SVG via the Kroki service (cached in `.cache/kroki/`, so each diagram is rendered once ever per change). If the build machine is offline, the build doesn't fail — those pages fall back to client-side Mermaid (a small script loads only on pages that need it) and a warning is printed. For category-theory-style commutative diagrams, draw in [quiver](https://q.uiver.app/) and embed the exported SVG as an image.

### Footnotes

`Some claim.[^1]` … `[^1]: The footnote text.` — rendered at the bottom with return links.

### Raw HTML / interactivity

HTML passes through markdown untouched, so a page can carry its own widget (see the Turing machine at the bottom of `turing-machines.md`: a `<div>` mount plus a `<script src="/assets/js/...js" defer>`). Keep scripts per-article; the site itself stays JS-free apart from the theme toggle.

---

## 2a. PDF pages

Drop a `.pdf` straight into `src/content/` anywhere a markdown file could go. It behaves like any other article **everywhere except its own page**: it gets a tile in its folder's grid (eyebrow reads "PDF"), participates in `order.yaml`, sibling prev/next, and is wiki-linkable as `[[filename]]`. Its page, however, is a thin wrapper that embeds the document and offers a switch to **open the raw file** (`Embedded ↔ Open raw file ↗`).

```
src/content/research/some-paper.pdf      ← the file (served at /research/some-paper.pdf)
src/content/research/some-paper.yaml     ← OPTIONAL sidecar, same basename
```

The page lives at the clean URL `/research/some-paper/`; the file itself is copied to `/research/some-paper.pdf`.

The sidecar is plain YAML (no `---` fences — it's not markdown) and every field is optional:

```yaml
title: A Sample Paper        # falls back to the prettified filename
summary: One sentence.       # tile + page subtitle (optional)
glyph: thesis                # SVG from _includes/glyphs/ (optional)
draft: true                  # visible locally, excluded from deploys (optional)
hide: true                   # excluded everywhere (optional)
```

Notes:
- No sidecar at all is fine — you just get a filename-derived title and no summary/glyph.
- PDFs are **not** in full-text search, the Atom feed, or `/tags/` (their text isn't markdown). They are tile-, order-, sibling-, and wiki-link-aware.
- Like wiki-link targets generally, a brand-new PDF needs a dev-server restart to be picked up (the content scan runs at startup).

## 3. The map: `order.yaml`

One file controls naming, ordering, and decoration of every tile grid. Each key is a folder path under `src/content/` (`""` = homepage).

```yaml
mathematics/articles/differential-geometry:
  title: Differential Geometry
  glyph: manifold
  blurb: Manifolds, forms, smooth structures.
  order:                  # top-left → bottom-right; mixes folders and files
    - differential-forms
    - vector-fields
```

- Slugs not listed appear after listed ones, alphabetically. Folders with no entry at all still work (prettified name, alphabetical).
- An article's `glyph`/`summary` come from its own front matter; a section's come from here.
- Renaming a file changes its URL **and** its slug — update its `order:` line and any `[[wiki-links]]` to it.

---

## 4. Tags

`tags: [geometry, logic]` in front matter creates `/tags/geometry/` etc. automatically, plus the `/tags/` index (linked in the footer). Tags are the cross-section axis — use them for topics that span fields (e.g. `quantum` across physics and chemistry). One reserved-word rule: don't use the tag names `all`, `articles`, `sectionNodes`, or `tagList` (they're internal collection names).

## 5. Search

Full-text search lives at `/search/` (header icon, or press `/` anywhere). The index is built by [Pagefind](https://pagefind.app/) as part of `npm run build` and on every deploy. The dev server alone doesn't index — the search page says so rather than erroring. Only article bodies are indexed (`data-pagefind-body` in the article layout).

## 6. Drafts

`draft: true` pages build locally (with a visible badge and a "Draft ·" tile marker) but are completely excluded from deployed builds — the workflow sets `ELEVENTY_PRODUCTION=1`. To preview production behavior locally: `ELEVENTY_PRODUCTION=1 npm run build`.

## 7. Dates

Articles show "Last updated" from their **latest git commit** (`git Last Modified`). Files not yet committed show the current date. This is automatic; don't add `date:` by hand unless you want to pin it.

## 8. Glyphs

Inline SVGs in `src/_includes/glyphs/` (15 included: `integral`, `wedge`, `manifold`, `vector`, `group`, `tape`, `lightcone`, `orbital`, `flask`, `thesis`, `compass`, `pen`, `rule`, `chip`, `plane`, `speech`). The contract for your own: 48×48 viewBox, strokes only, no colors, `pathLength="100"` on every shape (powers the draw-on-hover animation). A typo'd glyph name fails silently — the tile just has no graphic.

## 9. Look and feel

All colors are CSS variables at the top of `src/assets/css/style.css` — each defined for light and dark (in both the `prefers-color-scheme` block and the explicit `[data-theme]` blocks; change all occurrences). Syntax-highlight colors are the `--syn-*` variables; Pagefind UI inherits via `--pagefind-ui-*`. Fonts load from Google Fonts in `base.njk`. Layout knobs: tile width `minmax(250px, 1fr)`, tile height `min-height: 170px`, page width `920px`, prose `70ch`.

**Print:** every article has a print stylesheet — `Ctrl/Cmd-P` gives a clean ink-on-white PDF with chrome stripped and external URLs expanded.

## 10. Feeds, sitemap, 404, about

- `/feed.xml` — Atom feed of the 20 most recent articles (by git date). Requires `site.url` to be set.
- `/sitemap.xml` — all pages.
- `404.html` — served automatically by GitHub Pages on missing URLs.
- `/about/` — edit `src/about.md` (name, bio, contact). The footer carries the CC BY 4.0 license notice; swap the link and label there if you ever change license.

## 11. Running locally and deploying

```bash
npm install
npm run dev      # localhost:8080, live reload (no search index, drafts visible)
npm run build    # full production-shaped build incl. search index → _site/
```

Deploy = push to `main`. One-time: Settings → Pages → Source → "GitHub Actions". Base path (root site vs `/repo/` project site) is detected automatically. Custom domains: set in the Pages settings.

## 12. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| New page doesn't appear | Not under `src/content/`, or not a `.md`/`.pdf` file. The build log lists every page. New PDFs (like wiki-link targets) need a dev-server restart. |
| Tile in the wrong place | Slug in `order.yaml` doesn't match the filename (typo or rename). Unmatched slugs are ignored. |
| Math shows raw `$...$` | Unbalanced `$` or unsupported KaTeX command. Literal dollar: `\$`. |
| Wiki-link is grey/dashed | Target file doesn't exist, or was created after the dev server started (restart), or you need the full-path form. |
| "ambiguous" warning at build | Two files share a filename; use `[[full/path/to/file]]`. |
| Search empty locally | Expected — the index only exists after `npm run build`. |
| Diagram shows as code locally | Offline build; Kroki unreachable → client fallback kicked in (fine), or check the warning in the build log. Cached diagrams in `.cache/kroki/` keep working offline. |
| Draft leaked to the live site | The page lacked `draft: true`, or you bypassed the workflow. Stale local checks: `rm -rf _site` first — Eleventy doesn't delete old output files. |
| Styles/scripts broken on Pages but fine locally | Hardcoded URL without leading `/`. Always use absolute paths. |
| Build fails in CI only | `package-lock.json` not committed (`npm ci` needs it), or Node version drift (CI uses 20). |
| Date shows today for everything | Files not committed to git yet. Commit; dates come from `git log`. |

## 13. Reference: the machinery (for future you)

1. **Section tree** — the `sectionNodes` collection in `eleventy.config.js` walks content, merges `order.yaml`, sorts children (explicit order, then alphabetical), counts descendants, records breadcrumbs; `sections.njk` paginates over it to emit one index page per folder.
2. **Clean URLs** — `content.11tydata.js` computes permalinks by stripping `content/` from the file path.
3. **Wiki-links** — a config-time filesystem scan builds slug→URL and backlink maps (hence the restart caveat); a markdown-it inline rule renders the links; the `backlinksFor` filter feeds the layout.
4. **Mermaid** — a fence override emits `<pre class="mermaid">`; an async transform replaces each with Kroki-rendered SVG (sha-keyed disk cache) or, on failure, leaves the source and injects the client renderer once per page.
5. **Drafts** — an `md` preprocessor returns `false` for `draft: true` when `ELEVENTY_PRODUCTION` is set, removing the file from the build entirely.
6. **Filters** — `parentNode` (breadcrumbs), `siblingNav` (prev/next in `order.yaml` order), `backlinksFor`, `readableDate`, `crumbPath` (tag-tile eyebrows).

Touch points for extensions: add fields to node objects in the collection builder and consume them in `section.njk`.
