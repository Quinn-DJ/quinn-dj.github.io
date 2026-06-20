# Chapter 10: C++ 模板与泛型编程

> 编写一次，适配多种类型——模板是实现泛型编程的核心工具，让代码复用达到极致。

---

## 泛型编程概述

### 核心思想

**泛型编程 (Generic Programming)** 旨在创建不依赖于具体数据类型的通用算法和数据结构。核心目标是消除冗余代码，让同一套逻辑能够处理整数、浮点数、字符串等多种不同类型，实现真正的"通用"。

C++ 通过**模板 (Template)** 实现泛型编程——将数据类型本身作为参数传递。编译器根据传入的具体类型生成对应的实例代码。

!!! tip "核心价值"
    极大提升代码复用率，显著降低长期维护成本与出错风险。

### 模板 vs 宏定义

| 特性 | C++ 模板 | C 语言宏 |
|------|---------|----------|
| 处理阶段 | 编译期类型检查 | 预编译期文本替换 |
| 类型安全 | 严格校验参数类型，类型绝对安全 | 简单字符替换，无任何检查 |
| 代码生成 | 按需生成特定类型代码，避免冗余 | 多次替换增加代码量，可能引发二义性 |
| 调试 | 编译期报错，易于定位 | 展开不透明，调试困难 |
| 函数重载 | 支持 | 不支持 |

```cpp
// 宏的陷阱：多次求值导致未定义行为
#define SWAP(a, b) { auto t = a; a = b; b = t; }
int c = 1;
SWAP(++c, c);  // 危险！未定义行为

// 模板的优势：类型安全 + 行为确定
template<typename T>
void swap(T& a, T& b) {
    T temp = a; a = b; b = temp;
}
// swap(++c, c); // 行为定义良好，c 输出 2
// swap(x, 3.14); // 编译错误！类型不匹配，杜绝隐式转换
```

!!! warning "核心洞察"
    模板在编译期实例化，既保证了效率，又提供了类型安全保障。优先使用模板而非宏。

### 模板的分类

| 类别 | 说明 | 示例 |
|------|------|------|
| **函数模板** | 创建通用函数，实现算法复用 | `std::sort` |
| **类模板** | 创建通用类，构建数据结构 | `std::vector`, `std::map` |
| **别名模板** (C++11) | 简化复杂的模板类型 | `template<T> using Vec = vector<T>` |
| **可变参数模板** (C++11) | 接受任意数量参数 | `std::tuple`, `make_shared` |
| **变量模板** (C++14) | 模板化的常量 | `pi<T>` |
| **Concepts** (C++20) | 模板参数的类型约束 | `requires` 子句 |

---

## 函数模板 (Function Template)

### 定义语法

```cpp
template <typename T>        // 模板参数列表
return-type func_name(T param) {
    // 函数体：使用类型 T
}
```

```cpp
template <typename T>
void print(const T& val) {
    cout << "Val: " << val << endl;
}

// 调用时自动推导 T 的类型
print(42);      // T = int
print(3.14);    // T = double
```

!!! tip "自动推导"
    编译器根据传入实参的类型自动确定 `T` 的具体类型，无需手动指定。

### 模板参数 (Template Parameters)

**类型参数 (Type Parameters)**：代表通用数据类型，使用 `typename` 或 `class` 声明。实现代码泛型复用，适应多种类型。

```cpp
template <typename T>
T add(T a, T b) { return a + b; }
```

**非类型参数 (Non-type Parameters)**：代表编译期常量值（整数、枚举、指针），在编译期确定数值。

```cpp
template<typename T, size_t N>
void printArray(const T (&arr)[N]) {
    cout << "Size: " << N << ": ";
    for (size_t i = 0; i < N; ++i)
        cout << arr[i] << " ";
    cout << endl;
}

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    printArray(arr);  // 编译器自动推导 N = 5
}
```

!!! tip "非类型参数的核心价值"
    将数组大小纳入模板参数，实现编译期自动推导与类型安全保障，避免手动传参错误。

### 实例化机制 (Instantiation Mechanism)

模板如同 3D 模型文件（蓝图），只有在"打印"（实例化）时，才会生成真实的物体（代码）。

| 方式 | 说明 | 示例 |
|------|------|------|
| **隐式实例化** | 编译器根据传入实参类型自动推导模板参数 | `max(i1, i2)` → `max<int>` |
| **显式实例化** | 程序员通过尖括号明确指定模板参数类型 | `max<double>(i1, d1)` |

```cpp
template<typename T>
T max(const T& a, const T& b) {
    return (a > b) ? a : b;
}

int main() {
    int i1 = 10, i2 = 20;
    double d1 = 3.14;

    int int_max = max(i1, i2);        // 隐式实例化：T = int
    // auto mixed = max(i1, d1);      // 错误！类型不匹配，推导失败
    double d_max = max<double>(i1, d1); // 显式实例化：T = double，i1 被提升
}
```

### 函数模板重载 (Function Template Overloading)

允许定义多个同名函数模板，只要其模板参数列表或函数参数列表不同。编译器根据上下文自动选择最佳匹配。

```cpp
// 1. 模板：打印单个值
template<typename T>
void print(T v) { cout << v << endl; }

// 2. 模板：打印两个值
template<typename T1, typename T2>
void print(T1 a, T2 b) { cout << a << ", " << b << endl; }

// 3. 普通函数：精确匹配
void print(const char* s) { cout << "String: " << s << endl; }

// 调用逻辑
print(42);           // 匹配模板 1（单参数）
print(3.14, "pi");   // 匹配模板 2（双参数）
print("Hello");      // 匹配普通函数（精确匹配优先）
```

!!! tip "重载判定规则"
    若普通函数与模板均匹配，**普通函数优先调用**。

### 模板特化 (Template Specialization)

当通用模板对特定类型效率低下或逻辑不适用时，为这些类型提供定制化的特殊实现。

```cpp
// 通用模板
template <typename T>
void print(const T& v) {
    cout << "Generic: " << v << endl;
}

// 针对 const char* 的特化版本
template <>
void print<const char*>(const char* const& v) {
    if (!v) cout << "nullptr" << endl;
    else cout << "String: " << v << " (len=" << strlen(v) << ")" << endl;
}

print(100);      // Generic: 100
print("Hello");  // String: Hello (len=5)
```

!!! tip "特化核心价值"
    让通用模板具备处理特殊场景的精准能力，是灵活性与严谨性的结合。

---

## 类模板 (Class Template)

### 定义语法

```cpp
template <typename T1, typename T2>
class Pair {
private:
    T1 first;
    T2 second;
public:
    Pair(T1 f, T2 s) : first(f), second(s) {}
    void print() const {
        cout << first << ", " << second << endl;
    }
};
```

### 类模板实例化

!!! important "类模板必须显式指定类型"
    与函数模板不同，类模板的实例化必须显式指定模板参数的类型，编译器无法从构造函数参数推导。

```cpp
Pair<int, double> p1(10, 3.14);      // 显式实例化
Pair<string, int> p2("Age", 25);     // Pair<int,double> 和 Pair<string,int> 是完全不同的类型
```

### 成员函数的类外定义

```cpp
template <typename T>
class Calculator {
public:
    T add(const T& a, const T& b) const { return a + b; }  // 类内定义（隐式内联）
    T multiply(const T& a, const T& b) const;              // 仅声明
};

// 类外定义：必须重复 template <T> 且类名后加 <T>
template <typename T>
T Calculator<T>::multiply(const T& a, const T& b) const {
    return a * b;
}
```

!!! warning "类外定义的要点"
    必须重复书写 `template <typename T>`，类名后必须加 `<T>`。

### 静态成员

每个模板实例化后的类，都拥有**独立的**静态成员副本。

```cpp
template<typename T>
class Counter {
public:
    static int count;
    Counter() { count++; }
    ~Counter() { count--; }
};

// 类外定义静态成员（必须！）
template<typename T>
int Counter<T>::count = 0;

// Counter<int>::count 与 Counter<double>::count 互不影响
```

!!! tip "核心结论"
    类模板的静态成员属于特定的实例化类（如 `Counter<int>`），而非模板本身。修改其中一个的静态成员不会影响另一个。

### 类模板特化 (Class Template Specialization)

**全特化 (Full Specialization)**：为所有模板参数指定具体类型。本质上是一个普通的类定义，针对特定类型优化逻辑。

```cpp
template <>
class ClassName<Type1, Type2> { /* ... */ };
```

**偏特化 (Partial Specialization)**：为部分参数指定类型或限定范围。结果仍属于模板，需实例化。适用于指针、引用或容器类型适配。

```cpp
// 针对所有指针类型的偏特化
template<typename T>
class Printer<T*> {
public:
    void print(T* ptr) const {
        if (!ptr) cout << "nullptr";
        else cout << "Val: " << *ptr;
    }
};
```

!!! tip "偏特化核心优势"
    规避空指针风险，提升代码复用性，优化特定场景逻辑。编译器会优先匹配最具体的版本。

---

## C++11-23 模板新特性

### 模板别名 (C++11)

使用 `using` 关键字替代传统的 `typedef`，为复杂的模板类型创建简洁别名。

```cpp
template <typename T>
using Vec = vector<T>;

Vec<int> nums;  // 等价于 vector<int>
```

!!! tip "核心价值"
    简化冗长的模板类型书写，显著提升代码可读性与维护效率。

### 可变参数模板 (C++11)

允许模板接受任意数量、任意类型的参数。是实现标准库中 `std::tuple`、`printf` 等灵活功能的底层基石。

核心机制：
- **参数包**：`typename... Args` 用于打包任意参数
- **展开参数包**：`...` 操作符解包并逐一处理参数

```cpp
// 递归终止函数（无参重载）
void print() { cout << '\n'; }

// 递归展开：每次提取第一个参数，剩余继续递归
template<typename T, typename... Args>
void print(const T& first, const Args&... args) {
    cout << first << " ";
    print(args...);  // 展开剩余参数包
}

print(1, 2.5, "Hi", 'A');  // 输出: 1 2.5 Hi A
```

### constexpr 模板 (C++11/17)

编译期完成计算，将计算成本从运行时转移到编译时，零运行时开销。

```cpp
template <int N>
constexpr int factorial() {
    if constexpr (N <= 1) return 1;  // C++17: 编译期条件分支
    else return N * factorial<N-1>();
}

// factorial<5>() 在编译时直接计算出 120
constexpr int result = factorial<5>();
int arr[result];  // 可直接作为数组大小
```

### 模板参数默认值 (Template Parameter Defaults, C++11)

```cpp
template <typename T = int, size_t C = 10>
class SimpleVector { /* ... */ };

SimpleVector<> v1;              // 默认: int, 容量 10
SimpleVector<double> v2;        // 指定类型, 默认容量
SimpleVector<string, 5> v3;     // 全参数指定
```

### Concepts (C++20)

C++20 核心特性——从"鸭子类型"走向"显式契约"。Concepts 允许为模板参数定义约束，解决传统模板编程中意图模糊和编译报错晦涩难懂的痛点。

**三大优势：**

| 优势 | 说明 |
|------|------|
| **提升代码可读性** | 显式声明参数必须满足的能力，代码意图清晰 |
| **改善编译错误** | 不再输出冗长的模板回溯，直接指出违反的约束 |
| **精准的重载决议** | 基于不同约束实现模板重载，消除调用歧义 |

```cpp
#include <concepts>

// 定义 Concept：要求为整数或浮点数
template<typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

// 使用 Concept 约束模板参数
template<Numeric T>
T add(T a, T b) { return a + b; }

add(5, 10);       // OK
add(1.5, 2.5);    // OK
// add("Hi", "C++"); // 编译报错！不满足 Numeric 约束
```

### requires 子句 (C++20)

配合 Concepts 使用，直接表达模板参数的约束条件。

```cpp
// 模板参数列表中
template <typename T>
requires Numeric<T>
void func(const T& t) { /* ... */ }

// 函数参数列表后
template <typename T>
void func(const T& t) requires Numeric<T> { /* ... */ }
```

---

## 模板使用注意事项

### 1. 声明与定义不可分离

!!! danger "核心原则"
    模板的声明和定义必须写在**同一个头文件**中。分离到 `.h` + `.cpp` 会导致链接器找不到实现，报 `undefined reference` 错误。

原理：模板是"编译期"行为，编译器在实例化时必须"看得到"完整的定义代码。

### 2. 避免模板匹配歧义

当多个模板都能匹配同一个调用时，会产生二义性导致编译错误。

规避策略：
- 保持设计简洁，减少不必要的重载
- 针对特殊场景优先使用特化
- 在调用点显式实例化消除模糊
- 使用 C++20 Concepts 对模板参数进行精确约束

### 3. 特化优先级顺序

编译器总是选择"最具体"的、能够匹配调用的那个版本。

| 优先级 | 版本 | 说明 |
|--------|------|------|
| 最高 | **普通函数** | 精确匹配 |
| 次高 | **全特化** | 针对特定类型的完全实现 |
| 较低 | **偏特化** | 针对部分类型参数的特化 |
| 最低 | **通用模板** | 最基础的模板定义，兜底匹配 |

!!! tip "记忆口诀"
    普通函数 > 全特化 > 偏特化 > 通用模板

---

## 总结

| 核心要点 | 说明 |
|----------|------|
| **泛型编程** | "编写一次，适配多种类型"，模板是实现泛型编程的核心工具 |
| **函数模板** | 创建通用函数，支持隐式/显式实例化、重载与特化 |
| **类模板** | 创建通用数据结构，必须显式指定类型，静态成员独立 |
| **模板特化** | 全特化覆盖所有参数，偏特化针对指针/引用等做类型适配 |
| **C++11 特性** | 模板别名、可变参数模板、constexpr 编译期计算 |
| **C++20 Concepts** | 类型约束革命，从源头杜绝匹配歧义，改善编译报错 |
| **避坑指南** | 定义放头文件，注意匹配歧义，明确特化优先级 |
