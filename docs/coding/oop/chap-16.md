# Chapter 16: 现代C++总复习

> 系统梳理 C++11-23 核心语法特性与工程最佳实践，建立完整的知识图谱，夯实面向对象、泛型编程与函数式编程的理论基础。

---

## 知识体系全景图

现代 C++ 学习可分为三个层次：

| 层次 | 内容 | 目标 |
|------|------|------|
| **基础语法核心** | 数据类型、运算符、控制流、函数 | 掌握底层逻辑与核心规范 |
| **面向对象与泛型** | 类与对象、继承、多态、STL、智能指针 | 掌握高效安全的内存管理范式 |
| **现代特性与工程** | C++11-23 新特性、Boost 等准标准库 | 建立系统化工程化思维 |

---

## 变量类型与初始化

### 统一初始化 (Uniform Initialization)

使用 `{}` 进行初始化，语法统一且能防止类型收窄：

```cpp
int x{42};       // OK
// int y{3.14};  // 编译错误：禁止窄化转换
```

### auto 类型推导

编译器自动推断变量类型，尤其适合处理冗长的模板类型：

```cpp
auto ptr = std::make_unique<int>(42);
auto it = myMap.begin();
```

### decltype 类型查询

查询表达式或变量的实际类型，是模板元编程的核心工具：

```cpp
int x = 10;
decltype(x) y = 20;  // y 的类型为 int
```

### nullptr：类型安全的空指针

彻底替代 `NULL` 和 `0`，解决指针与整数类型混淆导致的重载解析问题。

### using 别名

相比 `typedef`，`using` 支持模板别名，让复杂模板类型定义更简洁：

```cpp
template <typename T>
using Vec = std::vector<T>;  // Vec<int> 即 vector<int>
```

---

## 类与对象总结

### 核心概念

| 机制 | 作用 |
|------|------|
| **封装 (Encapsulation)** | 通过访问控制符隐藏实现细节，仅暴露必要接口 |
| **构造函数** | 对象初始化时的资源分配与状态设置 |
| **析构函数** | 销毁时释放资源；基类析构建议声明为 `virtual` |
| **const 成员函数** | 承诺不修改对象状态，支持 const 对象调用 |
| **static 静态成员** | 属于类本身而非具体对象，由所有实例共享 |

```cpp
class Rectangle {
private:
    double width_, height_;
    static int count_;
public:
    Rectangle() { count_++; }
    ~Rectangle() { count_--; }
    double getArea() const {
        return width_ * height_;
    }
    static int getCount() { return count_; }
};
```

---

## 运算符重载

为核心思想是为自定义类型赋予内置类型般的操作符行为。

| 类别 | 支持的操作符 |
|------|-------------|
| **算术与比较** | `+` `-` `*` `/` `==` `!=` `<` `>` |
| **自增/自减** | `++` `--`（前置/后置） |
| **下标访问** | `[]` 模拟数组式元素访问 |

### 最佳实践：复合赋值 + 非成员实现

```cpp
class Complex {
    double real_, imag_;
public:
    // 成员函数实现 +=
    Complex& operator+=(const Complex& o) {
        real_ += o.real_;
        imag_ += o.imag_;
        return *this;
    }
};

// 非成员函数实现 +，复用 +=
Complex operator+(Complex a, const Complex& b) {
    a += b;
    return a;
}
```

优先将 `operator+=` 作为成员函数实现，再通过非成员函数 `operator+` 复用其逻辑，减少代码冗余并保持接口一致性。

---

## 继承与多态

### 继承方式

| 方式 | 含义 |
|------|------|
| **public** | "is-a" 关系，基类 public 成员在派生类中保持 public |
| **protected** | 基类 public/protected 成员变为 protected |
| **private** | 基类成员全部变为 private，多用于实现细节复用 |
| **virtual** | 解决菱形继承中的成员二义性 |

### 多态的实现机制

| 类型 | 时机 | 实现方式 |
|------|------|----------|
| **静态多态** | 编译期 | 函数重载、模板 |
| **动态多态** | 运行期 | 虚函数表 (vtable) + 虚函数指针 (vptr) |

### C++11 核心关键字

| 关键字 | 作用 |
|--------|------|
| **override** | 显式声明重写基类虚函数，编译器严格检查签名匹配 |
| **final** | 修饰虚函数：禁止派生类重写；修饰类：禁止被继承 |

### Shape 类体系示例

```cpp
// 抽象基类
class Shape {
public:
    virtual double calculateArea() const = 0;  // 纯虚函数
    virtual void draw() const;                  // 虚函数
    virtual ~Shape() = default;                 // 虚析构函数
};

// 派生类
class Circle : public Shape {
    double r;
public:
    double calculateArea() const override {
        return 3.14159 * r * r;
    }
};

class Rectangle : public Shape {
    double width, height;
public:
    double calculateArea() const override {
        return width * height;
    }
};

// 多态调用
void printShapeInfo(const Shape& shape) {
    shape.draw();
    std::cout << "Area: " << shape.calculateArea() << std::endl;
}
```

### 高频考点：虚析构函数

```cpp
class Base {
public:
    ~Base() { /* ... */ }  // 非虚析构 —— 危险！
};

class Derived : public Base {
    int* p_ = new int[100];
public:
    ~Derived() { delete[] p_; }
};

// 错误用法
Base* p = new Derived();
delete p;  // 仅调用 Base::~Base()，Derived 资源泄漏！
```

黄金法则：只要一个类可能作为基类被继承，其析构函数就必须声明为 `virtual`。

---

## 移动语义 (Move Semantics)

### 核心思想

转移资源的所有权，而非拷贝资源，从根本上避免对包含动态内存的复杂对象进行不必要的深拷贝。

| 概念 | 说明 |
|------|------|
| **左值 (lvalue)** | 有名称、可被取地址的对象，生命周期持久 |
| **右值 (rvalue)** | 临时对象、无名对象，生命周期短暂 |
| **std::move** | 将左值强制转换为右值引用，激活移动语义 |

### 移动构造与移动赋值

通过接管源对象的资源指针并置空源对象，实现零拷贝转移：

```cpp
class MyString {
private:
    char* data_;
    size_t size_;

    void freeData() { delete[] data_; }

public:
    explicit MyString(const char* str = "") {
        // 普通构造：分配内存 + 拷贝
    }

    MyString(const MyString& other) {
        // 拷贝构造：深拷贝
    }

    // 移动构造函数：窃取资源，无内存分配
    MyString(MyString&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;   // 关键：置空源对象
        other.size_ = 0;
    }

    // 移动赋值运算符
    MyString& operator=(MyString&& other) noexcept {
        if (this != &other) {
            freeData();
            data_ = other.data_;
            size_ = other.size_;
            other.data_ = nullptr;
            other.size_ = 0;
        }
        return *this;
    }

    // 显式禁用拷贝赋值，强制使用移动语义
    MyString& operator=(const MyString&) = delete;

    ~MyString() { freeData(); }
};
```

### 移动语义三原则

1. **直接接管资源指针**，避免昂贵的内存分配和深拷贝
2. **必须置空源对象指针**，防止双重释放
3. **移动操作声明 noexcept**，让 STL 容器（如 vector 扩容时）优先选择移动而非拷贝

---

## 智能指针 (Smart Pointers)

### 核心思想：RAII 资源管理

将动态内存的生命周期与智能指针对象的生命周期绑定，利用对象作用域自动调用析构函数释放资源。

### 三种智能指针对比

| 类型 | 所有权 | 拷贝 | 典型场景 |
|------|--------|------|----------|
| **unique_ptr** | 独占 | 禁止拷贝，可 std::move | 工厂函数返回值、类成员 |
| **shared_ptr** | 共享（引用计数） | 允许拷贝 | 资源被多个对象共享 |
| **weak_ptr** | 弱引用（不计数） | 允许拷贝 | 打破循环引用 |

### 循环引用问题

```cpp
// 问题：shared_ptr 相互持有导致内存泄漏
class A { public: std::shared_ptr<B> b_ptr; };
class B { public: std::shared_ptr<A> a_ptr; };
// a 持有 b，b 持有 a，引用计数均为 2
// 离开作用域后计数减为 1，对象永远无法销毁

// 解决方案：引入 weak_ptr 打破循环
class B {
public:
    std::weak_ptr<A> a_ptr;  // 弱引用，不增加计数
    ~B() { /* 正常调用 */ }
};
```

核心原则：拥有对象用 `shared_ptr`，观测对象用 `weak_ptr` —— "所有权与观测权分离"。

### 高频考点：unique_ptr 特性

| 描述 | 真伪 |
|------|------|
| 可被拷贝 | 错误 —— 仅支持 std::move 转移 |
| 独占式所有权管理 | 正确 —— 核心设计目标 |
| 解决循环引用 | 错误 —— 这是 weak_ptr 的职责 |
| 引用计数开销 | 不存在 —— 性能接近原始指针 |

---

## STL 容器

### 容器选择指南

| 容器 | 底层结构 | 随机访问 | 增删复杂度 | 适用场景 |
|------|----------|----------|-----------|----------|
| **vector** | 动态数组 | O(1) | 尾部 O(1) | 固定数据量、频繁随机读取 |
| **list** | 双向链表 | 不支持 | 任意位置 O(1) | 频繁中部/头部插入删除 |
| **deque** | 分段数组 | O(1) | 头尾 O(1) | 队列、两端快速增删 |
| **set/map** | 红黑树 | 不支持 | O(log n) | 有序存储、范围查询 |
| **unordered_set/map** | 哈希表 | 不支持 | 平均 O(1) | 极致查询效率、不要求顺序 |

### emplace vs push/insert

| 方式 | 构造时机 | 性能 |
|------|----------|------|
| `push_back` / `insert` | 先构造临时对象，再拷贝/移动到容器 | 可能产生额外构造 |
| `emplace_back` / `emplace` | 直接在容器内就地构造 | 零拷贝，更高效 |

优先使用 `emplace` 系列函数以减少不必要的临时对象构造。

---

## STL 算法概览

STL 算法与容器分离，通过迭代器操作数据：

| 类别 | 核心函数 | 作用 |
|------|----------|------|
| **非修改序列** | `for_each` `count` `find` `all_of` `any_of` `none_of` | 遍历、统计、查找、条件检查 |
| **修改序列** | `copy` `move` `transform` `replace` `remove` | 复制、移动、转换、替换 |
| **排序相关** | `sort` `stable_sort` `partial_sort` `binary_search` `lower_bound` `upper_bound` | 排序、有序查找 |
| **数值算法** | `accumulate` `iota` | 累加求和、生成连续序列 |

---

## Lambda 表达式

### 语法结构

```
[capture](parameters) -> return_type { body }
```

### 捕获方式

| 方式 | 含义 |
|------|------|
| `[]` | 不捕获任何外部变量 |
| `[=]` | 按值捕获所有外部变量 |
| `[&]` | 按引用捕获所有外部变量 |
| `[x, &y]` | 混合捕获：x 按值，y 按引用 |
| `[this]` | 捕获 this 指针 |

### 核心用法

```cpp
int x = 10;

// 值捕获：复制外部变量
auto add_x = [x](int y) { return x + y; };
std::cout << add_x(5) << std::endl;  // 输出：15，x 仍为 10

// 引用捕获：直接操作外部变量
auto modify_x = [&x](int y) { x += y; };
modify_x(5);
std::cout << x << std::endl;  // 输出：15

// 存储到 std::function
std::function<int(int)> sq = [](int a) { return a * a; };
std::cout << sq(5) << std::endl;  // 输出：25
```

### mutable 关键字

允许在 Lambda 体内修改按值捕获的变量（默认只读）。

### Lambda 与 STL 算法结合示例

```cpp
std::vector<double> scores = {85.5, 92.0, 58.0, 76.5, 98.0};

// 降序排序
std::sort(scores.begin(), scores.end(),
          [](double a, double b) { return a > b; });

// 查找第一个不及格分数
auto it = std::find_if(scores.begin(), scores.end(),
                       [](double s) { return s < 60.0; });

// 计算总和
double total = std::accumulate(scores.begin(), scores.end(), 0.0,
                               [](double sum, double s) { return sum + s; });
```

核心优势：逻辑内聚在调用点，无需定义分散的全局函数或函数对象。

---

## 迭代器分类

迭代器按能力划分为五个层级：

| 类型 | 读写 | 方向 | 操作 | 典型容器 |
|------|------|------|------|----------|
| **输入迭代器** | 只读 | 单向 | `++` `*` `->` `==` `!=` | `istream_iterator` |
| **输出迭代器** | 只写 | 单向 | `++` `*it=value` | `ostream_iterator` |
| **前向迭代器** | 读写 | 单向 | 同上 + 多遍扫描 | `forward_list` |
| **双向迭代器** | 读写 | 双向 | 同上 + `--` | `list` `map` `set` |
| **随机访问** | 读写 | 双向+跳跃 | 同上 + `[]` `+` `-` `<` `>` | `vector` `deque` `array` |

---

## C++17/20/23 新特性

### C++17：结构化绑定

一次性解构结构体、数组或元组的成员：

```cpp
std::pair<std::string, int> p = {"Alice", 30};
auto [name, age] = p;  // name = "Alice", age = 30
```

### C++17：std::filesystem

提供路径处理、目录遍历、文件状态查询等高级文件系统操作能力。

### C++20：Concepts（概念）

约束模板参数，使模板错误信息更清晰，提升代码可读性：

```cpp
template<std::integral T>
T add(T a, T b) { return a + b; }
```

### C++20：Ranges 库

支持链式算法调用，避免迭代器的繁琐传递：

```cpp
std::vector<int> v = {1, 2, 3, 4, 5};
auto even_sq = v | std::views::filter(even)
                | std::views::transform(sq);
```

### C++23：std::expected

提供"成功返回值 / 失败返回错误"的显式语义，是异常和错误码之外的第三种错误处理范式：

```cpp
std::expected<int, std::error_code> res = func();
if (res) {
    // 使用 *res
} else {
    // 处理 res.error()
}
```

---

## 异常处理

### 核心机制

| 关键字 | 作用 |
|--------|------|
| **try** | 包裹可能抛出异常的代码块 |
| **catch** | 捕获并处理特定类型的异常，支持多 catch 块 |
| **throw** | 主动抛出异常对象，传递给上层调用栈 |

### 设计原则

| 原则 | 说明 |
|------|------|
| **早抛出，晚捕获** | 错误源头立即抛出，高层统一处理 |
| **noexcept 规范** | 指定函数不抛出异常，帮助编译器优化 |
| **避免裸 new** | 用智能指针确保异常发生时资源正确释放 |

```cpp
void process(int d) {
    if (d < 0) throw std::runtime_error("Invalid");
}

int main() {
    try {
        process(-10);
    } catch (const std::runtime_error& e) {
        std::cerr << "Error: " << e.what();
    }
}
```

---

## 文件 I/O

### 核心流类

| 类 | 作用 |
|----|------|
| `std::ifstream` | 从文件读取数据 |
| `std::ofstream` | 向文件写入数据 |
| `std::fstream` | 同时支持读写 |

### 类层次结构

```
ios_base
 └── ios
      ├── istream  ←── ifstream (读文件)
      ├── ostream  ←── ofstream (写文件)
      └── iostream ←── fstream  (读写文件)
```

### 关键打开模式

| 模式 | 说明 |
|------|------|
| `ios::in` | 读取模式打开（ifstream 默认） |
| `ios::out` | 写入模式打开，存在则清空（ofstream 默认） |
| `ios::app` | 追加模式，写入数据添加到文件末尾 |
| `ios::ate` | 打开后定位到文件末尾 |
| `ios::trunc` | 若文件存在则截断为空 |
| `ios::binary` | 二进制模式 |

模式可通过 `|` 组合：`ios::in | ios::out | ios::binary`。

---

## 常见易错点汇总

### 内存泄漏 (Memory Leaks)

| 成因 | 解决方案 |
|------|----------|
| 忘记释放动态内存 | 优先使用智能指针管理资源 |
| 基类析构未声明 virtual | 基类析构函数必须为虚函数 |

### 多态失效 (Polymorphism Failure)

| 成因 | 解决方案 |
|------|----------|
| 虚函数签名不一致（const、返回值） | 严格匹配签名 |
| 遗漏 override 关键字 | 始终使用 override 显式声明 |

### 对象切片 (Object Slicing)

以值传递将派生类对象传给基类参数，导致派生类特有成员被"切片"丢失。解决方案：始终使用指针或引用传递对象。

### 智能指针滥用

| 错误 | 后果 | 修正 |
|------|------|------|
| shared_ptr 循环引用 | 引用计数无法归零，内存泄漏 | 使用 weak_ptr 打破循环 |
| 拷贝 unique_ptr | 编译错误 | 使用 std::move 转移所有权 |

### 异常未捕获

抛出异常后若未在调用栈中捕获，程序会直接终止。遵循"早抛出，晚捕获"原则，在合适的层级统一处理，避免异常泄露到程序边界之外。

---

## 代码优化实践：从原始指针到智能指针

### 反面教材

```cpp
std::vector<Person*> ps;
ps.push_back(new Person("Zhang San", 20));
// 忘记 delete！内存泄漏
```

问题诊断：

1. **直接的内存泄漏风险**：new 创建了对象但没有对应的 delete
2. **异常不安全**：若 push_back 与 delete 之间抛出异常，释放代码永远不会执行
3. **违背现代 C++ 实践**：手动管理原始指针易因疏忽引入难以追踪的 Bug

### 优化后

```cpp
std::vector<std::shared_ptr<Person>> persons;
persons.push_back(std::make_shared<Person>("Zhang San", 20));
// 无需手动 delete！vector 销毁时自动释放内存
// 即使发生异常也能保证资源被正确回收
```

收益：

1. **自动内存管理**：彻底告别手动 delete
2. **强异常安全性**：异常发生时仍正常析构
3. **代码简洁健壮**：遵循 RAII 原则

---

## 核心知识点回顾

| 领域 | 核心要点 |
|------|----------|
| **面向对象** | 封装隐藏细节、继承实现复用、多态统一接口；掌握虚函数、抽象类、虚析构函数 |
| **内存管理** | 遵循 RAII 原则；智能指针管理堆内存；移动语义优化传递效率 |
| **STL 与函数式** | 根据场景选型容器；组合 STL 通用算法；Lambda 简化临时逻辑 |
| **现代特性** | auto 简化类型、nullptr 类型安全、C++17 结构化绑定、C++20 Concepts & Ranges |

---

## 备考与实践建议

1. **深入理解原理**：不仅要会用，更要理解 vtable 结构、引用计数实现、移动语义底层机制
2. **多写代码多实践**：通过小型实战项目和算法题巩固知识
3. **阅读优秀代码**：研读 Boost、Abseil 等成熟开源库的源码
4. **关注标准发展**：了解 C++20/23 新特性（协程、模块、范围等）
5. **善用开发工具**：熟练使用 GCC/Clang 编译器、GDB/LLDB 调试器、Clang-Tidy 静态分析工具
