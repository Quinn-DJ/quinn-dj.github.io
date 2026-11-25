#!/usr/bin/env node
/**
 * 生成第十一讲（近似算法）的 SVG 图。
 *
 *   node tools/figures/build-ads11-figures.js
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
    .bin{fill:#eef1f6;stroke:#8b94a5;stroke-width:1.2}
    .bin-line{stroke:#ffffff;stroke-width:1.2}
    .i0{fill:#b8c4e8;stroke:#ffffff;stroke-width:1}
    .i1{fill:#cde8cb;stroke:#ffffff;stroke-width:1}
    .i2{fill:#f3d7a5;stroke:#ffffff;stroke-width:1}
    .i3{fill:#e7c2c7;stroke:#ffffff;stroke-width:1}
    .i4{fill:#c6e2e8;stroke:#ffffff;stroke-width:1}
    .i5{fill:#d8c8e8;stroke:#ffffff;stroke-width:1}
    .i6{fill:#d6d9df;stroke:#ffffff;stroke-width:1}
    .r-ball{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2;stroke-dasharray:7 5}
    .opt-ball{fill:#eef1ff;stroke:#4b5bb7;stroke-width:2}
    .site{fill:#ffffff;stroke:#5f6c82;stroke-width:1.6}
    .site-pick{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2.4}
    .far{fill:#fdecec;stroke:#b94a48;stroke-width:2.4}
    .edge{stroke:#8c95a6;stroke-width:1.3;fill:none;stroke-dasharray:4 4}
    .title{fill:#1f2330;font-size:18px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .txt{fill:#1f2330;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .txt-good{fill:#1f4f24;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .txt-warn{fill:#8f2929;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .lbl{fill:#3c4043;font-size:13.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .small{fill:#5f6673;font-size:12px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .accent{fill:#2e7d32;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .warn{fill:#b63c3c;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .seg{fill:#1f2330;font-size:12px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    @media (prefers-color-scheme: dark){
      .panel{fill:#222635;stroke:#41485c}
      .panel-alt{fill:#292e3d;stroke:#41485c}
      .bin{fill:#303648;stroke:#a0a8b8}
      .bin-line{stroke:#222635}
      .i0{fill:#485986;stroke:#222635}
      .i1{fill:#3f6746;stroke:#222635}
      .i2{fill:#81642d;stroke:#222635}
      .i3{fill:#754349;stroke:#222635}
      .i4{fill:#35636b;stroke:#222635}
      .i5{fill:#5c4774;stroke:#222635}
      .i6{fill:#555b68;stroke:#222635}
      .r-ball{fill:#24452f;stroke:#81c784}
      .opt-ball{fill:#29345f;stroke:#aeb8ff}
      .site{fill:#292e3d;stroke:#c2c7d2}
      .site-pick{fill:#24452f;stroke:#81c784}
      .far{fill:#4a292b;stroke:#ef9a9a}
      .edge{stroke:#a0a8b8}
      .title{fill:#eef0f6}
      .txt{fill:#eef0f6}
      .txt-good{fill:#c8e6c9}
      .txt-warn{fill:#ffcdd2}
      .lbl{fill:#d6d9e2}
      .small{fill:#b7bcc9}
      .accent{fill:#a5d6a7}
      .warn{fill:#ef9a9a}
      .seg{fill:#f3f5fa}
    }`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
  </style>`;

const line = (x1, y1, x2, y2, cls = 'edge') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>\n`;

const rect = (x, y, w, h, cls, rx = 7) =>
  `  <rect class="${cls}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rx}"/>\n`;

const circle = (x, y, r, cls) =>
  `  <circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>\n`;

const text = (x, y, value, cls = 'txt') =>
  `  <text class="${cls}" x="${x}" y="${y}">${value}</text>\n`;

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

// ------------------------------------------------ 1. Bin packing 对比
function binPackingComparison() {
  const w = 1120;
  const h = 640;
  const sizeToClass = new Map([
    ['0.1', 'i4'],
    ['0.2', 'i0'],
    ['0.3', 'i5'],
    ['0.4', 'i2'],
    ['0.5', 'i1'],
    ['0.7', 'i3'],
    ['0.8', 'i6'],
  ]);
  const packings = [
    {
      title: '最优：3 个箱',
      x: 190,
      bins: [
        ['0.8', '0.2'],
        ['0.7', '0.3'],
        ['0.5', '0.4', '0.1'],
      ],
    },
    {
      title: 'Next Fit：5 个箱',
      x: 560,
      bins: [
        ['0.2', '0.5'],
        ['0.4'],
        ['0.7'],
        ['0.1', '0.3'],
        ['0.8'],
      ],
    },
    {
      title: 'First Fit：4 个箱',
      x: 930,
      bins: [
        ['0.2', '0.5', '0.1'],
        ['0.4', '0.3'],
        ['0.7'],
        ['0.8'],
      ],
    },
  ];

  let s = header(
    w,
    h,
    '装箱样本的最优方案、Next Fit 与 First Fit 结果对比，三种方案分别使用 3、5、4 个容量为 1 的箱子'
  );

  s += `  <rect class="panel" x="20" y="20" width="1080" height="600" rx="16"/>\n`;
  s += text(560, 52, '物品顺序：0.2, 0.5, 0.4, 0.7, 0.1, 0.3, 0.8', 'title');

  for (const packing of packings) {
    s += text(packing.x, 92, packing.title, 'title');
    packing.bins.forEach((items, index) => {
      const y = 145 + index * 78;
      const barLeft = packing.x - 128;
      const barWidth = 256;
      s += text(packing.x - 155, y, `B${index + 1}`, 'lbl');
      s += `  <rect class="bin" x="${barLeft}" y="${y - 17}" width="${barWidth}" height="34" rx="7"/>\n`;

      let used = 0;
      for (const value of items) {
        const numeric = Number(value);
        const segmentWidth = numeric * barWidth;
        const segmentX = barLeft + used * barWidth;
        s += `  <rect class="${sizeToClass.get(value)}" x="${segmentX}" y="${y - 16}" width="${segmentWidth}" height="32"/>\n`;
        if (segmentWidth >= 42) {
          s += text(segmentX + segmentWidth / 2, y, value, 'seg');
        }
        used += numeric;
      }
    });
  }

  s += text(560, 555, '最优方案把 0.8+0.2、0.7+0.3、0.5+0.4+0.1 分别装成一箱', 'accent');
  s += text(560, 588, 'Next Fit 一旦换箱就不再回头；First Fit 会扫描之前所有箱子的剩余空间', 'lbl');

  return save('bin-packing-comparison.svg', s);
}

// ------------------------------------------------ 2. K-center 2-近似
function kCenterGreedy() {
  const w = 1120;
  const h = 620;
  let s = header(
    w,
    h,
    'K-center 的 2-近似证明：半径 r 的最优圆内任取一个站点，以它为中心的 2r 圆覆盖整个最优圆；右侧说明 K+1 个两两距离大于 2r 的站点无法被 K 个半径 r 的圆覆盖'
  );

  s += `  <rect class="panel" x="20" y="20" width="520" height="580" rx="16"/>\n`;
  s += `  <rect class="panel-alt" x="560" y="20" width="540" height="580" rx="16"/>\n`;
  s += text(280, 53, '为什么选站点做中心只需要 2r', 'title');
  s += text(830, 53, '为什么不能做到小于 2', 'title');

  // 左侧：最优 r 球内选站点 s，以 s 为圆心画 2r 球。
  const cStar = [260, 285];
  const sPick = [315, 260];
  const r = 82;
  const sites = [
    [205, 230],
    [325, 315],
    [235, 350],
    [360, 225],
  ];

  s += circle(cStar[0], cStar[1], r, 'opt-ball');
  s += circle(sPick[0], sPick[1], 2 * r, 'r-ball');
  for (const [x, y] of sites) {
    s += rect(x, y, 17, 17, 'site', 3);
  }
  s += line(cStar[0], cStar[1], sPick[0], sPick[1], 'edge');
  s += circle(cStar[0], cStar[1], 10, 'site');
  s += circle(sPick[0], sPick[1], 11, 'site-pick');
  s += text(cStar[0] - 22, cStar[1] + 28, 'c*', 'lbl');
  s += text(sPick[0] + 24, sPick[1] - 20, 's', 'txt-good');
  s += text(260, 395, '蓝色：最优半径 r', 'lbl');
  s += text(260, 425, '绿色虚线：以 s 为中心、半径 2r', 'accent');
  s += text(280, 485, '三角形不等式：', 'lbl');
  s += text(280, 516, 'dist(x, s) ≤ dist(x, c*) + dist(c*, s) ≤ 2r', 'title');
  s += text(280, 558, '所以任取一个站点做中心，都能覆盖整个最优圆', 'small');

  // 右侧：K=2 个最优小球与 3 个两两远大于 2r* 的点。
  const rSmall = 76;
  const opt1 = [735, 265];
  const opt2 = [930, 265];
  const far = [
    [830, 125],
    [700, 430],
    [965, 430],
  ];

  s += circle(opt1[0], opt1[1], rSmall, 'opt-ball');
  s += circle(opt2[0], opt2[1], rSmall, 'opt-ball');
  s += text(opt1[0], opt1[1], 'c₁*', 'lbl');
  s += text(opt2[0], opt2[1], 'c₂*', 'lbl');

  s += line(far[0][0], far[0][1], far[1][0], far[1][1], 'edge');
  s += line(far[1][0], far[1][1], far[2][0], far[2][1], 'edge');
  s += line(far[2][0], far[2][1], far[0][0], far[0][1], 'edge');
  far.forEach(([x, y], index) => {
    s += circle(x, y, 12, 'far');
    s += text(x, y + 30, `p${index + 1}`, 'warn');
  });

  s += text(830, 500, '若 K 个贪心中心再加下一个点 p_{K+1}', 'lbl');
  s += text(830, 532, '这 K+1 个点两两距离都大于 2r*', 'lbl');
  s += text(830, 566, 'K 个半径 r* 的球放不下它们，矛盾', 'small');

  return save('k-center-greedy.svg', s);
}

console.log('已生成：');
console.log('  ' + binPackingComparison());
console.log('  ' + kCenterGreedy());
