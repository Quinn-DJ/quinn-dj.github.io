# 08: STL：容器、迭代器与算法

> 容器存数据，算法处理逻辑，迭代器串起二者——STL 的核心就这三样。

---

## STL 概述

### 什么是 STL？

**STL (Standard Template Library)** 是 C++ 标准库的核心，基于**泛型编程**思想，将容器（数据）、算法（操作）和迭代器（访问）三者分离。

### STL 四大核心组件

| 组件 | 角色 | 示例 |
|------|------|------|
| **容器** (Containers) | 存储数据 | `vector`, `map`, `list` |
| **算法** (Algorithms) | 处理数据 | `sort()`, `find()`, `copy()` |
| **迭代器** (Iterators) | 连接容器和算法 | `begin()`, `end()` |
| **函数对象** (Functors) | 自定义操作 | `less<int>()`, Lambda |

---

## Part 1: 容器

### 容器分类

```
┌────────────────────────────────────────────┐
│                  STL 容器                   │
├──────────────────┬─────────────────────────┤
│   序列式容器       │      关联式容器          │
│  (Sequence)      │    (Associative)        │
├──────────────────┼─────────────────────────┤
│  vector          │  set / multiset         │
│  list            │  map / multimap         │
│  deque           │                         │
│  array (C++11)   │  无序关联式容器           │
│  forward_list    │  unordered_set / map    │
├──────────────────┴─────────────────────────┤
│            容器适配器（Adapters)             │
│  stack (LIFO) / queue (FIFO)               │
│  priority_queue                            │
└────────────────────────────────────────────┘
```

---

### 序列式容器

#### vector — 动态数组，随机访问

```cpp
#include <vector>
vector<int> v = {1, 2, 3, 4, 5};

// 常用操作
v.push_back(6);            // 末尾添加
v.pop_back();              // 末尾删除
v.insert(v.begin()+2, 99); // 在第 2 位置插入
v.erase(v.begin()+1);      // 删除第 1 位置
v[0] = 10;                 // 随机访问
```

#### list — 双向链表

```cpp
#include <list>
list<int> lst = {1, 2, 3, 4, 5};

lst.push_front(0);             // 头部插入
lst.push_back(6);              // 尾部插入
lst.pop_front();               // 头部删除
lst.pop_back();                // 尾部删除
lst.insert(++lst.begin(), 99); // 任意位置 O(1)
```

!!! note "vector vs list"
    | 操作 | vector | list |
    |------|--------|------|
    | 随机访问 | O(1) | O(n) |
    | 头/尾插入删除 | O(1) | O(1) |
    | 中间插入删除 | O(n) | O(1) |
    | 内存连续 | 连续 | 不连续 |

#### deque — 双端队列

```cpp
deque<int> dq = {1, 2, 3};
dq.push_front(0);  // 首部插入
dq.push_back(4);   // 尾部插入
cout << dq[1];     // 支持随机访问
```

#### C++11: array — 固定大小数组

```cpp
array<int, 5> arr = {1, 2, 3, 4, 5};
cout << arr.size();    // 5
cout << arr[2];        // 随机访问
```

#### C++11: forward_list — 单向链表

```cpp
forward_list<int> fl = {1, 2, 3};
fl.push_front(0);
// 没有 push_back，没有 size()
```

---

### 关联式容器

#### set — 元素唯一，自动排序

```cpp
set<int> s = {3, 1, 4, 1, 5};  // 结果：{1, 3, 4, 5}
s.insert(2);
auto it = s.find(3);           // 返回迭代器
```

#### map — 键值对，按键自动排序

```cpp
map<string, int> scores;
scores["Alice"] = 95;
scores["Bob"] = 88;

for (const auto& [name, score] : scores) {  // C++17 structured binding
    cout << name << ": " << score << endl;
}

auto pos = scores.find("Alice"); // 查找键为 "Alice" 的元素
if (pos != scores.end())         // 检查是否找到（找不到的话 pos 会是 scores.end()）
    cout << pos->second;         // 获取对应值
```

#### multiset / multimap — 允许重复键

```cpp
multimap<string, int> mm;
mm.insert({"Alice", 95});
mm.insert({"Alice", 88});  // OK，允许重复键
```

---

### 无序关联式容器 (C++11)

基于哈希表，无序但平均 O(1) 查询：

```cpp
unordered_set<int> us = {1, 2, 3};
unordered_map<string, int> um;
um["apple"] = 5;
```

!!! tip "map vs unordered_map"
    | 特性 | map | unordered_map |
    |------|-----|---------------|
    | 实现 | 红黑树 | 哈希表 |
    | 查找 | O(log n) | O(1) 平均 |
    | 有序性 | 有序 | 无序 |
    | 适用 | 需要排序 | 只需快速查找 |

---

### 容器适配器

基于已有容器实现的受限接口：

```cpp
// stack：先进后出 (LIFO)
stack<int> stk;
stk.push(1); stk.push(2); stk.push(3);
stk.top();   // 3
stk.pop();   // 移除 3

// queue：先进先出 (FIFO)
queue<int> q;
q.push(1); q.push(2);
q.front(); // 1
q.pop();   // 移除 1

// priority_queue：最大堆（默认）
priority_queue<int> pq;
pq.push(3); pq.push(1); pq.push(5);
pq.top(); // 5（最大元素）
```

---

### 容器选择原则

| 需求 | 推荐容器 |
|------|---------|
| 随机访问为主，尾部添加 | `vector` |
| 频繁首/尾/中间插入删除 | `list` |
| 首尾都需高效插入 | `deque` |
| 快速查找 + 排序 | `set` / `map` |
| 最快的查找，无需排序 | `unordered_set` / `unordered_map` |

---

## Part 2: 迭代器

### 什么是迭代器？

**迭代器 (Iterator)** 是抽象化的"指针"，提供统一接口来遍历不同容器：

```cpp
vector<int> v = {1, 2, 3, 4, 5};
for (auto it = v.begin(); it != v.end(); ++it) {
    cout << *it << " ";  // *it 解引用获取元素值
}
```

### 迭代器分类

五级分类，从弱到强：

| 类型 | 能力 | 示例容器 |
|------|------|---------|
| **输入迭代器** (Input) | 单向读 | `istream_iterator` |
| **输出迭代器** (Output) | 单向写 | `ostream_iterator` |
| **前向迭代器** (Forward) | 读写，只能前进 | `forward_list` |
| **双向迭代器** (Bidirectional) | 可前进和后退 | `list`, `set`, `map` |
| **随机访问迭代器** (Random) | 跳跃访问 `it+n` | `vector`, `deque`, `array` |

迭代器是算法对容器的唯一要求——算法通过迭代器分类声明所需的最低迭代器能力，只要传入的迭代器满足该要求，算法就能工作。

---

### C++11：基于范围的 for 循环

```cpp
vector<int> v = {1, 2, 3, 4, 5};

// 只读遍历
for (int val : v) { cout << val << " "; }

// 修改遍历
for (int& val : v) { val *= 2; }

// 使用 const auto& 避免拷贝
for (const auto& val : mapData) { /* ... */ }
```

### C++11: begin/end 非成员函数

```cpp
int arr[] = {1, 2, 3, 4, 5};
for (auto it = begin(arr); it != end(arr); ++it) { /* ... */ }
```

---

### 迭代器失效问题

| 操作 | vector | list | map/set |
|------|--------|------|---------|
| 插入元素 | 可能导致全部失效 | **永不失效** | **永不失效** |
| 删除元素 | 当前位置及之后失效 | 仅被删除的失效 | 仅被删除的失效 |

!!! warning "vector 插入危险"
    `vector` 插入元素可能触发**重新分配内存**，所有已获取的迭代器都会失效。

```cpp
// DANGER: 迭代器可能失效
for (auto it = v.begin(); it != v.end(); ++it) {
    v.push_back(*it);  // 可能导致 reallocation，it 失效！
}

// SAFE: 先记录大小，或使用 reserve 预留空间
```

---

## Part 3: 算法

算法通过迭代器操作容器，完全独立于具体容器类型。

```cpp
// 算法 = 迭代器范围 + 操作
sort(vec.begin(), vec.end());
```

### 非修改性算法

| 算法 | 作用 |
|------|------|
| `find(first, last, value)` | 查找等于 value 的第一个元素 |
| `find_if(first, last, pred)` | 查找满足谓词的第一个元素 |
| `count(first, last, value)` | 统计等于 value 的元素个数 |
| `for_each(first, last, func)` | 对每个元素执行 func |
| `all_of/any_of/none_of` (C++11) | 全满足/任一满足/全不满足 |

```cpp
vector<int> v = {1, 2, 3, 4, 5, 6};
auto it = find(v.begin(), v.end(), 3);
auto it2 = find_if(v.begin(), v.end(), [](int x) { return x > 3; });
int c = count(v.begin(), v.end(), 1);
for_each(v.begin(), v.end(), [](int& x) { x *= 2; });
```

### 修改性算法

| 算法 | 作用 |
|------|------|
| `copy(first, last, dest)` | 拷贝到目标位置 |
| `fill(first, last, value)` | 填充为 value |
| `replace(first, last, old, new)` | 替换所有 old 为 new |
| `remove(first, last, value)` | 逻辑删除等于 value 的元素 |
| `reverse(first, last)` | 反转区间 |
| `unique(first, last)` | 移除相邻重复 |

### 排序与搜索算法

| 算法 | 复杂度 | 作用 |
|------|--------|------|
| `sort(first, last)` | O(n log n) | 默认升序排序 |
| `stable_sort` | O(n log^2 n) | 保持相等元素相对顺序 |
| `binary_search` | O(log n) | 二分搜索（需有序） |
| `lower_bound` | O(log n) | 第一个 ≥ value 的位置 |
| `upper_bound` | O(log n) | 第一个 > value 的位置 |

```cpp
vector<int> v = {3, 1, 4, 1, 5, 9, 2};
sort(v.begin(), v.end());              // {1, 1, 2, 3, 4, 5, 9}
v.erase(unique(v.begin(), v.end()), v.end()); // 去重
```

### 数值算法

```cpp
#include <numeric>
vector<int> v = {1, 2, 3, 4, 5};

int sum = accumulate(v.begin(), v.end(), 0);  // 15
adjacent_difference / inner_product / partial_sum / iota
// iota(v.begin(), v.end(), 1); // 生成 1,2,3,4,5
```

| 算法 | 作用 |
|------|------|
| `accumulate` | 累加 |
| `adjacent_difference` | 相邻差分 |
| `inner_product` | 内积 |
| `partial_sum` | 前缀和 |
| `iota` | 生成连续整数序列 |

---

### C++11-20 算法新特性

| 版本 | 特性 |
|------|------|
| C++11 | `all_of`/`any_of`/`none_of`, `move`/`move_backward` |
| C++17 | **并行算法**：`sort(execution::par, vec.begin(), vec.end())` |
| C++20 | **Ranges**：`sort(vec)` 直接作用于整个容器 |
