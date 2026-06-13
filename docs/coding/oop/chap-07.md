# Chapter 7: 继承进阶 — 多重继承与菱形继承

> 多重继承是 C++ 中最具争议的特性——用得好是利器，用得不好是灾难。

---

## 多重继承 (Multiple Inheritance)

一个派生类**同时继承多个基类**的能力，称为多重继承。

```cpp
class Base1 { /* ... */ };
class Base2 { /* ... */ };
class Derived : public Base1, public Base2 { /* ... */ };
```

### 语法

```cpp
class Student {
protected:
    string _studentID;
public:
    Student(string id) : _studentID(id) {}
    void study() const { cout << "Studying..." << endl; }
};

class Worker {
protected:
    string _employeeID;
public:
    Worker(string id) : _employeeID(id) {}
    void work() const { cout << "Working..." << endl; }
};

class PartTimeStudent : public Student, public Worker {
public:
    PartTimeStudent(string sid, string eid)
        : Student(sid), Worker(eid) {}

    void showStatus() const {
        cout << "Student ID: " << _studentID << endl;
        cout << "Employee ID: " << _employeeID << endl;
    }
};

int main() {
    PartTimeStudent p("S001", "E001");
    p.study();      // 来自 Student
    p.work();       // 来自 Worker
    p.showStatus(); // 自己的
}
```

### 多重继承的典型场景

- 将**不同来源的功能**组合到一个类中
- 实现**多个接口**（Java 接口的概念在 C++ 中通过纯虚基类实现）
- **混合类 (Mixin)**：为类添加特定功能

!!! tip "多重继承 vs 组合"
    当你只是想要一个类拥有另一个类的功能时，优先考虑组合；只有当类的确是"既是 A 又是 B"时（Is-a），才使用多重继承。

---

## 菱形继承问题 (Diamond Problem)

当两个类继承同一个基类，而另一个类又同时继承这两个类时，形成菱形继承结构。

```
      A
     / \
    B   C
     \ /
      D
```

### 问题示例

```cpp
class Animal {
protected:
    string _name;
public:
    Animal(string name) : _name(name) {}
    void eat() { cout << _name << " is eating." << endl; }
};

class FlyingAnimal : public Animal {
public:
    FlyingAnimal(string name) : Animal(name) {}
    void fly() { cout << _name << " is flying." << endl; }
};

class RunningAnimal : public Animal {
public:
    RunningAnimal(string name) : Animal(name) {}
    void run() { cout << _name << " is running." << endl; }
};

// ❌ 菱形继承：Dragon 会拥有两份 Animal 的副本
class Dragon : public FlyingAnimal, public RunningAnimal {
public:
    Dragon(string name)
        : FlyingAnimal(name), RunningAnimal(name) {}
};

int main() {
    Dragon d("Draco");
    // d.eat();              // ❌ 二义性错误！来自哪条路径？
    // d.FlyingAnimal::eat(); // ✅ 需要指定路径，但数据冗余
}
```

### 菱形继承的三宗罪

| 问题 | 表现 |
|------|------|
| **数据冗余** | `Animal` 的成员在 `Dragon` 中存在两份 |
| **二义性** | 成员访问时不清楚走哪条继承路径 |
| **内存泄漏** | 资源管理复杂，`delete` 可能遗漏 |

!!! warning "菱形继承的后果"
    以 `Dragon` 为例：
    - `_name` 存在**两个副本**：一个来自 `FlyingAnimal::Animal`，一个来自 `RunningAnimal::Animal`
    - `d.eat()` 调用时编译器不知道走哪条路径，拒绝编译

---

## 虚继承 (Virtual Inheritance)

虚继承解决了菱形继承问题——使用 `virtual` 关键字继承，确保基类在派生类中**只有一份副本**。

### 语法

```cpp
class Animal {
protected:
    string _name;
public:
    Animal(string name) : _name(name) {}
    void eat() { cout << _name << " is eating." << endl; }
};

// ✅ 使用虚继承
class FlyingAnimal : virtual public Animal {
public:
    FlyingAnimal(string name) : Animal(name) {}
    void fly() { cout << _name << " is flying." << endl; }
};

class RunningAnimal : virtual public Animal {
public:
    RunningAnimal(string name) : Animal(name) {}
    void run() { cout << _name << " is running." << endl; }
};

// 现在 Dragon 中只有一份 Animal
class Dragon : public FlyingAnimal, public RunningAnimal {
public:
    Dragon(string name)
        : Animal(name)            // ★ 由最派生类直接初始化虚基类
        , FlyingAnimal(name)
        , RunningAnimal(name) {}
};

int main() {
    Dragon d("Draco");
    d.eat();      // ✅ 没有二义性了！
    d.fly();      // ✅
    d.run();      // ✅
}
```

!!! important "虚继承的关键规则"
    **虚基类由最派生类的构造函数直接初始化**，而不是由中间类初始化。中间类对虚基类的构造调用会被忽略。

### 构造顺序（虚继承的特殊性）

```cpp
class A { public: A() { cout << "A\n"; } };
class B : virtual public A { public: B() : A() { cout << "B\n"; } };
class C : virtual public A { public: C() : A() { cout << "C\n"; } };
class D : public B, public C {
public:
    D() : A(), B(), C() { cout << "D\n"; }
};

// 输出：A → B → C → D
// 虚基类 A 只构造一次，且最先构造
```

---

## 重定义 vs 重写 (Redefine vs Override)

| 特性 | 重定义 (Redefine/Hide) | 重写 (Override) |
|------|-----------------------|-----------------|
| 基类函数 | 非虚函数 | 虚函数 |
| 绑定时机 | 编译期（静态绑定） | 运行期（动态绑定） |
| 调用方式 | 指针类型决定 | 对象实际类型决定 |
| 函数签名 | 只要同名即可 | 必须完全匹配 |

```cpp
class Base {
public:
    void redefined() { cout << "Base redefined" << endl; }    // 非虚
    virtual void overridden() { cout << "Base overridden" << endl; }  // 虚
};

class Derived : public Base {
public:
    void redefined() { cout << "Derived redefined" << endl; }    // 重定义
    void overridden() override { cout << "Derived overridden" << endl; }  // 重写
};

int main() {
    Base* p = new Derived();
    p->redefined();      // 输出：Base redefined（静态绑定）
    p->overridden();     // 输出：Derived overridden（动态绑定）
    delete p;
}
```

!!! tip "override 关键字 (C++11)"
    使用 `override` 关键字来显式标记重写函数，编译器会帮你检查签名是否匹配：
    ```cpp
    void overridden() override;  // ✅ 正确
    void Overridden() override;  // ❌ 编译错误！拼写不一致
    ```

---

## 组合优于继承

多重继承的许多问题可以通过**组合模式**避免：

```cpp
// ❌ 多重继承方式
class FlyingAnimal : public Animal { /* ... */ };
class RunningAnimal : public Animal { /* ... */ };
class Dragon : public FlyingAnimal, public RunningAnimal { /* ... */ };

// ✅ 组合方式
class Animal   { /* ... */ };
class Flyable  { /* 飞行能力接口 */ };
class Runnable { /* 奔跑能力接口 */ };

class Dragon : public Animal, public Flyable, public Runnable {
    // 各自实现
};
```

---

## 面向对象设计与编程规范

- **面向对象分析 (OOA)**：识别类和对象、确定属性与行为
- **面向对象设计 (OOD)**：定义类间关系（继承/组合/关联）
- **面向对象编程 (OOP)**：编码实现，通过封装保证数据安全

### 规范实践

| 实践 | 说明 |
|------|------|
| 合理使用虚继承 | 只在解决菱形继承时使用，而非默认选用 |
| 避免深层继承 | 深度超过 3-4 层的继承关系难以维护 |
| 优先使用组合 | "Has-a" 比 "Is-a" 更灵活 |
| 使用 override 关键字 | 明确表达重写意图，编译器检查签名 |
| 头文件保护 | `#pragma once` 或 `#ifndef` 宏 |
