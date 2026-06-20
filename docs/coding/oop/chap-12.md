# Chapter 12: C++ 迭代器与标准库算法

> 迭代器是连接容器与算法的桥梁，让代码脱离具体容器细节，实现真正的通用编程。

---

## 迭代器概述

### 什么是迭代器？

迭代器本质是**"泛化的指针"**，它封装了容器底层复杂的访问逻辑。通过迭代器，我们可以统一、简洁地遍历元素，而无需关心容器在内存中是如何具体存储数据的。

### 迭代器的核心作用

| 作用 | 说明 |
|------|------|
| **遍历容器元素** | 提供通用方式逐个访问元素 |
| **传递容器范围** | 为算法传递操作的起始和结束位置 |
| **适配 STL 算法** | 算法基于迭代器设计，实现不同容器的算法复用 |
| **提升代码通用性** | 替代指针与下标，代码更通用且易维护 |

### 迭代器 vs 索引遍历

```cpp
vector<int> vec = {10, 20, 30, 40, 50};

// 使用迭代器
for (auto it = vec.begin(); it != vec.end(); ++it) {
    cout << *it << " ";   // 解引用访问元素
}

// C 风格索引
for (size_t i = 0; i < vec.size(); ++i) {
    cout << vec[i] << " ";
}
```

### 迭代器的通用性

```cpp
// 同一个函数，无需修改即可处理 vector 和 list
template<typename Container>
void print_container(Container& c) {
    for (auto it = c.begin(); it != c.end(); ++it) {
        cout << *it << " ";
    }
}

// print_container(vec);   // OK：vector
// print_container(lst);   // OK：list
// 如果使用 [] 索引访问，list 将无法编译！
```

---

## 迭代器分类

迭代器按能力划分为五个层级，构成能力递增的层次结构：

| 迭代器类型 | 能力 | 读写 | 移动方向 | 典型容器 |
|-----------|------|------|----------|---------|
| **输入迭代器** | 只读，单遍扫描 | 只读 | 单向 | `istream_iterator` |
| **输出迭代器** | 只写，单遍扫描 | 只写 | 单向 | `ostream_iterator` |
| **前向迭代器** | 多遍扫描 | 读写 | 单向 | `forward_list` |
| **双向迭代器** | 前向 + 反向 | 读写 | 双向 | `list`, `map`, `set` |
| **随机访问迭代器** | 任意跳转 | 读写 | 双向 + 跳跃 | `vector`, `deque`, `array`, `string` |

### 各迭代器的操作能力

```
输入迭代器: ++  *  ->  ==  !=
输出迭代器: ++  *it=value
前向迭代器: ++  *  ->  ==  !=  （多遍扫描）
双向迭代器: ++  --  *  ->  ==  !=
随机访问:   ++  --  *  ->  ==  !=  []  +  -  <  >  <=  >=
```

!!! tip "迭代器与算法关系"
    更强的迭代器类型继承了较弱类型的所有功能。算法对迭代器有最低要求，选择不匹配会导致编译错误。

---

## C++11-20 迭代器新特性

### C++11: 只读与反向迭代器

```cpp
vector<int> vec = {1, 2, 3, 4, 5};

// cbegin()/cend() — 只读迭代器
for (auto it = vec.cbegin(); it != vec.cend(); ++it) {
    cout << *it << " ";
    // *it = 10;   // 编译错误！禁止修改
}

// rbegin()/rend() — 反向遍历
for (auto it = vec.rbegin(); it != vec.rend(); ++it) {
    cout << *it << " ";  // 输出: 5 4 3 2 1
}
// 注意：反向迭代器的 ++ 实际上是向容器开头移动

// crbegin()/crend() — 只读反向迭代器
for (auto it = vec.crbegin(); it != vec.crend(); ++it) {
    cout << *it << " ";  // 输出: 5 4 3 2 1（只读）
}
```

### C++11: 基于范围的 for 循环 (Range-based for Loop)

```cpp
// 旧式迭代器遍历
for (auto it = vec.begin(); it != vec.end(); ++it) {
    cout << *it << " ";
}

// 范围 for 循环（编译器自动展开为迭代器循环）
for (int num : vec) {
    cout << num << " ";   // 代码量减少 50%，可读性大幅提升
}
```

### C++14: make_reverse_iterator

```cpp
auto it = v.end();
// C++11 旧式写法
std::reverse_iterator<decltype(it)> r1(it);
// C++14 新写法：简洁优雅
auto r2 = std::make_reverse_iterator(it);
```

### C++20: constexpr 迭代器

```cpp
constexpr array<int, 3> arr = {10, 20, 30};
constexpr auto it = arr.begin();   // 编译期获取迭代器
static_assert(*it == 10);          // 编译期断言，零运行时开销
```

---

## STL 算法库

### 概述

STL 算法是封装好的通用函数，通过迭代器处理容器元素，**不直接操作容器本身**。算法与容器完全解耦——只要迭代器兼容，同一算法可应用于不同类型容器。

头文件：
- `<algorithm>`：绝大多数通用算法（查找、排序等）
- `<numeric>`：数值相关算法（累加、内积等）

### 算法分类

| 类别 | 说明 | 典型算法 |
|------|------|---------|
| **非修改型** | 只读取，不改变容器 | `find`, `count`, `for_each` |
| **修改型** | 修改元素值或位置 | `copy`, `replace`, `fill` |
| **排序** | 调整数据顺序 | `sort`, `stable_sort`, `reverse` |
| **数值** | 数值计算 | `accumulate`, `inner_product` |

---

## 非修改型算法 (Non-modifying Algorithms)

这些算法仅需**输入迭代器**，兼容性极强，适用于所有标准容器。

### find / find_if

```cpp
vector<int> nums = {1, 2, 3, 4, 5, 4, 3};

// find: 查找第一个等于目标值的元素
auto it = find(nums.begin(), nums.end(), 4);
if (it != nums.end()) cout << "Found: " << *it << endl;

// find_if: 查找第一个满足条件的元素
auto it_even = find_if(nums.begin(), nums.end(),
    [](int x) { return x % 2 == 0; });
cout << "First even: " << *it_even << endl;  // 2
```

### count / count_if

```cpp
vector<int> nums = {1, 2, 3, 4, 5, 4, 3, 2, 1};

int cnt = count(nums.begin(), nums.end(), 3);
cout << cnt << endl;  // 2

// count_if: 统计满足条件的元素个数
int even_cnt = count_if(nums.begin(), nums.end(),
    [](int x) { return x % 2 == 0; });
```

### for_each

```cpp
vector<string> words = {"apple", "banana"};

for_each(words.begin(), words.end(), [](const string& s) {
    cout << s.size() << " ";  // 5 6
});
```

---

## 修改型算法 (Modifying Algorithms)

修改型算法需要**前向迭代器或更强**类型，以支持写入操作。

### copy / copy_if

```cpp
vector<int> src = {1, 2, 3, 4, 5};
vector<int> dest;

// 全量拷贝（使用 back_inserter 自动扩容）
copy(src.begin(), src.end(), back_inserter(dest));

// 条件拷贝：仅复制奇数
copy_if(src.begin(), src.end(), back_inserter(dest),
    [](int x) { return x % 2 != 0; });
```

!!! warning "目标空间管理"
    目标容器必须有足够空间！推荐使用 `std::back_inserter` 自动扩容，避免越界崩溃。

### fill / replace

```cpp
vector<int> v = {1, 2, 3, 4, 5};

fill(v.begin(), v.end(), 0);       // 全部填充为 0

replace(v.begin(), v.end(), 2, 99);  // 将所有 2 替换为 99

replace_if(v.begin(), v.end(),
    [](int x) { return x > 50; }, 100);  // 条件替换
```

---

## 排序算法

排序算法对迭代器要求较高，`sort` 和 `stable_sort` 需要**随机访问迭代器**。

### sort

```cpp
vector<int> nums = {5, 2, 9, 1, 5, 6};

// 默认升序
sort(nums.begin(), nums.end());     // {1, 2, 5, 5, 6, 9}

// 自定义降序
sort(nums.begin(), nums.end(),
    [](int a, int b) { return a > b; });  // {9, 6, 5, 5, 2, 1}
```

### stable_sort

稳定排序——相等元素的原始相对顺序保持不变。

```cpp
struct P { int id; string name; };

vector<P> ps = {{1, "Alice"}, {2, "Bob"}, {1, "Charlie"}};

stable_sort(ps.begin(), ps.end(),
    [](const P& a, const P& b) { return a.id < b.id; });

// 输出: 1:Alice, 1:Charlie, 2:Bob
// Alice 和 Charlie (ID=1) 保持原始顺序
```

### reverse

```cpp
vector<int> v = {1, 2, 3, 4, 5};
reverse(v.begin(), v.end());  // {5, 4, 3, 2, 1}
// reverse 仅需双向迭代器
```

---

## 数值算法 (Numeric Algorithms)

头文件 `<numeric>`，提供序列的基础计算与统计功能。

### accumulate

```cpp
#include <numeric>

vector<int> v = {1, 2, 3, 4, 5};

int sum = accumulate(v.begin(), v.end(), 0);  // 求和: 15

// 求积（自定义二元操作）
int prod = accumulate(v.begin(), v.end(), 1, multiplies<int>());  // 120
```

!!! tip "初始值的决定性作用"
    第三个参数不仅是计算起点，更决定了返回值的类型。例如 `0LL` 才能得到 `long long` 类型的累加结果。

### inner_product

```cpp
vector<int> a = {1, 2, 3};
vector<int> b = {4, 5, 6};

// 内积: 1*4 + 2*5 + 3*6 = 32
int result = inner_product(a.begin(), a.end(), b.begin(), 0);
```

---

## C++11-20 算法新特性

### Lambda 表达式适配 (C++11)

与 STL 算法无缝结合，匿名函数简化自定义逻辑传递，告别繁琐函数对象。

### all_of / any_of / none_of (C++11)

```cpp
vector<int> v = {2, 4, 6, 8, 10};

bool all = all_of(v.begin(), v.end(),
    [](int x) { return x % 2 == 0; });   // true: 全部偶数

bool any = any_of(v.begin(), v.end(),
    [](int x) { return x > 5; });        // true: 存在 >5 的元素

bool none = none_of(v.begin(), v.end(),
    [](int x) { return x % 2 != 0; });   // true: 没有奇数
```

### std::move 算法 (C++11)

```cpp
// 高效移动元素所有权，避免深拷贝开销
move(src.begin(), src.end(), dest.begin());
```

### std::shuffle (C++11)

```cpp
#include <random>

vector<int> v = {1, 2, 3, 4, 5};
shuffle(v.begin(), v.end(), mt19937{random_device{}()});
```

### C++20 Ranges 库 (Ranges Library)

```cpp
#include <ranges>

vector<int> nums = {5, 2, 8, 1, 9};

// 旧式写法
sort(nums.begin(), nums.end());

// C++20 Ranges：直接传容器
ranges::sort(nums);

// 管道操作 + 视图（惰性求值 Lazy Evaluation，零拷贝）
auto view = nums
    | views::filter([](int x) { return x % 2 == 0; })
    | views::transform([](int x) { return x * 2; });

// 输出: 4 8 12 （仅过滤出的偶数加倍，惰性计算）
```

---

## 算法对迭代器的要求

!!! important "适配原则"
    算法对迭代器有严格的最低要求，使用不满足要求的迭代器会导致编译错误。

| 算法 | 最低迭代器要求 | 可用容器 |
|------|---------------|---------|
| `find` | 输入迭代器 | 所有容器 |
| `for_each` | 输入迭代器 | 所有容器 |
| `reverse` | 双向迭代器 | `vector`, `list`, `map`（不能 `forward_list`） |
| `sort` | **随机访问迭代器** | `vector`, `deque`, `array`（不能 `list`！） |

```cpp
// list 不能使用 std::sort！
list<int> lst = {3, 1, 4};
// sort(lst.begin(), lst.end());  // 编译错误！
lst.sort();                        // 正确：使用成员函数
```

---

## 迭代器失效 (Iterator Invalidation)

!!! danger "迭代器失效"
    容器修改（插入/删除）后，指向该容器的迭代器可能失效，访问失效迭代器会导致未定义行为。

### 失效规则

| 容器 | 操作 | 失效范围 |
|------|------|---------|
| `vector` | 插入/删除 | 操作点之后的所有迭代器 |
| `vector` | `push_back` 触发扩容 | 所有迭代器 |
| `list` / `map` | 插入 | 不会导致任何迭代器失效 |
| `list` / `map` | 删除 | 仅被删除元素的迭代器失效 |

### 安全删除模式

```cpp
// 正确：使用 erase 返回值更新迭代器
vector<int> v = {1, 2, 3, 4, 5, 6};
auto it = v.begin();
while (it != v.end()) {
    if (*it % 2 == 0) {
        it = v.erase(it);  // 接收返回值
    } else {
        ++it;
    }
}
```

### erase-remove 惯用法 (Erase-Remove Idiom)

```cpp
// 批量删除所有值为 2 的元素
vector<int> vec = {1, 2, 3, 2, 4, 2, 5};

// Step 1: remove 将非 2 的元素移到前端，返回新逻辑终点
auto end = remove(vec.begin(), vec.end(), 2);
// Step 2: erase 删除逻辑终点后的无效元素
vec.erase(end, vec.end());  // 合并写法，O(n)

// 结果: {1, 3, 4, 5}
```

---

## 总结

| 要点 | 说明 |
|------|------|
| 迭代器分类 | 输入/输出/前向/双向/随机访问，能力逐级增强 |
| 算法适配 | 严格遵循算法对迭代器类别的要求（如排序需随机访问） |
| 迭代器失效 | 修改容器后务必重新获取迭代器 |
| erase-remove | 先逻辑移动，后物理删除，O(n) 批量删除范式 |
| 现代特性 | Ranges 库、Views 视图、Lambda 表达式让代码更简洁 |
| C++20 | `ranges::sort(container)` 直接传容器，告别 begin/end |
