# Blog roadmap

Ideas for `blog.css` / the writing setup, ranked. Nothing here is committed to —
it's a queue to pull from, not a backlog to burn down.

**The constraint worth protecting:** plain hand-written HTML, no build step, no
dependencies to update. Most "make it richer" ideas quietly turn this into a
static-site generator. Everything below stays inside one CSS file plus small
inline scripts.

**The rule that keeps it fast:** every library is opt-in per post. The template
loads highlight.js behind a "drop these two lines if the post has no code"
comment. KaTeX, three.js and highlight.js together are ~1MB — no single post
should ever load all three.

---

## Tier 1 — DONE

All five shipped in `blog.css` + `js/enhance.js`, demoed in `styleguide.html#enhance`.

1. ~~**Live filter on cheatsheet tables.**~~ Shipped: `<table class="cheat filterable">`. The Vim post is a 60-row table. A search
   box that filters rows as you type: `class="cheat filterable"`. ~12 lines of JS.
   The one thing this blog needs that nobody else's does.
2. ~~**Copy button on code blocks.**~~ Shipped: automatic on every `<pre>`.
   Copies `innerText`, so the CSS-drawn `$` prompt is not included.
3. ~~**Dark mode.**~~ Shipped: system default, `[data-theme]` override, nav
   toggle, and a pre-paint `<head>` snippet so there is no white flash.
4. ~~**Auto-TOC + heading anchors.**~~ Shipped: `<div class="toc" data-auto>`
   fills itself; every `h2`/`h3` gets an id and a `¶`.
5. ~~**Social cards + description meta.**~~ Shipped in `blog/_template.html`.

> They were done in one pass, as planned. Script order matters and is fixed in
> both the template and the styleguide: highlight → lightbox → enhance, with
> the styleguide's snippet capture before all three.

## Tier 2 — real value, more work

- **Mermaid diagrams** for architecture and sequence diagrams. ~1MB, so load it
  only in posts that use it.
- **Line highlighting in code** (`data-hl="3,5"`) — dim everything but the lines
  under discussion. *Still open.*
- ~~**Sticky TOC sidebar**~~ Shipped: `class="toc stick"`, pure CSS.
- ~~**Print stylesheet.**~~ Shipped: hides nav/buttons/filters, inverts dark code
  blocks to ink-on-white, keeps tables and figures off page breaks.
- ~~**Prev/next + series navigation.**~~ Shipped: `.series`, commented into the
  template.
- **RSS feed.** Cheap only if `feed.xml` is hand-edited the way `blog.html` is.
  *Still open.*

## Tier 3 — mesmerising, heavier

- **Asciinema casts** — real recorded terminal sessions, replayable, selectable
  text. Self-hostable player, ~200KB.
- **Tabbed code groups** — the same config as YAML / Terraform / CLI.

## Explicitly skipped

Client-side site search (revisit around 20 posts), tag pages, reading time,
comments, and any real SSG. Solutions to problems this blog does not have yet.

---

# Interactive / mathematical posts

For control theory, chaos theory, linear algebra, three.js and visualization
content. The crossover is the thesis: an autoscaler *is* a feedback controller,
a retry storm *is* a nonlinear map. That intersection is underwritten.

## Item zero: math rendering

**Status: container and `.eqn` shipped; the library is deliberately not
vendored** — import it per post from the snippet in the template footer.

**KaTeX, not MathJax.** Self-hosted (~270KB), renders synchronously with no
layout flash, and its auto-render extension turns `$...$` and `$$...$$` into
math with two script lines — same opt-in pattern as highlight.js. Add a numbered
`.eqn` block for equations referenced by number. Control theory and linear
algebra are unwritable without this.

## One interactive-figure convention

**Status: shipped** as `figure.sketch` — stage, controls row, caption, themed
sliders and buttons. Only the per-post maths is left to write. The shared rAF
helper is still open.

Not a framework — a convention, reused:

```html
<figure class="sketch">
  <canvas></canvas>
  <div class="controls"><!-- range inputs, a readout, a reset --></div>
  <figcaption>…</figcaption>
</figure>
```

The reusable part in `blog.css` is small (~40 lines): `input[type=range]` styled
in the site teal, a mono numeric readout, play/pause and reset buttons,
consistent aspect ratio and caption. Every interactive figure then looks like it
belongs to the same body of work.

**The one shared JS helper worth building (~20 lines):** a requestAnimationFrame
loop that pauses when the figure scrolls off-screen and respects
`prefers-reduced-motion`. Without it, every animated post quietly drains
laptops in background tabs. The actual math stays per-post.

## Per-topic tooling

| Topic | Tool | Why |
|---|---|---|
| Chaos theory | Raw canvas, no library | A bifurcation diagram is "plot two million points"; a Lorenz projection is a polyline. A charting library is pure overhead. Cheapest *and* most striking. |
| Control theory | Raw canvas, then uPlot (45KB) | Start raw; add uPlot the first moment axis ticks become annoying. |
| Linear algebra | 2D canvas | The 3Blue1Brown move — a grid transformed by a matrix, draggable basis vectors — is a canvas and some interpolation. |
| 3D / three.js | three.js (~600KB), lazy | Load only in posts that use it, init on scroll-into-view, cap device pixel ratio. Always ship a static image fallback — it doubles as the blog index thumbnail. |

**Consistent colormap.** One perceptually-uniform ramp harmonized with the teal,
used across every plot. Small thing; it's what makes a set of figures read as a
body of work rather than assorted demos.

## Two free polish items

- ~~`<details>` "show the code that made this figure"~~ Shipped as
  `<details class="src">`.
- ~~A **full-bleed figure** class.~~ Shipped as `class="bleed"`.

## Skipped here

MathJax, Plotly, D3 (for these use cases), any front-end framework, a physics
engine, and emphatically a plugin system for figures. Also: no shared
"visualization library" until three posts exist and the repetition is visible.

## First post to prove the system

**"Your autoscaler is a PID controller and that's why it oscillates."**
Interactive step response, three sliders. Simultaneously SRE content and control
theory — it states the blog's thesis in one post.

---

# Electronics / hardware posts

Circuits and boards are not a fifth topic — they close the loop on the other
four. The unifying claim: the same control and chaos maths shows up in
Kubernetes and in copper.

## The anchor post: Chua's circuit

A handful of op-amps, two capacitors and an inductor producing a **double-scroll
chaotic attractor** that can be photographed on a scope. One post that is chaos
theory, electronics and 3D visualization at once: scope photos of the real
circuit beside the same attractor rotating in three.js, driven by the same
equations.

The companion: build a temperature controller, show the overshoot on a scope,
and note it is the *identical* PID maths as the autoscaler post —
"control theory, demonstrated once in Kubernetes and once in copper."

## Language packs still missing

The vendored `js/highlight.min.js` already covers `c` and `cpp`, so firmware
posts work today. Missing and worth adding the same way `dockerfile` and
`nginx` were (1–2KB each): `verilog`, `vhdl`, `arduino`, `x86asm`.

## Cheap and high-value

**Status: all four shipped** (containers only for WaveDrom — import the library
per post).

- **WaveDrom** for digital timing diagrams — I2C/SPI/UART from a small JSON blob
  in a `<script>` tag. Tiny, opt-in, exactly what embedded posts need.
- **Annotated board photos** — numbered markers absolutely positioned over a
  photo, with a matching legend list. ~20 lines of CSS, and it is how every good
  hardware writeup explains a board.
- ~~**Image zoom via native `<dialog>`**~~ Shipped as `js/lightbox.js`, with a
  `.gallery` grid and `a.zoom` for single images.
- ~~**`.bom` and `.specs` table variants**~~ Shipped.

## Worth the setup

- **SchemDraw** (Python) generating schematics as SVG *at build time*, committed
  to the repo. Consistent house style, no runtime cost, and it pairs with the
  `<details>` "show the code that made this figure" idea — for a schematic that
  is genuinely delightful.
- **KiCad Interactive BOM** plugin emits a self-contained HTML file with a
  clickable board ↔ BOM cross-highlight. Drop it in as a linked page.
- **Gerbers → SVG** with tracespace, at build time, for layer views.

## Heavier but mesmerising

- **3D PCB in three.js** from a KiCad glTF export. Reuses the three.js work the
  visualization posts already need.
- **A live circuit simulator embed** (falstad/circuitjs, self-hosted) for the one
  post where the reader tweaking R and C *is* the point. Megabytes — exactly one
  post, never the default.

## Skipped here

A homegrown schematic editor, a component database, WebSerial/WebUSB gimmicks,
and live scope streaming. Precompute with ngspice and plot the results instead —
the reader cannot tell, and the page stays 50KB.
