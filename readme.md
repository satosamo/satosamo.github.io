# Compendium

A personal university knowledge repository. Static, markdown-first, GitHub Pages ready.
Built with [Eleventy](https://www.11ty.dev/) (Nunjucks) and build-time [KaTeX](https://katex.org/).

Features: auto-generated section index pages · one-file ordering (`order.yaml`) · full-text search (Pagefind, press `/`) · theorem/proof environments · `[[wiki-links]]` with backlinks · build-time Mermaid diagrams · tags · syntax highlighting · footnotes · drafts (`draft: true`, excluded from deploys) · git-based "last updated" · prev/next navigation · Atom feed · sitemap · 404 · print stylesheet · dark/light themes · per-article interactive widgets (see the Turing machine).

**Before first deploy:** set your URL and name in `src/_data/site.json` and edit `src/about.md`. Full reference in [DOCUMENTATION.md](DOCUMENTATION.md).

## The three things you'll actually do

### 1. Add a page

Drop a markdown file anywhere under `src/content/`. That's it.

```
src/content/physics/articles/relativity/time-dilation.md
```

```markdown
---
title: Time Dilation
summary: One line shown on the tile and under the heading.   # optional
glyph: lightcone                                             # optional
---

Moving clocks run slow: $\Delta t = \gamma\, \Delta\tau$.

$$\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}$$
```

- The URL mirrors the folder: `/physics/articles/relativity/time-dilation/`.
- Every folder in the path gets an **auto-generated index page of tiles** — you never write index pages.
- Create a new folder and it becomes a new section automatically (so "others" is just `mkdir`).
- Math: `$...$` inline, `$$...$$` display. Rendered at build time — no JS math on the live site.
- Markdown files are *not* run through the template engine, so LaTeX braces are always safe.

### 2. Reorder / rename / decorate tiles

One file: **`src/_data/order.yaml`**. Each key is a folder path; `order` lists its tiles top-left to bottom-right. Moving *Differential Forms* above *Vector Fields* is swapping two lines:

```yaml
mathematics/articles/differential-geometry:
  title: Differential Geometry
  glyph: manifold
  blurb: Manifolds, forms, and smooth structures.
  order:
    - differential-forms
    - vector-fields
```

Anything not listed appears after the listed items, alphabetically. Folders absent from the file still work — prettified name, alphabetical order.

**Glyphs** are inline SVGs in `src/_includes/glyphs/` (12 starters included: `integral`, `wedge`, `manifold`, `vector`, `group`, `tape`, `lightcone`, `orbital`, `flask`, `thesis`, `compass`, `pen`, `rule`). To add your own, copy any of them as a template: 48×48 viewBox, strokes only, and put `pathLength="100"` on each path — that powers the draw-on-hover animation. Reference it by filename in `order.yaml` (for sections) or in a page's front matter (for articles).

### 3. Deploy

Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds and publishes. One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**. The base path is detected automatically, so it works both as `username.github.io` and as a project site at `username.github.io/repo`.

## Local development

```bash
npm install
npm run dev      # live-reloading server at localhost:8080
npm run build    # output in _site/
```

## Layout

```
src/
  _data/order.yaml        ← the map of the site (titles, order, glyphs, blurbs)
  _data/site.json         ← site title + subtitle
  _includes/glyphs/       ← your SVG decorations
  _includes/layouts/      ← base / section / article templates
  assets/css/style.css    ← all styling (design tokens at the top)
  content/                ← your markdown lives here, folders = sections
  sections.njk            ← generates an index page for every folder
eleventy.config.js        ← builds the section tree, KaTeX, ordering
```

## Theming

Auto light/dark via `prefers-color-scheme`, with a toggle in the header (persisted in `localStorage`). All colors are CSS variables at the top of `style.css` — change six hex values to retheme.
