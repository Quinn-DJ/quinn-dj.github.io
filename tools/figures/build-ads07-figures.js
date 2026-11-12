#!/usr/bin/env node
/**
 * 生成第七讲（分治）的 SVG 图。
 *
 *   node tools/figures/build-ads07-figures.js
 *
 * 只使用 Node 内置模块。颜色和字体都写进 SVG，浅色与深色主题
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
    .axis{stroke:#c4cad5;stroke-width:1.2}
    .split{stroke:#2e7d32;stroke-width:2.4}
    .strip{fill:#e7f4e8;opacity:.72}
    .grid{stroke:#aeb6c5;stroke-width:1.4;fill:none}
    .half-line{stroke:#2e7d32;stroke-width:2.2}
    .point{fill:#334155;stroke:#ffffff;stroke-width:2}
    .point-left{fill:#3f51b5;stroke:#ffffff;stroke-width:2}
    .point-right{fill:#8a5a00;stroke:#ffffff;stroke-width:2}
    .point-best{fill:#c75252;stroke:#ffffff;stroke-width:2.4}
    .point-p{fill:#2e7d32;stroke:#ffffff;stroke-width:2.4}
    .best{stroke:#c75252;stroke-width:2.5;fill:none}
    .guide{stroke:#7b8494;stroke-width:1.4;fill:none;stroke-dasharray:5 5}
    .title{fill:#1f2330;font-size:18px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .txt{fill:#1f2330;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .lbl{fill:#3c4043;font-size:13.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .small{fill:#5f6673;font-size:12.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .accent{fill:#2e7d32;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .warn{fill:#a33b3b;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    @media (prefers-color-scheme: dark){
      .panel{fill:#222635;stroke:#41485c}
      .panel-alt{fill:#292e3d;stroke:#41485c}
      .axis{stroke:#5d6578}
      .split{stroke:#81c784}
      .strip{fill:#24452f;opacity:.78}
      .grid{stroke:#687188}
      .half-line{stroke:#81c784}
      .point{fill:#d7dbe5;stroke:#292e3d}
      .point-left{fill:#9fa8da;stroke:#222635}
      .point-right{fill:#ffcc80;stroke:#222635}
      .point-best{fill:#ef9a9a;stroke:#222635}
      .point-p{fill:#81c784;stroke:#222635}
      .best{stroke:#ef9a9a}
      .guide{stroke:#a6acba}
      .title{fill:#eef0f6}
      .txt{fill:#eef0f6}
      .lbl{fill:#d6d9e2}
      .small{fill:#b7bcc9}
      .accent{fill:#a5d6a7}
      .warn{fill:#ef9a9a}
    }`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
  </style>`;

const line = (x1, y1, x2, y2, cls = 'axis') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>\n`;

const circle = (x, y, r, cls) =>
  `  <circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>\n`;

const text = (x, y, value, cls = 'txt') =>
  `  <text class="${cls}" x="${x}" y="${y}">${value}</text>\n`;

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

// ---------------------------------------------------- 最近点对的窄带与打包引理
function closestPairStrip() {
  const w = 1000;
  const h = 540;
  let s = header(
    w,
    h,
    '最近点对分治中的窄带检查：左图是跨中线检查，右图用八个小方格说明每个点最多只需再比较七个点'
  );

  s += `  <rect class="panel" x="20" y="20" width="590" height="500" rx="16"/>\n`;
  s += `  <rect class="panel-alt" x="630" y="20" width="350" height="500" rx="16"/>\n`;
  s += text(315, 52, '递归结束后，跨中线的点对还要再查一次', 'title');
  s += text(805, 52, '一个点为什么只需再看 7 个点', 'title');

  // 左图：左右两半和宽度为 2 delta 的窄带。
  s += `  <rect class="strip" x="225" y="82" width="180" height="394" rx="4"/>\n`;
  s += line(315, 78, 315, 482, 'split');
  s += line(225, 78, 225, 482, 'guide');
  s += line(405, 78, 405, 482, 'guide');
  s += text(140, 104, '左半区', 'lbl');
  s += text(488, 104, '右半区', 'lbl');
  s += text(225, 504, '中线 − δ', 'small');
  s += text(315, 504, '中线', 'accent');
  s += text(405, 504, '中线 + δ', 'small');

  const leftPoints = [
    [104, 158, 'point-left'],
    [168, 228, 'point-left'],
    [250, 314, 'point-left'],
    [292, 392, 'point-left'],
    [181, 438, 'point-left'],
  ];
  const rightPoints = [
    [493, 142, 'point-right'],
    [452, 246, 'point-right'],
    [368, 326, 'point-right'],
    [430, 410, 'point-right'],
    [521, 452, 'point-right'],
  ];
  const allPoints = [...leftPoints, ...rightPoints];

  for (const [x, y, cls] of allPoints) {
    s += circle(x, y, 6, cls);
  }

  // 左右半区各自已有的最近点对。
  s += line(104, 158, 168, 228, 'best');
  s += line(493, 142, 452, 246, 'best');

  // 跨中线的最终答案。
  const p = [292, 392];
  const q = [368, 326];
  s += circle(p[0], p[1], 8, 'point-best');
  s += circle(q[0], q[1], 8, 'point-best');
  s += line(p[0], p[1], q[0], q[1], 'best');
  s += text(335, 348, '跨中线候选', 'warn');
  s += text(315, 145, '先分别递归左右两半', 'lbl');
  s += text(315, 466, '只比较 |x − 中线| &lt; δ 的点', 'lbl');

  // 右图：2 delta 宽、delta 高的矩形分成 4 x 2 个小格。
  const x0 = 690;
  const y0 = 108;
  const cellW = 65;
  const cellH = 65;
  const gridW = 260;
  const gridH = 130;
  s += `  <rect class="strip" x="${x0}" y="${y0}" width="${gridW}" height="${gridH}" rx="3"/>\n`;
  s += `  <rect class="grid" x="${x0}" y="${y0}" width="${gridW}" height="${gridH}" rx="3"/>\n`;

  for (let i = 1; i < 4; i++) {
    s += line(x0 + i * cellW, y0, x0 + i * cellW, y0 + gridH, 'grid');
  }
  s += line(x0, y0 + cellH, x0 + gridW, y0 + cellH, 'grid');
  s += line(x0 + 2 * cellW, y0 - 18, x0 + 2 * cellW, y0 + gridH + 18, 'half-line');

  // 每个小格放一个点，说明上界是 8；绿色的是当前扫描点 p_i。
  const cellPoints = [
    [x0 + 28, y0 + 30, 'point-p'],
    [x0 + 94, y0 + 36, 'point'],
    [x0 + 158, y0 + 28, 'point'],
    [x0 + 228, y0 + 37, 'point'],
    [x0 + 33, y0 + 94, 'point'],
    [x0 + 97, y0 + 101, 'point'],
    [x0 + 163, y0 + 92, 'point'],
    [x0 + 231, y0 + 102, 'point'],
  ];
  for (const [x, y, cls] of cellPoints) {
    s += circle(x, y, 7, cls);
  }

  s += text(x0 + 28, y0 + 54, 'pᵢ', 'accent');
  s += text(805, 272, '每个小格最多一个点', 'txt');
  s += text(805, 306, '小格边长 δ/2，对角线长度为 δ/√2 &lt; δ', 'small');
  s += text(805, 334, '否则同一半区就出现了距离小于 δ 的点对', 'small');
  s += text(805, 378, '矩形最多 8 个点', 'txt');
  s += text(805, 410, '扣掉 pᵢ，后面最多再检查 7 个', 'accent');
  s += text(805, 466, '按 y 排序后，再按这个局部窗口扫描', 'lbl');

  return save('closest-pair-strip.svg', s);
}

console.log('已生成：');
console.log('  ' + closestPairStrip());
