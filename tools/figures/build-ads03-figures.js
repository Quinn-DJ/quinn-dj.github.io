#!/usr/bin/env node
/**
 * 生成 docs/coding/ads/figures 下第三讲（倒排索引）的图。
 *
 *   node tools/figures/build-ads03-figures.js
 *
 * 三张图：倒排索引的结构、索引构建流水线、precision-recall 平面。
 * 图里没有数学公式，样式都写在图内 <style>，浅色深色各一套。
 */

const fs = require('fs');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');

const STYLE = `
    .edge{stroke:#5f6368;stroke-width:1.6;fill:none}
    .box{fill:#f4f5f7;stroke:#9aa0a6;stroke-width:1.4}
    .step{fill:#eef1ff;stroke:#3f51b5;stroke-width:1.6}
    .cell{fill:#ffffff;stroke:#9aa0a6;stroke-width:1.2}
    .blk{fill:#fdf0e6;stroke:#c98a4b;stroke-width:1.4}
    .txt{fill:#1f2330;font-family:'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif;font-size:13.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .hd{fill:#3c4043;font-family:'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif;font-size:14px;font-weight:600;text-anchor:middle}
    .term{fill:#1f2330;font-family:'LXGW WenKai Mono','LXGW WenKai',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .cap{fill:#3f51b5;font-family:'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif;font-size:15px;font-weight:600;text-anchor:middle}
    .lbl{fill:#3c4043;font-family:'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif;font-size:13.5px;font-weight:500}
    .axis{stroke:#5f6368;stroke-width:1.6;fill:none}
    .curve{stroke:#3f51b5;stroke-width:2.4;fill:none}
    .mk{fill:#5f6368}
    .pt{fill:#d84343;stroke:#b71c1c;stroke-width:1.4}
    @media (prefers-color-scheme: dark){
      .edge{stroke:#9aa0a6}
      .box{fill:#262a3a;stroke:#7a7f8f}
      .step{fill:#33406b;stroke:#9fa8da}
      .cell{fill:#2f3346;stroke:#7a7f8f}
      .blk{fill:#4a3524;stroke:#c98a4b}
      .txt{fill:#e8eaf6}
      .hd{fill:#c7cad6}
      .term{fill:#e8eaf6}
      .cap{fill:#9fa8da}
      .lbl{fill:#c7cad6}
      .axis{stroke:#9aa0a6}
      .curve{stroke:#9fa8da}
      .mk{fill:#9aa0a6}
      .pt{fill:#ef9a9a;stroke:#c62828}
    }`;

const ARROW = `  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path class="mk" d="M0,0 L10,5 L0,10 z"/>
    </marker>
  </defs>
`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
  </style>
${ARROW}`;

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

const edge = (x1, y1, x2, y2, marker = true) =>
  `  <line class="edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${marker ? ' marker-end="url(#arrow)"' : ''}/>`;

const rect = (x, y, w, h, cls) =>
  `  <rect class="${cls}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6"/>`;

const text = (x, y, t, cls = 'txt') => `  <text class="${cls}" x="${x}" y="${y}">${t}</text>`;

// ---------------------------------------------------------- 1. 倒排索引的结构
function invertedIndex() {
  const w = 920, h = 430;
  let s = header(w, h, '倒排索引：词典与倒排记录表');
  const rows = [
    {term: 'a', times: 2, postings: [[2, 1], [4, 1]]},
    {term: 'arrived', times: 2, postings: [[3, 1], [4, 1]]},
    {term: 'gold', times: 3, postings: [[1, 1], [2, 1], [4, 1]]},
    {term: 'silver', times: 3, postings: [[1, 1], [3, 2]]},
    {term: 'truck', times: 3, postings: [[1, 1], [3, 1], [4, 1]]},
  ];
  const y0 = 110, dy = 62;
  s += text(80, 60, '词典（term）', 'hd') + '\n';
  s += text(215, 60, '出现次数', 'hd') + '\n';
  s += text(620, 60, '倒排记录表（docID, tf）', 'hd') + '\n';
  rows.forEach((r, i) => {
    const y = y0 + i * dy;
    s += rect(80, y, 74, 40, 'box') + '\n';
    s += text(80, y + 1, r.term, 'term') + '\n';
    s += rect(215, y, 60, 40, 'box') + '\n';
    s += text(215, y + 1, r.times) + '\n';
    r.postings.forEach((p, j) => {
      const x = 400 + j * 110;
      s += rect(x, y, 92, 40, 'cell') + '\n';
      s += `  <line class="edge" x1="${x + 8}" y1="${y - 12}" x2="${x + 8}" y2="${y + 12}" stroke-width="1"/>\n`;
      s += text(x - 22, y + 1, p[0]) + '\n';
      s += text(x + 22, y + 1, p[1]) + '\n';
    });
    s += `  <line class="edge" x1="117" y1="${y}" x2="184" y2="${y}" marker-end="" stroke-dasharray="3 3"/>\n`;
    s += `  <line class="edge" x1="245" y1="${y}" x2="348" y2="${y}" marker-end="" stroke-dasharray="3 3"/>\n`;
  });
  s += text(460, 405, 'silver 的两条记录表示：文档 1 里出现 1 次，文档 3 里出现 2 次，一共 3 次', 'cap') + '\n';
  return save('inverted-index-example.svg', s);
}

// ------------------------------------------------------ 2. 索引构建流水线与块式合并
function indexConstruction() {
  const w = 980, h = 470;
  let s = header(w, h, '倒排索引的构建流程');
  const steps = ['Token Analyzer', 'Stop Filter', 'Word Stemming', 'Vocabulary', 'Insertor'];
  const x0 = 120, dx = 185;
  s += text(490, 45, '构建流水线：读一个词，先过停用词和词干化，再查词典、插入倒排记录表', 'cap') + '\n';
  steps.forEach((t, i) => {
    const x = x0 + i * dx;
    s += rect(x, 110, 150, 52, 'step') + '\n';
    s += text(x, 111, t) + '\n';
    if (i) s += edge(x - dx + 75, 110, x - 75, 110) + '\n';
  });
  s += text(490, 210, '内存不够时：写一块到磁盘，最后归并', 'cap') + '\n';
  s += rect(170, 300, 190, 56, 'box') + '\n';
  s += text(170, 301, '内存中的倒排索引') + '\n';
  s += edge(268, 300, 336, 300) + '\n';
  s += text(302, 260, '内存满', 'lbl') + '\n';
  ['Block 0', 'Block 1', 'Block 2'].forEach((t, i) => {
    const x = 380 + i * 110;
    s += rect(x, 300, 96, 56, 'blk') + '\n';
    s += text(x, 301, t) + '\n';
  });
  s += edge(596, 300, 664, 300) + '\n';
  s += text(630, 260, '归并', 'lbl') + '\n';
  s += rect(800, 300, 210, 56, 'box') + '\n';
  s += text(800, 301, '磁盘上的 Inverted Index') + '\n';
  s += text(490, 425, '块式构建的代价是要多做一轮 I/O，换来的是内存占用可控', 'lbl') + '\n';
  return save('index-construction.svg', s);
}

// --------------------------------------------------------------- 3. P-R 平面
function precisionRecall() {
  const w = 780, h = 520;
  let s = header(w, h, 'Precision-Recall 平面');
  const ox = 110, oy = 390, ex = 710, ey = 80;
  s += `  <line class="axis" x1="${ox}" y1="${oy}" x2="${ex}" y2="${oy}"/>\n`;
  s += `  <line class="axis" x1="${ox}" y1="${oy}" x2="${ox}" y2="${ey}"/>\n`;
  const X = (r) => ox + r * (ex - ox);
  const Y = (p) => oy - p * (oy - ey);
  [[0, '0'], [0.5, '0.5'], [1, '1']].forEach(([v, t]) => {
    s += text(X(v), oy + 22, t) + '\n';
    s += text(ox - 24, Y(v), t) + '\n';
  });
  s += text((ox + ex) / 2, oy + 52, 'Recall 召回率') + '\n';
  s += `  <text class="txt" x="40" y="${(oy + ey) / 2}" transform="rotate(-90 40 ${(oy + ey) / 2})">Precision 精确率</text>\n`;
  const pts = [[0.05, 0.96], [0.2, 0.88], [0.4, 0.74], [0.55, 0.62], [0.7, 0.48], [0.85, 0.32], [0.98, 0.12]];
  s += `  <polyline class="curve" points="${pts.map(([r, p]) => `${X(r).toFixed(1)},${Y(p).toFixed(1)}`).join(' ')}"/>\n`;
  // 理想点
  s += `  <circle cx="${X(1)}" cy="${Y(1)}" r="5" fill="none" stroke="#2e7d32" stroke-width="2"/>\n`;
  s += `  <text class="lbl" x="${X(1) - 8}" y="${Y(1) - 14}" text-anchor="end">理想点 (1, 1)</text>\n`;
  // 例子点
  s += `  <circle class="pt" cx="${X(0.67)}" cy="${Y(0.5)}" r="6"/>\n`;
  s += `  <text class="lbl" x="${X(0.67) + 12}" y="${Y(0.5) + 20}">例子：P = 0.50，R = 0.67</text>\n`;
  s += `  <text class="lbl" x="${ox}" y="480">高精度、低召回：返回的都相关，但漏了很多</text>\n`;
  s += `  <text class="lbl" x="${ox}" y="504">低精度、高召回：相关的基本都在，但混了不少无关的</text>\n`;
  return save('precision-recall.svg', s);
}

console.log('已生成：');
console.log('  ' + invertedIndex());
console.log('  ' + indexConstruction());
console.log('  ' + precisionRecall());
