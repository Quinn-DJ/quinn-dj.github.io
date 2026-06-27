# 07: 模板与泛型编程 (Templates & Generic Programming)

> 泛型让代码适用于多种类型而无需为每种类型重写。C++ 模板是编译期的"多态"——运行期零开销。

---

## 什么是泛型编程？

**泛型编程 (Generic Programming)** 是一种通过编写与具体类型无关的通用代码来操作多种数据类型的范式。

| 方式 | 问题 |
|------|------|
| 函数重载 | 每种类型写一个函数，代码冗余 |
| 宏定义 | 无类型检查，易出错 |
| **模板 (Template)** | 一次编写，无限复用，编译期类型检查 |

---

## 函数模板

### 语法

```cpp
template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}
// 等价写法：template <class T>
```

| 关键字 | 含义 |
|--------|------|
| `template` | 声明这是一个模板 |
| `<typename T>` | `T` 是类型参数（占位符） |

### 使用方式

```cpp
int x = 10, y = 20;
cout << getMax(x, y) << endl;     // 自动推导 T=int
cout << getMax<int>(10, 20) << endl; // 显式指定
```

### 模板的"隐式实例化"

编译器不会为未使用的类型生成代码，避免了代码膨胀。只有当函数模板被调用时，编译器才会根据需要生成对应类型的实例。

---

## 类模板

让整个类适用于不同类型的数据：

```cpp
template <typename T>
class Container {
private:
    T _data[100];
    int _size = 0;
public:
    void add(T value) { _data[_size++] = value; }
    T get(int index) const { return _data[index]; }
    int size() const { return _size; }
};

Container<int> intContainer;
intContainer.add(42);
Container<string> strContainer;
strContainer.add("Hello");
```

### 类模板的声明与实现分离

模板代码不能像普通类那样分离到 `.h`/`.cpp` 中，因为模板在编译期进行实例化，编译器需要**完整的模板定义**。

```cpp
// .h 文件
template <typename T>
class Container {
    T _data[100];
    int _size = 0;
public:
    void add(T value);  // 声明
};

// ★ 模板的实现也必须放在头文件中！
template <typename T>
void Container<T>::add(T value) {
    _data[_size++] = value;
}
```

!!! important "模板的编译模型"
    标准 C++ 要求模板的完整定义在编译时可见。解决方法：
    1. 将所有代码放在头文件中
    2. 在 `.cpp` 中显式实例化（`template class Container<int>`）
    3. C++20 Modules 能解决此问题

---

## 多类型参数

模板支持同时使用多个类型参数：

```cpp
template <typename KeyType, typename ValueType>
class Pair {
private:
    KeyType _key;
    ValueType _value;
public:
    Pair(KeyType key, ValueType value)
        : _key(key), _value(value) {}
    KeyType getKey() const { return _key; }
    ValueType getValue() const { return _value; }
};

Pair<string, int> score("Alice", 95);
```

---

## 模板特化 (Specialization)

为特定的类型提供"定制版"实现。这个机制使模板可以根据不同的类型实参执行不同的行为。

### 全特化

为某个具体类型提供完全不同的实现：

```cpp
// 通用模板
template <typename T>
class Compare {
public:
    bool equals(T a, T b) { return a == b; }
};

// 针对 double 的全特化
template <>
class Compare<double> {
public:
    bool equals(double a, double b) {
        return fabs(a - b) < 1e-9;
    }
};
```

### 部分特化 (Partial Specialization)

只对参数的一部分进行特化。**仅适用于类模板**，函数模板不支持部分特化：

```cpp
// 通用类模板
template <typename T1, typename T2>
struct Pair { /* ... */ };

// 部分特化：第二个类型固定为 int
template <typename T>
struct Pair<T, int> { /* 特殊处理 */ };
```

---

## 非类型模板参数

模板参数不一定是类型，可以是确定类型的常量值。这在需要编译期确定大小（如静态数组）或指定策略时非常有用：

```cpp
template <typename T, int Size>
class StaticArray {
private:
    T _data[Size];
public:
    int size() const { return Size; }
    T& operator[](int index) { return _data[index]; }
};

StaticArray<int, 10> arr;   // 类型为 int，大小为 10
StaticArray<double, 5> arr2; // 类型为 double，大小为 5
```

!!! note "非类型参数的限制"
    - 必须是编译期可确定的常量
    - C++17 前：必须是整型、枚举、指针、引用
    - C++20：支持浮点类型和字面量类类型

---

## 可变参数模板 (Variadic Templates)

C++11 引入的语法，让模板函数或类可以接受任意数量的参数。它使用参数包 `...` 的展开机制：

```cpp
// 递归终止（基础情况）
template <typename T>
T sum(T t) { return t; }

// 递归展开
template <typename T, typename... Args>
T sum(T first, Args... rest) {
    return first + sum(rest...);
}

int result = sum(1, 2, 3, 4, 5);  // 15
```

---

## C++20 Concepts

`Concepts` 是 C++20 最重要的模板特性，它提供了一种约束模板参数的方法，让模板报错信息**大幅友好化**：

```cpp
#include <concepts>

// 要求 T 支持比较
template <typename T>
requires totally_ordered<T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}

// 简洁写法
auto getMax(totally_ordered auto a, totally_ordered auto b) {
    return (a > b) ? a : b;
}
```

### Concepts 的优势

| 问题 | C++17 前 | C++20 Concepts |
|------|----------|----------------|
| 报错信息 | 内层模板展开，数十行不可读 | 直接指出约束失败 |
| 重载选择 | 手动 SFINAE，代码复杂 | Composition of constraints |
| 类型约束 | 通过文档/注释说明 | 编译器强制检查 |

---

## 模板使用注意事项

| 注意点 | 说明 |
|--------|------|
| 代码膨胀 | 不同类型会生成独立代码 |
| 编译开销 | 编译时间会增加 |
| 类型要求 | 模板假设类型支持某些操作（如 `>`），类模板使用者必须确保传入的类型确实支持模板体内用到的所有操作 |
| 调试困难 | 模板展开后的代码难以阅读 |
| 头文件约束 | 模板定义必须放在头文件中 |
