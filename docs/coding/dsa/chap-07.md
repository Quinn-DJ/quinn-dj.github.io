# 第七章：图论算法

> 图是一切关系的抽象——从社交网络到交通导航，从任务调度到资源分配。

---

## 图的表示

### 两种基本表示方法

| 方法 | 空间 | 判边 | 遍历邻接点 |
|------|:---:|:----:|:----------:|
| **邻接矩阵** | $O(V^2)$ | $O(1)$ | $O(V)$ |
| **邻接表** | $O(V+E)$ | $O(\deg(v))$ | $O(\deg(v))$ |

```cpp
// 邻接表
vector<vector<int>> adj(n + 1);  // 1-indexed

// 带权边
struct Edge {
    int to, weight;
};
vector<vector<Edge>> graph(n + 1);
```

!!! tip "何时用哪种？"
    - **邻接矩阵**：稠密图（$E \approx V^2$），如 Floyd-Warshall
    - **邻接表**：稀疏图（$E \ll V^2$），大多数情况

---

## 拓扑排序 (Topological Sort)

对**有向无环图 (DAG)** 的所有顶点进行线性排序，使得每条有向边 $(u,v)$ 的起点 $u$ 在 $v$ 之前。

### 算法：基于入度 (Kahn 算法)

1. 计算每个节点的入度
2. 将所有入度为 0 的节点入队
3. 依次出队，将其邻接点的入度减 1，若减为 0 则入队

```cpp
vector<int> topologicalSort(int n, vector<vector<int>>& graph) {
    vector<int> inDegree(n + 1, 0);
    // 计算入度
    for (int u = 1; u <= n; u++)
        for (int v : graph[u])
            inDegree[v]++;

    queue<int> q;
    for (int i = 1; i <= n; i++)
        if (inDegree[i] == 0) q.push(i);

    vector<int> result;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        result.push_back(u);
        for (int v : graph[u]) {
            if (--inDegree[v] == 0)
                q.push(v);
        }
    }

    if (result.size() != n)
        return {};  // 存在环，无法拓扑排序
    return result;
}
```

复杂度：$O(V + E)$。

### 应用

- 课程先修关系排课
- 构建系统中的依赖解析
- 任务调度中的依赖管理

---

## 最短路径算法

### Dijkstra 算法 — 非负权单源最短路

使用优先队列（最小堆）实现：

```cpp
vector<int> dijkstra(int n, vector<vector<Edge>>& graph, int start) {
    const int INF = 1e9;
    vector<int> dist(n + 1, INF);
    // 最小堆: {距离, 节点}
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;  // 过时的记录

        for (auto& e : graph[u]) {
            int nd = d + e.weight;
            if (nd < dist[e.to]) {
                dist[e.to] = nd;
                pq.push({nd, e.to});
            }
        }
    }
    return dist;
}
```

| 实现方式 | 复杂度 |
|----------|:-----:|
| 朴素（每次扫描所有节点） | $O(V^2)$ |
| 二叉堆 | $O((V+E)\log V)$ |
| Fibonacci 堆 | $O(E + V\log V)$ |

!!! warning "Dijkstra 的限制"
    不能处理**负权边**。负权边会破坏 Dijkstra 的贪心性质——一个已经确定为最短路径的节点可能被后续的负权边"反向优化"。

### Bellman-Ford 算法 — 支持负权边

进行 $V-1$ 轮**松弛操作**（每轮检查所有边，尝试更新距离）。第 $V$ 轮如果还能松弛，说明存在**负权环**。

```cpp
vector<int> bellmanFord(int n, vector<Edge>& edges, int start) {
    const int INF = 1e9;
    vector<int> dist(n + 1, INF);
    dist[start] = 0;

    for (int i = 1; i < n; i++) {  // V-1 轮
        bool updated = false;
        for (auto& e : edges) {
            if (dist[e.from] != INF && dist[e.from] + e.weight < dist[e.to]) {
                dist[e.to] = dist[e.from] + e.weight;
                updated = true;
            }
        }
        if (!updated) break;  // 提前结束优化
    }
    return dist;
}
```

复杂度：$O(VE)$。

### Floyd-Warshall 算法 — 全源最短路

经典的 DP 算法，计算**所有节点对之间的最短距离**。

```cpp
void floydWarshall(int n, vector<vector<int>>& dist) {
    for (int k = 1; k <= n; k++)          // 中转节点
        for (int i = 1; i <= n; i++)      // 起点
            for (int j = 1; j <= n; j++)  // 终点
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
}
```

复杂度：$O(V^3)$，适用于**稠密图**（$V \le 300$ 左右）。

!!! tip "Floyd 的巧妙之处"
    三维 DP 可以压缩到二维——`dist[i][j]` 在每轮更新中原地被改写，而 $k$ 循环的顺序保证了正确性。

---

## 各最短路径算法对比

| 算法 | 源 | 负权边 | 复杂度 | 适用 |
|------|:--:|:-----:|:-----:|------|
| Dijkstra (二叉堆) | 单源 | ❌ | $O((V+E)\log V)$ | 最常用 |
| Bellman-Ford | 单源 | ✅ | $O(VE)$ | 含负权稀疏图 |
| Floyd-Warshall | 全源 | ✅ | $O(V^3)$ | $V\le 300$ 的稠密图 |
| SPFA | 单源 | ✅ | $O(kE)$ 平均 / $O(VE)$ 最坏 | Bellman-Ford 队列优化 |

---

## 最小生成树 (MST)

**MST (Minimum Spanning Tree)** 是一棵连接所有节点且边权总和最小的树。

> MST 是唯一的当且仅当所有边的权值互不相同。

### Prim 算法

类似 Dijkstra，从任意节点出发，每次选择距离当前生成树最近的节点加入。

```cpp
int prim(int n, vector<vector<Edge>>& graph) {
    const int INF = 1e9;
    vector<int> minEdge(n + 1, INF);   // 到 MST 的最小边权
    vector<bool> inMST(n + 1, false);

    int start = 1;
    minEdge[start] = 0;
    // {距离, 节点}
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, start});

    int total = 0, count = 0;

    while (!pq.empty() && count < n) {
        auto [d, u] = pq.top(); pq.pop();
        if (inMST[u]) continue;

        inMST[u] = true;
        total += d;
        count++;

        for (auto& e : graph[u]) {
            if (!inMST[e.to] && e.weight < minEdge[e.to]) {
                minEdge[e.to] = e.weight;
                pq.push({e.weight, e.to});
            }
        }
    }

    return count < n ? -1 : total;  // -1 表示图不连通
}
```

### Kruskal 算法

按边权从小到大依次选边，如果边的两端不在同一集合中（用**并查集**判断），则将该边加入 MST。

```cpp
// 并查集 (Disjoint Set Union)
struct DSU {
    vector<int> parent, rank;
    DSU(int n) : parent(n + 1), rank(n + 1, 0) {
        for (int i = 1; i <= n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);  // 路径压缩
        return parent[x];
    }
    bool unite(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (rank[x] < rank[y]) swap(x, y);
        parent[y] = x;
        if (rank[x] == rank[y]) rank[x]++;
        return true;
    }
};

int kruskal(int n, vector<array<int,3>>& edges) {
    // edges = {weight, u, v}
    sort(edges.begin(), edges.end());
    DSU dsu(n);

    int total = 0, count = 0;
    for (auto& [w, u, v] : edges) {
        if (dsu.unite(u, v)) {
            total += w;
            count++;
            if (count == n - 1) break;
        }
    }
    return count == n - 1 ? total : -1;
}
```

### MST 算法对比

| 算法 | 实现方式 | 复杂度 |
|------|----------|:-----:|
| Prim (二叉堆) | 优先队列 + 贪心 | $O((V+E)\log V)$ |
| Prim (朴素) | 扫描所有节点 | $O(V^2)$ |
| Kruskal | 并查集 + 排序 | $O(E\log E)$ |

!!! tip "如何选择？"
    - **稠密图**（$E \approx V^2$）→ Prim 朴素 $O(V^2)$ 比 Kruskal 的 $O(E\log E)$ 更快
    - **稀疏图** → Kruskal 或 Prim 二叉堆均可

---

## 并查集 (Disjoint Set Union)

并查集维护一个**不相交集合**的集合，支持：

| 操作 | 说明 | 均摊复杂度 |
|------|------|:---------:|
| `find(x)` | 查找 $x$ 所属集合的代表元 | $O(\alpha(N))$ |
| `unite(x,y)` | 合并两个集合 | $O(\alpha(N))$ |

其中 $\alpha(N)$ 是反阿克曼函数，在实际范围内 $\alpha(N) \le 4$。

两个关键优化：
- **路径压缩 (Path Compression)**：`find` 时将路径上所有节点直接指向根
- **按秩合并 (Union by Rank)**：总是将矮树合并到高树下

```cpp
struct DSU {
    vector<int> parent, rank;
    DSU(int n) : parent(n + 1), rank(n + 1, 0) {
        for (int i = 1; i <= n; i++) parent[i] = i;
    }
    int find(int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);
    }
    void unite(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return;
        if (rank[x] < rank[y]) parent[x] = y;
        else if (rank[x] > rank[y]) parent[y] = x;
        else { parent[y] = x; rank[x]++; }
    }
};
```

---

## 图论算法复杂度速查

| 算法 | 时间复杂度 |
|------|:--------:|
| 拓扑排序 (Kahn) | $O(V+E)$ |
| Dijkstra (二叉堆) | $O((V+E)\log V)$ |
| Bellman-Ford | $O(VE)$ |
| Floyd-Warshall | $O(V^3)$ |
| Prim (二叉堆) | $O((V+E)\log V)$ |
| Kruskal | $O(E\log E)$ |
| 并查集 | $O(\alpha(V))$ 均摊 |
