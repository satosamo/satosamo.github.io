// Reads src/_data/courses.yaml and renders it as markdown tables (Course List
// page) and as CSV (download). One source, two views.
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function load() {
  return yaml.load(fs.readFileSync(path.join(__dirname, "src/_data/courses.yaml"), "utf8")) || [];
}

function toMarkdown(programs = load()) {
  const out = [];
  for (const p of programs) {
    out.push(`## ${p.program}, ${p.institution}`, "");
    for (const t of p.terms) {
      const withType = t.courses.some((c) => c.type);
      out.push(`### ${t.year} · ${t.term}${t.status ? ` (${t.status})` : ""}`, "");
      out.push(`| Course | Code | ECTS |${withType ? " Type |" : ""}`, `| --- | --- | --- |${withType ? " --- |" : ""}`);
      for (const c of t.courses) {
        // wiki-links need an escaped pipe inside a table cell
        const name = c.notes ? `[[${c.notes}/about\\|${c.title}]]` : c.title + (c.recognised ? " †" : "");
        const title = c.sk ? `${name}<br>*${c.sk}*` : name;
        out.push(`| ${title} | ${c.code || ""} | ${c.ects ?? ""} |${withType ? ` ${c.type || ""} |` : ""}`);
      }
      out.push("");
    }
    if (p.note) out.push(p.note, "");
  }
  return out.join("\n");
}

// The metadata block at the top of a course's about page: every course whose
// `notes` folder is `folder` (a course page may cover several, e.g. (1)–(4)).
function toInfoMarkdown(folder, programs = load()) {
  const rows = [];
  for (const p of programs) {
    for (const t of p.terms) {
      for (const c of t.courses) {
        if (c.notes === folder) rows.push({ p, t, c, taken: `${t.term} ${t.year}${t.status ? ` (${t.status})` : ""}` });
      }
    }
  }
  if (!rows.length) return null;

  const where = [...new Set(rows.map(({ p }) => `${p.institution}, ${p.program}`))].join("; ");
  if (rows.length > 1) {
    const out = [`${where}.`, "", "| Course | Code | Taken | ECTS | Type |", "| --- | --- | --- | --- | --- |"];
    for (const { c, taken } of rows) {
      out.push(`| ${c.title}${c.sk ? `<br>*${c.sk}*` : ""} | ${c.code || ""} | ${taken} | ${c.ects ?? ""} | ${c.type || ""} |`);
    }
    return out.join("\n");
  }
  const { c, taken } = rows[0];
  const out = [`*${c.sk || c.title}*, ${where}.`, ""];
  if (c.code) out.push(`- **Code:** ${c.code}`);
  out.push(`- **Taken:** ${taken}`);
  if (c.ects != null) out.push(`- **ECTS:** ${c.ects}`);
  if (c.type) out.push(`- **Type:** ${c.type}`);
  return out.join("\n");
}

const CSV_HEADER = ["program", "institution", "year", "term", "status", "title", "title_sk", "code", "ects", "type", "recognised"];

function toCsv(programs = load()) {
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [CSV_HEADER.map(cell).join(",")];
  for (const p of programs) {
    for (const t of p.terms) {
      for (const c of t.courses) {
        rows.push([
          p.program, p.institution, t.year, t.term, t.status, c.title, c.sk, c.code, c.ects, c.type, c.recognised ? "yes" : "",
        ].map(cell).join(","));
      }
    }
  }
  // BOM so Excel reads the Slovak diacritics as UTF-8
  return "﻿" + rows.join("\r\n") + "\r\n";
}

module.exports = { load, toMarkdown, toInfoMarkdown, toCsv };
