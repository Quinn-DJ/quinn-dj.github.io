#!/usr/bin/env node
/**
 * 生成 docs/coding/ads/figures 下第五讲（二项队列）的图。
 *
 *   node tools/figures/build-ads05-figures.js
 *
 * 四张图：二项树 B_0..B_3、13 个元素的二项队列、DeleteMin 的四步、
 * 以及孩子-兄弟（left-child / right-sibling）表示法。
 * 样式写在图内 <style>，浅色深色各一套。
 */

const fs = require('fs');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');
const FONT = "'LXGW WenKai','LXGW WenKai Screen','PingFang SC','Noto Sans SC',ui-sans-serif,-apple-system,Arial,sans-serif";

const STYLE = `
    .edge{stroke:#5f6368;stroke-width:1.6;fill:none}
    .sib{stroke:#d84343;stroke-width:1.8;fill:none;stroke-dasharray:5 4}
    .n{fill:#ffffff;stroke:#3f51b5;stroke-width:1.8}
    .key{fill:#1f2330;font-family:${FONT};font-size:13px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .cap{fill:#3f51b5;font-family:${FONT};font-size:15px;font-weight:600;text-anchor:middle}
    .lbl{fill:#3c4043;font-family:${FONT};font-size:13.5px;font-weight:500}
    .mono{fill:#3f51b5;font-family:'LXGW WenKai Mono','LXGW WenKai',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .mk{fill:#5f6368}
    @media (prefers-color-scheme: dark){
      .edge{stroke:#9aa0a6}
      .sib{stroke:#ef9a9a}
      .n{fill:#262a3a;stroke:#9fa8da}
      .key{fill:#e8eaf6}
      .cap{fill:#9fa8da}
      .lbl{fill:#c7cad6}
      .mono{fill:#9fa8da}
      .mk{fill:#9aa0a6}
    }`;

const ARROW = `  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path class="mk" d="M0,0 L10,5 L0,10 z"/>
    </marker>
    <marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path class="sibmk" d="M0,0 L10,5 L0,10 z"/>
    </marker>
  </defs>
`;

const header = (w, h, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <style>${STYLE}
    .sibmk{fill:#d84343}
    @media (prefers-color-scheme: dark){ .sibmk{fill:#ef9a9a} }
  </style>
${ARROW}`;

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

const edge = (x1, y1, x2, y2, cls = 'edge') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

/** 圆里放 key */
const node = (x, y, key, r = 17) =>
  `  <circle class="n" cx="${x}" cy="${y}" r="${r}"/>\n` +
  `  <text class="key" x="${x}" y="${y + 1}">${key}</text>\n`;

const text = (x, y, t, cls = 'lbl') => `  <text class="${cls}" x="${x}" y="${y}">${t}</text>`;
const mid = (x, y, t, cls = 'lbl') => `  <text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;

/**
 * 把一棵二项树排成图：{k: 根的值, c: [子树, ...]}，返回 {nodes, edges, width}
 * 同一个函数同时供下面几张图使用。
 */
function layout(tree, x, y, gap = 40, dy = 62) {
  const kids = tree.c || [];
  // 叶子占一格，节点画在格子的中间
  if (!kids.length) return {nodes: [{x: x + gap / 2, y, k: tree.k}], edges: [], width: gap};
  let cx = x;
  const subs = kids.map((kid) => {
    const sub = layout(kid, cx, y + dy, gap, dy);
    cx += sub.width;
    return sub;
  });
  const width = cx - x;
  const nx = x + width / 2;
  const nodes = [{x: nx, y, k: tree.k}];
  const edges = [];
  subs.forEach((sub) => {
    nodes.push(...sub.nodes);
    edges.push([nx, y, sub.nodes[0].x, sub.nodes[0].y], ...sub.edges);
  });
  return {nodes, edges, width};
}

function drawForest(trees, x, y, gap = 40) {
  let out = '';
  let cx = x;
  trees.forEach((t) => {
    if (!t) return;
    const sub = layout(t, cx, y, gap);
    sub.edges.forEach(([x1, y1, x2, y2]) => { out += edge(x1, y1 + 17, x2, y2 - 17) + '\n'; });
    sub.nodes.forEach((n) => { out += node(n.x, n.y, n.k); });
    cx += sub.width + 30;
  });
  return out;
}

/** 算一组树的总宽度（树之间留 34px） */
function forestWidth(trees, gap = 52) {
  return trees.filter(Boolean).reduce((sum, t, i) => sum + layout(t, 0, 0, gap).width + (i ? 34 : 0), 0);
}

/** 在一行里居中地画一组树 + 标题 */
function panel(s, trees, cx, top, caption, note, gap = 52) {
  const width = forestWidth(trees, gap);
  s += mid(cx, top - 26, caption, 'cap') + '\n';
  s += drawForest(trees, cx - width / 2, top, gap) + '';
  if (note) s += mid(cx, top + 250, note) + '\n';
  return s;
}

// ------------------------------------------------------ 1. B_0..B_3 的结构
function binomialTrees() {
  const w = 940, h = 520;
  let s = header(w, h, '二项树 B0 到 B3 的结构');
  const B0 = {k: 'B₀', c: []};
  const B1 = {k: 'B₁', c: [{k: 'B₀', c: []}]};
  const B2 = {k: 'B₂', c: [{k: 'B₁', c: [{k: 'B₀', c: []}]}, {k: 'B₀', c: []}]};
  const B3 = {k: 'B₃', c: [B2, B1, B0]};
  const panels = [
    {name: 'B₀', size: '1 个节点', t: B0, cx: 130, top: 120},
    {name: 'B₁', size: '2 个节点', t: B1, cx: 330, top: 120},
    {name: 'B₂', size: '4 个节点', t: B2, cx: 620, top: 120},
    {name: 'B₃', size: '8 个节点', t: B3, cx: 240, top: 320},
  ];
  panels.forEach((p) => {
    const sub = layout(p.t, 0, 0, 52);
    const x0 = p.cx - sub.width / 2;
    s += mid(p.cx, p.top - 52, p.name, 'cap') + '\n';
    s += mid(p.cx, p.top - 28, p.size) + '\n';
    sub.edges.forEach(([x1, y1, x2, y2]) => {
      s += edge(x1 + x0, y1 + p.top + 17, x2 + x0, y2 + p.top - 17) + '\n';
    });
    sub.nodes.forEach((n) => { s += node(n.x + x0, n.y + p.top, n.k, 18); });
  });
  s += `  <text class="mono" x="700" y="330">B_k 的根有 k 个孩子：B_0, B_1, …, B_{k-1}</text>\n`;
  s += `  <text class="mono" x="700" y="362">B_k 有 2^k 个节点</text>\n`;
  s += `  <text class="mono" x="700" y="394">第 d 层有 C(k, d) 个节点（二项式系数）</text>\n`;
  return save('binomial-trees.svg', s);
}

// ------------------------------------------- 2. 13 个元素的二项队列（13 = 1101₂）
function queueExample() {
  const w = 960, h = 480;
  let s = header(w, h, '13 个元素的二项队列：B3 + B2 + B0');
  s += `  <text class="mono" x="480" y="42">13 = 1101₂ = 2³ + 2² + 2⁰  →  B₃ + B₂ + B₀</text>\n`;
  const B0 = {k: 13, c: []};
  const B2 = {k: 9, c: [{k: 11, c: [{k: 12, c: []}]}, {k: 10, c: []}]};
  const B3 = {k: 1, c: [{k: 5, c: [{k: 7, c: [{k: 8, c: []}]}, {k: 6, c: []}]}, {k: 3, c: [{k: 4, c: []}]}, {k: 2, c: []}]};
  const panels = [
    {t: B3, cx: 250, cap: 'B₃（8 个节点）'},
    {t: B2, cx: 620, cap: 'B₂（4 个节点）'},
    {t: B0, cx: 860, cap: 'B₀（1 个节点）'},
  ];
  panels.forEach((p) => {
    const sub = layout(p.t, 0, 0, 52);
    const x0 = p.cx - sub.width / 2;
    sub.edges.forEach(([x1, y1, x2, y2]) => { s += edge(x1 + x0, y1 + 120 + 17, x2 + x0, y2 + 120 - 17) + '\n'; });
    sub.nodes.forEach((n) => { s += node(n.x + x0, n.y + 120, n.k, 18); });
    s += mid(p.cx, 380, p.cap, 'cap') + '\n';
  });
  s += mid(480, 440, '每棵树都是堆序的（根比孩子小）；树的大小是 2 的幂，所以 N 的二进制表示唯一决定用哪几棵树') + '\n';
  return save('binomial-queue-example.svg', s);
}

// ------------------------------------------------ 3. DeleteMin 的四步（7 个元素）
function deleteMinFigure() {
  const w = 1000, h = 640;
  let s = header(w, h, '二项队列 DeleteMin 的四步');
  const H = [{k: 1, c: [{k: 3, c: [{k: 4, c: []}]}, {k: 2, c: []}]}, {k: 5, c: [{k: 6, c: []}]}, {k: 7, c: []}];
  const Hp = [{k: 5, c: [{k: 6, c: []}]}, {k: 7, c: []}];
  const Hpp = [{k: 3, c: [{k: 4, c: []}]}, {k: 2, c: []}];
  const res = [{k: 3, c: [{k: 5, c: [{k: 6, c: []}]}, {k: 4, c: []}]}, {k: 2, c: [{k: 7, c: []}]}];
  const cells = [
    {trees: H, cx: 250, top: 80, cap: 'H：插入 1..7 之后的队列（7 = 111₂）', note: 'Step 1：最小值 1 在 B₂ 的根上，O(log N)'},
    {trees: Hp, cx: 750, top: 80, cap: "H'：把 B₂ 整棵摘掉，O(1)", note: '剩下的 3 个节点：B₁ + B₀'},
    {trees: Hpp, cx: 250, top: 400, cap: "H''：摘掉根 1，两个孩子变成独立的树，O(log N)", note: '孩子是 B₁ 和 B₀，按身高递减排好'},
    {trees: res, cx: 750, top: 400, cap: "Merge(H', H'')：6 = 110₂ → B₂ + B₁，O(log N)", note: '合并完还是 B₂ + B₁'},
  ];
  cells.forEach((c) => {
    s += mid(c.cx, c.top - 30, c.cap, 'cap') + '\n';
    const width = forestWidth(c.trees);
    s += drawForest(c.trees, c.cx - width / 2, c.top) + '';
    s += mid(c.cx, c.top + 190, c.note) + '\n';
  });
  return save('binomial-delete-min.svg', s);
}

// ------------------------------- 4. 孩子-兄弟表示法（left-child / right-sibling）
function lcrsFigure() {
  const w = 780, h = 420;
  let s = header(w, h, '二项树的孩子-兄弟表示法');
  const P = {9: [390, 80], 11: [300, 190], 10: [470, 190], 12: [300, 295]};
  // LeftChild：实线
  s += edge(390, 97, 300, 173) + '\n';
  s += edge(300, 207, 300, 278) + '\n';
  // NextSibling：红色虚线
  s += `  <line class="sib" x1="318" y1="190" x2="452" y2="190" marker-end="url(#arrow2)"/>\n`;
  Object.keys(P).forEach((k) => { s += node(P[k][0], P[k][1], k, 18); });
  s += `  <text class="lbl" x="255" y="140">LeftChild</text>\n`;
  s += `  <text class="lbl" x="385" y="170">NextSibling</text>\n`;
  s += mid(390, 350, 'struct BinNode { ElementType Element; Position LeftChild; Position NextSibling; };') + '\n';
  s += mid(390, 378, '每个节点只要两个指针：孩子串成一条链，第一个孩子由 LeftChild 指过去') + '\n';
  return save('binomial-lcrs.svg', s);
}

console.log('已生成：');
console.log('  ' + binomialTrees());
console.log('  ' + queueExample());
console.log('  ' + deleteMinFigure());
console.log('  ' + lcrsFigure());
