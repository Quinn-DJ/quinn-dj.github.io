#!/usr/bin/env node
/**
 * 生成 docs/coding/ads/figures 里带公式的 SVG 图，并把图内字体统一成 LXGW WenKai。
 *
 *   - avl-min-nodes.svg：整张图重画，公式用 MathJax 预渲染成矢量路径
 *   - avl-{rr,ll,lr,rl}-rotation.svg：把方框标签 A_L / B_R 换成排版好的公式
 *   - splay-{zig,zig-zag,zig-zig}.svg：把方框里的子树字母换成数学斜体
 *   - bst-insert-order.svg：只统一字体，图里没有公式
 *
 * 依赖 mathjax-full（离线把 TeX 渲染成 SVG 路径，图里不带任何运行时脚本）。
 * 任选一种装法：
 *   npm install mathjax-full@3.2.2
 *   # 代理环境下 npm 报证书错误时取 tarball：
 *   mkdir -p ~/.cache/tex2svg/node_modules/mathjax-full
 *   curl -L https://registry.npmmirror.com/mathjax-full/-/mathjax-full-3.2.2.tgz -o /tmp/mathjax-full.tgz
 *   tar -xzf /tmp/mathjax-full.tgz -C ~/.cache/tex2svg/node_modules/mathjax-full --strip-components=1
 *
 * 用法：node tools/figures/build-ads-figures.js
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');
const EX = 7;        // 1ex = 7px，公式字号约 16px
const CJK = 15;      // 中文标签字号，全角字宽等于 1em
const GAP = 4;       // 中文与公式之间的间距

/** 图内统一字体：LXGW WenKai 优先，缺失时按后备栈回退 */
const FONT_OLD = "ui-sans-serif,-apple-system,'PingFang SC','Noto Sans SC',Arial,sans-serif";
const FONT_NEW = "'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif";

function mathjaxRoot() {
  const tries = [
    process.env.MATHJAX_FULL,
    path.join(os.homedir(), '.cache/tex2svg/node_modules/mathjax-full'),
    path.join(__dirname, 'node_modules/mathjax-full'),
    path.join(process.cwd(), 'node_modules/mathjax-full'),
  ].filter(Boolean);
  for (const p of tries) {
    if (fs.existsSync(path.join(p, 'package.json'))) return p;
  }
  console.error('找不到 mathjax-full，见脚本头部注释里的安装方式。');
  process.exit(2);
}

const root = mathjaxRoot();
const {mathjax} = require(path.join(root, 'js/mathjax.js'));
const {TeX} = require(path.join(root, 'js/input/tex.js'));
const {SVG} = require(path.join(root, 'js/output/svg.js'));
const {liteAdaptor} = require(path.join(root, 'js/adaptors/liteAdaptor.js'));
const {RegisterHTMLHandler} = require(path.join(root, 'js/handlers/html.js'));

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const doc = mathjax.document('', {
  // AllPackages 需要 mhchemparser，手动装 tarball 时没有，base + ams 够用
  InputJax: new TeX({packages: ['base', 'ams']}),
  OutputJax: new SVG({fontCache: 'local'}),
});

/** 渲染一个公式，返回 viewBox / 像素宽高 / 基线深度 / 内部标记 */
function math(tex, display = false) {
  const node = doc.convert(tex, {display, em: 16, ex: EX});
  const outer = adaptor.outerHTML(node);
  const svg = outer.slice(outer.indexOf('<svg'));
  const open = svg.match(/<svg([^>]*)>/)[1];
  const num = (re) => {
    const m = open.match(re);
    return m ? parseFloat(m[1]) : 0;
  };
  const va = open.match(/vertical-align:\s*(-?[\d.]+)ex/);
  return {
    viewBox: open.match(/viewBox="([^"]+)"/)[1],
    width: num(/width="([\d.]+)ex"/) * EX,
    height: num(/height="([\d.]+)ex"/) * EX,
    depth: va ? -parseFloat(va[1]) * EX : 0,
    inner: svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>')),
  };
}

/** 嵌套 <svg>，x 是左边缘，yCenter 是垂直中心 */
function place(m, x, yCenter, cls = 'mj') {
  const k = (v) => Number(v).toFixed(2);
  return `<svg class="${cls}" x="${k(x)}" y="${k(yCenter - m.height / 2)}" ` +
    `width="${k(m.width)}" height="${k(m.height)}" viewBox="${m.viewBox}" role="img">${m.inner}</svg>`;
}

/** 一行「中文 + 公式」，整体在 cx 居中 */
function mixedLine(parts, cx, y, cls = 'mj') {
  let total = 0;
  parts.forEach((p, i) => {
    total += p.text ? p.text.length * CJK : p.math.width;
    if (i) total += GAP;
  });
  let x = cx - total / 2;
  const out = [];
  parts.forEach((p, i) => {
    if (i) x += GAP;
    if (p.text) {
      out.push(`<text class="lb" x="${x.toFixed(2)}" y="${y}">${p.text}</text>`);
      x += p.text.length * CJK;
    } else {
      out.push(place(p.math, x, y, cls));
      x += p.math.width;
    }
  });
  return out.join('\n  ');
}

function buildMinNodes() {
  const TL = math('T_L'), TR = math('T_R');
  const h1 = math('h-1'), h2 = math('h-2');
  const n1 = math('n_{h-1}'), n2 = math('n_{h-2}');
  const formula = math('n_h = n_{h-1} + n_{h-2} + 1', true);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="720" height="330" viewBox="0 0 720 330" role="img" aria-label="高度为 h 的高度平衡树最少节点数的结构">
  <style>
    .edge{stroke:#5f6368;stroke-width:1.8;fill:none}
    .n{fill:#eef1ff;stroke:#3f51b5;stroke-width:2}
    .t{fill:#1f2330;font-family:'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif;font-size:19px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .lb{fill:#3c4043;font-family:'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif;font-size:15px;font-weight:500}
    .box{fill:#f4f5f7;stroke:#9aa0a6;stroke-width:1.6}
    .mj{color:#3c4043}
    .mjcap{color:#3f51b5}
    @media (prefers-color-scheme: dark){
      .edge{stroke:#9aa0a6}
      .n{fill:#2a2f4a;stroke:#9fa8da}
      .t{fill:#e8eaf6}
      .lb{fill:#c7cad6}
      .box{fill:#262a3a;stroke:#7a7f8f}
      .mj{color:#c7cad6}
      .mjcap{color:#9fa8da}
    }
  </style>

  <line class="edge" x1="360" y1="60" x2="250" y2="170"/>
  <line class="edge" x1="360" y1="60" x2="470" y2="170"/>

  <rect class="box" x="205" y="170" width="90" height="100" rx="6"/>
  <rect class="box" x="425" y="170" width="90" height="100" rx="6"/>
  <circle class="n" cx="360" cy="60" r="27"/>
  <text class="t" x="360" y="61">A</text>

  ${mixedLine([{math: TL}], 250, 196)}
  ${mixedLine([{text: '高度'}, {math: h1}], 250, 221)}
  ${mixedLine([{text: '最少'}, {math: n1}], 250, 246)}

  ${mixedLine([{math: TR}], 470, 196)}
  ${mixedLine([{text: '高度'}, {math: h2}], 470, 221)}
  ${mixedLine([{text: '最少'}, {math: n2}], 470, 246)}

  ${place(formula, 360 - formula.width / 2, 305, 'mjcap')}
</svg>
`;
  fs.writeFileSync(path.join(FIG_DIR, 'avl-min-nodes.svg'), svg);
  return `avl-min-nodes.svg（${(svg.length / 1024).toFixed(1)} KB）`;
}

// 方框标签的两种写法：A_L 用 tspan 拼的下标，子树字母是单个字符
const SUB_RE = /<text class="lb" x="([\d.]+)" y="([\d.]+)">([A-Z])<tspan dy="5" font-size="13">([LR])<\/tspan><\/text>/g;
const LETTER_RE = /<text class="lb" x="([\d.]+)" y="([\d.]+)">([A-Z])<\/text>/g;

function ensureSvgBits(svg) {
  // MathJax 的字体缓存用 xlink:href 引用，根节点必须声明这个命名空间
  if (!svg.includes('xmlns:xlink')) {
    svg = svg.replace('<svg xmlns="http://www.w3.org/2000/svg"',
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  if (!svg.includes('.mj{')) {
    svg = svg.replace('    @media (prefers-color-scheme: dark){',
      '    .mj{color:#3c4043}\n    @media (prefers-color-scheme: dark){');
    svg = svg.replace('      .lb{fill:#c7cad6}\n',
      '      .lb{fill:#c7cad6}\n      .mj{color:#c7cad6}\n');
  }
  if (!svg.includes('class="lb"')) {
    svg = svg.replace(/^\s*\.lb\{[^\n]*\n/gm, '');
  }
  return svg;
}

/** 把历史图里残留的旧字体栈换成 LXGW WenKai */
function ensureFont(svg) {
  return svg.split(FONT_OLD).join(FONT_NEW);
}

function mathifyFigure(name) {
  const file = path.join(FIG_DIR, name);
  let svg = fs.readFileSync(file, 'utf8');
  let n = 0;
  svg = svg.replace(SUB_RE, (_, xs, ys, base, sub) => {
    const m = math(`${base}_{${sub}}`);
    n++;
    return place(m, parseFloat(xs) - m.width / 2, parseFloat(ys));
  });
  svg = svg.replace(LETTER_RE, (_, xs, ys, ch) => {
    const m = math(ch);
    n++;
    return place(m, parseFloat(xs) - m.width / 2, parseFloat(ys));
  });
  svg = ensureSvgBits(svg);
  svg = ensureFont(svg);
  fs.writeFileSync(file, svg);
  return `${name}（替换 ${n} 个标签，${(svg.length / 1024).toFixed(1)} KB）`;
}

console.log('已更新：');
console.log('  ' + buildMinNodes());
for (const f of [
  'avl-rr-rotation.svg', 'avl-ll-rotation.svg', 'avl-lr-rotation.svg', 'avl-rl-rotation.svg',
  'splay-zig.svg', 'splay-zig-zag.svg', 'splay-zig-zig.svg',
  'bst-insert-order.svg',
]) {
  console.log('  ' + mathifyFigure(f));
}
