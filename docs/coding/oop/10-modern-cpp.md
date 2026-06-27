# 10: 现代 C++ 特性 (Modern C++)

> C++11 之后的 C++ 在安全性、简洁性和效率上都有了大幅提升。本章串讲 C++11-23 的核心新特性。

---

## 知识体系概览

现代 C++ 学习可分为三个层次：

| 层次 | 主要内容 | 关键词 |
|------|---------|--------|
| 基础层 | 改进的类型系统 | `auto`, `decltype`, `nullptr`, 统一初始化 `{}` |
| 核心层 | 资源管理与并发 | 移动语义、智能指针、RAII、Lambda |
| 高级层 | 模板元编程与语言扩展 | Concepts, Ranges, Coroutines, Modules |

---

## 移动语义 (Move Semantics)

### 为什么需要移动语义？

传统 C++ 中，临时对象的拷贝是巨大的性能开销，尤其是在处理动态内存时。移动语义允许将资源直接从源对象"窃取"到目标对象，而不是拷贝，性能大幅提升。

```cpp
// 传统方式：两次深拷贝
vector<int> createLargeVector() {
    vector<int> v(1000000);
    return v;  // C++98: 拷贝返回 → 性能差
}              // C++11: 移动返回 → 高效

vector<int> result = createLargeVector();
```

### 左值与右值

| 概念 | 特点 | 示例 |
|------|------|------|
| **左值 (lvalue)** | 有名字、可取地址 | `int x = 10;` `x` 是左值 |
| **右值 (rvalue)** | 临时、不可取地址 | `x + 3`, `10`, `string("temp")` |

### 移动构造函数与移动赋值

```cpp
class Buffer {
private:
    int* _data;
    size_t _size;
public:
    // 移动构造函数
    Buffer(Buffer&& other) noexcept
        : _data(other._data), _size(other._size) {
        other._data = nullptr;   // ★ 将源对象置为安全状态
        other._size = 0;
    }

    // 移动赋值运算符
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] _data;
            _data = other._data;
            _size = other._size;
            other._data = nullptr;
            other._size = 0;
        }
        return *this;
    }
};
```

### std::move 与 std::forward

| 函数 | 作用 |
|------|------|
| `std::move(x)` | 无条件将左值转为右值，触发移动语义 |
| `std::forward<T>(x)` | **完美转发 (Perfect Forwarding)**：保留值类别，仅在 T 是右值引用时才转换为右值 |

```cpp
string s1 = "Hello";
string s2 = std::move(s1);  // s1 被"窃取"，之后不应使用 s1

template <typename T>
void wrapper(T&& arg) {
    func(std::forward<T>(arg));  // 完美转发
}
```

---

## 智能指针 (Smart Pointers)

| 特点 | `unique_ptr` | `shared_ptr` | `weak_ptr` |
|------|-------------|-------------|-----------|
| 所有权 | 独占 | 共享 | 不拥有（观察） |
| 拷贝 | 禁止 | 引用计数+1 | — |
| 释放 | 自动 delete | 计数归零时释放 | — |
| 典型用途 | 工厂函数、容器元素 | 共享资源 | 打破循环引用 |

### unique_ptr — 独占所有权

```cpp
auto p1 = make_unique<int>(42);
// auto p2 = p1;                   // ❌ 禁止拷贝
auto p3 = std::move(p1);           // ✅ 转移所有权

// 自动释放
void func() {
    auto p = make_unique<Resource>();  // 申请资源
    // ... 使用 p ...
}  // p 自动析构，无需 delete
```

### shared_ptr — 共享所有权

```cpp
auto s1 = make_shared<Resource>();     // 引用计数 = 1
auto s2 = s1;                          // 引用计数 = 2
auto s3 = s1;                          // 引用计数 = 3
// s3 出作用域 → 引用计数 = 2
// s2 出作用域 → 引用计数 = 1
// s1 出作用域 → 引用计数 = 0 → 释放资源
```

### weak_ptr — 解决循环引用

```cpp
class B;  // 前向声明
class A { shared_ptr<B> _bPtr; };
class B { weak_ptr<A> _aPtr; };  // ★ 用 weak_ptr 打破循环
```

!!! warning "循环引用陷阱"
    两个 `shared_ptr` 互相指向对方 → 引用计数永远不为 0 → 内存泄漏！

---

## Lambda 表达式

Lambda 是 C++11 引入的**匿名函数对象**，让代码内联在调用处，简洁高效。

```cpp
[capture](parameters) -> return_type { body };

// 示例
auto add = [](int a, int b) -> int { return a + b; };
cout << add(3, 4) << endl;  // 7
```

### 捕获列表

| 捕获方式 | 语法 | 含义 |
|----------|------|------|
| 值捕获 | `[x]` | 拷贝外部变量 x |
| 引用捕获 | `[&x]` | 引用外部变量 x |
| 所有值 | `[=]` | 拷贝所有外部变量 |
| 所有引用 | `[&]` | 引用所有外部变量 |
| 混合 | `[=, &x]` | 默认值，x 引用 |
| 移动捕获 (C++14) | `[x = std::move(x)]` | 移动外部变量 |

```cpp
int base = 10;
auto addBase = [base](int x) { return base + x; };  // 值捕获
auto incBase = [&base]() { base++; };                 // 引用捕获
```

### Lambda 在 STL 中的应用

```cpp
vector<int> v = {3, 1, 4, 1, 5, 9, 2};

sort(v.begin(), v.end(),
     [](int a, int b) { return a > b; });

auto it = find_if(v.begin(), v.end(),
                  [](int x) { return x > 5; });
```

---

## C++17 关键特性

| 特性 | 说明 |
|------|------|
| **结构化绑定** | `auto [name, score] = pair;` |
| **if constexpr** | 编译期条件分支，避免无效模板实例化 |
| **if with initializer** | `if (auto it = m.find(k); it != m.end())` |
| **Fold Expressions** | `(args + ...)` 参数包展开 |
| **string_view** | 字符串非拥有视图，零拷贝 |
| **optional** | `optional<int>` 表示可能不存在的值 |
| **variant** | 类型安全的 union |

```cpp
// 结构化绑定
map<string, int> scores;
for (auto& [name, score] : scores) {
    cout << name << " scored " << score << endl;
}

// if 初始化器
if (auto result = func(); result.isValid()) { /* 使用 result */ }

// optional
optional<int> findValue() {
    if (found) return 42;
    return nullopt;  // 表示"没有值"
}
```

---

## C++20 核心新特性

| 特性 | 作用 |
|------|------|
| **Concepts** | 约束模板参数（编译期类型检查） |
| **Ranges** | `sort(vec)` 替代 `sort(vec.begin(), vec.end())` |
| **Coroutines** | `co_await`, `co_yield` 协程 |
| **Modules** | `import std;` 取代 `#include` |
| **三路比较 `<=>`** | 自动生成所有比较运算符 |

```cpp
// <=> (三路比较 / spaceship)
struct Point {
    int x, y;
    auto operator<=>(const Point&) const = default;
};
// 自动生成 ==, !=, <, <=, >, >=

// Ranges
vector<int> v = {3, 1, 4, 1, 5, 9, 2};
ranges::sort(v);
auto even = v | views::filter([](int x) { return x % 2 == 0; });
```

---

## C++23 预览

| 特性 | 说明 |
|------|------|
| `std::expected<T, E>` | 返回值或错误 |
| `std::mdspan` | 多维数组视图 |
| `std::print` | 类型安全的输出（类似 Python print） |
| Deducing this | `auto(this)` 简化 CRTP 等模式 |
| `import std;` | 标准库模块，编译更快 |

---

## 易错点汇总

| 易错点 | 说明 | 规避策略 |
|--------|------|----------|
| 野指针 | 使用已释放的指针 | 用智能指针替代裸指针 |
| 循环引用 | `shared_ptr` 互相持有，引用计数永不归零 | 用 `weak_ptr` 打破循环 |
| 迭代器失效 | `vector` 扩容时所有迭代器失效 | 用 `list` 或提前 `reserve()`；优先用索引而非迭代器 |
| 未初始化变量 | 局部变量值不确定 | 声明即初始化，或使用 `{}` 统一初始化 |
| 对象切割 | 值传递派生类对象给基类参数 | 使用指针或引用传递，基类声明虚函数 |
| 悬挂引用 | 引用指向已销毁的临时对象 | 警惕函数返回局部变量的引用 |
