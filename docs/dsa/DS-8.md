---
title: DS-8 O(n) 建堆
authors: [Quinn]
comments: true
date: 2025-12-04
tags:
  - 数据结构与算法
---

### **题目描述**

本题需要您实现一个 $O(n)$ 建堆的算法。具体来说，给定一些数 $a_0, a_1, \ldots, a_{n-1}$，您需要将其重新排序，使得排序后的数组满足：
- $a_i \leq a_{(i - 1) / 2}$ 对所有的 $i = 1, 2, \ldots, n-1$ 成立，这里 $(i - 1) / 2$ 里的除法是整除。

**禁止**使用 STL 自带的 make_heap 函数。

### **解题思路**

我们采取自底向上的堆化方法来实现 $O(n)$ 建堆。具体步骤如下：
1. 对于即将操作的节点 $a_i$，我们认为它的子树已经是一个合法的堆。并且叶子结点就是一个合法的堆。
2. 从最后一个非叶子节点开始，依次向前遍历每个节点，并对每个节点执行下沉操作。
3. 下沉操作的具体步骤如下：
   - 比较当前节点与其左右子节点的值，找到其中最大的值。
   - 如果当前节点的值小于最大子节点的值，则交换它们的位置，并继续对被交换下去的子节点执行下沉操作，直到堆性质得到满足。
4. 重复上述步骤，直到所有非叶子节点都被处理完毕。

### **代码实现**

```cpp
#include <vector>
using namespace std;

void makeHeap(vector<int> &a) {
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; --i) {
        int node = i;
        while (1) {
            int left = 2 * node + 1;
            if (left >= n) break;
            int right = left + 1;
            int target = left;
            if (right < n && a[right] > a[left]) {
                target = right;
            }
            if (a[node] >= a[target]) break; // 堆性质已满足
            swap(a[node], a[target]); // 下沉操作
            node = target;
        }
    }
}
```