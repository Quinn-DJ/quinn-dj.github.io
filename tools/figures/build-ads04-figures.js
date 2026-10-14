#!/usr/bin/env node
/**
 * 生成 docs/coding/ads/figures 下第四讲（左倾堆与斜堆）的图。
 *
 *   node tools/figures/build-ads04-figures.js
 *
 * 三张图：Npl 与左倾性质、左倾堆合并的例子、斜堆均摊分析里的重节点。
 * 图里没有数学公式，样式都写在图内 <style>，浅色深色各一套。
 */

const fs = require('fs');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');
const FONT = "'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif";

const STYLE = `
    .edge{stroke:#5f6368;stroke-width:1.6;fill:none}
    .path{stroke:#d84343;stroke-width:2.2;fill:none}
    .n{fill:#ffffff;stroke:#3f51b5;stroke-width:1.8}
    .heavy{fill:#37474f;stroke:#263238;stroke-width:1.8}
    .key{fill:#1f2330;font-family:${FONT};font-size:14px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .keyw{fill:#ffffff;font-family:${FONT};font-size:14px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .badge{fill:#eef1ff;stroke:#3f51b5;stroke-width:1.2}
    .badgetxt{fill:#3f51b5;font-family:${FONT};font-size:10.5px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .cap{fill:#3f51b5;font-family:${FONT};font-size:15px;font-weight:600;text-anchor:middle}
    .lbl{fill:#3c4043;font-family:${FONT};font-size:13.5px;font-weight:500}
    .mark{fill:#d84343;font-family:${FONT};font-size:20px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .ok{fill:#2e7d32;font-family:${FONT};font-size:20px;font-weight:700;text-anchor:middle;dominant-baseline:central}
    .mk{fill:#5f6368}
    @media (prefers-color-scheme: dark){
      .edge{stroke:#9aa0a6}
      .path{stroke:#ef9a9a}
      .n{fill:#262a3a;stroke:#9fa8da}
      .heavy{fill:#455a64;stroke:#90a4ae}
      .key{fill:#e8eaf6}
      .keyw{fill:#ffffff}
      .badge{fill:#33406b;stroke:#9fa8da}
      .badgetxt{fill:#c5cae9}
      .cap{fill:#9fa8da}
      .lbl{fill:#c7cad6}
      .mark{fill:#ef9a9a}
      .ok{fill:#a5d6a7}
      .mk{fill:#9aa0a6}
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

const edge = (x1, y1, x2, y2, cls = 'edge') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

/** 圆里放 key，右上角可以带一个 Npl 小徽标 */
const node = (x, y, key, {npl = null, heavy = false, r = 19} = {}) => {
  let out = `  <circle class="${heavy ? 'heavy' : 'n'}" cx="${x}" cy="${y}" r="${r}"/>\n`;
  out += `  <text class="${heavy ? 'keyw' : 'key'}" x="${x}" y="${y + 1}">${key}</text>\n`;
  if (npl !== null) {
    out += `  <circle class="badge" cx="${x + 17}" cy="${y - 15}" r="9.5"/>\n`;
    out += `  <text class="badgetxt" x="${x + 17}" y="${y - 14}">${npl}</text>\n`;
  }
  return out;
};

const text = (x, y, t, cls = 'lbl') => `  <text class="${cls}" x="${x}" y="${y}">${t}</text>`;
const mid = (x, y, t, cls = 'lbl') => `  <text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;

// ------------------------------------------------- 1. Npl 的定义与左倾性质
function nplFigure() {
  const w = 880, h = 440;
  let s = header(w, h, 'Npl 的定义与左倾性质');
  s += text(200, 40, '满足左倾性质', 'cap') + '\n';
  s += text(650, 40, '不满足左倾性质', 'cap') + '\n';

  // 左边：合法
  const L = {root: [200, 90], b: [130, 175], c: [270, 175], d: [95, 260], e: [165, 260]};
  s += edge(L.root[0], L.root[1] + 19, L.b[0], L.b[1] - 19) + '\n';
  s += edge(L.root[0], L.root[1] + 19, L.c[0], L.c[1] - 19) + '\n';
  s += edge(L.b[0], L.b[1] + 19, L.d[0], L.d[1] - 19) + '\n';
  s += edge(L.b[0], L.b[1] + 19, L.e[0], L.e[1] - 19) + '\n';
  s += node(L.root[0], L.root[1], '1') + node(L.b[0], L.b[1], '1') + node(L.c[0], L.c[1], '0');
  s += node(L.d[0], L.d[1], '0') + node(L.e[0], L.e[1], '0');
  s += mid(200, 400, '每个节点：左孩子的 Npl ≥ 右孩子的 Npl') + '\n';
  s += `  <text class="ok" x="340" y="175">✓</text>\n`;

  // 右边：不合法，B 的左孩子 Npl 0 < 右孩子 Npl 1
  const R = {root: [650, 90], b: [580, 175], c: [720, 175], d: [545, 260], e: [615, 260], f: [650, 345]};
  s += edge(R.root[0], R.root[1] + 19, R.b[0], R.b[1] - 19) + '\n';
  s += edge(R.root[0], R.root[1] + 19, R.c[0], R.c[1] - 19) + '\n';
  s += edge(R.b[0], R.b[1] + 19, R.d[0], R.d[1] - 19) + '\n';
  s += edge(R.b[0], R.b[1] + 19, R.e[0], R.e[1] - 19) + '\n';
  s += edge(R.e[0] + 6, R.e[1] + 17, R.f[0], R.f[1] - 19) + '\n';
  s += node(R.root[0], R.root[1], '1') + node(R.b[0], R.b[1], '1') + node(R.c[0], R.c[1], '0');
  s += node(R.d[0], R.d[1], '0') + node(R.e[0], R.e[1], '1') + node(R.f[0], R.f[1], '0');
  s += `  <text class="mark" x="536" y="150">✗</text>\n`;
  s += mid(650, 400, 'B 处左边是 0、右边是 1，违反了左倾性质') + '\n';
  return save('leftist-npl.svg', s);
}

// ------------------------------------------- 2. 左倾堆合并的例子（H1 + H2 → 结果）
function mergeFigure() {
  const w = 1000, h = 620;
  let s = header(w, h, '两个左倾堆的合并过程');

  // H1 = 3(10(14,23), 21)，右路径 3 → 21
  s += text(150, 45, 'H₁', 'cap') + '\n';
  const h1 = {r: [150, 80], a: [90, 155], b: [210, 155], c: [60, 230], d: [120, 230]};
  s += edge(h1.r[0], h1.r[1] + 19, h1.a[0], h1.a[1] - 19) + '\n';
  s += edge(h1.r[0], h1.r[1] + 19, h1.b[0], h1.b[1] - 19, 'path') + '\n';
  s += edge(h1.a[0], h1.a[1] + 19, h1.c[0], h1.c[1] - 19) + '\n';
  s += edge(h1.a[0], h1.a[1] + 19, h1.d[0], h1.d[1] - 19) + '\n';
  s += node(h1.r[0], h1.r[1], '3', {npl: 1}) + node(h1.a[0], h1.a[1], '10', {npl: 1});
  s += node(h1.b[0], h1.b[1], '21', {npl: 0}) + node(h1.c[0], h1.c[1], '14', {npl: 0});
  s += node(h1.d[0], h1.d[1], '23', {npl: 0});
  s += text(150, 275, '右路径：3 → 21', 'lbl') + '\n';

  // H2 = 6(7(18,24), 12(37,33))，右路径 6 → 12 → 33
  s += text(150, 350, 'H₂', 'cap') + '\n';
  const h2 = {r: [150, 385], a: [90, 460], b: [210, 460], c: [60, 535], d: [120, 535], e: [180, 535], f: [240, 535]};
  s += edge(h2.r[0], h2.r[1] + 19, h2.a[0], h2.a[1] - 19) + '\n';
  s += edge(h2.r[0], h2.r[1] + 19, h2.b[0], h2.b[1] - 19, 'path') + '\n';
  s += edge(h2.a[0], h2.a[1] + 19, h2.c[0], h2.c[1] - 19) + '\n';
  s += edge(h2.a[0], h2.a[1] + 19, h2.d[0], h2.d[1] - 19) + '\n';
  s += edge(h2.b[0], h2.b[1] + 19, h2.e[0], h2.e[1] - 19) + '\n';
  s += edge(h2.b[0], h2.b[1] + 19, h2.f[0], h2.f[1] - 19, 'path') + '\n';
  s += node(h2.r[0], h2.r[1], '6', {npl: 2}) + node(h2.a[0], h2.a[1], '7', {npl: 1});
  s += node(h2.b[0], h2.b[1], '12', {npl: 1}) + node(h2.c[0], h2.c[1], '18', {npl: 0});
  s += node(h2.d[0], h2.d[1], '24', {npl: 0}) + node(h2.e[0], h2.e[1], '37', {npl: 0});
  s += node(h2.f[0], h2.f[1], '33', {npl: 0});
  s += text(150, 580, '右路径：6 → 12 → 33', 'lbl') + '\n';

  // 箭头
  s += `  <line class="edge" x1="330" y1="300" x2="420" y2="300" marker-end="url(#arrow)"/>\n`;
  s += text(375, 280, '合并', 'cap') + '\n';

  // 结果：in-order 编号 18 7 24 6 37 12 21 33 3 14 10 23
  const order = [18, 7, 24, 6, 37, 12, 21, 33, 3, 14, 10, 23];
  const depth = {18: 3, 7: 2, 24: 3, 6: 1, 37: 3, 12: 2, 21: 3, 33: 4, 3: 0, 14: 2, 10: 1, 23: 2};
  const pos = {};
  order.forEach((k, i) => { pos[k] = [560 + 32 * i, 80 + 75 * depth[k]]; });
  const links = [[3, 6], [3, 10], [6, 7], [6, 12], [7, 18], [7, 24], [12, 37], [12, 21], [21, 33], [10, 14], [10, 23]];
  links.forEach(([a, b]) => { s += edge(pos[a][0], pos[a][1] + 19, pos[b][0], pos[b][1] - 19) + '\n'; });
  const npls = {3: 2, 6: 2, 10: 1, 7: 1, 12: 1, 14: 0, 23: 0, 18: 0, 24: 0, 37: 0, 21: 0, 33: 0};
  order.forEach((k) => { s += node(pos[k][0], pos[k][1], String(k), {npl: npls[k], r: 18}) + '\n'; });
  s += text(760, 45, '合并结果（徽标里是 Npl）', 'cap') + '\n';
  s += mid(620, 520, '合并沿着两条右路径往下走：H₁ 的 3 → 21，H₂ 的 6 → 12 → 33，') + '\n';
  s += mid(620, 542, '一共 4 次递归；回程时再检查左右 Npl、必要时交换孩子') + '\n';
  return save('leftist-merge-example.svg', s);
}

// ------------------------------------------ 3. 斜堆均摊分析：重节点与轻节点
function heavyLightFigure() {
  const w = 900, h = 490;
  let s = header(w, h, '斜堆均摊分析里的重节点与轻节点');
  const P = {1: [430, 80], 2: [280, 180], 3: [580, 180], 4: [200, 280], 5: [340, 280], 6: [500, 280], 7: [660, 280], 8: [710, 380]};
  const E = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [7, 8]];
  E.forEach(([a, b]) => { s += edge(P[a][0], P[a][1] + 19, P[b][0], P[b][1] - 19) + '\n'; });
  const size = {1: 8, 2: 3, 3: 5, 4: 1, 5: 1, 6: 1, 7: 2, 8: 1};
  const heavy = {1: true, 7: true};
  Object.keys(P).forEach((k) => {
    s += node(P[k][0], P[k][1], k, {npl: size[k], heavy: !!heavy[k], r: 20}) + '\n';
  });
  s += mid(450, 435, '深色是重节点（右子树节点数 ≥ 该节点子树节点数的一半），浅色是轻节点') + '\n';
  s += mid(450, 460, '徽标里是子树节点数；合并只会改变右路径 1 → 3 → 7 → 8 上节点的轻重') + '\n';
  return save('skew-heavy-light.svg', s);
}

console.log('已生成：');
console.log('  ' + nplFigure());
console.log('  ' + mergeFigure());
console.log('  ' + heavyLightFigure());
