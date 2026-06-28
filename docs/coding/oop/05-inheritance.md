# 05: 继承 (Inheritance)

> 继承是 OOP 的基石之一——让代码**复用**不再是复制粘贴。但多重继承也是 C++ 中最具争议的特性——用得好是利器，用得不好是灾难。

---

## 什么是继承？

**继承 (Inheritance)** 是从已有类（**基类/父类**）派生出新类（**派生类/子类**）的机制，派生类自动拥有基类的所有成员。

| 关系 | 含义 | 示例 |
|------|------|------|
| **Is-a** | 派生类是基类的一种 | 狗是一种动物 |
| **Has-a** | 类包含另一个类的对象（组合） | 车有一个引擎 |

!!! tip "区分 Is-a 与 Has-a"
    - Is-a 是 **继承**: `class Dog : public Animal {}`
    - Has-a 是 **组合**: `class Car { Engine _engine; }`

### 继承的核心作用

| 作用 | 说明 |
|------|------|
| 代码复用 | 派生类直接继承基类的代码 |
| 层次建模 | 表达现实世界中的分类关系 |
| 多态基础 | 继承是实现运行时多态的先决条件 |

---

## 继承的语法

```cpp
class Animal {
protected:
    string _name;
    int _age;
public:
    Animal(string name, int age) : _name(name), _age(age) {}
    void eat() const { cout << _name << " is eating." << endl; }
    void sleep() const { cout << _name << " is sleeping." << endl; }
};

class Dog : public Animal {
public:
    Dog(string name, int age) : Animal(name, age) {}
    void bark() const { cout << _name << " says: Woof!" << endl; }
};
```

---

## 三种继承方式

| 继承方式 | 基类的 `public` 成员 | 基类 `protected` 成员 | 基类 `private` 成员 |
|----------|-----------------|--------------------|--------------------|
| `public` 继承 | `public` | `protected` | **不可访问** |
| `protected` 继承 | `protected` | `protected` | **不可访问** |
| `private` 继承 | `private` | `private` | **不可访问** |

!!! important "关键规则"
    无论哪种继承方式，基类的 `private` 成员在派生类中都**不可直接访问**。

### 公有继承 (public) — 最常用

```cpp
class Derived : public Base {
    // pub -> public, pro -> protected, pri -> 不可访问
};
```

### 保护继承 (protected)

```cpp
class Derived : protected Base {
    // pub -> protected, pro -> protected, pri -> 不可访问
};
```

### 私有继承 (private) — 默认方式

```cpp
class Derived : private Base {  // class Derived : Base 等价
    // pub -> private, pro -> private, pri -> 不可访问
};
```

---

## 继承中的构造与析构

### 构造顺序

1. 先构造**基类**部分
2. 再构造**派生类**成员

### 析构顺序

1. 先析构**派生类**成员
2. 再析构**基类**部分

同样也是先进后出的栈式结构。

```cpp
class Base {
public:
    Base() { cout << "Base constructor" << endl; }
    ~Base() { cout << "Base destructor" << endl; }
};

class Derived : public Base {
public:
    Derived() { cout << "Derived constructor" << endl; }
    ~Derived() { cout << "Derived destructor" << endl; }
};
```

输出为：
```bash
Base constructor
Derived constructor
Derived destructor
Base destructor
```

!!! tip "记忆"
    构造：基类 -> 派生类（先建基础，再建上层）
    析构：派生类 -> 基类（先拆上层，再拆基础）

### 派生类的初始化列表

派生类初始化列表**必须**调用基类的构造函数：

```cpp
class Animal {
private:
    string _name;
public:
    Animal(string name) : _name(name) {}
};

class Dog : public Animal {
private:
    string _breed;
public:
    Dog(string name, string breed)
        : Animal(name), _breed(breed) {}  // 必须调用基类构造
};
```

!!! warning "基类默认构造不可用时"
    如果基类没有默认构造函数，派生类必须在初始化列表中显式调用基类的带参构造函数。

---

## 向上与向下转型

### 向上转型 (Upcasting) — 安全

派生类指针/引用可以隐式转换为基类指针/引用：

```cpp
// 与上文相同的类定义：Dog 继承自 Animal
Dog dog("Buddy", 3);
Animal* animalPtr = &dog;     // 向上转型
Animal& animalRef = dog;      // 向上转型
```

### 向下转型 (Downcasting) — 需显式

基类指针/引用转换为派生类需要运行时类型检查：

```cpp
// 与上文相同的类定义：Dog 继承自 Animal
Animal* a = new Dog("Buddy", 3);
Dog* d = dynamic_cast<Dog*>(a); // 检查 a 中的实际对象类型是否为 Dog
```

---

## 继承中的隐藏/重定义 (Name Hiding)

如果派生类定义了与基类同名的方法，基类方法被**隐藏**：

```cpp
class Base {
public:
    void show() { cout << "Base show()" << endl; }
    void show(int x) { cout << "Base show(" << x << ")" << endl; }
};

class Derived : public Base {
public:
    void show() { cout << "Derived show()" << endl; }
};

Derived d;
d.show();              // 派生类的 show()，输出 Derived show()
// d.show(10);         // 编译错误！基类的 show(int) 被隐藏了！
d.Base::show();        // 通过作用域解析访问，输出 Base show()
d.Base::show(10);      // 通过作用域解析访问，输出 Base show(10)
```

!!! warning "名字隐藏"
    派生类只需方法名相同就会隐藏**基类所有同名函数**。可用 `using Base::show` 引入。

---

## 多重继承 (Multiple Inheritance)

一个派生类同时继承多个基类：

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
};
```

!!! tip "多重继承 vs 组合"
    只有当类的确是"既是 A 又是 B"时（Is-a），才使用多重继承。否则优先考虑组合。

---

## 菱形继承问题 (Diamond Problem)

当两个类继承同一个基类，而另一个类又同时继承这两个类时：

```
      A
     / \
    B   C
     \ /
      D
```

例如：
```cpp
class Animal {
public:
    void eat() { cout << "Animal is eating." << endl; }
};
class FlyingAnimal : public Animal { /* ... */ };
class RunningAnimal : public Animal { /* ... */ };
// 问题：Dragon 会拥有两份 Animal 的副本
class Dragon : public FlyingAnimal, public RunningAnimal { /* ... */ };
// d.eat();  // 二义性错误！
```

### 菱形继承容易产生的问题

| 问题 | 表现 |
|------|------|
| **数据冗余** | 基类成员存在多份 |
| **二义性** | 访问时不清楚走哪条继承路径 |
| **资源管理** | delete 可能遗漏 |

---

## 虚继承 (Virtual Inheritance)

使用 `virtual` 关键字继承，确保基类在派生类中**只有一份副本**：

```cpp
class FlyingAnimal : virtual public Animal {
public:
    FlyingAnimal(string name) : Animal(name) {}
};

class RunningAnimal : virtual public Animal {
public:
    RunningAnimal(string name) : Animal(name) {}
};

class Dragon : public FlyingAnimal, public RunningAnimal {
public:
    Dragon(string name):
        Animal(name),           // 由最派生类直接初始化虚基类
        FlyingAnimal(name),
        RunningAnimal(name) {}
};
```

!!! important "虚继承的关键规则"
    **虚基类由最派生类的构造函数直接初始化**，中间类对虚基类的构造调用的初始化会被忽略。

### 构造顺序（虚继承的特殊性）

虚基类最先构造，且只构造一次：`虚基类 A -> B -> C -> D`

---

## 重定义 vs 重写

| 特性 | 重定义 (Redefine/Hide) | 重写 (Override) |
|------|-----------------------|-----------------|
| 基类函数 | 非虚函数 | 虚函数 |
| 绑定时机 | 编译期（静态绑定） | 运行期（动态绑定） |
| 调用方式 | 指针类型决定 | 对象实际类型决定 |

```cpp
class Base {
public:
    void redefined() { cout << "Base redefined" << endl; }
    virtual void overridden() { cout << "Base overridden" << endl; }
};

class Derived : public Base {
public:
    void overridden() override { cout << "Derived overridden" << endl; }
};

Base* p = new Derived();
p->redefined();      // 输出：Base redefined（静态绑定）
p->overridden();     // 输出：Derived overridden（动态绑定）
```

!!! tip "override 关键字 (C++11)"
    ```cpp
    void overridden() override;  // 正确
    void Overridden() override;  // 编译错误！签名不匹配
    ```

---

## 组合优于继承

多重继承的许多问题可以通过**组合模式**避免：

```cpp
// 组合方式：将能力拆分为接口
class Dragon : public Animal, public Flyable, public Runnable { /* ... */ };
```

---

## 面向对象设计规范

| 实践 | 说明 |
|------|------|
| 使用继承表达 **Is-a** 关系 | 狗是动物 → 继承；车有引擎 → 组合 |
| 遵循**里氏替换原则 (LSP)** | 派生类应该能替换基类使用 |
| 合理使用虚继承 | 只在解决菱形继承时使用 |
| 避免深层继承 | 深度超过 3-4 层难以维护 |
| 使用 override 关键字 | 明确表达重写意图，编译器检查签名 |
