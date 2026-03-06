---
title: 什么是 C++?
authors: [Quinn]
comments: true
date: 2026-03-04
tags:
  - 面向对象编程
---

# 什么是 C++?

## C++ 历史

C++ 是由 Bjarne Stroustrup 在 1979 年开发的编程语言，最初被称为 "C with Classes"。它完全兼容 C 语言，并在其基础上添加了**面向对象编程（OOP）**特性，使得程序员能够更好地组织和管理代码。

## C++ 的特点

- **Efficiency**: 性能接近汇编语言，是高性能应用的首选。
- **OPP**: 支持类、对象、继承、多态等特性。
- **Versatility**: 适用于操作系统、游戏、嵌入式及数据库开发。
- **Modern**: 引入智能指针、Lambda表达式等现代编程范式。

## 与 C 的关系 （base on Microsoft C++ Learning）
> C++ 的原始要求之一是与 C 语言向后兼容。因此，C++ 始终允许 C 样式编程，其中包含原始指针、数组、以 null 结尾的字符串和其他功能。它们可以实现良好的性能，但也可能会引发 bug 并增加复杂性。C++ 的演变注重可显著降低 C 样式惯例使用需求的功能。如果需要，你仍可以使用旧的 C 编程设施。但是，在新式 C++ 代码中，对上述设施的需求会越来越少。现代 C++ 代码更加简单、安全、美观，而且速度仍像以往一样快速。
> 
> ——摘自微软 C++ 教程

### 资源和智能指针

C 语言的一个主要 bug 类型是**内存泄漏**，泄漏通常是由未能为使用 `delete` 分配的内存调用 `new` 导致的。C++ 强调“资源获取即初始化”(RAII) 原则：资源（堆内存、文件句柄、套接字等）应由对象“拥有”，该对象在其构造函数中创建或接收新分配的资源，并在其析构函数中将此资源删除。\
具体参阅[对象生存期和资源管理（RAII）](https://learn.microsoft.com/zh-cn/cpp/cpp/object-lifetime-and-resource-management-modern-cpp?view=msvc-180)。

### `std::string` 和 `std::string_view`

C 语言的字符串是 bug 的另一个主要来源。通过使用 `std::string` 和 `std::wstring`，几乎可以消除与 C 样式字符串关联的所有错误。还可以利用成员函数的优势进行搜索、追加和在前面追加等操作。两者都对速度进行了高度优化。将字符串传递到仅需要只读访问权限的函数时，在 C++17 中，可以使用 `std::string_view`，以便提高性能。

### `std::vector` 和其他标准库容器

标准库容器都遵循 RAII 原则。它们为安全遍历元素提供迭代器。此外，它们对性能进行了高度优化，并且已充分测试正确性。通过使用这些容器，可以消除自定义数据结构中可能引入的 bug 或低效问题。使用 vector 替代原始数组，来作为 C++ 中的序列容器。

```c++
vector<string> apples;
apples.push_back("Granny Smith");
```

使用 map（而不是 unordered_map），作为默认关联容器。对于退化和多案例，使用 set、multimap 和 multiset。

```c++
map<string, string> apple_color;
// ...
apple_color["Granny Smith"] = "Green";
```
### 标准库算法

C++ 标准库包含许多常见操作（如搜索、排序、筛选和随机化）的算法分类，这些分类在不断增长。数学库的内容很广泛。在 C++17 及更高版本中，提供了许多算法的并行版本。
以下是一些重要示例：

- `for_each`，默认遍历算法（以及基于范围的 for 循环）。
- `transform`，用于对容器元素进行非就地修改
- `find_if`，默认搜索算法。
- `sort`、`lower_bound` 和其他默认的排序和搜索算法。

若要编写比较运算符，请使用严格的 `<`，并尽可能使用命名 lambda。

```c++
auto comp = [](const widget& w1, const widget& w2)
     { return w1.weight() < w2.weight(); }

sort( v.begin(), v.end(), comp );

auto i = lower_bound( v.begin(), v.end(), widget{0}, comp );
```

### 用 `auto` 替代显式类型名称
C++11 引入了 `auto` 关键字，以便可将其用于变量、函数和模板声明中。`auto` 会指示编译器推导对象的类型，这样你就无需显式键入类型。当推导出的类型是嵌套模板时，`auto` 尤其有用：

```c++
map<int,list<string>>::iterator i = m.begin(); // C-style
auto i = m.begin(); // modern C++
```

### 基于范围的 `for` 循环
对数组和容器的 C 样式迭代容易引发索引错误，而且键入过程单调乏味。若要消除这些错误，并提高代码的可读性，可使用基于范围的 `for` 循环，此循环包含标准库容器和原始数组。有关详细信息，请参阅基于范围的 `for` 语句。

```c++
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> v {1,2,3};
    for(int i = 0; i < v.size(); ++i) { // C-style
        std::cout << v[i];
    }
    for(auto& num : v) { // modern C++
        std::cout << num;
    }
}
```

### 用 `constexpr` 表达式替代宏
C 和 C++ 中的宏是指编译之前由预处理器处理的标记。在编译文件之前，宏标记的每个实例都将替换为其定义的值或表达式。C 样式编程通常使用宏来定义编译时常量值。但宏容易出错且难以调试。在现代 C++ 中，应优先使用 `constexpr` 变量定义编译时常量：

```c++
#define SIZE 10 // C-style
constexpr int size = 10; // modern C++
```

### 统一初始化
在现代 C++ 中，可以使用任何类型的括号初始化。在初始化数组、矢量或其他容器时，这种初始化形式会非常方便。在下面的示例中，使用三个 `v2` 实例初始化 `S`。`v3` 将使用三个 `S` 实例进行初始化，这些实例使用括号初始化自身。编译器基于 `v3` 声明的类型推断每个元素的类型。

```c++
#include <vector>
struct S {
    std::string name;
    float num;
    S(std::string s, float f) : name(s), num(f) {}
};

int main() {
    // C-style initialization
    std::vector<S> v;
    S s1("Norah", 2.7);
    S s2("Frank", 3.5);
    S s3("Jeri", 85.9);

    v.push_back(s1);
    v.push_back(s2);
    v.push_back(s3);

    // Modern C++:
    std::vector<S> v2 {s1, s2, s3};

    // or...
    std::vector<S> v3{ {"Norah", 2.7}, {"Frank", 3.5}, {"Jeri", 85.9} };
}
```

### Lambda 表达式

在 C 样式编程中，可以通过使用函数指针将函数传递到另一个函数。函数指针不便于维护和理解。它们引用的函数可能是在源代码的其他位置中定义的，而不是从调用它的位置定义的。此外，它们不是类型安全的。现代 C++ 提供了函数对象和重写 `operator()` 运算符的类，可以像调用函数一样调用它们。创建函数对象的最简便方法是使用内联 lambda 表达式。下面的示例演示如何使用 lambda 表达式传递函数对象，然后由 find_if 函数在矢量的每个元素中调用此函数对象：

```C++
std::vector<int> v {1,2,3,4,5};
int x = 2;
int y = 4;
auto result = find_if(begin(v), end(v), [=](int i) { return i > x && i < y; });
```
可以将 lambda 表达式 `[=](int i) { return i > x && i < y; }` 理解为“采用类型 `int` 的单个参数并返回一个布尔值来表示此参数是否大于 `x` 并且小于 `y` 的函数”。请注意，可在 lambda 中使用来自周围上下文的 `x` 和 `y` 变量。`[=]` 会指定通过值捕获这些变量；换言之，对于这些值，lambda 表达式具有自己的值副本.

## Hello World 代码解析

```c++
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

- **Preprocessor Directive**: `#include <iostream>` 提供了输入输出对象 `cout` 和 `cin`，由于是在标准库，所以使用尖括号括起来。
