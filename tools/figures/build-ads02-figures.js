#!/usr/bin/env node
/**
 * 生成 docs/coding/ads/figures 下第二讲（红黑树 / B+ 树）的图。
 *
 *   node tools/figures/build-ads02-figures.js
 *
 * 只画结构，图里没有数学公式，所以不依赖 MathJax。样式都是图内 <style>，
 * 浅色和深色各一套，引用方式仍然是 <img>，不引外部字体。
 */

const fs = require('fs');
const path = require('path');

const FIG_DIR = path.join(__dirname, '../../docs/coding/ads/figures');

const STYLE = `
    .edge{stroke:#5f6368;stroke-width:1.6;fill:none}
    .link{stroke:#9aa0a6;stroke-width:1.4;fill:none}
    .bk{fill:#37474f;stroke:#263238;stroke-width:1.6}
    .rd{fill:#d84343;stroke:#b71c1c;stroke-width:1.6}
    .ring{fill:none;stroke:#263238;stroke-width:1.6}
    .nt{fill:#ffffff;font-family:ui-sans-serif,-apple-system,'PingFang SC','Noto Sans SC',Arial,sans-serif;font-size:15px;font-weight:600;text-anchor:middle;dominant-baseline:central}
    .box{fill:#f4f5f7;stroke:#9aa0a6;stroke-width:1.4}
    .hl{fill:#dbe4ff;stroke:#3f51b5;stroke-width:1.6}
    .key{fill:#1f2330;font-family:ui-sans-serif,-apple-system,'PingFang SC','Noto Sans SC',Arial,sans-serif;font-size:12.5px;font-weight:500;text-anchor:middle;dominant-baseline:central}
    .cap{fill:#3f51b5;font-family:ui-sans-serif,-apple-system,'PingFang SC','Noto Sans SC',Arial,sans-serif;font-size:15px;font-weight:600;text-anchor:middle}
    .lbl{fill:#3c4043;font-family:ui-sans-serif,-apple-system,'PingFang SC','Noto Sans SC',Arial,sans-serif;font-size:14px;font-weight:500}
    .row{fill:#3f51b5;font-family:ui-sans-serif,-apple-system,'PingFang SC','Noto Sans SC',Arial,sans-serif;font-size:15px;font-weight:600}
    .note{fill:#3c4043;font-family:ui-sans-serif,-apple-system,'PingFang SC','Noto Sans SC',Arial,sans-serif;font-size:13px;text-anchor:middle}
    .mk{fill:#5f6368}
    @media (prefers-color-scheme: dark){
      .edge{stroke:#9aa0a6}
      .link{stroke:#7a7f8f}
      .bk{fill:#455a64;stroke:#90a4ae}
      .rd{fill:#c62828;stroke:#ef9a9a}
      .ring{stroke:#90a4ae}
      .box{fill:#262a3a;stroke:#7a7f8f}
      .hl{fill:#33406b;stroke:#9fa8da}
      .key{fill:#e8eaf6}
      .cap{fill:#9fa8da}
      .lbl{fill:#c7cad6}
      .row{fill:#9fa8da}
      .note{fill:#c7cad6}
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

/** NIL：黑节点，画成小方块 */
const nilBox = (x, y, side = 14) =>
  `  <rect class="bk" x="${(x - side / 2).toFixed(1)}" y="${(y - side / 2).toFixed(1)}" width="${side}" height="${side}" rx="2"/>`;

/** 给一个节点补上缺失的左/右孩子 NIL，返回边和小方块 */
const nilKids = (x, y, hasLeft, hasRight, dx = 26, dy = 34, side = 14) => {
  let out = '';
  if (!hasLeft) {
    out += edge(x, y + 17, x - dx, y + dy - side / 2) + '\n' + nilBox(x - dx, y + dy, side) + '\n';
  }
  if (!hasRight) {
    out += edge(x, y + 17, x + dx, y + dy - side / 2) + '\n' + nilBox(x + dx, y + dy, side) + '\n';
  }
  return out;
};

const edge = (x1, y1, x2, y2, cls = 'edge') =>
  `  <line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

const link = (x1, y1, x2, y2) =>
  `  <line class="link" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#arrow)"/>`;

/** 红黑树节点：kind = black | red */
const rbNode = (x, y, text, kind, r = 18) =>
  `  <circle class="${kind === 'red' ? 'rd' : 'bk'}" cx="${x}" cy="${y}" r="${r}"/>\n` +
  `  <text class="nt" x="${x}" y="${y + 1}">${text}</text>`;

/** B+ 树节点：keys 用 "|" 分隔，画成一个带分隔线的方框 */
function bplusBox(x, y, keys, {w, h = 30, cls = 'box'} = {}) {
  const list = keys.length ? keys.split('|') : [];
  const n = Math.max(list.length, 1);
  const cw = w / n;
  let out = `  <rect class="${cls}" x="${(x - w / 2).toFixed(1)}" y="${y - h / 2}" width="${w}" height="${h}" rx="5"/>\n`;
  list.forEach((k, i) => {
    if (i) {
      const sx = x - w / 2 + cw * i;
      out += `  <line class="edge" x1="${sx.toFixed(1)}" y1="${y - h / 2}" x2="${sx.toFixed(1)}" y2="${y + h / 2}" stroke-width="1"/>\n`;
    }
    out += `  <text class="key" x="${(x - w / 2 + cw * i + cw / 2).toFixed(1)}" y="${y + 1}">${k}</text>\n`;
  });
  return out;
}

const save = (name, svg) => {
  fs.writeFileSync(path.join(FIG_DIR, name), svg + '</svg>\n');
  return `${name}（${(svg.length / 1024).toFixed(1)} KB）`;
};

// ---------------------------------------------------------------- 1. 红黑树示例
function rbtreeExample() {
  const w = 880;
  const h = 540;
  let s = header(w, h, '一棵合法的红黑树');
  const P = {7: [440, 70], 2: [240, 165], 11: [640, 165], 1: [160, 260], 5: [320, 260], 8: [560, 260], 14: [720, 260], 4: [390, 355], 15: [790, 355]};
  const kind = {7: 'black', 2: 'red', 11: 'red', 1: 'black', 5: 'black', 8: 'black', 14: 'black', 4: 'red', 15: 'red'};
  const E = [[7, 2], [7, 11], [2, 1], [2, 5], [5, 4], [11, 8], [11, 14], [14, 15]];
  E.forEach(([a, b]) => { s += edge(P[a][0], P[a][1] + 18, P[b][0], P[b][1] - 18) + '\n'; });
  // 每个空指针都补一个 NIL 方块
  const NILS = [
    [1, 118, 350], [1, 202, 350],
    [5, 282, 350],
    [4, 352, 445], [4, 428, 445],
    [8, 522, 350], [8, 598, 350],
    [14, 682, 350],
    [15, 752, 445], [15, 828, 445],
  ];
  NILS.forEach(([p, x, y]) => {
    s += edge(P[p][0], P[p][1] + 18, x, y - 9) + '\n';
    s += nilBox(x, y, 18) + '\n';
  });
  Object.keys(P).forEach((k) => { s += rbNode(P[k][0], P[k][1], k, kind[k]) + '\n'; });
  s += `  <text class="lbl" x="440" y="505" text-anchor="middle">小方块是 NIL（黑），每个空指针都有一个；红节点是 2、11、4、15</text>\n`;
  return save('rbtree-example.svg', s);
}

// ------------------------------------------------------- 2. 红黑树插入的三种情况
function insertCases() {
  const w = 900;
  const h = 780;
  let s = header(w, h, '红黑树插入后的三种修复情况');
  const rows = [80, 300, 520];

  const arrow = (x, y) => `  <line class="edge" x1="${x}" y1="${y}" x2="${x + 70}" y2="${y}" marker-end="url(#arrow)"/>\n`;
  const label = (x, y, t) => `  <text class="cap" x="${x}" y="${y}" text-anchor="end">${t}</text>\n`;

  // 情况 1：P、U 都是红的
  s += label(120, rows[0], '情况 1');
  s += edge(260, rows[0] - 30, 200, rows[0] + 30) + '\n';
  s += edge(260, rows[0] - 30, 320, rows[0] + 30) + '\n';
  s += edge(200, rows[0] + 30, 170, rows[0] + 90) + '\n';
  s += rbNode(260, rows[0] - 30, 'G', 'black') + '\n';
  s += rbNode(200, rows[0] + 30, 'P', 'red') + '\n';
  s += rbNode(320, rows[0] + 30, 'U', 'red') + '\n';
  s += rbNode(170, rows[0] + 90, 'N', 'red') + '\n';
  s += nilKids(200, rows[0] + 30, true, false) + nilKids(320, rows[0] + 30, false, false) +
       nilKids(170, rows[0] + 90, false, false);
  s += arrow(400, rows[0] + 10);
  s += edge(680, rows[0] - 30, 620, rows[0] + 30) + '\n';
  s += edge(680, rows[0] - 30, 740, rows[0] + 30) + '\n';
  s += edge(620, rows[0] + 30, 590, rows[0] + 90) + '\n';
  s += rbNode(680, rows[0] - 30, 'G', 'red') + '\n';
  s += rbNode(620, rows[0] + 30, 'P', 'black') + '\n';
  s += rbNode(740, rows[0] + 30, 'U', 'black') + '\n';
  s += rbNode(590, rows[0] + 90, 'N', 'red') + '\n';
  s += nilKids(620, rows[0] + 30, true, false) + nilKids(740, rows[0] + 30, false, false) +
       nilKids(590, rows[0] + 90, false, false);

  // 情况 2：P 红、U 黑，N 在内侧
  s += label(120, rows[1], '情况 2');
  s += edge(260, rows[1] - 30, 200, rows[1] + 30) + '\n';
  s += edge(260, rows[1] - 30, 320, rows[1] + 30) + '\n';
  s += edge(200, rows[1] + 30, 235, rows[1] + 90) + '\n';
  s += rbNode(260, rows[1] - 30, 'G', 'black') + '\n';
  s += rbNode(200, rows[1] + 30, 'P', 'red') + '\n';
  s += rbNode(320, rows[1] + 30, 'U', 'black') + '\n';
  s += rbNode(235, rows[1] + 90, 'N', 'red') + '\n';
  s += nilKids(200, rows[1] + 30, false, true) + nilKids(320, rows[1] + 30, false, false) +
       nilKids(235, rows[1] + 90, false, false);
  s += arrow(400, rows[1] + 10);
  s += edge(680, rows[1] - 30, 620, rows[1] + 30) + '\n';
  s += edge(680, rows[1] - 30, 740, rows[1] + 30) + '\n';
  s += edge(620, rows[1] + 30, 585, rows[1] + 90) + '\n';
  s += rbNode(680, rows[1] - 30, 'G', 'black') + '\n';
  s += rbNode(620, rows[1] + 30, 'N', 'red') + '\n';
  s += rbNode(740, rows[1] + 30, 'U', 'black') + '\n';
  s += rbNode(585, rows[1] + 90, 'P', 'red') + '\n';
  s += nilKids(620, rows[1] + 30, true, false) + nilKids(740, rows[1] + 30, false, false) +
       nilKids(585, rows[1] + 90, false, false);

  // 情况 3：P 红、U 黑，N 在外侧
  s += label(120, rows[2], '情况 3');
  s += edge(260, rows[2] - 30, 200, rows[2] + 30) + '\n';
  s += edge(260, rows[2] - 30, 320, rows[2] + 30) + '\n';
  s += edge(200, rows[2] + 30, 165, rows[2] + 90) + '\n';
  s += rbNode(260, rows[2] - 30, 'G', 'black') + '\n';
  s += rbNode(200, rows[2] + 30, 'P', 'red') + '\n';
  s += rbNode(320, rows[2] + 30, 'U', 'black') + '\n';
  s += rbNode(165, rows[2] + 90, 'N', 'red') + '\n';
  s += nilKids(200, rows[2] + 30, true, false) + nilKids(320, rows[2] + 30, false, false) +
       nilKids(165, rows[2] + 90, false, false);
  s += arrow(400, rows[2] + 10);
  s += edge(680, rows[2] - 30, 620, rows[2] + 30) + '\n';
  s += edge(680, rows[2] - 30, 760, rows[2] + 30) + '\n';
  s += edge(760, rows[2] + 30, 800, rows[2] + 90) + '\n';
  s += rbNode(680, rows[2] - 30, 'P', 'black') + '\n';
  s += rbNode(620, rows[2] + 30, 'N', 'red') + '\n';
  s += rbNode(760, rows[2] + 30, 'G', 'red') + '\n';
  s += rbNode(800, rows[2] + 90, 'U', 'black') + '\n';
  s += nilKids(620, rows[2] + 30, false, false) + nilKids(760, rows[2] + 30, false, true) +
       nilKids(800, rows[2] + 90, false, false);

  s += `  <text class="lbl" x="450" y="735" text-anchor="middle">G 是祖父、P 是父节点、U 是叔叔；情况 2 转完就变成情况 3 的形状，情况 3 做完这棵子树就平衡了</text>\n`;
  s += `  <text class="lbl" x="450" y="757" text-anchor="middle">小方块是 NIL（黑），每个空指针都有一个</text>\n`;
  return save('rbtree-insert-cases.svg', s);
}

// ---------------------------------------------------------------- 3. 4 阶 B+ 树示例
function bplusExample() {
  const w = 940;
  const h = 340;
  let s = header(w, h, '一棵 4 阶 B+ 树');
  const leaves = [
    '1,4,8,11', '12,13', '15,18,19', '21,24', '25,26', '31,38',
    '41,43,46', '48,49,50', '59,68', '72,78', '84,88', '91,92,99',
  ];
  const leafX = leaves.map((_, i) => 60 + i * 74);
  const leafY = 265;
  const inner = [
    {keys: '12|15', children: [0, 1, 2]},
    {keys: '25|31|41', children: [3, 4, 5, 6]},
    {keys: '59', children: [7, 8]},
    {keys: '84|91', children: [9, 10, 11]},
  ];
  const innerY = 155;
  inner.forEach((n) => {
    const cx = n.children.reduce((a, c) => a + leafX[c], 0) / n.children.length;
    n.cx = cx;
  });
  const rootY = 55;
  const rootX = leafX[leafX.length - 1] / 2 + 30;
  // 根
  s += bplusBox(rootX, rootY, '21|48|72', {w: 130, h: 32}) + '\n';
  inner.forEach((n) => {
    s += bplusBox(n.cx, innerY, n.keys, {w: 34 * n.keys.split('|').length + 20, h: 32}) + '\n';
    s += edge(rootX, rootY + 16, n.cx, innerY - 16) + '\n';
    n.children.forEach((c) => {
      s += edge(n.cx, innerY + 16, leafX[c], leafY - 15) + '\n';
    });
  });
  leaves.forEach((k, i) => {
    s += bplusBox(leafX[i], leafY, k, {w: 70, h: 30}) + '\n';
    if (i) s += link(leafX[i - 1] + 35, leafY, leafX[i] - 35, leafY) + '\n';
  });
  s += `  <text class="lbl" x="470" y="325" text-anchor="middle">内部节点里存的是右边那棵子树的最小 key；数据都在叶子上，叶子之间串成链表</text>\n`;
  return save('bplus-tree-example.svg', s);
}

// ------------------------------------------------------ 4. M = 3 插入 8 引发的分裂
function insertSplit() {
  const w = 940;
  const h = 400;
  let s = header(w, h, 'M = 3 的 B+ 树插入 8 前后的变化');
  // 左：根 [3|5]，三个叶子
  s += `  <text class="cap" x="230" y="45" >插入 8 之前</text>\n`;
  s += bplusBox(230, 80, '3|5', {w: 70, h: 30}) + '\n';
  const lx = [110, 230, 350];
  const lk = ['1,2', '3,4', '5,6,7'];
  lx.forEach((x, i) => {
    s += edge(230, 95, x, 175) + '\n';
    s += bplusBox(x, 190, lk[i], {w: 70, h: 30, cls: i === 2 ? 'hl' : 'box'}) + '\n';
    if (i) s += link(lx[i - 1] + 35, 190, x - 35, 190) + '\n';
  });
  // 箭头
  s += `  <line class="edge" x1="470" y1="140" x2="540" y2="140" marker-end="url(#arrow)"/>\n`;
  s += `  <text class="lbl" x="505" y="120" text-anchor="middle">插入 8</text>\n`;
  // 右：新根 [5]，第二层 [3] [7]，四个叶子
  s += `  <text class="cap" x="760" y="45">插入 8 之后</text>\n`;
  s += bplusBox(760, 80, '5', {w: 40, h: 30}) + '\n';
  const r2 = [{x: 635, k: '3'}, {x: 845, k: '7'}];
  const r3 = [{x: 590, k: '1,2'}, {x: 680, k: '3,4'}, {x: 800, k: '5,6', hl: true}, {x: 890, k: '7,8', hl: true}];
  r2.forEach((n) => {
    s += edge(760, 95, n.x, 175) + '\n';
    s += bplusBox(n.x, 190, n.k, {w: 40, h: 30}) + '\n';
  });
  r3.forEach((n, i) => {
    const parent = i < 2 ? r2[0].x : r2[1].x;
    s += edge(parent, 205, n.x, 255) + '\n';
    s += bplusBox(n.x, 270, n.k, {w: 66, h: 30, cls: n.hl ? 'hl' : 'box'}) + '\n';
    if (i) s += link(r3[i - 1].x + 33, 270, n.x - 33, 270) + '\n';
  });
  s += `  <text class="lbl" x="470" y="355" text-anchor="middle">叶子 {5,6,7} 变成 {5,6} 和 {7,8}，分隔键 7 上移；父节点 [3 5 7] 再分裂成 [3] 和 [7]，5 上移成新根</text>\n`;
  return save('bplus-insert-split.svg', s);
}

// ---------------------------------------------------- 5. 红黑树删除的四种情况
function rbtreeDeleteCases() {
  const w = 980, h = 1040;
  let s = header(w, h, '红黑树删除后的四种修复情况');

  // NIL 画成方块；带了一重额外黑（双重黑）时再加一圈边框
  const dblNil = (x, y, label = 'x') =>
    `  <rect class="bk" x="${x - 15}" y="${y - 15}" width="30" height="30" rx="5"/>\n` +
    `  <rect class="ring" x="${x - 19}" y="${y - 19}" width="38" height="38" rx="7"/>\n` +
    `  <text class="nt" x="${x}" y="${y + 1}" font-size="13">${label}</text>`;
  const plainNil = (x, y, label = 'x') =>
    `  <rect class="bk" x="${x - 15}" y="${y - 15}" width="30" height="30" rx="5"/>\n` +
    `  <text class="nt" x="${x}" y="${y + 1}" font-size="13">${label}</text>`;
  const dblCircle = (x, y, label) =>
    rbNode(x, y, label, 'black', 16) + '\n' +
    `  <circle class="ring" cx="${x}" cy="${y}" r="20"/>`;

  // 画一个面板：nodes 里带 kids 的节点会补上缺失孩子的 NIL
  const panel = (nodes, edges) => {
    let out = '';
    const half = (n) => (n.type === 'circle' ? 17 : 7);
    edges.forEach(([i, j]) => {
      const A = nodes[i], B = nodes[j];
      out += edge(A.x, A.y + half(A), B.x, B.y - half(B)) + '\n';
    });
    nodes.forEach((n) => {
      if (n.kids) out += nilKids(n.x, n.y, n.kids[0], n.kids[1]);
    });
    nodes.forEach((n) => {
      if (n.type === 'dblnil') out += dblNil(n.x, n.y, n.label) + '\n';
      else if (n.type === 'nil') out += plainNil(n.x, n.y, n.label) + '\n';
      else if (n.type === 'dblcircle') out += dblCircle(n.x, n.y, n.label) + '\n';
      else out += rbNode(n.x, n.y, n.label, n.color) + '\n';
    });
    return out;
  };

  const bx = 235, ax = 700;
  const rows = [
    {title: '情况 1', note: 'w 染黑、p 染红，绕 p 旋转，问题变成情况 2、3 或 4', y: 55},
    {title: '情况 2', note: 'w 染红，多出来的一重黑上移给 p，p 变成新的 x，继续往上处理', y: 265},
    {title: '情况 3', note: 'c 染黑、w 染红，绕 w 旋转，转成情况 4', y: 475},
    {title: '情况 4', note: 'w 顶替 p 的位置和颜色，p、d 染黑，绕 p 旋转，双重黑消失，修复结束', y: 760},
  ];
  const NIL4 = [false, false];        // 叶子节点：两个孩子都是 NIL
  const NIL_L = [false, true];        // 只有右孩子

  rows.forEach((row, i) => {
    const y0 = row.y;
    s += `  <text class="row" x="30" y="${y0}">${row.title}</text>\n`;
    s += `  <text class="note" x="490" y="${y0 + (i === 2 ? 240 : 205)}">${row.note}</text>\n`;

    // 处理前：p 下面挂着双黑的 x 和兄弟 w，w 的孩子是 c、d
    const beforeCore = (wColor, cColor, dColor) => panel([
      {x: bx, y: y0, label: 'p', color: 'black', type: 'circle'},
      {x: bx - 62, y: y0 + 70, label: 'x', type: 'dblnil'},
      {x: bx + 88, y: y0 + 70, label: 'w', color: wColor, type: 'circle'},
      {x: bx + 45, y: y0 + 132, label: 'c', color: cColor, type: 'circle', kids: NIL4},
      {x: bx + 130, y: y0 + 132, label: 'd', color: dColor, type: 'circle', kids: NIL4},
    ], [[0, 1], [0, 2], [2, 3], [2, 4]]);

    if (i === 0) {
      s += beforeCore('red', 'black', 'black');
      s += panel([
        {x: ax, y: y0, label: 'w', color: 'black', type: 'circle'},
        {x: ax - 58, y: y0 + 70, label: 'p', color: 'red', type: 'circle'},
        {x: ax + 58, y: y0 + 70, label: 'd', color: 'black', type: 'circle', kids: NIL4},
        {x: ax - 115, y: y0 + 132, label: 'x', type: 'dblnil'},
        {x: ax - 28, y: y0 + 132, label: 'c', color: 'black', type: 'circle', kids: NIL4},
      ], [[0, 1], [0, 2], [1, 3], [1, 4]]);
    } else if (i === 1) {
      s += beforeCore('black', 'black', 'black');
      s += panel([
        {x: ax, y: y0, label: 'p', type: 'dblcircle'},
        {x: ax - 70, y: y0 + 70, label: 'x', type: 'nil'},
        {x: ax + 88, y: y0 + 70, label: 'w', color: 'red', type: 'circle'},
        {x: ax + 45, y: y0 + 132, label: 'c', color: 'black', type: 'circle', kids: NIL4},
        {x: ax + 130, y: y0 + 132, label: 'd', color: 'black', type: 'circle', kids: NIL4},
      ], [[0, 1], [0, 2], [2, 3], [2, 4]]);
    } else if (i === 2) {
      s += beforeCore('black', 'red', 'black');
      s += panel([
        {x: ax, y: y0, label: 'p', color: 'black', type: 'circle'},
        {x: ax - 62, y: y0 + 70, label: 'x', type: 'dblnil'},
        {x: ax + 72, y: y0 + 70, label: 'c', color: 'black', type: 'circle', kids: NIL_L},
        {x: ax + 108, y: y0 + 132, label: 'w', color: 'red', type: 'circle', kids: NIL_L},
        {x: ax + 140, y: y0 + 194, label: 'd', color: 'black', type: 'circle', kids: NIL4},
      ], [[0, 1], [0, 2], [2, 3], [3, 4]]);
    } else {
      s += beforeCore('black', 'black', 'red');
      s += panel([
        {x: ax, y: y0, label: 'w', color: 'black', type: 'circle'},
        {x: ax - 58, y: y0 + 70, label: 'p', color: 'black', type: 'circle'},
        {x: ax + 58, y: y0 + 70, label: 'd', color: 'black', type: 'circle', kids: NIL4},
        {x: ax - 108, y: y0 + 132, label: 'x', type: 'nil'},
        {x: ax - 28, y: y0 + 132, label: 'c', color: 'black', type: 'circle', kids: NIL4},
      ], [[0, 1], [0, 2], [1, 3], [1, 4]]);
    }
  });
  s += `  <text class="note" x="490" y="1005">小方块是 NIL（黑），带双边框的 x 表示带了一重额外黑的 NIL</text>\n`;
  return save('rbtree-delete-cases.svg', s);
}

// ------------------------------------------- 6. B+ 树删除：借一个 key / 合并后删根
function bplusDelete() {
  const w = 980, h = 560;
  let s = header(w, h, 'B+ 树删除时的两种处理');

  // ---- 情况 1：向兄弟借 ----
  s += `  <text class="row" x="30" y="45">情况 1：兄弟有富余，借一个 key（M = 3）</text>\n`;
  s += bplusBox(150, 95, '3|6', {w: 70, h: 30}) + '\n';
  [['1,2', 60], ['3,4,5', 150], ['6,7', 240]].forEach(([k, x]) => {
    s += edge(150, 110, x, 175) + '\n';
    s += bplusBox(x, 190, k, {w: 70, h: 30}) + '\n';
  });
  s += link(95, 190, 115, 190) + '\n';
  s += link(185, 190, 205, 190) + '\n';
  s += `  <line class="edge" x1="300" y1="140" x2="350" y2="140" marker-end="url(#arrow)"/>\n`;
  s += `  <text class="lbl" x="318" y="120" text-anchor="middle">删除 1</text>\n`;
  s += bplusBox(470, 95, '4|6', {w: 70, h: 30}) + '\n';
  [['2,3', 380, 'hl'], ['4,5', 470, 'hl'], ['6,7', 560, 'box']].forEach(([k, x, cls]) => {
    s += edge(470, 110, x, 175) + '\n';
    s += bplusBox(x, 190, k, {w: 70, h: 30, cls}) + '\n';
  });
  s += link(415, 190, 435, 190) + '\n';
  s += link(505, 190, 525, 190) + '\n';
  s += `  <text class="note" x="470" y="245">叶子 {1,2} 只剩一个 key，向右兄弟借来 3，</text>\n`;
  s += `  <text class="note" x="470" y="263">父节点里的分隔 key 从 3 改成 4</text>\n`;

  // ---- 情况 2：合并，根只剩一个孩子就删掉 ----
  s += `  <text class="row" x="30" y="330">情况 2：兄弟也紧张，合并；根只剩一个孩子就删掉</text>\n`;
  s += bplusBox(150, 375, '5', {w: 40, h: 30}) + '\n';
  [['2,3', 100], ['5,6', 200]].forEach(([k, x]) => {
    s += edge(150, 390, x, 455) + '\n';
    s += bplusBox(x, 470, k, {w: 70, h: 30}) + '\n';
  });
  s += link(135, 470, 145, 470) + '\n';
  s += `  <line class="edge" x1="290" y1="420" x2="345" y2="420" marker-end="url(#arrow)"/>\n`;
  s += `  <text class="lbl" x="318" y="400" text-anchor="middle">删除 2</text>\n`;
  s += bplusBox(470, 470, '3,5,6', {w: 80, h: 30, cls: 'hl'}) + '\n';
  s += `  <text class="note" x="470" y="415">两个叶子合并成 {3,5,6}，根没有 key 了</text>\n`;
  s += `  <text class="note" x="470" y="433">直接删掉，树高减 1</text>\n`;
  return save('bplus-delete.svg', s);
}

console.log('已生成：');
console.log('  ' + rbtreeExample());
console.log('  ' + insertCases());
console.log('  ' + bplusExample());
console.log('  ' + insertSplit());
console.log('  ' + rbtreeDeleteCases());
console.log('  ' + bplusDelete());
