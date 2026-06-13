# 第六章：排序

> 排序是算法中最基础也最重要的主题——几乎所有数据处理的起点，都是"先排个序"。

---

## 排序算法总览

### 稳定性

**稳定排序 (Stable)**：相等元素的相对顺序在排序后保持不变。

| 算法 | 稳定 |
|------|:---:|
| 插入排序 | ✅ |
| 冒泡排序 | ✅ |
| 归并排序 | ✅ |
| 希尔排序 | ❌ |
| 堆排序 | ❌ |
| 快速排序 | ❌ |

!!! tip "为什么稳定性重要？"
    当你**先按姓名排序，再按年龄排序**时——稳定的排序能保证同年龄的人仍保持姓名的字母顺序。

### 复杂度对比

| 算法 | 最坏时间 | 平均时间 | 空间 |
|------|:------:|:------:|:---:|
| 插入排序 | $O(N^2)$ | $O(N^2)$ | $O(1)$ |
| 希尔排序 | $O(N^{3/2})$ | 取决于增量 | $O(1)$ |
| 堆排序 | $O(N\log N)$ | $O(N\log N)$ | $O(1)$ |
| 归并排序 | $O(N\log N)$ | $O(N\log N)$ | $O(N)$ |
| 快速排序 | $O(N^2)$ | $O(N\log N)$ | $O(\log N)$ |

---

## 插入排序 (Insertion Sort)

将数组分为"已排序部分"和"未排序部分"，每次从未排序部分取一个元素插入到已排序部分的正确位置。

```cpp
void insertionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 1; i < n; i++) {
        int tmp = a[i];
        int j = i - 1;
        // 将大于 tmp 的元素右移
        while (j >= 0 && a[j] > tmp) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = tmp;
    }
}
```

**特点**：
- 对于**基本有序**的数组非常快（接近 $O(N)$）
- 对于**小规模数据**（$N < 20$）是最佳选择
- **稳定**排序，原地排序

!!! tip "插入排序的实际应用"
    快速排序在递归到子数组较小时（如 $N < 10$），通常会切换到插入排序以获得更好的性能。

---

## 希尔排序 (Shell Sort)

通过比较**相隔一定增量（gap）**的元素进行排序，逐步减小 gap，最终变为普通的插入排序。

```cpp
void shellSort(vector<int>& a) {
    int n = a.size();
    // Hibbard 增量序列：2^k - 1
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // 对每个子序列进行插入排序
        for (int i = gap; i < n; i++) {
            int tmp = a[i];
            int j = i;
            while (j >= gap && a[j - gap] > tmp) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = tmp;
        }
    }
}
```

| 增量序列 | 最坏复杂度 |
|----------|:--------:|
| Shell 原始 $\lfloor N/2^k\rfloor$ | $O(N^2)$ |
| Hibbard $2^k-1$ | $O(N^{3/2})$ |
| Sedgewick | $O(N^{4/3})$ |

!!! note "希尔排序的核心思想"
    通过大 gap 的预排序，让元素"大步移动"，快速接近最终位置。gap 缩小到 1 时，数组已基本有序，插入排序接近 $O(N)$。

---

## 堆排序 (Heap Sort)

**步骤**：
1. **建堆**（自底向上 buildHeap）：$O(N)$
2. **依次取最小值**：N 次 deleteMin 操作
3. 每次将堆顶（最小值）与当前堆的最后一个元素交换，然后堆大小减 1 并下滤

```cpp
// 下滤：维护以 root 为根、大小为 heapSize 的堆
void percDown(vector<int>& a, int root, int heapSize) {
    int tmp = a[root];
    int child;
    while (2 * root + 1 < heapSize) {
        child = 2 * root + 1;  // 左孩子
        if (child + 1 < heapSize && a[child + 1] > a[child])
            child++;            // 选较大的孩子
        if (tmp >= a[child]) break;
        a[root] = a[child];
        root = child;
    }
    a[root] = tmp;
}

void heapSort(vector<int>& a) {
    int n = a.size();
    // 建最大堆（升序排序）
    for (int i = n / 2 - 1; i >= 0; i--)
        percDown(a, i, n);
    // 依次取出最大值放到末尾
    for (int i = n - 1; i > 0; i--) {
        swap(a[0], a[i]);      // 最大值放到末尾
        percDown(a, 0, i);     // 对剩余部分重新下滤
    }
}
```

!!! tip "堆排序的特点"
    - $O(N\log N)$ 最坏情况保证（不同于快排）
    - **原地排序**（空间 $O(1)$）
    - **不稳定**（远距离交换破坏相对顺序）
    - 实际运行速度通常不如快速排序（cache 不友好）

---

## 归并排序 (Merge Sort)

**分治三步骤**：
1. **Divide**：将数组平分为两半
2. **Conquer**：分别递归排序两半
3. **Combine**：合并两个有序子数组

```cpp
void merge(vector<int>& a, vector<int>& tmp, int left, int mid, int right) {
    int i = left, j = mid + 1, k = left;
    // 两个有序子数组 [left, mid] 和 [mid+1, right]
    while (i <= mid && j <= right) {
        if (a[i] <= a[j])
            tmp[k++] = a[i++];
        else
            tmp[k++] = a[j++];
    }
    while (i <= mid)  tmp[k++] = a[i++];
    while (j <= right) tmp[k++] = a[j++];
    // 复制回原数组
    for (i = left; i <= right; i++)
        a[i] = tmp[i];
}

void mergeSortHelper(vector<int>& a, vector<int>& tmp, int left, int right) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSortHelper(a, tmp, left, mid);
    mergeSortHelper(a, tmp, mid + 1, right);
    merge(a, tmp, left, mid, right);
}

void mergeSort(vector<int>& a) {
    vector<int> tmp(a.size());
    mergeSortHelper(a, tmp, 0, a.size() - 1);
}
```

| 特性 | 值 |
|------|------|
| 最坏/平均时间 | $O(N\log N)$ |
| 空间 | $O(N)$（需要辅助数组） |
| 稳定性 | ✅ 稳定 |
| 原地 | ❌ 非原地 |

!!! tip "归并排序的优势场景"
    归并排序适用于**外部排序**（数据量大到无法全部载入内存）。也因其稳定性，在需要保持相等元素顺序的场合很受欢迎。

---

## 快速排序 (Quick Sort)

同样是分治，但与归并排序相反——**先划分再递归**。

### 三步走

1. 选一个**枢纽元 (Pivot)**
2. **划分 (Partition)**：比 pivot 小的放左边，大的放右边
3. 递归排序左右两部分

```cpp
// 三数中值分割法选枢纽元
int median3(vector<int>& a, int left, int right) {
    int mid = left + (right - left) / 2;
    if (a[left] > a[mid])  swap(a[left], a[mid]);
    if (a[left] > a[right]) swap(a[left], a[right]);
    if (a[mid] > a[right]) swap(a[mid], a[right]);
    // 将枢纽元放到 right-1 位置
    swap(a[mid], a[right - 1]);
    return a[right - 1];
}

void quickSort(vector<int>& a, int left, int right) {
    if (left + 10 <= right) {         // 超过阈值用快排
        int pivot = median3(a, left, right);
        int i = left, j = right - 1;
        while (true) {
            while (a[++i] < pivot);    // 从左找 >= pivot
            while (a[--j] > pivot);    // 从右找 <= pivot
            if (i < j) swap(a[i], a[j]);
            else break;
        }
        swap(a[i], a[right - 1]);      // 枢纽元归位
        quickSort(a, left, i - 1);
        quickSort(a, i + 1, right);
    } else {
        // 小数组用插入排序
        insertionSort(a, left, right);
    }
}
```

!!! warning "快排的最坏情况"
    如果每次选的 pivot 恰好是最小/最大值，划分极不均衡 → $O(N^2)$。使用**三数中值分割法**可以有效避免此问题。

| 特性 | 值 |
|------|------|
| 平均时间 | $O(N\log N)$ |
| 最坏时间 | $O(N^2)$ |
| 空间 | $O(\log N)$（递归栈） |
| 稳定性 | ❌ 不稳定 |
| 原地 | ✅ 近似原地 |

!!! tip "快排为什么通常是最快的？"
    1. 内循环极其紧凑（仅比较和移动）
    2. Cache 友好（原地操作）
    3. 划分后子问题独立，可并行

---

## 基于比较的排序 — 下界

基于比较的排序算法，**最坏情况下至少需要 $\Omega(N\log N)$ 次比较**。这是信息论下界——$N$ 个元素的排列有 $N!$ 种可能，至少需要 $\log_2(N!)$ 次比较来区分，即 $\Omega(N\log N)$。

这意味着：**堆排序、归并排序已是最优**（在比较的框架下）。

---

## 排序算法的选择指南

| 场景 | 推荐算法 | 理由 |
|------|----------|------|
| 数据量小 ($N<20$) | 插入排序 | 常数小，简单 |
| 通用排序 | 快速排序 | 实际最快 |
| 需要稳定性 | 归并排序 | 唯一稳定的 $O(N\log N)$ |
| 空间严格受限 | 堆排序 | $O(1)$ 空间 |
| 最坏情况保证 | 归并/堆排序 | $O(N\log N)$ 保证 |
| 外部排序 | 归并排序 | 可分块排序后归并 |
