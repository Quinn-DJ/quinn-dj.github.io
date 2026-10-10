# Agent Working Guide for This Repository

This file is for agents working in this repository, and it doubles as a quick project overview for humans. Read it before writing course notes, creating figures, or changing the site.

## 0. TL;DR

- Notes are a person's class notes, not generator output: Chinese-first with English terms in parentheses on first mention, then run the text through the humanizer-zh rules to remove AI traces.
- Decide what a figure explains before choosing its form: structure/process diagrams as SVG, comparisons as tables, interactivity as lightweight HTML plus vanilla JS. Pre-render formulas that live inside figures, and check both light and dark themes.
- The site is a Zensical static site with a single config file, `zensical.toml`. New pages must be added to the nav manually. `zensical build --clean` must pass, and pushing to `master` deploys to GitHub Pages.

## 1. Site Structure

```
quinn-dj.github.io/
├── zensical.toml              # single site config: nav, theme, plugins, Markdown extensions
├── requirements.txt           # build deps (zensical, mkdocs-material, pymdown-extensions, markdown-exec, numpy, matplotlib, Pillow)
├── docs/                      # content root (docs_dir)
│   ├── index.md               # homepage: custom HTML + inline <style>, hides navigation/toc
│   ├── coding/
│   │   ├── index.md
│   │   ├── oop/               # OOP: chapters 01-10 + index
│   │   ├── dsa/               # Data structures & algorithms: chap-01-07 + DS-1-10 homework reports + index
│   │   ├── ads/               # Advanced data structures & algorithm analysis: class01-03 + index + figures/
│   │   ├── pics/              # images
│   │   └── *.md               # standalone research notes: BPE, Verlet, three-body, Cholesky
│   ├── math/
│   │   ├── ode/               # ordinary differential equations
│   │   ├── numalg/            # numerical linear algebra: 01-07 + index
│   │   ├── convolution/       # article + diagrams/ (standalone HTML)
│   │   └── eml.md
│   ├── blog/                  # essays: index.md + posts/ + .authors.yml (blog plugin)
│   ├── links/index.md         # friend links
│   ├── tags.md                # tag index page (<!-- material/tags -->)
│   ├── stylesheets/           # extra.css, link.css, customize.css, rb234.css
│   ├── javascripts/           # extra.js, mathjax.js, rb234.js (katex.js is not enabled)
│   └── overrides/             # theme template overrides: main.html, partials/{meta,footer,copyright,comments}.html
├── tools/figures/             # figure generators: build-ads-figures.js, build-ads02-figures.js, build-ads03-figures.js
├── .github/workflows/docs.yml # build + deploy GitHub Pages
└── site/                      # build output (gitignored, never edit by hand)
```

### Page type conventions

| Type | Location | Front matter | Comments | Reference file |
|------|----------|--------------|----------|----------------|
| Course notes | `docs/coding/ads/class0N.md`, `docs/coding/dsa/chap-0N.md`, etc. | none | none | `class02.md`, `chap-03.md` |
| Course landing page | `index.md` in each course directory | none | none | `docs/coding/ads/index.md` |
| Articles (rendered by the blog plugin) | `docs/math/convolution/index.md`, `docs/blog/posts/*.md` | yes: `title` / `authors` / `comments` / `date` / `description` | giscus when `comments: true` | `docs/math/convolution/index.md` |
| Tag page / friend links | `docs/tags.md`, `docs/links/index.md` | depends | none |  |

Navigation rules:

- The nav is written by hand in `zensical.toml`; there is no auto-discovery. Adding one note means changing three places: create the `.md` file, add a nav entry in `zensical.toml`, and add an index entry in the series `index.md`.
- `use_directory_urls = true`, so use normal relative paths for internal links (`figures/xxx.svg`, `../oop/01-cpp-basics.md`).
- Front matter on articles feeds the blog plugin: URLs look like `{date}/{slug}`, reading time is estimated at 265 words per minute, and the author list lives in `docs/blog/.authors.yml`.

## 2. Zensical Usage and Site Mechanics

### Commands

```bash
zensical build --clean   # full build; always run after changing notes
zensical serve -o        # local preview, default localhost:8000
```

Current version is 0.0.47, installed at `~/.local/bin/zensical` (available on PATH). The repo's `.venv/` does not contain zensical, so do not use `.venv/bin/zensical`. Zensical only has three subcommands: `build`, `serve`, and `new`.

### Config layout (`zensical.toml`)

- `[project]`: site name, `site_url`, `docs_dir = "docs"`, `site_dir = "site"`, `extra_javascript` / `extra_css`, and `nav`.
- `[project.theme]`: `variant = "modern"` (Material for MkDocs theme), `custom_dir = "docs/overrides"`, `language = "zh"`, features (tabs/sections/instant/search, etc.), and three palettes (follow system / light indigo / dark slate black).
- `[project.plugins.*]`: `search` (zh + en, Chinese tokenization uses the `[\s\-\.]+` separator), `tags`, `blog`, `markdown-exec`.
- `[project.markdown_extensions]`: see section 4.
- `[project.extra]`: social links, `generator`, and the CI-injected `build_date`.

Theme customization and overrides:

- Extra CSS/JS must be registered in `extra_css` / `extra_javascript` to be loaded site-wide.
- `docs/overrides/` overrides theme templates: `main.html` pulls in meta tags, `partials/copyright.html` renders the "last updated" line (reads `config.extra.build_date`), and `comments.html` is the giscus integration.
- Pages can contain raw HTML directly (`md_in_html` is enabled). The homepage, tag page, friend links, and interactive components all rely on this.

Deployment pipeline (`.github/workflows/docs.yml`):

1. Triggered by a push to `master`.
2. `pip install -r requirements.txt`.
3. Inject `build_date` into `[project.extra]` using the last commit time (`TZ=Asia/Shanghai`).
4. `zensical build --clean`, upload `site/`, deploy to GitHub Pages.

Local builds do not inject `build_date`; an empty "last updated" line in the footer is expected. Do not patch it by editing `zensical.toml` locally.

Runtime dependency: MathJax 3 is loaded from the unpkg CDN, so pages with formulas need network access. Formulas do not render in an offline preview, and that is not a note-writing bug.

## 3. Note-Writing Approach (Summarized from Project Chats)

### 3.1 Positioning and tone

- Chinese-first, with English in parentheses on first mention of a key term: `AVL 树（AVL Trees）`, `黑高（black-height）`, `倒排索引（inverted index）`.
- Keep each course series internally consistent; do not force cross-series uniformity. Current styles:

  | Series | Top-level heading | Sections | Example |
  |--------|-------------------|----------|---------|
  | ADS | `# 第 N 讲：中文标题` | `## N. 中文（English）` + `### N.M 中文` | `class01.md` |
  | OOP | `# NN: 中文 (English)` | `## 中文` + `### 中文` | `04-operator-overloading.md` |
  | DSA | `# 第 N 章：中文` | `## 中文` (unnumbered) | `chap-06.md` |
  | Numerical linear algebra | `# NN: 中文` | `## 中文: $formula$` | `02-matrix-decomposition.md` |

- Notes must be directly usable for review and problem solving (the user works exercises such as 2-3 tree insertions and B+ tree true/false questions from these notes). Definitions, properties, procedures, edge cases, and complexity must all be findable, not just conclusions.

### 3.2 Structure template

Course notes (ADS is the representative pattern; adjust for other series per the table above):

```markdown
# 第 N 讲：中文标题

> Intro: what problem this lecture solves, how it connects to the previous one, and the one thing worth remembering.

---

## 1. Topic（English Term）

### 1.1 Definition and properties

> [!NOTE]
> **定义：xxx（English）**
>
> Content

Body: motivation and intuition first, then formalization, then procedures, with tables, figures, and code in between.

---

## 参考资料

1. Textbook: author, *title* (edition): chapter (pages).
2. A specific [OI Wiki](https://oi-wiki.org/) page, noting which part of the lecture it informed.
3. Course materials: the "xxx" slides / supplementary handout.
```

- Separate sections with `---`. When an anchor is needed, use attr_list: `## 3. 红黑树与 2-3-4 树 { #rb-234-tree }`.
- Articles (`math/convolution`, `blog/posts`) use front matter; the intro should say why you wrote it and how you understand it, not read like an abstract.
- Articles written by AI and not human-proofread should carry a `> [!WARNING]` AI disclaimer, following `docs/math/eml.md`.

### 3.3 Content rules

- Primary sources are the course slides and official materials. Textbooks and reliable online references (OI Wiki for implementation details) are welcome, but the references section must distinguish what came from the slides from what you added.
- Work through every example yourself. When slide numbers disagree with the source text, trust the definition and the source, and call out the discrepancy in your handoff message. Case in point: in class03 (inverted index), the slide matrix row for `a` and the posting count for `silver` did not match the four sample documents, so the notes used recomputed values, keeping prose and figures consistent.
- Answer "why" before "what" and "how." Motivate with counterexamples or data, for example the BST comparison of average search cost 6.5 / 3.5 / 3.1 for three insertion orders.
- Use tables for comparisons and mappings: property-by-property mapping, before/after operation views, and terminology tables.
- Reference sections as "1.1 节" in Chinese prose, never `§1.1`.
- Mark code blocks with a language fence (`cpp`, `python`, `r`, etc.), and only include code that actually runs. When borrowing an implementation, cite the source (for example OI Wiki) in the references.

### 3.4 Prose style (humanizer-zh hard rules)

Before writing, read an existing note in the same series and follow its vocabulary and sentence patterns. When editing someone else's draft, make the smallest possible change.

- Never add Chinese em dashes (`——`).
- Do not overuse bold. Reserve it for first-mention terms and callout headwords; no bold inside tables.
- No "本文旨在介绍……" style preambles, no closing zingers, no repeated summary at the end.
- Do not fall into "首先……其次……最后……" templates. Vary sentence length; short sentences and white space are fine.
- Avoid promotional language ("至关重要", "革命性的", "无缝的").
- Keep the author's voice and imperfections. Phrases like "套路是", "好让", "一直就是" read more like a person's notes than "该机制旨在实现".
- Before committing, grep as a self-check: `——` should be 0, `§` should be 0, bold density should not spike, and every "值得注意的是/综上所述/不言而喻" should be judged on whether it carries information or just fills space.

### 3.5 Figures and visualization

First ask whether a figure earns its place. Only draw things that are hard to explain in prose.

| What you need to show | Use | Existing examples |
|-----------------------|-----|-------------------|
| Structure, state, process (static) | Hand-written or script-generated SVG | `avl-*-rotation.svg`, `index-construction.svg`, `precision-recall.svg` |
| Data comparisons, statistical charts | Python generating SVG (not PNG) | No real example in the repo yet; historical plans discussed migrating from matplotlib to HTML/SVG |
| Simple comparisons and mappings | Markdown tables | Property/complexity comparison tables throughout the notes |
| Interactive concept demos | HTML + CSS + vanilla JS components, or standalone HTML + iframe | `rb234.js` + `rb234.css` + `class02.md`; `docs/math/convolution/diagrams/*.html` |
| Draft flowcharts / architecture | Mermaid code blocks (superfences custom fence is configured; not yet used in this project) |  |

SVG rules (from the `svg-math-figure` skill and this project's figure scripts):

- Give the root element `width`, `height`, and `viewBox` (pixel values). Do not reference external fonts, images, or scripts.
- Use `'LXGW WenKai'` as the first font in every figure's stack, followed by `'LXGW WenKai Screen'`, `'PingFang SC'`, `'Noto Sans SC'`, and a system sans stack. All ADS figure scripts set this. After changing fonts or styles, rerun the generators so every figure is rebuilt. An SVG loaded via `<img>` cannot use the site webfont, so viewers without the font installed fall back through the stack.
- Put both light and dark colors inside the figure's `<style>`, under `@media (prefers-color-scheme: dark)`, with a fixed class set (`.edge` / `.box` / `.txt` / `.lbl`). See `tools/figures/build-ads03-figures.js`.
- Formulas inside a figure cannot rely on the page MathJax (an SVG loaded via `<img>` is a standalone document). Use `<text>` + `tspan` for simple notation; for real formulas, pre-render them to vector paths with the `svg-math-figure` skill. Keep CJK labels in plain `<text>`, and declare `xmlns:xlink` on the root SVG.
- Add `role="img"` plus `aria-label` / `aria-labelledby`. Do not use `foreignObject`.
- The surrounding prose must explain how to read the figure. Figures are not decoration. See the "悬停或点选任意节点……" hint and the legend before the class02 section 3 widget.
- Put generators in `tools/figures/build-*.js` and commit outputs to `docs/<course>/figures/`. To change a figure, edit the script and rerun it; never hand-edit generated SVG.
- Render and inspect each figure in both light and dark mode before handing off (see the figure generator section, 4.3).

Interactive component rules (see `rb234`):

- Compute the layout in JS instead of hard-coding coordinates; the figure should follow the data.
- Adapt to the theme with CSS variables, overriding under `[data-md-color-scheme="slate"]`. Do not hard-code colors that only work in light mode.
- Use `aria-live="polite"` for status text, and test responsiveness at least at 320 and 736 pixels wide.
- Embed standalone HTML in prose with `<iframe src="diagrams/xxx.html" width="100%" height="..." style="border:none;"></iframe>`, with the height fixed per figure.

### 3.6 Workflow

1. Read the existing notes and `index.md` in the same series to fix style and placement. If the user provided slides or PDFs, read them first.
2. If figures are needed, write the generator first, rebuild every figure it owns, and inspect the output in both themes.
3. Write the body, verify every example yourself, and keep terms and sources explicit.
4. Run the text through the humanizer-zh rules.
5. `zensical build --clean`.
6. `zensical serve -o` and check in the browser: formulas, callouts, figures, dark mode, narrow screens.
7. Report what changed, where the notes disagree with the slides, and what verification was done.
8. After the user confirms, commit and push (pushing `master` deploys automatically and produces a build result).

### 3.7 Boundaries and lessons learned

- When the user says "restore the notes first, then add the new content," restore precisely first, then add. Do not edit other things along the way. This is how the class02 section 3 addition was handled.
- Check `git status` before starting. Do not touch files the user is editing, and do not mix unrelated changes into your commit.
- Course materials (`*.ppt`, `*.pptx`, `*.zip`, `*.pdf`, `docs/math/numalg/slides`) are gitignored and must not be committed. The only exception is `docs/math/ode/docs/ode.pdf`.
- Background decorations (the spider-web canvas, frosted-glass scrim, blue-purple dark palette) were tried and fully reverted. Do not add them back unilaterally; the site keeps the palette in `zensical.toml`.
- No large screenshots or PNGs in the repo. Figures should stay vector (SVG, HTML tables, or Mermaid); earlier R-note work replaced about 1.1MB of screenshots this way, and that conclusion still holds.

## 4. Tools You Can Use on the Site

### 4.1 Markdown and formatting (all enabled in `zensical.toml`)

| Tool | Syntax | Purpose |
|------|--------|---------|
| GitHub callouts | `> [!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!IMPORTANT]`, `[!QUOTE]`, `[!CAUTION]` | Site-wide callout style. The `!!!` syntax is supported but not used in this project. |
| Tables | Standard Markdown tables | Comparisons, mappings, terminology |
| attr_list | `{ #anchor }`, `{.class}` | Heading anchors and element classes |
| footnotes | `[^1]` | Footnotes and sources |
| def_list / abbr | Definition lists, abbreviations | Terms and abbreviations |
| pymdownx.\* | `mark`, `caret`, `tilde`, `keys`, `smartsymbols`, `critic`, `quotes`, `details`, `tabbed`, `tasklist`, `snippets`, `emoji` | Highlights, revisions, keys, collapsible blocks, tabs, task lists, snippet includes, emoji |
| Code blocks | cpp / python / r fences plus `pymdownx.highlight` | Line numbers, anchors, copy button, auto titles |
| toc | `toc_depth = 3`, `permalink = true` | Table of contents |
| Raw HTML | `<div>`, `<style>`, `<svg>` directly in Markdown | Homepage, tag page, friend links, interactive components |
| tags plugin | `tags` in front matter | Tag aggregation into `docs/tags.md` |

### 4.2 Math

- In note files, write `$...$` for inline math and `$$...$$` for display math.
- Pipeline: `pymdownx.arithmatex` (`generic = true`) wraps formulas in an `arithmatex` container, then `docs/javascripts/mathjax.js` plus the unpkg MathJax 3 build renders them at runtime.
- In chat replies, follow the global AGENTS.md rule and use `\(...\)` / `\[...\]`; only keep `$...$` when quoting file content.

### 4.3 Figures and interactivity

- Hand-written or Node-generated SVG (first choice; see 3.5).
- Standalone HTML files plus iframes (animation, complex layout).
- Site-wide components: `docs/stylesheets/*.css` and `docs/javascripts/*.js`, registered in `extra_css` / `extra_javascript`.
- Mermaid code blocks (wired up and ready).
- Python: scripts can generate figure files offline (`numpy` / `matplotlib` / `Pillow` are in `requirements.txt`). The `markdown-exec` plugin is enabled, but no page currently depends on it. Confirm the payoff before using it; build-time execution adds build time and an environment dependency.
- Comments: giscus, only rendered when a page has `comments: true` in front matter.

Figure generators:

- Every generated figure has a plain-Node script under `tools/figures/`. The general pattern is `node example.js`, or `node tools/figures/<script>.js` for a script in this repo. Scripts are safe to rerun and write SVG into `docs/coding/ads/figures/`.
- `build-ads-figures.js` owns `avl-min-nodes`, `avl-{rr,ll,lr,rl}-rotation`, `splay-{zig,zig-zag,zig-zig}`, and `bst-insert-order`. It also normalizes the font stack of every figure it touches to LXGW WenKai.
- `build-ads02-figures.js` owns the red-black tree and B+ tree figures.
- `build-ads03-figures.js` owns the inverted-index, index-construction, and precision-recall figures.
- Scripts use Node built-ins only, except `build-ads-figures.js`, which needs `mathjax-full` for formulas (search order: `$MATHJAX_FULL`, `~/.cache/tex2svg/node_modules/mathjax-full`, local `node_modules`).
- To pre-render a formula fragment for a figure: `node /Users/quinn/.agents/skills/svg-math-figure/scripts/tex2svg.js "n_{h-1}" --json`.
- To rasterize an SVG for a light/dark check with the bundled Node + sharp:

  ```bash
  NODE_PATH=/Users/quinn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
    /Users/quinn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node -e \
    "const s=require('sharp');s('docs/coding/ads/figures/rbtree-example.svg',{density:160}).png().toFile('/tmp/figure.png').then(()=>console.log('ok'))"
  ```

### 4.4 Verification and helper tools

| Tool | Command | Purpose |
|------|---------|---------|
| Zensical | `zensical build --clean` / `zensical serve -o` | Build and local preview |
| Node figure scripts | `node example.js` / `node tools/figures/<script>.js` | Regenerate the SVG figures a script owns (details in 4.3) |
| svg-math-figure skill | `node /Users/quinn/.agents/skills/svg-math-figure/scripts/tex2svg.js "n_{h-1}" --json` | Pre-render formulas for figures |
| Bundled Node + sharp | see 4.3 | Rasterize SVG to PNG for light/dark inspection |
| GitHub Actions | runs automatically after a push to `master` | Build and deploy; confirms the page is actually live |

Note: `build-ads-figures.js` needs `mathjax-full`. The script looks in `$MATHJAX_FULL`, then `~/.cache/tex2svg/node_modules/mathjax-full`, then the local `node_modules`. `build-ads02/03-figures.js` only use Node built-ins.

## 5. Tools You Cannot Use, and Things Not to Do

| Do not | Why | Instead |
|--------|-----|---------|
| Use arbitrary MkDocs plugins (for example `mkdocs-git-revision-date-localized-plugin`) | Zensical does not guarantee loading arbitrary MkDocs plugins; these dependencies were explicitly ruled out | For "last updated", inject `build_date` in CI and render it in `partials/copyright.html` |
| Pass `extra` values through environment variables | Zensical does not support it | Put them in `zensical.toml`, or have CI inject them before the build |
| Fetch data from the GitHub API in runtime JS | External dependency, slow, unavailable offline | Generate static content at build time |
| Use KaTeX (`katex.js` and the KaTeX CSS are commented out) | It duplicates MathJax, and two renderers conflict | Use MathJax consistently |
| Expect page MathJax, page CSS, external fonts, or scripts to work inside an SVG | An SVG loaded via `<img>` is a standalone document; external resources cannot reach it | Pre-render formulas to paths, put colors in the figure, use a system font stack |
| Use `foreignObject` | Inconsistent browser support | `<text>` + `tspan`, or pre-rendered SVG fragments |
| Hand-edit generated SVG / HTML output | The next script run overwrites it, and figure and script drift apart | Edit `tools/figures/build-*.js` and regenerate |
| Default to matplotlib PNGs as illustrations | Large files, poor dark-mode contrast, blurry on mobile; screenshots were the exact problem this rule came from | Generate SVG, or use HTML tables / Mermaid |
| Commit large screenshots, PDFs, PPTs, or zips | Bloats the repo, and course materials carry copyright and privacy concerns | Keep them local and gitignore them |
| Commit `site/` or `.venv/` | Build output and local environment, already gitignored | Leave them ignored |
| Add background decorations (canvas spider web, frosted-glass scrim) or change the palette unilaterally | These were tried and fully reverted; they hurt readability and mobile performance | Ask the user first, scrim the content layer, and degrade on small screens |
| Introduce frontend frameworks or bundlers | The site is plain static HTML/CSS/JS with no npm build chain | Vanilla JS; scripts use Node built-ins only |
| Commit or push with a failing build | CI deploys directly, which means shipping broken pages | Run `zensical build --clean` and preview locally first |

## 6. Common Commands

```bash
# Build and preview the site
zensical build --clean
zensical serve -o

# Git workflow
git status --short
git diff --stat
git log --oneline -5
git add <files>
git commit -m "docs(ads): ..."
git push origin master

# Check the deploy run triggered by the push
gh run list --limit 1

# Note-text self-checks
rg -n '——' docs/<changed files>   # should be empty
rg -n '§'   docs/<changed files>   # should be empty; write "N.M 节" instead
```

## 7. Pre-Commit Checklist

- [ ] Sources are explicit, every example was verified, and any disagreement with the slides is called out
- [ ] Key terms have English parentheses on first mention, and the series style is consistent
- [ ] The text passed the humanizer rules: no new `——`, no `§`, restrained bold usage
- [ ] New pages are registered in `zensical.toml` nav and linked from the series `index.md`
- [ ] Figures have generators, both themes were inspected, and in-figure formulas are pre-rendered
- [ ] Figures use `'LXGW WenKai'` as the first font and were regenerated after any font or style change
- [ ] `zensical build --clean` passes
- [ ] The local preview was checked for formulas, callouts, figures, dark mode, and narrow screens
- [ ] The change scope is reported clearly, and commit/push happens only after the user confirms
