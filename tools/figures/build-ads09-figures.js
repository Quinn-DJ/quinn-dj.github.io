#!/usr/bin/env node
/**
 * 生成第九讲（贪心算法）的 SVG 图。
 *
 *   node tools/figures/build-ads09-figures.js
 *
 * 只使用 Node 内置模块。图内颜色和字体均写在 SVG 中，浅色与深色
 * 主题由 prefers-color-scheme 切换。
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
    .axis{stroke:#98a1b2;stroke-width:1.4}
    .grid{stroke:#d6dbe5;stroke-width:1;stroke-dasharray:3 6}
    .interval{fill:#e8ebf2;stroke:#697386;stroke-width:1.6}
    .interval-good{fill:#dff1e1;stroke:#2e7d32;stroke-width:2.3}
    .edge{stroke:#667085;stroke-width:1.7;fill:none}
    .edge-good{stroke:#2e7d32;stroke-width:2.2;fill:none}
    .node{fill:#ffffff;stroke:#4f5d75;stroke-width:1.8}
    .node-good{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2}
    .leaf{fill:#ffffff;stroke:#667085;stroke-width:1.7}
    .leaf-good{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2}
    .title{fill:#1f2330;font-size:18px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .txt{fill:#1f2330;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .txt-good{fill:#1f4f24;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .leaf-char{fill:#1f2330;font-size:16px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .leaf-freq{fill:#5f6673;font-size:12.5px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .lbl{fill:#3c4043;font-size:13.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .small{fill:#5f6673;font-size:12px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .accent{fill:#2e7d32;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .edge-lbl{fill:#7b8494;font-size:11.5px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .step{fill:#243b84;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    @media (prefers-color-scheme: dark){
      .panel{fill:#222635;stroke:#41485c}
      .panel-alt{fill:#292e3d;stroke:#41485c}
      .axis{stroke:#7a8397}
      .grid{stroke:#3d4456}
      .interval{fill:#343a4b;stroke:#9aa3b5}
      .interval-good{fill:#24452f;stroke:#81c784}
      .edge{stroke:#a6acba}
      .edge-good{stroke:#81c784}
      .node{fill:#292e3d;stroke:#c2c7d2}
      .node-good{fill:#24452f;stroke:#81c784}
      .leaf{fill:#292e3d;stroke:#a6acba}
      .leaf-good{fill:#24452f;stroke:#81c784}
      .title{fill:#eef0f6}
      .txt{fill:#eef0f6}
      .txt-good{fill:#c8e6c9}
      .leaf-char{fill:#eef0f6}
      .leaf-freq{fill:#b7bcc9}
      .lbl{fill:#d6d9e2}
      .small{fill:#b7bcc9}
      .accent{fill:#a5d6a7}
      .edge-lbl{fill:#a6acba}
      .step{fill:#c5caff}
    }`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
  </style>`;

const line = (x1, y1, x2, y2, cls = 'edge') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>\n`;

const rect = (x, y, w, h, cls, rx = 8) =>
  `  <rect class="${cls}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rx}"/>\n`;

const circle = (x, y, r, cls) =>
  `  <circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>\n`;

const text = (x, y, value, cls = 'txt') =>
  `  <text class="${cls}" x="${x}" y="${y}">${value}</text>\n`;

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

// ------------------------------------------------- 1. 活动选择的时间轴
function activitySelection() {
  const w = 1080;
  const h = 610;
  const x0 = 200;
  const scale = 50;
  const mapX = (time) => x0 + time * scale;
  const rowTop = 142;
  const rowStep = 38;

  const activities = [
    [1, 1, 4],
    [2, 3, 5],
    [3, 0, 6],
    [4, 5, 7],
    [5, 3, 9],
    [6, 5, 9],
    [7, 6, 10],
    [8, 8, 11],
    [9, 8, 12],
    [10, 2, 14],
    [11, 12, 16],
  ];
  const selected = new Set([1, 4, 8, 11]);

  let s = header(
    w,
    h,
    '活动选择样本：按结束时间排序后，绿色区间 a1、a4、a8、a11 构成四个彼此兼容的活动'
  );

  s += `  <rect class="panel" x="20" y="20" width="1040" height="570" rx="16"/>\n`;
  s += text(540, 52, '按结束时间从小到大扫描，选择第一个与已选活动兼容的区间', 'title');

  for (let time = 0; time <= 16; time++) {
    const x = mapX(time);
    s += line(x, 92, x, 515, 'grid');
    s += line(x, 92, x, 99, 'axis');
    if (time % 2 === 0) {
      s += text(x, 76, String(time), 'small');
    }
  }
  s += line(x0, 96, mapX(16), 96, 'axis');
  s += text(76, 76, '时间', 'small');

  activities.forEach(([id, start, finish], index) => {
    const y = rowTop + index * rowStep;
    const good = selected.has(id);
    const left = mapX(start);
    const right = mapX(finish);

    s += text(76, y, `a${id}`, good ? 'txt-good' : 'txt');
    s += text(133, y, `[${start},${finish})`, 'small');
    s += rect((left + right) / 2, y, right - left, 22, good ? 'interval-good' : 'interval', 6);
    s += text((left + right) / 2, y, `a${id}`, good ? 'txt-good' : 'lbl');
  });

  s += text(540, 544, '绿色：a1 → a4 → a8 → a11，共 4 个活动', 'accent');
  s += text(
    540,
    570,
    'a1 结束后资源空闲，a4 才能开始；换用更早开始的 a3 会挡住后面的候选',
    'small'
  );

  return save('activity-selection.svg', s);
}

// ----------------------------------------------------- 2. Huffman 树
function huffmanTree() {
  const w = 1160;
  const h = 650;
  let s = header(
    w,
    h,
    'Huffman 编码示例：频率 1 和 3 的叶结点先合并，最终所有叶子代价之和为 146'
  );

  s += `  <rect class="panel" x="20" y="20" width="820" height="610" rx="16"/>\n`;
  s += `  <rect class="panel-alt" x="860" y="20" width="280" height="610" rx="16"/>\n`;
  s += text(430, 52, '频率越小，合并得越早，离根越远', 'title');
  s += text(1000, 52, '合并顺序', 'title');

  const nodes = {
    root: { x: 430, y: 108, r: 29, weight: 58, cls: 'node-good' },
    n25: { x: 300, y: 202, r: 25, weight: 25, cls: 'node-good' },
    n33: { x: 640, y: 202, r: 25, weight: 33, cls: 'node-good' },
    i: { x: 205, y: 300, char: 'i', weight: 12, cls: 'leaf-good' },
    sp: { x: 380, y: 300, char: '␣', weight: 13, cls: 'leaf-good' },
    e: { x: 560, y: 300, char: 'e', weight: 15, cls: 'leaf-good' },
    n18: { x: 730, y: 300, r: 24, weight: 18, cls: 'node-good' },
    n8: { x: 645, y: 398, r: 22, weight: 8, cls: 'node-good' },
    a: { x: 785, y: 398, char: 'a', weight: 10, cls: 'leaf-good' },
    t: { x: 555, y: 492, char: 't', weight: 4, cls: 'leaf' },
    n4: { x: 700, y: 492, r: 20, weight: 4, cls: 'node-good' },
    nl: { x: 650, y: 570, char: '↵', weight: 1, cls: 'leaf' },
    sb: { x: 750, y: 570, char: 's', weight: 3, cls: 'leaf' },
  };

  const edges = [
    ['root', 'n25', '0'],
    ['root', 'n33', '1'],
    ['n25', 'i', '0'],
    ['n25', 'sp', '1'],
    ['n33', 'e', '0'],
    ['n33', 'n18', '1'],
    ['n18', 'n8', '0'],
    ['n18', 'a', '1'],
    ['n8', 't', '0'],
    ['n8', 'n4', '1'],
    ['n4', 'nl', '0'],
    ['n4', 'sb', '1'],
  ];

  for (const [fromKey, toKey, bit] of edges) {
    const from = nodes[fromKey];
    const to = nodes[toKey];
    const fromR = from.r || 24;
    const toR = to.r || 24;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    const sx = from.x + (dx / length) * fromR;
    const sy = from.y + (dy / length) * fromR;
    const ex = to.x - (dx / length) * toR;
    const ey = to.y - (dy / length) * toR;

    s += line(sx, sy, ex, ey, 'edge');
    s += text((sx + ex) / 2 + 8, (sy + ey) / 2 - 5, bit, 'edge-lbl');
  }

  for (const [key, node] of Object.entries(nodes)) {
    if (node.char) {
      s += rect(node.x, node.y, 66, 46, node.cls, 9);
      s += text(node.x, node.y - 8, node.char, 'leaf-char');
      s += text(node.x, node.y + 12, String(node.weight), 'leaf-freq');
    } else {
      s += circle(node.x, node.y, node.r, node.cls);
      s += text(node.x, node.y + 1, String(node.weight), key === 'root' ? 'txt-good' : 'txt');
    }
  }

  const steps = [
    ['1 + 3', '= 4'],
    ['4 + 4', '= 8'],
    ['8 + 10', '= 18'],
    ['12 + 13', '= 25'],
    ['15 + 18', '= 33'],
    ['25 + 33', '= 58'],
  ];
  steps.forEach(([left, right], index) => {
    const y = 122 + index * 58;
    s += `  <rect class="leaf" x="885" y="${y - 20}" width="230" height="38" rx="8"/>\n`;
    s += text(940, y, left, 'step');
    s += text(1055, y, right, 'accent');
    if (index < steps.length - 1) {
      s += line(1000, y + 20, 1000, y + 36, 'edge');
    }
  });

  s += text(430, 610, '叶结点中的数字是频率；内部结点的数字是子树频率和', 'lbl');
  s += text(1000, 522, '总代价', 'lbl');
  s += text(1000, 551, '30 + 30 + 24 + 15 + 16 + 26 + 5', 'small');
  s += text(1000, 585, '= 146', 'accent');

  return save('huffman-tree.svg', s);
}

console.log('已生成：');
console.log('  ' + activitySelection());
console.log('  ' + huffmanTree());
