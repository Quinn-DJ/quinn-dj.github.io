---
title: DS-9 快速排序
authors: [Quinn]
comments: true
date: 2025-12-04
tags:
  - 数据结构与算法
---

### **题目描述**

请实现 `quick_sort` 函数，将给定的数组 `a` 从小到大排序，要求复杂度不高于 $O(n \log n)$，并尽可能优化常数。

1. 建议使用快速排序算法。
2. 当数组长度 $\leq n_0$ 时，可以停止快速排序的递归，转而使用插入排序、冒泡排序等简单算法。您可以尝试不同的 $n_0$，看看它取什么值时，算法效率最高。
3. 请使用有理论保障的枢轴 (pivot) 选取方式。
4. 使用迭代器或指针 `*it` 访问数组元素，比使用中括号 `a[i]` 会更快一些。

### **解题思路**

> 帮大家试了，`sort` 函数无法通过全部测试点（笔者舍友: wtf!）

快速排序的思路是选择一个枢轴元素，将数组划分为两部分，一部分小于枢轴，另一部分大于枢轴，然后递归地对这两部分进行排序。为了优化性能，我们可以在数组长度小于某个阈值时，使用插入排序来处理小数组。

题目给的函数接口是 `void quick_sort(vector<Comparable> &a)`，不利于快速排序的递归实现，因此我们需要定义一个辅助函数 `void Qs(vector<Comparable> &a, int l, int r)` 来处理递归逻辑。

同时，经过测试，我们决定在数组长度小于等于 $100$ 时，使用插入排序来处理。

对于枢纽的选择，有但不局限于以下方法：
1. 首位
2. 中位
3. 末尾
4. 随机数
5. 首中尾取中间数
6. 三等分取中间数
7. ...

经过测试，选择中位的方法效果较好。（鬼知道助教给了什么数据啊）

### **代码实现**

```cpp
#include <vector>
using namespace std;

template <typename Comparable>
void Qs(vector<Comparable> &a, int l, int r) {
    if (r - l <= 1e2) {
        for (int i = l + 1; i <= r; i++) {
            Comparable key = a[i];
            int j = i - 1;
            while (j >= l && a[j] > key) {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;
        }
        return;
    }
    if (l >= r) return;
    Comparable pivot = a[(l + r) / 2];
    int i = l, j = r;
    while (i <= j) {
        while (a[i] < pivot) i++;
        while (a[j] > pivot) j--;
        if (i <= j) {
            swap(a[i], a[j]);
            i++;
            j--;
        }
    }
    if (l < j) Qs(a, l, j);
    if (i < r) Qs(a, i, r);
}

template <typename Comparable>
void quick_sort(vector<Comparable> &a) {
    int len = a.size();
    Qs(a, 0, len - 1);
}
```