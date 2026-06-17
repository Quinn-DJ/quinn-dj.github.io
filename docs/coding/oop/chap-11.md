# Chapter 11: C++ STL 容器深度解析与实践

> 容器存储数据，算法处理逻辑，迭代器充当桥梁——三者有机结合，构成了 C++ 标准模板库的强大功能核心。

---

## STL 概述

### 什么是 STL？

**STL (Standard Template Library)** 是 C++ 标准库的核心，提供高效、可移植的通用组件。它基于**泛型编程**思想，将容器（数据）、算法（操作）和迭代器（访问）三者分离，极大提升了代码的灵活性与可组合性。

### STL 四大核心组件

| 组件 | 角色 | 示例 |
|------|------|------|
| **容器 (Containers)** | 存储数据的类模板 | `vector`, `list`, `map` |
| **迭代器 (Iterators)** | 统一访问容器元素，连接容器与算法 | `begin()`, `end()` |
| **算法 (Algorithms)** | 处理数据的函数模板 | `sort()`, `find()`, `copy()` |
| **函数对象 (Functors)** | 重载了 `()` 运算符的类，定制算法行为 | `less<T>`, `greater<T>` |

### 什么是容器？

容器是用于存储和管理一组对象的类模板。它内部封装了动态数组、链表、树等复杂结构，通过统一的接口（`insert`、`erase` 等）屏蔽底层细节。

```cpp
// 容器的通用特性
Container<T> c;            // 默认构造
Container<T> c1(c2);       // 拷贝构造
c1 = c2;                   // 拷贝赋值
c1 = std::move(c2);        // 移动赋值 (C++11)

c.empty();                 // 判断是否为空
c.size();                  // 元素个数
c.max_size();              // 理论最大容量
c.clear();                 // 清空所有元素（不释放内存）
c1.swap(c2);               // 交换两个容器（O(1)）
```

---

## 容器的分类

| 类别 | 底层结构 | 特点 | 示例 |
|------|---------|------|------|
| **序列式容器** | 线性排列 | 位置固定，支持顺序/随机访问 | `vector`, `list`, `deque`, `array`, `forward_list` |
| **关联式容器** | 红黑树 | 按键排序，O(log n) 查找 | `set`, `map`, `multiset`, `multimap` |
| **无序关联式容器** | 哈希表 | 无序，平均 O(1) 查找 (C++11) | `unordered_set`, `unordered_map` |
| **适配器容器** | 封装基础容器 | 提供特定接口（栈、队列） | `stack`, `queue`, `priority_queue` |

---

## 序列式容器

### 各容器特性对比

| 容器 | 底层结构 | 随机访问 | 头插入 | 尾插入 | 中间插入 | 内存连续性 |
|------|---------|----------|--------|--------|----------|-----------|
| `vector` | 动态数组 | O(1) | O(n) | O(1)* | O(n) | 是 |
| `list` | 双向链表 | O(n) | O(1) | O(1) | O(1) | 否 |
| `deque` | 分段数组 | O(1) | O(1) | O(1)* | O(n) | 分段连续 |
| `array` | 静态数组 | O(1) | — | — | — | 是 |
| `forward_list` | 单向链表 | O(n) | O(1) | — | 指定后 O(1) | 否 |

\* 摊还时间复杂度

!!! tip "选型口诀"
    随机访问选 `vector`/`array`，频繁增删选 `list`，双端操作选 `deque`，极致省内存选 `forward_list`。

---

### vector (动态数组)

**底层实现**：连续内存的动态数组，以"空间换时间"策略预分配内存（capacity >= size）。

```cpp
#include <vector>
using namespace std;

// 初始化
vector<int> v = {1, 2, 3};
vector<int> v2(5, 0);        // 5 个元素，全为 0

// 尾部操作
v.push_back(4);              // 拷贝插入
v.emplace_back(5);           // 原地构造（C++11，更高效）

// 访问
cout << v[2] << endl;        // 无检查，快速
cout << v.at(3) << endl;     // 带越界检查

// 插入和删除
auto it = v.insert(v.begin() + 2, 99);  // 在索引 2 处插入
v.erase(it);                            // 删除（注意迭代器失效！）
v.pop_back();                           // 删除尾部
v.clear();                              // 清空（capacity 可能保留）
```

!!! warning "erase 迭代器失效"
    `erase` 操作会导致指向被删除元素之后的所有迭代器失效。正确的删除方式：
    ```cpp
    it = v.erase(it);  // 使用返回值更新迭代器
    ```

#### vector 的 C++11-23 演进

```cpp
// C++11: emplace_back — 原地构造
v.emplace_back(10, 20);  // 跳过临时对象

// C++20: resize_and_overwrite — 直接操作已分配内存
v.resize_and_overwrite(100, [](auto* p, auto n) {
    for (int i = 0; i < n; ++i) new(p + i) int(i);
    return n;
});

// C++23: contains — 直观的元素判断（用于关联容器）
if (m.contains(42)) { /* ... */ }
```

#### vector 适用场景

- 高频随机访问（数组遍历、配置表读取）
- 尾部操作密集（日志记录、任务队列）
- 数据库查询结果集、图形学顶点缓存

---

### list (双向链表)

**底层实现**：双向链表，每个节点包含数据区和前驱/后继指针。

```cpp
#include <list>

list<int> my_list = {1, 2, 3};

// 头尾操作
my_list.push_front(0);     // O(1)
my_list.push_back(4);      // O(1)
my_list.pop_front();       // O(1)
my_list.pop_back();        // O(1)

// 插入和删除（找到位置后 O(1)）
auto it = find(my_list.begin(), my_list.end(), 2);
it = my_list.insert(it, 99);
my_list.erase(it);

// 排序：必须使用成员函数
my_list.sort();            // 不能用 std::sort（list 不支持随机访问）
```

!!! important "list 的专属排序"
    `list` 不支持随机访问，无法使用全局 `std::sort`，必须使用成员函数 `list.sort()`。

#### list 适用场景

- 频繁在任意位置插入/删除
- 无需随机访问，仅需顺序遍历
- LRU 缓存淘汰、任务消息队列

---

### deque (双端队列)

**底层实现**：通过中控器（map）管理多个固定大小的连续内存块，将分散的物理内存"缝合"为逻辑上的连续空间。

```cpp
#include <deque>

deque<int> dq = {2, 3, 4};

dq.push_front(1);          // O(1)
dq.push_back(5);           // O(1)
dq.pop_front();            // O(1)
dq.pop_back();             // O(1)

// 支持随机访问
cout << dq[2] << endl;     // O(1)
```

!!! tip "deque 的定位"
    `deque` 是 `vector` 和 `list` 之间的最优平衡——兼具随机访问和双端高效操作。它是 `queue` 和 `stack` 的默认底层容器。

---

### array (静态数组)

**底层实现**：C 语言原生数组的轻量级封装，大小在编译期确定，栈上分配。

```cpp
#include <array>

array<int, 5> arr = {1, 2, 3, 4, 5};

cout << arr[2] << endl;    // O(1) 随机访问
cout << arr.size();        // 返回固定大小
arr.fill(0);               // 快速填充全 0
```

!!! tip "array vs vector"
    `array` 比原生数组更安全（支持 STL 接口），比 `vector` 更轻量（栈分配）。适合编译期已知大小的固定数据。

---

### forward_list (单向链表)

C++11 引入的轻量级单向链表，每个节点仅存储数据和指向下一个节点的指针，空间占用比 `list` 更小。

```cpp
#include <forward_list>

forward_list<int> fl = {1, 2, 3};

fl.push_front(0);             // O(1)
fl.insert_after(fl.begin(), 99);  // 在指定节点之后插入
fl.erase_after(fl.begin());       // 删除指定节点之后的元素
```

---

## 关联式容器

### 核心特性

关联式容器基于**红黑树**实现，元素按键自动排序存储。查找、插入、删除的时间复杂度均为 O(log n)。

### 红黑树简介

红黑树是一种自平衡的二叉搜索树，通过以下五项规则维持 O(log n) 的树高：

1. 节点颜色只能是红色或黑色
2. 根节点必须是黑色
3. 叶子节点（NIL）均为黑色
4. 红色节点的父节点必为黑色（无连续红节点）
5. 任一节点到其叶子的所有路径包含相同数目的黑色节点

---

### set (集合)

元素唯一且有序，键即值。

```cpp
#include <set>

set<int> s = {3, 1, 4, 1, 5};  // 自动去重排序 → {1, 3, 4, 5}

s.insert(2);                     // 插入
auto it = s.find(4);             // 查找
cout << s.count(5) << endl;      // 计数（0 或 1）

// 范围查找
auto low = s.lower_bound(3);     // >= 3 的第一个元素
auto high = s.upper_bound(5);    // > 5 的第一个元素
for (auto it = low; it != high; ++it) { /* [3, 5) */ }
```

---

### map (键值对映射)

键唯一且有序，存储 Key-Value 对。

```cpp
#include <map>

map<int, string> my_map;

// 三种插入方式
my_map.insert(make_pair(1, "one"));
my_map.insert({2, "two"});           // 初始化列表
my_map.emplace(3, "three");          // 高效原地构造 (C++11)

// 访问
cout << my_map[1] << endl;           // 若不存在会插入默认值！
cout << my_map.at(2) << endl;        // 安全访问，越界抛异常

// 遍历
for (const auto& p : my_map) {
    cout << p.first << ": " << p.second << endl;
}

// 查找
auto it = my_map.find(3);
if (it != my_map.end()) { /* 找到了 */ }
```

!!! warning "[] vs at()"
    `[]` 有副作用——键不存在时会自动插入默认值。只读场景首选 `at()`。

---

### multiset / multimap

允许关键字重复存储的关联容器。

```cpp
// multiset: 允许重复键的集合
multiset<int> ms = {1, 1, 2, 3};
cout << ms.count(1) << endl;       // 2（可能 >1）

// multimap: 一个 Key 对应多个 Value
multimap<int, string> mm;
mm.insert({1, "Alice"});
mm.insert({1, "Bob"});             // 同一个 Key 多个值
// mm[1] = ...;                    // 错误！multimap 禁止 [] 操作
```

---

## 无序关联式容器 (C++11)

基于**哈希表**实现，元素存储无序，但查找效率平均为 O(1)。

### 哈希表原理

1. 哈希函数将关键字转化为哈希值
2. 哈希值对应表中"桶"的索引位置
3. 冲突时使用链地址法（拉链）解决
4. 负载因子（元素总数 / 桶数）影响性能，过高会触发重哈希

### unordered_set / unordered_map

```cpp
#include <unordered_map>
#include <unordered_set>

unordered_map<string, int> umap = {{"Alice", 25}};
umap["Charlie"] = 35;             // 插入/修改

// 遍历（顺序不确定！）
for (const auto& p : umap) {
    cout << p.first << ": " << p.second << endl;
}

// 哈希专属操作
cout << umap.load_factor() << endl;   // 负载因子
cout << umap.bucket_count() << endl;  // 桶数量
umap.rehash(100);                     // 强制重哈希
```

### unordered_multiset / unordered_multimap

允许重复键的无序容器，接口与 `multiset`/`multimap` 高度兼容。

---

## 适配器容器

适配器容器**不是独立容器**，而是对 `deque`、`vector` 等底层容器的封装与接口适配。

### stack (栈)

后进先出 (LIFO)，默认底层容器为 `deque`。

```cpp
#include <stack>

stack<int> s;
s.push(1);              // 入栈
s.emplace(2);           // 原地构造入栈
s.top();                // 访问栈顶元素
s.pop();                // 出栈（不返回元素！）
```

### queue (队列)

先进先出 (FIFO)，默认底层容器为 `deque`。

```cpp
#include <queue>

queue<int> q;
q.push(1);              // 队尾插入
q.front();              // 访问队头
q.back();               // 访问队尾
q.pop();                // 队头出队
```

### priority_queue (优先队列)

队头始终是优先级最高的元素，默认大顶堆（最大值优先）。

```cpp
#include <queue>

priority_queue<int> max_pq;       // 大顶堆（默认）
max_pq.push(3);
max_pq.top();                     // 返回最大值

// 小顶堆（最小值优先）
priority_queue<int, vector<int>, greater<int>> min_pq;
```

---

## 容器选择原则

!!! tip "选择决策流程"

| 需求 | 首选 | 备选 |
|------|------|------|
| 随机访问 | `vector` / `array` | `deque` |
| 两端增删 | `deque` | `list` / `vector`(尾) |
| 任意增删 | `list` / `forward_list` | `deque` |
| 有序映射 | `map` | `unordered_map` |
| 最快查找 | `unordered_map` | `map` |
| 有序集合 | `set` | `unordered_set` |
| LIFO 栈 | `stack` | — |
| FIFO 队列 | `queue` | — |
| 优先级 | `priority_queue` | — |

---

## 总结

| 核心要点 | 说明 |
|----------|------|
| 容器分类 | 序列式重顺序，关联式重快速查找，无序容器 O(1) 查找 |
| 底层实现 | `vector` 连续内存，`list` 双向链表，`map` 红黑树，`unordered_map` 哈希表 |
| 性能权衡 | 无序容器摊还 O(1)，但牺牲有序性 |
| 选型策略 | 根据访问效率、增删频率和有序性需求选择 |
| 适配器 | `stack`/`queue`/`priority_queue` 不是独立容器，是对基础容器的封装 |
