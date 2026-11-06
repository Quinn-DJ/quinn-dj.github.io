#!/usr/bin/env node
/**
 * 生成第七讲（动态规划）的 SVG 图。
 *
 *   node tools/figures/build-ads07-figures.js
 *
 * 只使用 Node 内置模块。图内没有数学公式，浅色和深色主题都由图内
 * <style> 控制，不依赖页面 CSS、字体请求或脚本。
 */

const fs = require('fs');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');
const FONT =
  "'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif";

const STYLE = `
    text{font-family:${FONT}}
    .panel{fill:#f7f8fb;stroke:#d9dde7;stroke-width:1.2}
    .edge{stroke:#667085;stroke-width:1.7;fill:none}
    .edge-good{stroke:#2e7d32;stroke-width:2.5;fill:none}
    .edge-move{stroke:#8a90a0;stroke-width:1.5;fill:none;stroke-dasharray:5 5}
    .box{fill:#ffffff;stroke:#667085;stroke-width:1.6}
    .box-good{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2.3}
    .dot{fill:#eef1ff;stroke:#3f51b5;stroke-width:1.8}
    .dot-repeat{fill:#fdecec;stroke:#c75252;stroke-width:2}
    .dot-good{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2}
    .txt{fill:#1f2330;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .txt-good{fill:#1f4f24;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .txt-repeat{fill:#8f2929;font-size:15px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .term{fill:#243b84;font-size:16px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .cap{fill:#3f51b5;font-size:18px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .lbl{fill:#3c4043;font-size:13.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .small{fill:#5f6673;font-size:12.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .good{fill:#2e7d32;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .repeat{fill:#b63c3c;font-size:14px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    @media (prefers-color-scheme: dark){
      .panel{fill:#222635;stroke:#41485c}
      .edge{stroke:#a6acba}
      .edge-good{stroke:#81c784}
      .edge-move{stroke:#737b8d}
      .box{fill:#292e3d;stroke:#a6acba}
      .box-good{fill:#24452f;stroke:#81c784}
      .dot{fill:#303a64;stroke:#9fa8da}
      .dot-repeat{fill:#4a292b;stroke:#ef9a9a}
      .dot-good{fill:#24452f;stroke:#81c784}
      .txt{fill:#eef0f6}
      .txt-good{fill:#c8e6c9}
      .txt-repeat{fill:#ffcdd2}
      .term{fill:#c5caff}
      .cap{fill:#aeb8ff}
      .lbl{fill:#d6d9e2}
      .small{fill:#b7bcc9}
      .good{fill:#a5d6a7}
      .repeat{fill:#ef9a9a}
    }`;

const arrowDefs = `
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path fill="#667085" d="M0,0 L10,5 L0,10 z"/>
    </marker>
    <marker id="arrow-good" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path fill="#2e7d32" d="M0,0 L10,5 L0,10 z"/>
    </marker>
    <marker id="arrow-move" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path fill="#8a90a0" d="M0,0 L10,5 L0,10 z"/>
    </marker>
    <style>
      @media (prefers-color-scheme: dark){
        marker#arrow path{fill:#a6acba}
        marker#arrow-good path{fill:#81c784}
        marker#arrow-move path{fill:#737b8d}
      }
    </style>
  </defs>`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
  </style>
${arrowDefs}`;

const line = (x1, y1, x2, y2, cls = 'edge', marker = 'arrow') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${
    marker ? ` marker-end="url(#${marker})"` : ''
  }/>\n`;

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

// ------------------------------------------------------- 1. 重叠子问题与表格
function overlapSubproblems() {
  const w = 980;
  const h = 430;
  let s = header(
    w,
    h,
    '斐波那契递归树中的重复子问题，以及从小到大填表的一次计算顺序'
  );

  s += `  <rect class="panel" x="24" y="24" width="600" height="382" rx="16"/>\n`;
  s += `  <rect class="panel" x="650" y="24" width="306" height="382" rx="16"/>\n`;
  s += text(324, 55, '递归树：同一个子问题被反复展开', 'cap');
  s += text(803, 55, '填表：从小到大只算一次', 'cap');

  const nodes = [
    [320, 105, 28, 'dot', 'F6', 'term'],
    [205, 200, 25, 'dot', 'F5', 'term'],
    [435, 200, 25, 'dot', 'F4', 'term'],
    [120, 305, 23, 'dot', 'F4', 'term'],
    [275, 305, 23, 'dot-repeat', 'F3', 'txt-repeat'],
    [365, 305, 23, 'dot-repeat', 'F3', 'txt-repeat'],
    [515, 305, 23, 'dot', 'F2', 'term'],
  ];

  s += line(304, 126, 221, 176);
  s += line(336, 126, 419, 176);
  s += line(186, 220, 137, 282);
  s += line(224, 220, 258, 282);
  s += line(416, 220, 382, 282);
  s += line(454, 220, 498, 282);

  for (const [x, y, r, cls, value, textCls] of nodes) {
    s += circle(x, y, r, cls);
    s += text(x, y + 1, value, textCls);
  }

  s += text(210, 275, '也重复', 'repeat');
  s += text(340, 352, '两个分支都要计算 F3', 'repeat');
  s += text(324, 386, '朴素递归的调用次数满足 T(N) ≥ T(N−1) + T(N−2)', 'lbl');

  const values = [
    ['F0', '1'],
    ['F1', '1'],
    ['F2', '2'],
    ['F3', '3'],
    ['F4', '5'],
    ['F5', '8'],
    ['F6', '13'],
  ];
  values.forEach(([term, value], i) => {
    const y = 105 + i * 42;
    s += rect(755, y, 118, 30, i >= 5 ? 'box-good' : 'box', 6);
    s += text(735, y + 1, term, 'txt');
    s += text(782, y + 1, value, 'txt-good');
    s += text(885, y + 1, i === 0 ? '起点' : `由前两项得到`, 'small');
    if (i > 0) {
      s += line(755, y - 27, 755, y - 15, 'edge-move', null);
    }
  });
  s += text(803, 386, '保存最近两个值即可，不必保留整张表', 'lbl');

  return save('dp-overlap.svg', s);
}

// --------------------------------------------------------- 2. 两条装配线
function assemblyLines() {
  const w = 1020;
  const h = 450;
  let s = header(
    w,
    h,
    '两条装配线、四个工位的调度图，绿色路径表示总时间 13 的最优方案'
  );

  s += `  <rect class="panel" x="20" y="20" width="980" height="410" rx="16"/>\n`;
  s += text(510, 50, '绿色路径：第 1 站在 1 号线，第 2 站之前换到 0 号线', 'cap');

  const xs = [255, 430, 605, 780];
  const y0 = 145;
  const y1 = 305;
  const stages = ['第 1 站', '第 2 站', '第 3 站', '第 4 站'];
  const times0 = ['4', '5', '3', '2'];
  const times1 = ['2', '6', '4', '3'];

  s += text(95, 115, '装配线 0', 'term');
  s += text(95, 275, '装配线 1', 'term');
  s += circle(78, 225, 34, 'dot');
  s += text(78, 225, '零件', 'txt');
  s += circle(930, 225, 34, 'dot');
  s += text(930, 225, '汽车', 'txt');

  for (let i = 0; i < xs.length; i++) {
    const good0 = i >= 1;
    const good1 = i === 0;
    s += rect(xs[i], y0, 110, 58, good0 ? 'box-good' : 'box');
    s += text(xs[i], y0 - 9, stages[i], 'txt');
    s += text(xs[i], y0 + 14, `工序 ${times0[i]}`, good0 ? 'good' : 'small');

    s += rect(xs[i], y1, 110, 58, good1 ? 'box-good' : 'box');
    s += text(xs[i], y1 - 9, stages[i], 'txt');
    s += text(xs[i], y1 + 14, `工序 ${times1[i]}`, good1 ? 'good' : 'small');
  }

  // 两条线的水平移动
  for (let i = 0; i < xs.length - 1; i++) {
    s += line(xs[i] + 55, y0, xs[i + 1] - 55, y0, i >= 1 ? 'edge-good' : 'edge', i >= 1 ? 'arrow-good' : 'arrow');
    s += line(xs[i] + 55, y1, xs[i + 1] - 55, y1, 'edge', 'arrow');
  }

  // 不同工位之间允许换线
  for (let i = 0; i < xs.length - 1; i++) {
    const x1 = xs[i] + 55;
    const x2 = xs[i + 1] - 55;
    const isBest = i === 0;
    s += line(x1, y0, x2, y1, isBest ? 'edge' : 'edge-move', 'arrow-move');
    s += line(x1, y1, x2, y0, isBest ? 'edge-good' : 'edge-move', isBest ? 'arrow-good' : 'arrow-move');
  }

  // 起点、终点与最优路径
  s += line(112, 225, xs[0] - 60, y1, 'edge-good', 'arrow-good');
  s += line(xs[0] + 55, y1, xs[1] - 55, y0, 'edge-good', 'arrow-good');
  s += line(xs[3] + 55, y0, 896, 225, 'edge-good', 'arrow-good');

  s += text(360, 230, '换线 +1', 'good');
  s += text(165, 192, '从 1 号线出发', 'good');
  s += text(865, 175, '到终点', 'good');
  s += text(510, 380, '时间：2 + 1 + 5 + 3 + 2 = 13', 'lbl');
  s += text(510, 406, '虚线是其他换线方向；是否换线由上一站的两条最优路径比较决定', 'small');

  return save('assembly-lines.svg', s);
}

console.log('已生成：');
console.log('  ' + overlapSubproblems());
console.log('  ' + assemblyLines());
