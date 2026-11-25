#!/usr/bin/env node
/**
 * 生成第十讲（NP 完全性）的 SVG 图。
 *
 *   node tools/figures/build-ads10-figures.js
 *
 * 只使用 Node 内置模块。颜色和字体都写在 SVG 内，浅色与深色主题
 * 由 prefers-color-scheme 切换。
 */

const fs = require('fs');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');
const FONT =
  "'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif";

const STYLE = `
    text{font-family:${FONT}}
    .panel{fill:#f7f8fb;stroke:#d9dde7;stroke-width:1.2}
    .panel-alt{fill:#ffffff;stroke:#d9dde7;stroke-width:1.2}
    .np-region{fill:#eef1ff;stroke:#4b5bb7;stroke-width:2}
    .p-region{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2}
    .npc-region{fill:#fdecec;stroke:#b94a48;stroke-width:2}
    .co-region{fill:#fff4d6;stroke:#9a6700;stroke-width:2}
    .collapse{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2.4}
    .box{fill:#ffffff;stroke:#667085;stroke-width:1.7}
    .box-a{fill:#fdecec;stroke:#b94a48;stroke-width:2.2}
    .box-b{fill:#eef1ff;stroke:#4b5bb7;stroke-width:2.2}
    .edge{stroke:#8c95a6;stroke-width:1.5;fill:none}
    .edge-good{stroke:#2e7d32;stroke-width:2.6;fill:none}
    .edge-warn{stroke:#c75252;stroke-width:1.7;fill:none;stroke-dasharray:5 5}
    .arrow{stroke:#667085;stroke-width:2;fill:none}
    .arrow-warn{stroke:#b94a48;stroke-width:2.2;fill:none}
    .lit{fill:#ffffff;stroke:#667085;stroke-width:1.7}
    .lit-good{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2.4}
    .title{fill:#1f2330;font-size:18px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .txt{fill:#1f2330;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .txt-good{fill:#1f4f24;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .txt-warn{fill:#8f2929;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .lbl{fill:#3c4043;font-size:13.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .small{fill:#5f6673;font-size:12px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .accent{fill:#2e7d32;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .warn{fill:#b63c3c;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .formula{fill:#1f2330;font-size:17px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    @media (prefers-color-scheme: dark){
      .panel{fill:#222635;stroke:#41485c}
      .panel-alt{fill:#292e3d;stroke:#41485c}
      .np-region{fill:#29345f;stroke:#aeb8ff}
      .p-region{fill:#24452f;stroke:#81c784}
      .npc-region{fill:#4a292b;stroke:#ef9a9a}
      .co-region{fill:#493c22;stroke:#e2c26b}
      .collapse{fill:#24452f;stroke:#81c784}
      .box{fill:#292e3d;stroke:#a6acba}
      .box-a{fill:#4a292b;stroke:#ef9a9a}
      .box-b{fill:#303a64;stroke:#9fa8da}
      .edge{stroke:#a0a8b8}
      .edge-good{stroke:#81c784}
      .edge-warn{stroke:#ef9a9a}
      .arrow{stroke:#a6acba}
      .arrow-warn{stroke:#ef9a9a}
      .lit{fill:#292e3d;stroke:#a6acba}
      .lit-good{fill:#24452f;stroke:#81c784}
      .title{fill:#eef0f6}
      .txt{fill:#eef0f6}
      .txt-good{fill:#c8e6c9}
      .txt-warn{fill:#ffcdd2}
      .lbl{fill:#d6d9e2}
      .small{fill:#b7bcc9}
      .accent{fill:#a5d6a7}
      .warn{fill:#ef9a9a}
      .formula{fill:#eef0f6}
    }`;

const arrowDefs = `
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path fill="#667085" d="M0,0 L10,5 L0,10 z"/>
    </marker>
    <marker id="arrow-warn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path fill="#b94a48" d="M0,0 L10,5 L0,10 z"/>
    </marker>
    <style>
      @media (prefers-color-scheme: dark){
        marker#arrow path{fill:#a6acba}
        marker#arrow-warn path{fill:#ef9a9a}
      }
    </style>
  </defs>`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
  </style>
${arrowDefs}`;

const line = (x1, y1, x2, y2, cls = 'edge', marker = null) =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${
    marker ? ` marker-end="url(#${marker})"` : ''
  }/>\n`;

const ellipse = (x, y, rx, ry, cls) =>
  `  <ellipse class="${cls}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>\n`;

const rect = (x, y, w, h, cls, rx = 9) =>
  `  <rect class="${cls}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rx}"/>\n`;

const circle = (x, y, r, cls) =>
  `  <circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>\n`;

const text = (x, y, value, cls = 'txt') =>
  `  <text class="${cls}" x="${x}" y="${y}">${value}</text>\n`;

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

// ------------------------------------------------- 1. P、NP 与 NPC 的关系
function npClasses() {
  const w = 1120;
  const h = 590;
  let s = header(
    w,
    h,
    'P、NP 与 NP 完全类的关系图：P 包含于 NP，NP 完全问题也包含于 NP；P 是否等于 NP 仍未知'
  );

  s += `  <rect class="panel" x="20" y="20" width="520" height="550" rx="16"/>\n`;
  s += `  <rect class="panel-alt" x="560" y="20" width="540" height="550" rx="16"/>\n`;
  s += text(280, 52, '定义给出的包含关系', 'title');
  s += text(830, 52, '两种极端情形', 'title');

  // 左图：先不假定 P 与 NPC 是否分离。
  s += ellipse(280, 300, 225, 185, 'np-region');
  s += ellipse(205, 350, 118, 88, 'p-region');
  s += ellipse(370, 350, 102, 88, 'npc-region');
  s += text(280, 150, 'NP：证书可在多项式时间验证', 'txt');
  s += text(205, 350, 'P', 'title');
  s += text(370, 350, 'NPC', 'title');
  s += text(287, 255, '两者是否相交取决于 P 与 NP', 'lbl');
  s += text(280, 450, '图中的相对位置只是示意，交集未知', 'small');
  s += text(280, 492, '已知只有 P ⊆ NP 与 NPC ⊆ NP', 'lbl');

  // 右图上：多数研究者的猜测。
  s += text(830, 94, '常见假设：P ≠ NP', 'title');
  s += ellipse(830, 185, 225, 82, 'np-region');
  s += ellipse(725, 185, 90, 57, 'p-region');
  s += ellipse(935, 185, 90, 57, 'npc-region');
  s += text(830, 116, 'NP', 'lbl');
  s += text(725, 185, 'P', 'txt');
  s += text(935, 185, 'NPC', 'txt');
  s += text(830, 283, '此时两者不交，NP 中可能还有中间问题', 'small');

  // 右图下：P = NP 时整个类塌缩。
  s += text(830, 340, '如果 P = NP', 'title');
  s += ellipse(830, 450, 130, 72, 'collapse');
  s += text(830, 435, 'P = NP', 'title');
  s += text(830, 467, 'NPC', 'txt');
  s += text(830, 548, '这个等式至今没有被证明，也没有被否定', 'small');

  return save('np-classes.svg', s);
}

// ------------------------------------------ 2. 归约方向与 Hamilton → TSP
function reductionHamiltonTsp() {
  const w = 1160;
  const h = 650;
  let s = header(
    w,
    h,
    '多项式归约的方向，以及从 Hamilton 环到旅行商问题的构造：原图边权为 1，补边权为 2'
  );

  s += `  <rect class="panel" x="20" y="20" width="530" height="610" rx="16"/>\n`;
  s += `  <rect class="panel-alt" x="570" y="20" width="570" height="610" rx="16"/>\n`;
  s += text(285, 52, '想证明 B 难，从已知难的 A 归约到 B', 'title');
  s += text(855, 52, 'Hamilton 环归约到 TSP', 'title');

  s += rect(105, 170, 125, 74, 'box-a');
  s += text(105, 156, 'A 的实例 x', 'txt');
  s += text(105, 184, 'A 已知为 NPC', 'small');
  s += rect(465, 170, 125, 74, 'box-b');
  s += text(465, 156, 'B 的实例 f(x)', 'txt');
  s += text(465, 184, '待证明的问题', 'small');
  s += line(168, 170, 402, 170, 'arrow', 'arrow');
  s += text(285, 148, '多项式时间 f', 'lbl');
  s += text(285, 204, 'yes ↔ yes，no ↔ no', 'accent');

  s += text(285, 270, '记作：A 的多项式归约 → B', 'title');
  s += text(285, 314, '若 B 有多项式算法，则 A 也有', 'lbl');
  s += text(285, 344, '这就是 B 至少和 A 一样难的理由', 'lbl');

  s += `  <rect class="panel" x="72" y="390" width="426" height="170" rx="12"/>\n`;
  s += text(285, 418, '最常见的错误方向', 'warn');
  s += text(285, 457, '只把 B 的某个实例变成 A', 'lbl');
  s += text(285, 487, '不能说明所有 NP 问题都能变成 B', 'lbl');
  s += text(285, 532, '证明 NPC 时，箭头要从已知难问题指向目标问题', 'small');

  // 右边的 TSP 图：绿色边来自原图 G，红色虚线是补边。
  const cx = 855;
  const cy = 225;
  const radius = 130;
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    pts.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }

  for (let i = 0; i < 5; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % 5];
    s += line(a[0], a[1], b[0], b[1], 'edge-good');
  }
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      if (j === i + 1 || (i === 0 && j === 4)) {
        continue;
      }
      const a = pts[i];
      const b = pts[j];
      s += line(a[0], a[1], b[0], b[1], 'edge-warn');
    }
  }
  for (let i = 0; i < 5; i++) {
    s += circle(pts[i][0], pts[i][1], 22, 'box-b');
    s += text(pts[i][0], pts[i][1], String(i + 1), 'txt');
  }

  s += text(855, 395, '绿色边：原图 G 中的边，权为 1', 'accent');
  s += text(855, 424, '红色虚线：补边，权为 2', 'warn');
  s += text(855, 468, 'K = |V| = 5', 'lbl');
  s += text(855, 505, 'G 有 Hamilton 环 ⇔ G′ 有总权 5 的 TSP 环', 'title');
  s += text(855, 548, '任何权 ≤ 5 的 tour 都只能走五条权 1 的边', 'small');
  s += text(855, 580, '所以这些边全部来自 G，正好构成一个 Hamilton 环', 'small');

  return save('reduction-hamilton-tsp.svg', s);
}

// ------------------------------------------------ 3. 3-SAT → CLIQUE
function satToClique() {
  const w = 1120;
  const h = 620;
  let s = header(
    w,
    h,
    '三文字子句可满足性归约到团问题：每个子句一列文字，兼容文字之间连边，选中一个大小为三的团就对应一组满足赋值'
  );

  s += `  <rect class="panel" x="20" y="20" width="1080" height="580" rx="16"/>\n`;
  s += text(560, 53, '每个子句选一个文字，兼容的文字之间连边', 'title');
  s += text(
    560,
    91,
    '(x₁ ∨ x₂ ∨ x₃) ∧ (¬x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₂ ∨ ¬x₃)',
    'formula'
  );

  const clauses = [
    ['x₁', 'x₂', 'x₃'],
    ['¬x₁', '¬x₂', 'x₃'],
    ['¬x₁', 'x₂', '¬x₃'],
  ];
  const xs = [245, 560, 875];
  const ys = [218, 328, 438];
  const nodes = [];

  for (let c = 0; c < 3; c++) {
    s += text(xs[c], 165, `第 ${c + 1} 个子句`, 'lbl');
    for (let l = 0; l < 3; l++) {
      nodes.push({ c, l, x: xs[c], y: ys[l], lit: clauses[c][l] });
    }
  }

  const sameLiteral = (a, b) => a === b;
  const conflict = (a, b) => {
    if (a.startsWith('¬') && !b.startsWith('¬')) {
      return a.slice(1) === b;
    }
    if (!a.startsWith('¬') && b.startsWith('¬')) {
      return a === b.slice(1);
    }
    return false;
  };
  const compatible = (a, b) => !conflict(a, b);

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.c !== b.c && compatible(a.lit, b.lit)) {
        s += line(a.x, a.y, b.x, b.y, 'edge');
      }
    }
  }

  const picked = [
    nodes.find((n) => n.c === 0 && n.lit === 'x₃'),
    nodes.find((n) => n.c === 1 && n.lit === 'x₃'),
    nodes.find((n) => n.c === 2 && n.lit === '¬x₁'),
  ];
  for (let i = 0; i < picked.length; i++) {
    for (let j = i + 1; j < picked.length; j++) {
      s += line(picked[i].x, picked[i].y, picked[j].x, picked[j].y, 'edge-good');
    }
  }

  for (const node of nodes) {
    const good = picked.some((p) => p.c === node.c && p.l === node.l);
    s += rect(node.x, node.y, 92, 50, good ? 'lit-good' : 'lit');
    s += text(node.x, node.y, node.lit, good ? 'txt-good' : 'txt');
  }

  s += text(560, 510, '绿色三角形：选 x₃、x₃、¬x₁，令 x₁=0、x₃=1 即可满足三个子句', 'accent');
  s += text(560, 545, '同列不连边，矛文字之间也不连边；大小为 k 的团必须每列恰好选一个', 'lbl');
  s += text(560, 575, '因此 φ 可满足 ⇔ 构造出的图有大小为 k 的团', 'title');

  return save('sat-to-clique.svg', s);
}

console.log('已生成：');
console.log('  ' + npClasses());
console.log('  ' + reductionHamiltonTsp());
console.log('  ' + satToClique());
