---
title: DS-6 双重探查散列表
authors: [Quinn]
comments: true
date: 2025-12-04
tags:
  - 数据结构与算法
---

### **题目描述**

本题要求您实现一个**开放定址 + 双重哈希（double hashing）**的哈希表的插入操作。

- 表容量为质数 $m$，槽位下标为 $0 \sim m-1$，每个槽位可以存储一个键。
- 键 $x$ 是 64 位无符号整数。
- 哈希与探查序列定义为：
$$
\begin{aligned}
h_1(x) & = x \bmod m ,\\
h_2(x) & = 1 + (x \bmod (m - 1)) ,\\
pos(j) & = (h_1(x) + j \cdot h_2(x)) \bmod m , \quad j = 0, 1, 2, \ldots
\end{aligned}
$$
您需要实现一个 `insert` 函数，支持插入一个键 $x$，**要求所有插入的平均探查次数不超过** $20$。

`insert` 函数返回一个整数 $d$，表示您在本次插入过程中，在 $d$ 位置插入成功；若本次插入失败，则返回 $-1$。

```cpp
#include <vector>
using namespace std;

class DoubleHashTable {
private:
    vector<unsigned long long> keys;
public:
    DoubleHashTable(int m) : keys(m) {}
    int insert(unsigned long long x);
};
```

### **解题思路**

题目已经给出了哈希函数和探查序列的定义，我们只需要按照定义实现插入操作即可。

```cpp
int insert(unsigned long long x) {
    int h1 = x % keys.size();
    int h2 = 1 + (x % (keys.size() - 1));
    for (int i = 0; i < keys.size(); ++i) {
        int index = (h1 + i * h2) % keys.size();
        if (keys[index] == 0) {
            keys[index] = x;
            return i;
        }
        if (keys[index] == x) {
            return i;
        }
    }
    return -1;
}
```