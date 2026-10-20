# What is this

A personal university knowledge repository. Static, markdown-first, GitHub Pages ready.
Built with [Eleventy](https://www.11ty.dev/) (Nunjucks) and build-time [KaTeX](https://katex.org/).

# Main

1. Ask, don't assume. If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements. When running unattended, pick the most reasonable interpretation, proceed, and record the assumption rather than blocking.

2. Implement the simplest solution for simple problems, better solutions for harder problems. Do not over-engineer or add flexibility that isn't needed yet. 

3. Don't touch unrelated code but please do surface bad code or design smells you discover with me so we can address them as a separate issue.

4. Flag uncertainty explicitly. If you're unsure about something, see point 1 above. If it makes sense to do so, conduct a small, localised and low-risk experiment and bring the hypothesis and results to me to discuss. Confidence without certainty causes more damage than admitting a gap.

5. I'm always open to ideas on better ways to do things. Please don't hesitate to suggest a better way, or one that has long lasting impact over a tactical change. (as a few examples)

# Visualisations

When I ask for a visualisation (interactive or not):

1. Interactive: inline SVG and vanilla JS. One script per figure in `src/assets/js/figures/`, mounted on `<div class="fig" data-figure="name">`. Use canvas only if SVG is too slow. Ask before adding any library.

2. Static: Mermaid for diagrams, hand-written inline SVG for geometry and plots.

3. Style: use only the site's CSS variables (`--bg`, `--ink`, `--muted`, `--line`, `--accent`, `--fig-1`). No hardcoded colours. It must look right in light and dark. Thin lines, mono labels, rounded boxes, as in `.fig`.

4. One idea per figure, with few controls (slider, play, toggle). Place it next to the paragraph it explains.

5. Keep the maths in pure functions, apart from the drawing. Check the numbers against an independent calculation.

6. Add a `<noscript>` fallback and use native inputs. Respect reduced motion.

7. Verify before reporting: build, then screenshot in headless Edge in light, dark and a narrow width. Say what you did not check.

8. New figures go in draft pages until I approve them. `linear-approx.js` and `figure-showcase.md` are the reference.
