# Chapter 10: 多态进阶与智能指针

> 有了多态思想还不够——如何安全地管理多态对象的生命周期，才是通往工业级 C++ 的最后一公里。

---

## 抽象类与接口设计

### 接口类 (Interface Class)

在 C++ 中，**接口**通过所有成员函数都是纯虚函数的抽象类来实现。这类似于 Java 中的 `interface` 关键字。

```cpp
// 接口类：可绘制
class Drawable {
public:
    virtual void draw() const = 0;
    virtual ~Drawable() = default;
};

// 接口类：可缩放
class Scalable {
public:
    virtual void scale(double factor) = 0;
    virtual ~Scalable() = default;
};
```

!!! tip "C++ 接口命名惯例"
    接口类通常以 `-able` 结尾（如 `Drawable`、`Comparable`），或者以 `I` 开头（如 `IDrawable`、`IScalable`）。

### 实现多个接口

C++ 中通过多重继承实现多个接口：

```cpp
class Circle : public Drawable, public Scalable {
private:
    double _radius;
public:
    Circle(double r) : _radius(r) {}

    void draw() const override {
        cout << "Drawing a circle with radius " << _radius << endl;
    }

    void scale(double factor) override {
        _radius *= factor;
    }
};

class Rectangle : public Drawable {
private:
    double _width, _height;
public:
    Rectangle(double w, double h) : _width(w), _height(h) {}

    void draw() const override {
        cout << "Drawing a rectangle: " << _width << "x" << _height << endl;
    }
};
```

### 接口 vs 抽象类

| 特性 | 接口 (Interface) | 抽象类 (Abstract Class) |
|------|------------------|------------------------|
| 数据成员 | 无 | 可以有 |
| 函数实现 | 全部纯虚 | 可以有部分实现 |
| 多重继承 | 常用（组合多个能力） | 谨慎使用 |
| 关系 | "Can-do"（能力） | "Is-a"（种类） |

---

## 对象切割 (Object Slicing)

将派生类对象按值传递给基类参数时，派生类特有的部分会被"切掉"。

```cpp
class Animal {
public:
    virtual void speak() const { cout << "Animal" << endl; }
};

class Dog : public Animal {
private:
    string _breed;
public:
    Dog(string breed) : _breed(breed) {}
    void speak() const override { cout << "Dog (" << _breed << ")" << endl; }
};

void byValue(Animal a) { a.speak(); }      // 切割！
void byRef(const Animal& a) { a.speak(); } // 多态！

int main() {
    Dog dog("Husky");
    byValue(dog);   // 输出 "Animal" — 切掉了 _breed 和虚函数
    byRef(dog);     // 输出 "Dog (Husky)" — 完整多态
}
```

!!! warning "避免值传递"
    处理多态对象时，始终使用**指针或引用**传递，不要使用值传递。

---

## 初始化和赋值中的多态

构造函数和析构函数中，虚函数**不是多态的**——它们只调用当前类的版本，而不是派生类的版本。

```cpp
class Base {
public:
    Base() { printInfo(); }    // 调用 Base::printInfo
    virtual void printInfo() { cout << "Base" << endl; }
};

class Derived : public Base {
public:
    Derived() { printInfo(); } // 调用 Derived::printInfo
    void printInfo() override { cout << "Derived" << endl; }
};

int main() {
    Derived d;
    // 输出：
    // Base     ← 构造 Base 时，Derived 部分尚未创建
    // Derived  ← 构造 Derived 时
    
    Base& ref = d;
    ref.printInfo();           // Derived — 正常多态
}
```

!!! important "构造/析构中的虚函数"
    基类构造期间，派生类部分尚未初始化，因此虚函数调用不会下达到派生类。析构函数同理。

---

## 智能指针 (Smart Pointers)

传统指针管理存在的问题：

| 问题 | 后果 |
|------|------|
| 忘记 `delete` | 内存泄漏 |
| 重复 `delete` | 未定义行为（程序崩溃） |
| 异常发生时未释放 | 资源泄漏 |

### RAII (Resource Acquisition Is Initialization)

**RAII** 是 C++ 的核心资源管理思想：资源在构造函数中获取，在析构函数中释放。

智能指针是 RAII 的典型应用——它们在构造时获取所有权，在析构时自动释放。

---

### unique_ptr — 独占所有权

`unique_ptr` 独占指向的对象，**不能拷贝**，只能移动。

```cpp
#include <memory>

class Resource {
public:
    Resource() { cout << "Resource acquired" << endl; }
    ~Resource() { cout << "Resource released" << endl; }
    void doWork() { cout << "Working..." << endl; }
};

int main() {
    // 创建 unique_ptr（推荐使用 make_unique）
    unique_ptr<Resource> ptr = make_unique<Resource>();

    ptr->doWork();           // 像使用普通指针一样

    // unique_ptr<Resource> ptr2 = ptr;    // ❌ 不能拷贝
    unique_ptr<Resource> ptr2 = move(ptr); // ✅ 可以移动（转移所有权）
    
    // ptr 现在为空
    if (!ptr) {
        cout << "ptr is null" << endl;
    }

    return 0;  // 不需要 delete，自动释放！
}
```

!!! tip "make_unique vs new"
    优先使用 `make_unique<T>(args)` 而非 `new T(args)`：
    - 更安全（异常安全）
    - 代码更简洁
    - 避免显式的 `new`/`delete`

### unique_ptr 与多态

```cpp
class Shape {
public:
    virtual void draw() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    void draw() const override { cout << "Circle" << endl; }
};

class Square : public Shape {
public:
    void draw() const override { cout << "Square" << endl; }
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Circle>());
    shapes.push_back(make_unique<Square>());

    for (const auto& s : shapes) {
        s->draw();  // 多态调用
    }
    // 自动释放所有对象
}
```

---

### shared_ptr — 共享所有权

`shared_ptr` 通过**引用计数**实现多个指针共享同一对象，当最后一个 `shared_ptr` 销毁时释放对象。

```cpp
#include <memory>

class Resource {
public:
    Resource() { cout << "Created" << endl; }
    ~Resource() { cout << "Destroyed" << endl; }
    void use() { cout << "In use" << endl; }
};

int main() {
    shared_ptr<Resource> ptr1 = make_shared<Resource>();
    {
        shared_ptr<Resource> ptr2 = ptr1;  // 引用计数：2
        ptr2->use();
        cout << "Inside scope" << endl;
    }  // ptr2 销毁，引用计数：1
    
    cout << "Still alive" << endl;
    return 0;
}  // ptr1 销毁，引用计数：0 → 释放对象
```

### 循环引用与 weak_ptr

`shared_ptr` 最大的陷阱是**循环引用**——两个对象互相持有对方的 `shared_ptr`，导致引用计数永远不为 0，产生内存泄漏。

```cpp
// ❌ 循环引用
class B;  // 前向声明

class A {
public:
    shared_ptr<B> _b;
    ~A() { cout << "A destroyed" << endl; }
};

class B {
public:
    shared_ptr<A> _a;
    ~B() { cout << "B destroyed" << endl; }
};

void leak() {
    auto a = make_shared<A>();
    auto b = make_shared<B>();
    a->_b = b;
    b->_a = a;  // 循环引用！
}  // a 和 b 都不会被销毁！内存泄漏！
```

解决方案：将其中一方的 `shared_ptr` 改为 `weak_ptr`。

```cpp
// ✅ 使用 weak_ptr 打破循环引用
class A {
public:
    shared_ptr<B> _b;
    ~A() { cout << "A destroyed" << endl; }
};

class B {
public:
    weak_ptr<A> _a;   // 弱引用：不增加引用计数
    ~B() { cout << "B destroyed" << endl; }
};

void noLeak() {
    auto a = make_shared<A>();
    auto b = make_shared<B>();
    a->_b = b;
    b->_a = a;  // weak_ptr 不增加引用计数
}  // ✅ a 和 b 都正确销毁！
```

| 智能指针 | 所有权 | 能否拷贝 | 引用计数 | 适用场景 |
|----------|--------|----------|----------|----------|
| `unique_ptr` | 独占 | 只能移动 | 无 | 明确所有者 |
| `shared_ptr` | 共享 | 可以拷贝 | 有 | 多所有者 |
| `weak_ptr` | 无所有权 | 从 shared_ptr 创建 | 无（观察者） | 打破循环引用 |

!!! tip "如何选择智能指针？"
    1. **默认用 `unique_ptr`** — 效率最高
    2. 需要共享所有权时用 `shared_ptr`
    3. 需要观察但不拥有对象时用 `weak_ptr`
    4. 普通 `*` / `&` 指针只在非拥有引用时使用

---

## 工厂模式 (Factory Pattern)

工厂模式利用多态和智能指针，将对象的创建过程封装起来：

```cpp
#include <memory>
#include <string>
#include <map>
using namespace std;

// 抽象产品
class Logger {
public:
    virtual void log(const string& msg) = 0;
    virtual ~Logger() = default;
};

// 具体产品
class ConsoleLogger : public Logger {
public:
    void log(const string& msg) override {
        cout << "[Console] " << msg << endl;
    }
};

class FileLogger : public Logger {
public:
    void log(const string& msg) override {
        cout << "[File] " << msg << endl;  // 实际应写入文件
    }
};

// 工厂类
class LoggerFactory {
public:
    static unique_ptr<Logger> createLogger(const string& type) {
        if (type == "console") return make_unique<ConsoleLogger>();
        if (type == "file")    return make_unique<FileLogger>();
        return nullptr;
    }
};

int main() {
    auto logger = LoggerFactory::createLogger("console");
    if (logger) {
        logger->log("Hello, Factory Pattern!");
    }
}
```

---

## 智能指针的生命周期管理

```cpp
class Manager {
private:
    vector<unique_ptr<Shape>> _shapes;  // 独占所有权
public:
    void addShape(unique_ptr<Shape> shape) {
        _shapes.push_back(move(shape));
    }

    void drawAll() const {
        for (const auto& s : _shapes) {
            s->draw();
        }
    }
};

int main() {
    Manager manager;
    manager.addShape(make_unique<Circle>());
    manager.addShape(make_unique<Square>());
    manager.drawAll();
    // Manager 析构时自动释放所有 Shape
}
```

---

## 总结：多态与智能指针的最佳实践

| 实践 | 说明 |
|------|------|
| 基类必须有虚析构 | 确保派生类资源正确释放 |
| 接口使用纯虚类 | 所有函数 `=0`，无数据成员 |
| 优先使用智能指针 | 避免手动 `new`/`delete` |
| 默认用 `unique_ptr` | 效率最高，语义明确 |
| 只在必要时用 `shared_ptr` | 引用计数有性能开销 |
| 用 `weak_ptr` 打破循环 | 解决 shared_ptr 循环引用 |
| 用 `make_shared`/`make_unique` | 异常安全且简洁 |
| 传递多态对象用引用 | 避免对象切割 |
