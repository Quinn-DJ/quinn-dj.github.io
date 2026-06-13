# 第五章：优先队列与堆

> 优先队列不只关心"谁先来"，更关心"谁更重要"——堆是它最高效的实现。

---

## 优先队列 (Priority Queue)

优先队列是一种特殊的队列，每次出队的是**优先级最高**的元素，而非最早入队的元素。

### ADT 定义

| 操作 | 说明 |
|------|------|
| `insert(x)` | 插入元素 $x$ |
| `deleteMin()` | 删除并返回最小元素 |
| `findMin()` | 返回最小元素（不删除） |

!!! note "本课程中"
    优先队列通常指**最小优先队列**（值越小优先级越高），最大优先队列同理。

### 朴素实现的复杂度

| 实现方式 | insert | deleteMin | findMin |
|----------|:------:|:---------:|:-------:|
| 无序数组 | $O(1)$ | $O(N)$ | $O(N)$ |
| 有序数组 | $O(N)$ | $O(1)$ | $O(1)$ |
| 二叉查找树 | $O(\log N)$ 平均 | $O(\log N)$ 平均 | $O(\log N)$ 平均 |
| **二叉堆** | $\mathbf{O(\log N)}$ | $\mathbf{O(\log N)}$ | $\mathbf{O(1)}$ |

---

## 二叉堆 (Binary Heap)

二叉堆是一种**完全二叉树**，满足**堆序性质**：

- **最小堆**：每个节点 ≤ 其所有子节点（根最小）
- **最大堆**：每个节点 ≥ 其所有子节点（根最大）

### 存储方式

完全二叉树可以用数组高效存储（节点 $i$ 的孩子在 $2i$ 和 $2i+1$，父亲在 $\lfloor i/2\rfloor$）。数组下标从 **1** 开始（0 位置空着不用）。

```
索引:   1   2   3   4   5   6
      [ -  13  21  16  24  31  19 ]

       13           ← 索引 1
      /  \
    21    16        ← 索引 2, 3
   /  \  /
  24 31 19          ← 索引 4, 5, 6
```

### 基本操作

#### insert — 上滤 (Percolate Up)

1. 在数组末尾（完全二叉树的下一个空位）创建一个"洞"
2. 将新元素与洞的父节点比较
3. 若新元素更小，将父节点移入洞中，洞上移
4. 重复直到新元素不小于父节点，填入洞中

```cpp
void insert(vector<int>& heap, int x) {
    heap.push_back(x);          // 先放在末尾
    int i = heap.size() - 1;    // 洞的位置
    // 上滤：与父节点比较
    while (i > 1 && heap[i] < heap[i / 2]) {
        swap(heap[i], heap[i / 2]);
        i /= 2;
    }
}
```
复杂度：$O(\log N)$。

#### deleteMin — 下滤 (Percolate Down)

1. 根节点（最小值）被删除
2. 将数组最后一个元素移到根的位置（形成"洞"）
3. 将洞与较小的子节点比较
4. 若子节点更小，交换，洞下移
5. 重复直到洞没有更小的子节点

```cpp
int deleteMin(vector<int>& heap) {
    int minVal = heap[1];               // 最小值在根
    heap[1] = heap.back();              // 最后一个元素移到根
    heap.pop_back();

    int i = 1;                          // 洞的当前位置
    int n = heap.size() - 1;
    // 下滤
    while (2 * i <= n) {                // 有左孩子
        int child = 2 * i;              // 左孩子
        // 如果右孩子更小，选右孩子
        if (child + 1 <= n && heap[child + 1] < heap[child])
            child++;
        if (heap[i] <= heap[child]) break;
        swap(heap[i], heap[child]);
        i = child;
    }
    return minVal;
}
```
复杂度：$O(\log N)$。

#### buildHeap — 建堆（$O(N)$）

自底向上，从最后一个非叶节点开始逐个执行下滤操作。

```cpp
void buildHeap(vector<int>& heap) {
    int n = heap.size() - 1;            // 有效元素个数
    for (int i = n / 2; i >= 1; i--) {  // 从最后一个非叶节点
        // 对 heap[i] 执行下滤
        int hole = i;
        int tmp = heap[hole];
        while (2 * hole <= n) {
            int child = 2 * hole;
            if (child + 1 <= n && heap[child + 1] < heap[child])
                child++;
            if (tmp <= heap[child]) break;
            heap[hole] = heap[child];
            hole = child;
        }
        heap[hole] = tmp;
    }
}
```

!!! important "buildHeap 的复杂度"
    $O(N)$ 而非直觉中的 $O(N\log N)$。原因：越靠近叶子的节点越多，但它们执行下滤的次数越少。精确分析得到的总复杂度为 $O(N)$。

---

## 二叉堆操作复杂度总结

| 操作 | 复杂度 |
|------|:-----:|
| findMin | $O(1)$ |
| insert | $O(\log N)$ |
| deleteMin | $O(\log N)$ |
| buildHeap | $O(N)$ |
| decreaseKey | $O(\log N)$ |
| increaseKey | $O(\log N)$ |
| remove | $O(\log N)$ |

---

## 堆的应用

### 1. 堆排序 (Heap Sort)

见第六章排序章节的详细说明。基本思路：
1. 将数组建堆 → $O(N)$
2. 重复执行 $N$ 次 deleteMin → $O(N\log N)$

### 2. Dijkstra 最短路径

使用最小堆维护当前已知的最短距离，每次取距离最小的节点。二叉堆版本的 Dijkstra 复杂度为 $O((N+M)\log N)$。

### 3. TOP-K 问题

用大小为 K 的最小堆维护前 K 个最大元素：
- 遍历每个元素，若比堆顶大则替换并下滤
- 复杂度 $O(N\log K)$

### 4. Huffman 编码

每次取频率最低的两个节点，合并后重新插入堆中。

### 5. 事件驱动模拟

按事件发生时间维护最小堆，每次弹出最早发生的事件进行处理。

---

## d-堆 (d-Heap)

每个节点有 $d$ 个子节点的堆。

- insert: $O(\log_d N)$（上滤层数更少）
- deleteMin: $O(d\log_d N)$（下滤时需要比较 $d$ 个子节点）
- 适用于 insert 频率远高于 deleteMin 的场景
