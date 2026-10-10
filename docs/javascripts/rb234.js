/* ------------------------------------------------------------------
   红黑树 ↔ 2-3-4 树（4 阶 B 树）交互插图

   用法（见 coding/ads/class02.md 第 3 节）：
     <div class="rb234" data-rb234>
       <svg data-rb234-svg></svg>
       <p data-rb234-status></p>
     </div>

   图不是画死的，是算出来的：
     1. 中序遍历决定横向槽位，深度决定纵坐标；
     2. "收缩红边"= 红节点并入它的黑父节点，得到一个 B 节点
        （0/1/2 个红孩子 → 2/3/4-节点）；
     3. B 节点的层号 = 它上方黑节点的个数（黑深度），
        于是"黑高相同"自动变成"所有叶子同层"。
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function mk(key, color, left, right) {
    return { key: key, color: color, left: left || null, right: right || null };
  }
  function NB(key, left, right) { return mk(key, "b", left, right); }
  function NR(key, left, right) { return mk(key, "r", left, right); }

  /* 一棵合法的红黑树：黑节点 40、10、30、50、80，红节点 20、60、35、70 */
  var tree = NB(40,
    NR(20, NB(10), NB(30, null, NR(35))),
    NR(60, NB(50), NB(80, NR(70)))
  );

  var ordered = [];
  (function walk(n, depth, parent, blackAnc, side) {
    if (!n) return;
    n.depth = depth;
    n.parent = parent;
    n.blackAnc = blackAnc;
    n.side = side;
    walk(n.left, depth + 1, n, blackAnc + (n.color === "b" ? 1 : 0), "l");
    n.index = ordered.length;
    ordered.push(n);
    walk(n.right, depth + 1, n, blackAnc + (n.color === "b" ? 1 : 0), "r");
  })(tree, 0, null, 0, "root");

  var maxDepth = 0;
  ordered.forEach(function (n) { if (n.depth > maxDepth) maxDepth = n.depth; });

  /* 收缩红边：每个红节点归属到它黑父节点的 key，黑节点归自己 */
  var cMap = {};
  var clusters = [];
  ordered.forEach(function (n) {
    var ck = n.color === "r" ? n.parent.key : n.key;
    n.clusterKey = ck;
    if (!cMap[ck]) {
      cMap[ck] = { key: ck, black: null, members: [], keys: [], children: [], level: 0 };
      clusters.push(cMap[ck]);
    }
    cMap[ck].members.push(n);
    if (n.color === "b") { cMap[ck].black = n; cMap[ck].level = n.blackAnc; }
  });
  clusters.sort(function (a, b) { return a.black.index - b.black.index; });

  var maxLevel = 0;
  clusters.forEach(function (c) {
    c.keys = c.members.map(function (m) { return m.key; }).sort(function (a, b) { return a - b; });
    if (c.level > maxLevel) maxLevel = c.level;

    /* B 节点的孩子 = 各"槽位"：左红孩子的两个孩子、右红孩子的两个孩子…… */
    var bn = c.black;
    var redL = bn.left && bn.left.color === "r" ? bn.left : null;
    var redR = bn.right && bn.right.color === "r" ? bn.right : null;
    var slots = [];
    if (redL) { slots.push(redL.left, redL.right); } else { slots.push(bn.left); }
    if (redR) { slots.push(redR.left, redR.right); } else { slots.push(bn.right); }
    c.children = slots.map(function (s) {
      return s ? cMap[s.color === "r" ? s.parent.key : s.key] : null;
    });
  });

  var DEFAULT_STATUS =
    "收缩红边：9 个关键字 → 5 个 B 节点（每节点最多 3 个关键字 / 4 个孩子），所有叶子落在同一层";

  function describe(c) {
    var reds = c.members
      .filter(function (m) { return m.color === "r"; })
      .map(function (m) { return m.key; })
      .sort(function (a, b) { return a - b; });
    return (c.keys.length + 1) + "-节点 {" + c.keys.join("、") + "}：黑 " + c.black.key +
      (reds.length ? "，红 " + reds.join("、") : "，无红孩子") +
      " → " + c.keys.length + " 个关键字 / " + (c.keys.length + 1) + " 个孩子";
  }

  function el(tag, attrs, txt) {
    var e = document.createElementNS(NS, tag);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
      }
    }
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  function init(root) {
    if (root.dataset.rb234Ready === "1") return;
    var svg = root.querySelector("[data-rb234-svg]");
    var status = root.querySelector("[data-rb234-status]");
    if (!svg || !status) return;
    root.dataset.rb234Ready = "1";

    var pinned = null;
    var active = null;

    function applyActive() {
      var marks = svg.querySelectorAll(".rb234__mark");
      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        if (active !== null && m.getAttribute("data-cluster") === String(active)) {
          m.classList.add("is-active");
        } else {
          m.classList.remove("is-active");
        }
      }
      status.textContent = active !== null && cMap[active] ? describe(cMap[active]) : DEFAULT_STATUS;
    }

    function setActive(key) { active = key; applyActive(); }

    function bind(g, key) {
      g.addEventListener("pointerenter", function () { if (pinned === null) setActive(key); });
      g.addEventListener("pointerleave", function () { if (pinned === null) setActive(null); });
      g.addEventListener("click", function () {
        pinned = pinned === key ? null : key;
        setActive(pinned);
      });
    }

    function render() {
      var measured = Math.round(root.getBoundingClientRect().width);
      var w = measured > 200 ? measured : 720;
      var compact = w < 460;

      var R = compact ? 12 : 15;
      var FS = compact ? 11 : 12;
      var rowGap = compact ? 44 : 54;
      var topY = compact ? 42 : 52;
      var padX = compact ? 26 : (w < 660 ? 40 : 46);
      var boxH = compact ? 28 : 32;
      var rowGapB = compact ? 30 : 38;
      var boxPad = 8;
      var labelGap = compact ? 13 : 15;

      var step = (w - 2 * padX) / (ordered.length - 1);
      var cw = Math.max(24, Math.min(42, Math.floor(step - 14)));

      ordered.forEach(function (n, i) {
        n.x = padX + i * step;
        n.y = topY + n.depth * rowGap;
      });

      var lowest = 0;
      ordered.forEach(function (n) {
        if (!n.left || !n.right) {
          var t = n.y + R + 7;
          if (t > lowest) lowest = t;
        }
      });
      if (lowest === 0) lowest = topY + maxDepth * rowGap + R;
      var rootTop = lowest + 6 + (compact ? 34 : 44);

      clusters.forEach(function (c) {
        var sum = 0;
        c.members.forEach(function (m) { sum += m.x; });
        c.cx = sum / c.members.length;
        c.w = c.keys.length * cw + boxPad * 2;
        c.top = rootTop + c.level * (boxH + rowGapB);
      });

      var H = rootTop + maxLevel * (boxH + rowGapB) + boxH + labelGap + 8;

      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute("viewBox", "0 0 " + w + " " + H);
      svg.setAttribute("width", w);
      svg.setAttribute("height", H);
      svg.appendChild(el("title", { id: "rb234-title" }, "红黑树与其对应的 2-3-4 树"));
      svg.appendChild(el("desc", { id: "rb234-desc" },
        "上面是一棵红黑树，根为黑节点 40，红边 20、60、35、70 表示它们与父节点同属一个 B 树节点。" +
        "下面是收缩红边后得到的 2-3-4 树：根节点含 20、40、60 三个关键字和 4 个孩子，" +
        "叶节点 10、30-35、50、70-80 都在同一层。"));

      /* 红黑树的边 */
      var gEdge = el("g");
      ordered.forEach(function (n) {
        [n.left, n.right].forEach(function (ch) {
          if (!ch) return;
          var dx = ch.x - n.x;
          var dy = ch.y - n.y;
          var len = Math.sqrt(dx * dx + dy * dy) || 1;
          var ux = dx / len;
          var uy = dy / len;
          var padEnd = ch.color === "r" ? 3.5 : 2;
          gEdge.appendChild(el("line", {
            x1: (n.x + ux * 2).toFixed(1), y1: (n.y + uy * 2).toFixed(1),
            x2: (ch.x - ux * padEnd).toFixed(1), y2: (ch.y - uy * padEnd).toFixed(1),
            "class": "rb234__edge--" + ch.color
          }));
        });
      });
      svg.appendChild(gEdge);

      /* NIL 叶子刻度：深度不同，但每条路径上的黑节点数相同 */
      var gNil = el("g");
      ordered.forEach(function (n) {
        var xo = R * 0.7;
        var ty = n.y + R + 7;
        if (!n.left) {
          gNil.appendChild(el("line", {
            x1: (n.x - xo - 5).toFixed(1), y1: ty, x2: (n.x - xo + 5).toFixed(1), y2: ty,
            "class": "rb234__nil"
          }));
        }
        if (!n.right) {
          gNil.appendChild(el("line", {
            x1: (n.x + xo - 5).toFixed(1), y1: ty, x2: (n.x + xo + 5).toFixed(1), y2: ty,
            "class": "rb234__nil"
          }));
        }
      });
      svg.appendChild(gNil);

      /* 红黑树节点 */
      var gNode = el("g");
      ordered.forEach(function (n) {
        var g = el("g", { "class": "rb234__mark", "data-cluster": n.clusterKey });
        g.appendChild(el("circle", { cx: n.x, cy: n.y, r: R + 3.5, "class": "rb234__ring" }));
        g.appendChild(el("circle", {
          cx: n.x, cy: n.y, r: R, "class": "rb234__dot--" + n.color
        }));
        g.appendChild(el("text", {
          x: n.x, y: n.y, "text-anchor": "middle", "dominant-baseline": "central",
          "font-size": FS, "class": n.color === "r" ? "rb234__key" : "rb234__key--inv"
        }, String(n.key)));
        bind(g, n.clusterKey);
        gNode.appendChild(g);
      });
      svg.appendChild(gNode);

      /* B 树的孩子指针 */
      var gBed = el("g");
      clusters.forEach(function (c) {
        c.children.forEach(function (child, i) {
          if (!child) return;
          gBed.appendChild(el("line", {
            x1: (c.cx - c.w / 2 + boxPad + i * cw).toFixed(1),
            y1: (c.top + boxH).toFixed(1),
            x2: child.cx.toFixed(1),
            y2: child.top.toFixed(1),
            "class": "rb234__bed"
          }));
        });
      });
      svg.appendChild(gBed);

      /* B 树节点：多个关键字装进同一个节点 */
      var gBox = el("g");
      clusters.forEach(function (c) {
        var g = el("g", { "class": "rb234__mark", "data-cluster": c.key });
        var x0 = c.cx - c.w / 2;
        g.appendChild(el("rect", {
          x: x0, y: c.top, width: c.w, height: boxH, rx: 7, "class": "rb234__box"
        }));
        for (var i = 1; i < c.keys.length; i++) {
          var dx = x0 + boxPad + i * cw;
          g.appendChild(el("line", {
            x1: dx, y1: c.top + 5, x2: dx, y2: c.top + boxH - 5, "class": "rb234__cell"
          }));
        }
        c.keys.forEach(function (k, i) {
          g.appendChild(el("text", {
            x: (x0 + boxPad + i * cw + cw / 2).toFixed(1), y: c.top + boxH / 2,
            "text-anchor": "middle", "dominant-baseline": "central",
            "font-size": FS, "class": "rb234__key"
          }, String(k)));
        });
        g.appendChild(el("text", {
          x: c.cx, y: c.top + boxH + labelGap, "text-anchor": "middle",
          "font-size": FS, "class": "rb234__lbl"
        }, (c.keys.length + 1) + "-节点"));
        bind(g, c.key);
        gBox.appendChild(g);
      });
      svg.appendChild(gBox);

      svg.appendChild(el("text", { x: 8, y: 15, "font-size": FS, "class": "rb234__cap" },
        "红黑树：" + ordered.length + " 个关键字 / " + (maxDepth + 1) + " 层"));
      svg.appendChild(el("text", { x: 8, y: rootTop - 8, "font-size": FS, "class": "rb234__cap" },
        "2-3-4 树：" + clusters.length + " 个节点 / " + (maxLevel + 1) + " 层"));

      applyActive();
    }

    svg.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t && t.closest && !t.closest(".rb234__mark")) {
        pinned = null;
        setActive(null);
      }
    });

    if (window.ResizeObserver) {
      var ro = new window.ResizeObserver(function () {
        if (!root.isConnected) { ro.disconnect(); return; }
        render();
      });
      ro.observe(root);
    } else {
      window.addEventListener("resize", render);
    }
    render();
  }

  function boot() {
    var roots = document.querySelectorAll("[data-rb234]");
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }

  /* 站点启用了 instant navigation：document$ 每次页面加载（含无刷新跳转）都会触发 */
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(boot);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
