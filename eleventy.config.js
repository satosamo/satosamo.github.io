const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const yaml = require("js-yaml");
const markdownIt = require("markdown-it");
const anchor = require("markdown-it-anchor");
const texmath = require("markdown-it-texmath");
const footnote = require("markdown-it-footnote");
const container = require("markdown-it-container");
const katex = require("katex");
const { HtmlBasePlugin } = require("@11ty/eleventy");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const site = require("./src/_data/site.json");

const PROD = !!process.env.ELEVENTY_PRODUCTION;

function prettify(slug) {
  const s = String(slug).replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function unescapeHtml(s) {
  return String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

/* ============================================================
   Content scan (config-time): powers wiki-links + backlinks.
   New files are picked up on dev-server restart.
   ============================================================ */
const CONTENT_DIR = path.join(__dirname, "src/content");
const pagesByStem = new Map();   // "physics/articles/relativity/constancy..." -> {stem,slug,url,title}
const pagesBySlug = new Map();   // "constancy..." -> [entries]
const backlinks = new Map();     // target stem -> [{title,url}]
const WIKILINK_RE = /\[\[([^\]|\n]+)(?:\|([^\]\n]+))?\]\]/g;

function scanContent() {
  const files = [];
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) files.push(p);
    }
  })(CONTENT_DIR);

  for (const f of files) {
    const raw = fs.readFileSync(f, "utf8");
    const stem = path.relative(CONTENT_DIR, f).replace(/\\/g, "/").replace(/\.md$/, "");
    const slug = stem.split("/").pop();
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    const titleMatch = fm && fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const draftMatch = fm && fm[1].match(/^draft:\s*true\s*$/m);
    if (PROD && draftMatch) continue;
    const entry = { stem, slug, url: `/${stem}/`, title: titleMatch ? titleMatch[1] : prettify(slug) };
    pagesByStem.set(stem, entry);
    if (!pagesBySlug.has(slug)) pagesBySlug.set(slug, []);
    pagesBySlug.get(slug).push(entry);
  }
  // second pass: backlink graph
  for (const f of files) {
    const raw = fs.readFileSync(f, "utf8");
    const stem = path.relative(CONTENT_DIR, f).replace(/\\/g, "/").replace(/\.md$/, "");
    const source = pagesByStem.get(stem);
    if (!source) continue;
    for (const m of raw.matchAll(WIKILINK_RE)) {
      const target = resolveWikilink(m[1].trim());
      if (target && target.stem !== stem) {
        if (!backlinks.has(target.stem)) backlinks.set(target.stem, []);
        const list = backlinks.get(target.stem);
        if (!list.some((x) => x.url === source.url)) list.push({ title: source.title, url: source.url });
      }
    }
  }
}
function resolveWikilink(target) {
  if (target.includes("/")) return pagesByStem.get(target.replace(/^\/|\/$/g, "")) || null;
  const hits = pagesBySlug.get(target) || [];
  if (hits.length > 1) {
    console.warn(`[wikilink] "${target}" is ambiguous (${hits.map((h) => h.stem).join(", ")}); using ${hits[0].stem}. Use the full path form [[${hits[0].stem}]] to disambiguate.`);
  }
  return hits[0] || null;
}
scanContent();

/* ============================================================
   Build-time Mermaid via Kroki, cached, with client fallback
   ============================================================ */
const KROKI_CACHE = path.join(__dirname, ".cache/kroki");
let krokiDown = false;
async function renderMermaid(code) {
  const hash = crypto.createHash("sha256").update(code).digest("hex").slice(0, 24);
  const cached = path.join(KROKI_CACHE, hash + ".svg");
  if (fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");
  if (krokiDown) throw new Error("kroki unavailable (cached failure)");
  const payload = zlib.deflateSync(Buffer.from(code, "utf8"), { level: 9 }).toString("base64url");
  const res = await fetch(`https://kroki.io/mermaid/svg/${payload}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`kroki ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const svg = await res.text();
  if (!svg.trimStart().startsWith("<svg")) throw new Error("kroki returned non-SVG");
  fs.mkdirSync(KROKI_CACHE, { recursive: true });
  fs.writeFileSync(cached, svg);
  return svg;
}
const MERMAID_FALLBACK_SCRIPT = `<script type="module">import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";mermaid.initialize({startOnLoad:true,theme:"neutral"});</script>`;

/* ============================================================ */

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // ---------- drafts: excluded entirely from production builds ----------
  eleventyConfig.addPreprocessor("drafts", "md", (data) => {
    if (data.draft && PROD) return false;
  });

  // ---------- markdown ----------
  const md = markdownIt({ html: true, typographer: true, linkify: true })
    .use(anchor, { permalink: false })
    .use(footnote)
    .use(texmath, {
      engine: katex,
      delimiters: "dollars",
      katexOptions: {
        throwOnError: false,
        macros: { "\\R": "\\mathbb{R}", "\\C": "\\mathbb{C}", "\\Z": "\\mathbb{Z}", "\\N": "\\mathbb{N}" },
      },
    });

  // theorem-style environments: ::: theorem Stokes ... :::
  const ENVS = ["theorem", "lemma", "proposition", "corollary", "definition", "example", "remark", "proof"];
  for (const name of ENVS) {
    md.use(container, name, {
      render(tokens, idx) {
        const t = tokens[idx];
        if (t.nesting === 1) {
          const info = t.info.trim().slice(name.length).trim();
          const label = name.charAt(0).toUpperCase() + name.slice(1);
          const named = info ? ` <span class="env-name">(${escapeHtml(info)})</span>` : "";
          return `<div class="env env-${name}"><p class="env-label">${label}${named}.</p>\n`;
        }
        return `</div>\n`;
      },
    });
  }

  // wiki-links: [[slug]], [[path/to/slug]], [[slug|display text]]
  md.inline.ruler.before("link", "wikilink", (state, silent) => {
    const src = state.src, pos = state.pos;
    if (src.charCodeAt(pos) !== 0x5b || src.charCodeAt(pos + 1) !== 0x5b) return false;
    const end = src.indexOf("]]", pos + 2);
    if (end === -1) return false;
    const inner = src.slice(pos + 2, end);
    if (inner.includes("\n") || inner.includes("[")) return false;
    if (!silent) {
      const bar = inner.indexOf("|");
      const target = (bar === -1 ? inner : inner.slice(0, bar)).trim();
      const label = bar === -1 ? null : inner.slice(bar + 1).trim();
      const resolved = resolveWikilink(target);
      if (resolved) {
        const open = state.push("link_open", "a", 1);
        open.attrs = [["href", resolved.url], ["class", "wikilink"]];
        const text = state.push("text", "", 0);
        text.content = label || resolved.title;
        state.push("link_close", "a", -1);
      } else {
        const tok = state.push("html_inline", "", 0);
        tok.content = `<span class="wikilink-missing" title="No page found for [[${escapeHtml(target)}]]">${escapeHtml(label || target)}</span>`;
      }
    }
    state.pos = end + 2;
    return true;
  });

  // mermaid fences -> placeholder (resolved by the transform below)
  const defaultFence = md.renderer.rules.fence.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim() === "mermaid") {
      return `<pre class="mermaid">${escapeHtml(token.content)}</pre>\n`;
    }
    return defaultFence(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addPlugin(syntaxHighlight);

  // ---------- mermaid transform: build-time SVG, client fallback ----------
  eleventyConfig.addTransform("mermaid", async function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) return content;
    if (!content.includes('<pre class="mermaid">')) return content;
    const re = /<pre class="mermaid">([\s\S]*?)<\/pre>/g;
    let out = "", last = 0, anyFallback = false, m;
    while ((m = re.exec(content)) !== null) {
      out += content.slice(last, m.index);
      try {
        const svg = await renderMermaid(unescapeHtml(m[1]).trim());
        out += `<figure class="diagram">${svg}</figure>`;
      } catch (e) {
        if (!krokiDown) console.warn(`[mermaid] build-time render unavailable (${e.message}); falling back to client-side rendering for this build.`);
        krokiDown = krokiDown || /fetch|network|timeout|abort|ENOTFOUND|ECONN|unavailable/i.test(String(e));
        out += m[0]; // keep source block for client-side mermaid
        anyFallback = true;
      }
      last = m.index + m[0].length;
    }
    out += content.slice(last);
    if (anyFallback) out = out.replace("</body>", MERMAID_FALLBACK_SCRIPT + "</body>");
    return out;
  });

  // ---------- static assets ----------
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/katex/dist/katex.min.css": "assets/katex/katex.min.css",
    "node_modules/katex/dist/fonts": "assets/katex/fonts",
  });

  eleventyConfig.addPlugin(HtmlBasePlugin);

  // ---------- Atom feed ----------
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "articles", limit: 20 },
    metadata: {
      language: "en",
      title: site.title,
      subtitle: site.subtitle,
      base: site.url,
      author: { name: site.author },
    },
  });

  // ---------- collections ----------
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/content/**/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("tagList", (api) => {
    const tags = new Set();
    for (const p of api.getFilteredByGlob("src/content/**/*.md")) {
      for (const t of p.data.tags || []) tags.add(t);
    }
    return [...tags].sort();
  });

  // the section tree (see DOCUMENTATION.md §9)
  eleventyConfig.addCollection("sectionNodes", (api) => {
    let orderCfg = {};
    try {
      orderCfg = yaml.load(fs.readFileSync(path.join(__dirname, "src/_data/order.yaml"), "utf8")) || {};
    } catch (e) {}

    const pages = api.getFilteredByGlob("src/content/**/*.md");
    const nodes = new Map();
    const ensure = (p) => {
      if (nodes.has(p)) return nodes.get(p);
      const n = { path: p, slug: p.split("/").pop() || "", subs: new Map(), articles: [] };
      nodes.set(p, n);
      if (p !== "") ensure(p.split("/").slice(0, -1).join("/")).subs.set(n.slug, n);
      return n;
    };
    ensure("");

    for (const pg of pages) {
      const stem = pg.page.filePathStem.replace(/^\/content\//, "");
      const parts = stem.split("/");
      const slug = parts.pop();
      ensure(parts.join("/")).articles.push({
        kind: "article",
        slug,
        title: pg.data.title || prettify(slug),
        url: pg.url,
        glyph: pg.data.glyph || null,
        summary: pg.data.summary || null,
        draft: !!pg.data.draft,
      });
    }

    const countArticles = (n) =>
      n.articles.length + [...n.subs.values()].reduce((a, c) => a + countArticles(c), 0);

    const out = [];
    const walk = (n, crumbs) => {
      const conf = orderCfg[n.path] || {};
      const title = conf.title || (n.path === "" ? "Home" : prettify(n.slug));
      const url = "/" + (n.path ? n.path + "/" : "");
      const sectionItems = [...n.subs.values()].map((s) => {
        const sc = orderCfg[s.path] || {};
        return {
          kind: "section", slug: s.slug,
          title: sc.title || prettify(s.slug),
          url: "/" + s.path + "/",
          glyph: sc.glyph || null, summary: sc.blurb || null,
          count: countArticles(s),
        };
      });
      const items = [...sectionItems, ...n.articles];
      const orderList = conf.order || [];
      items.sort((a, b) => {
        const ia = orderList.indexOf(a.slug), ib = orderList.indexOf(b.slug);
        if (ia === -1 && ib === -1) return a.title.localeCompare(b.title);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
      out.push({
        path: n.path, isRoot: n.path === "", title, url,
        glyph: conf.glyph || null, blurb: conf.blurb || null,
        count: countArticles(n), breadcrumbs: crumbs, items,
      });
      const next = [...crumbs, { title, url }];
      for (const it of items) if (it.kind === "section") walk(n.subs.get(it.slug), next);
    };
    walk(nodes.get(""), []);
    return out;
  });

  // ---------- filters ----------
  eleventyConfig.addFilter("parentNode", (nodes, filePathStem) => {
    const stem = String(filePathStem).replace(/^\/content\//, "").replace(/^\//, "");
    const dir = stem.split("/").slice(0, -1).join("/");
    return nodes.find((n) => n.path === dir);
  });

  eleventyConfig.addFilter("siblingNav", (nodes, filePathStem) => {
    const stem = String(filePathStem).replace(/^\/content\//, "").replace(/^\//, "");
    const parts = stem.split("/");
    const slug = parts.pop();
    const node = nodes.find((n) => n.path === parts.join("/"));
    if (!node) return {};
    const arts = node.items.filter((i) => i.kind === "article");
    const i = arts.findIndex((a) => a.slug === slug);
    if (i === -1) return {};
    return { prev: arts[i - 1] || null, next: arts[i + 1] || null };
  });

  eleventyConfig.addFilter("backlinksFor", (filePathStem) => {
    const stem = String(filePathStem).replace(/^\/content\//, "").replace(/^\//, "");
    return backlinks.get(stem) || [];
  });

  eleventyConfig.addFilter("readableDate", (d) => {
    if (!d) return "";
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);
  });

  eleventyConfig.addFilter("crumbPath", (url) =>
    String(url).split("/").filter(Boolean).slice(0, -1).map(prettify).join(" / ")
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
};
