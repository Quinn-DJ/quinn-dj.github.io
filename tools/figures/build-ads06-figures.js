#!/usr/bin/env node
/**
 * 生成第六讲（回溯）的 SVG 图。
 *
 *   node tools/figures/build-ads06-figures.js
 *
 * 只使用 Node 内置模块。图内只有简单记号，不依赖页面 MathJax，
 * 浅色和深色主题都由图内 <style> 控制。
 */

const fs = require('fs');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');

const STYLE = `
    text{font-family:'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif}
    .panel{fill:#f7f8fb;stroke:#d9dde7;stroke-width:1}
    .edge{stroke:#667085;stroke-width:1.8;fill:none}
    .edge-good{stroke:#2e7d32;stroke-width:2.4;fill:none}
    .edge-bad{stroke:#c75252;stroke-width:1.7;fill:none;stroke-dasharray:5 5}
    .node{fill:#ffffff;stroke:#667085;stroke-width:1.8}
    .node-root{fill:#e8eefc;stroke:#3f51b5;stroke-width:2}
    .node-good{fill:#e7f4e8;stroke:#2e7d32;stroke-width:2.2}
    .node-bad{fill:#f9eded;stroke:#c75252;stroke-width:1.8}
    .node-max{fill:#e8eefc;stroke:#3f51b5;stroke-width:2}
    .node-min{fill:#f9eded;stroke:#c75252;stroke-width:2}
    .pruned{fill:#34384a;stroke:#202431;stroke-width:2}
    .txt{fill:#1f2330;font-size:17px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .txt-light{fill:#ffffff;font-size:17px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .cap{fill:#3f51b5;font-size:20px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .lbl{fill:#3c4043;font-size:15px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .lbl-left{fill:#3c4043;font-size:15px;font-weight:500;dominant-baseline:central}
    .small{fill:#5f6673;font-size:13px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .good{fill:#2e7d32;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .bad{fill:#b63c3c;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .bound{fill:#b23a3a;font-size:22px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .board-edge{stroke:#4c5260;stroke-width:2;fill:none}
    .cell-a{fill:#fbfbf7}
    .cell-b{fill:#e7e3d8}
    .cell-q{fill:#dce5ff;stroke:#3f51b5;stroke-width:2}
    .queen{fill:#243b84;font-size:27px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .axis{stroke:#667085;stroke-width:2;fill:none}
    .tick{stroke:#9aa1ad;stroke-width:1.2;fill:none}
    .point{fill:#3f51b5;stroke:#243b84;stroke-width:1.5}
    .distance{fill:#dce5ff;stroke:#8798d8;stroke-width:1.2}
    .distance-t{fill:#243b84;font-size:14px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .chip{fill:#ffffff;stroke:#9aa1ad;stroke-width:1.3}
    @media (prefers-color-scheme: dark){
      .panel{fill:#222635;stroke:#41485c}
      .edge{stroke:#9aa0ae}
      .edge-good{stroke:#81c784}
      .edge-bad{stroke:#ef9a9a}
      .node{fill:#292e3d;stroke:#9aa0ae}
      .node-root{fill:#303a64;stroke:#9fa8da}
      .node-good{fill:#24452f;stroke:#81c784}
      .node-bad{fill:#4a292b;stroke:#ef9a9a}
      .node-max{fill:#303a64;stroke:#9fa8da}
      .node-min{fill:#4a292b;stroke:#ef9a9a}
      .pruned{fill:#11131b;stroke:#e0e3eb}
      .txt{fill:#eef0f6}
      .txt-light{fill:#f7f8fb}
      .cap{fill:#aeb8ff}
      .lbl{fill:#d6d9e2}
      .lbl-left{fill:#d6d9e2}
      .small{fill:#b7bcc9}
      .good{fill:#a5d6a7}
      .bad{fill:#ef9a9a}
      .bound{fill:#ff9e9e}
      .board-edge{stroke:#d6d9e2}
      .cell-a{fill:#2a2f3d}
      .cell-b{fill:#373d4d}
      .cell-q{fill:#374579;stroke:#aeb8ff}
      .queen{fill:#eef1ff}
      .axis{stroke:#aeb4c2}
      .tick{stroke:#737b8d}
      .point{fill:#9fa8da;stroke:#e8eaf6}
      .distance{fill:#303a64;stroke:#7d8bc8}
      .distance-t{fill:#eef0ff}
      .chip{fill:#2b3040;stroke:#858da0}
    }`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
  </style>`;

const line = (x1, y1, x2, y2, cls = 'edge') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>\n`;

const node = (x, y, text, cls = 'node', r = 20, textCls = 'txt') =>
  `  <circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>\n` +
  `  <text class="${textCls}" x="${x}" y="${y + 1}">${text}</text>\n`;

const label = (x, y, text, cls = 'lbl', extra = '') =>
  `  <text class="${cls}" x="${x}" y="${y}"${extra}>${text}</text>\n`;

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

// ------------------------------------------------------- 1. 四皇后的首条解路径
function backtrackingTree() {
  const w = 960;
  const h = 580;
  let s = header(w, h, '四皇后的深度优先搜索树，首条解路径为 2、4、1、3');

  // 根结点和第一层
  s += line(480, 56, 130, 140);
  s += line(480, 56, 360, 140, 'edge-good');
  s += line(480, 56, 590, 140);
  s += line(480, 56, 820, 140);
  s += node(480, 56, '根', 'node-root', 22);
  s += node(130, 140, '1');
  s += node(360, 140, '2', 'node-good');
  s += node(590, 140, '3');
  s += node(820, 140, '4');
  s += label(260, 88, 'x₁ = 1');
  s += label(420, 92, 'x₁ = 2', 'good');
  s += label(550, 88, 'x₁ = 3');
  s += label(720, 88, 'x₁ = 4');
  s += label(130, 180, '整枝无解，撤销', 'bad');
  s += label(590, 180, '继续枚举时有解', 'small');
  s += label(820, 180, '继续枚举时无解', 'small');

  // 用一条虚线把“撤销”画出来
  s += `  <path class="edge-bad" d="M130 120 C175 76 270 48 420 47" marker-end="url(#arrow-bad)"/>\n`;
  s += label(280, 54, '回溯', 'bad');

  // x1 = 2 下的 x2 候选
  s += line(360, 160, 250, 224, 'edge-bad');
  s += line(360, 160, 320, 224, 'edge-bad');
  s += line(360, 160, 390, 224, 'edge-bad');
  s += line(360, 160, 460, 224, 'edge-good');
  s += node(250, 224, '1', 'node-bad', 14, 'bad');
  s += node(320, 224, '2', 'node-bad', 14, 'bad');
  s += node(390, 224, '3', 'node-bad', 14, 'bad');
  s += node(460, 224, '4', 'node-good', 20);
  s += label(355, 202, 'x₂ = 1 … 4', 'small');

  // x2 = 4 下的 x3 候选
  s += line(460, 244, 390, 306, 'edge-good');
  s += line(460, 244, 460, 306, 'edge-bad');
  s += line(460, 244, 530, 306, 'edge-bad');
  s += line(460, 244, 600, 306, 'edge-bad');
  s += node(390, 306, '1', 'node-good', 20);
  s += node(460, 306, '2', 'node-bad', 14, 'bad');
  s += node(530, 306, '3', 'node-bad', 14, 'bad');
  s += node(600, 306, '4', 'node-bad', 14, 'bad');
  s += label(505, 284, 'x₃ = 1 … 4', 'small');

  // x3 = 1 下的 x4 候选
  s += line(390, 326, 330, 390, 'edge-bad');
  s += line(390, 326, 390, 390, 'edge-bad');
  s += line(390, 326, 450, 390, 'edge-good');
  s += node(330, 390, '1', 'node-bad', 14, 'bad');
  s += node(390, 390, '2', 'node-bad', 14, 'bad');
  s += node(450, 390, '3', 'node-good', 20);
  s += label(399, 366, 'x₄ = 1 … 3', 'small');

  // 首条解和说明
  s += `  <rect class="chip" x="530" y="356" width="335" height="92" rx="12"/>\n`;
  s += label(697, 383, '首次成功', 'cap');
  s += label(697, 415, '(2, 4, 1, 3)', 'good');
  s += label(697, 437, '搜索到这里就可以返回', 'small');
  s += `  <path class="edge-good" d="M470 390 C500 390 505 392 525 396" marker-end="url(#arrow-good)"/>\n`;
  s += label(480, 520, '失败的同级分支先撤销，再试下一个候选；这就是“回溯”', 'lbl');

  s = s.replace(
    '  <style>',
    `  <defs>
    <marker id="arrow-good" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path fill="#2e7d32" d="M0,0 L10,5 L0,10 z"/>
    </marker>
    <marker id="arrow-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path fill="#c75252" d="M0,0 L10,5 L0,10 z"/>
    </marker>
  </defs>
  <style>`
  );

  return save('backtracking-dfs.svg', s);
}

// ------------------------------------------------------------ 2. 八皇后合法解
function eightQueensBoard() {
  const w = 780;
  const h = 710;
  const x0 = 110;
  const y0 = 72;
  const cell = 70;
  const xs = [4, 6, 8, 2, 7, 1, 3, 5];
  let s = header(w, h, '八皇后问题的一个合法摆法，每一行、每一列和两条对角线都不冲突');

  s += `  <rect class="panel" x="24" y="24" width="732" height="650" rx="16"/>\n`;
  for (let c = 1; c <= 8; c++) {
    s += label(x0 + (c - 0.5) * cell, 51, String(c), 'cap');
  }
  for (let r = 1; r <= 8; r++) {
    s += label(x0 - 24, y0 + (r - 0.5) * cell, String(r), 'cap');
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cls = (r + c) % 2 === 0 ? 'cell-a' : 'cell-b';
      s += `  <rect class="${cls}" x="${x0 + c * cell}" y="${y0 + r * cell}" width="${cell}" height="${cell}"/>\n`;
    }
  }

  xs.forEach((col, row) => {
    const x = x0 + (col - 1) * cell;
    const y = y0 + row * cell;
    s += `  <rect class="cell-q" x="${x}" y="${y}" width="${cell}" height="${cell}"/>\n`;
    s += label(x + cell / 2, y + cell / 2 + 1, 'Q', 'queen');
  });
  s += `  <rect class="board-edge" x="${x0}" y="${y0}" width="${8 * cell}" height="${8 * cell}"/>\n`;

  s += label(390, 650, 'x = (4, 6, 8, 2, 7, 1, 3, 5)', 'cap');
  s += label(390, 678, '第 i 行的皇后放在第 xᵢ 列；行号在左，列号在上', 'small');
  return save('eight-queens.svg', s);
}

// ------------------------------------------------------ 3. Turnpike 定点与分支
function turnpikeReconstruction() {
  const w = 1040;
  const h = 610;
  const axisY = 105;
  const left = 82;
  const unit = 88;
  const points = [0, 3, 5, 6, 8, 10];
  let s = header(w, h, 'Turnpike 重建题的一组点，以及找到 0、3、5、6、8、10 的主要分支');

  s += `  <rect class="panel" x="22" y="22" width="996" height="566" rx="16"/>\n`;
  s += label(520, 50, '端点确定后，逐个尝试剩余的最大距离', 'cap');
  s += line(left, axisY, left + 10 * unit, axisY, 'axis');

  for (let d = 0; d <= 10; d++) {
    const x = left + d * unit;
    s += line(x, axisY - 6, x, axisY + 6, 'tick');
    s += label(x, axisY + 24, String(d), 'small');
  }

  points.forEach((d) => {
    const x = left + d * unit;
    s += node(x, axisY, '', 'point', 7);
    s += label(x, axisY - 24, String(d), 'lbl');
  });
  s += label(520, 160, '15 个两两距离推出 N = 6；最大距离 10 给出 x₁ = 0、x₆ = 10', 'lbl');

  // 主要分支：8 -> 7（失败）或 3 -> 6 -> 5
  s += line(520, 220, 520, 265);
  s += node(520, 220, '10', 'node-root', 21);
  s += node(520, 286, 'x₅ = 8', 'node-root', 30);
  s += line(520, 316, 360, 372, 'edge-bad');
  s += line(520, 316, 680, 372, 'edge-good');
  s += node(360, 402, 'x₄ = 7', 'node-bad', 30, 'bad');
  s += node(680, 402, 'x₂ = 3', 'node-good', 30);
  s += line(360, 432, 360, 488, 'edge-bad');
  s += node(360, 518, '两条子分支都失败', 'node-bad', 45, 'bad');
  s += line(680, 432, 680, 488, 'edge-good');
  s += node(680, 518, 'x₄ = 6', 'node-good', 30);
  s += line(680, 548, 840, 514, 'edge-good');
  s += node(840, 514, 'x₃ = 5', 'node-good', 30);
  s += `  <path class="edge-bad" d="M395 402 C470 382 580 382 648 402" marker-end="url(#arrow-bad)"/>\n`;
  s += label(522, 370, '撤销', 'bad');
  s += label(840, 560, '距离集合清空，成功', 'good');

  s = s.replace(
    '  <style>',
    `  <defs>
    <marker id="arrow-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path fill="#c75252" d="M0,0 L10,5 L0,10 z"/>
    </marker>
  </defs>
  <style>`
  );

  return save('turnpike-reconstruction.svg', s);
}

// ------------------------------------------------ 4. Alpha 与 Beta 两种剪枝
function alphaBetaPruning() {
  const w = 1040;
  const h = 590;
  let s = header(w, h, '极小化极大搜索中的 alpha 剪枝和 beta 剪枝示例');

  s += `  <rect class="panel" x="22" y="22" width="476" height="546" rx="16"/>\n`;
  s += `  <rect class="panel" x="542" y="22" width="476" height="546" rx="16"/>\n`;
  s += label(260, 40, 'α 剪枝', 'cap');
  s += label(780, 40, 'β 剪枝', 'cap');

  // 左：MAX 根已有 44，右侧 MIN 顶多给 40
  s += line(260, 110, 150, 206);
  s += line(260, 110, 370, 206);
  s += node(260, 86, '44', 'node-max', 28);
  s += label(310, 86, 'MAX', 'cap', ' text-anchor="start"');
  s += node(150, 232, '44', 'node-min', 28);
  s += label(150, 182, 'MIN', 'bad');
  s += node(370, 232, '40', 'node-min', 28);
  s += label(370, 182, 'MIN', 'bad');

  s += line(150, 260, 150, 330);
  s += node(150, 352, '…', 'node', 22);
  s += line(370, 260, 305, 330);
  s += line(370, 260, 410, 330, 'edge-bad');
  s += node(305, 352, '40', 'node-max', 26);
  s += label(305, 314, 'MAX', 'cap');
  s += node(410, 352, '?', 'pruned', 30, 'txt-light');
  s += label(410, 314, '剪掉', 'bad');
  s += label(260, 281, '≥', 'bound');
  s += label(260, 430, 'MAX 已能保证 44', 'lbl');
  s += label(260, 462, 'MIN 这个分支最多给 40', 'lbl');
  s += label(260, 494, '再搜也不会让根超过 44', 'small');

  // 右：MIN 根已有 44，左侧 MAX 至少能给 68
  s += line(780, 110, 670, 206);
  s += line(780, 110, 890, 206);
  s += node(780, 86, '44', 'node-min', 28);
  s += label(830, 86, 'MIN', 'bad', ' text-anchor="start"');
  s += node(670, 232, '44', 'node-max', 28);
  s += label(670, 182, 'MAX', 'cap');
  s += node(890, 232, '68', 'node-max', 28);
  s += label(890, 182, 'MAX', 'cap');

  s += line(670, 260, 670, 330);
  s += node(670, 352, '…', 'node', 22);
  s += line(890, 260, 825, 330);
  s += line(890, 260, 930, 330, 'edge-bad');
  s += node(825, 352, '68', 'node-min', 26);
  s += label(825, 314, 'MIN', 'bad');
  s += node(930, 352, '?', 'pruned', 30, 'txt-light');
  s += label(930, 314, '剪掉', 'bad');
  s += label(780, 281, '≤', 'bound');
  s += label(780, 430, 'MIN 已经拿到 44', 'lbl');
  s += label(780, 462, 'MAX 这个分支至少能给 68', 'lbl');
  s += label(780, 494, '再搜也不会让根低于 44', 'small');

  s += label(520, 548, '共同条件：α ≥ β 时，当前结点剩余分支不可能改变上层决策', 'lbl');

  return save('minimax-alpha-beta.svg', s);
}

const results = [
  backtrackingTree(),
  eightQueensBoard(),
  turnpikeReconstruction(),
  alphaBetaPruning(),
];

console.log(results.join('\n'));
