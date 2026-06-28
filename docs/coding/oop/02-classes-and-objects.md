# 02: 类与对象 (Classes and Objects)

> 从结构化编程到面向对象编程的转变，核心区别在于——过程式关心"怎么做"，面向对象关心"谁来做"。

---

## 面向对象编程基础

### 编程范式的转变

| 维度 | 过程式编程（C） | 面向对象编程（C++） |
|------|---------------|-------------------|
| 核心 | 以过程/函数为中心 | 以对象为中心 |
| 数据与操作 | 分离，全局共享 | 封装在对象内部 |
| 代码组织 | 按功能切分 | 按现实实体映射 |
| 扩展性 | 大型项目维护困难 | 高内聚、低耦合 |

### 什么是类与对象？

**类 (Class)** 是抽象的模板——定义事物的属性（数据）和行为（方法），类是用来创建对象的模板。

**对象 (Object)** 是类的具体实例——拥有类定义的结构，但属性值可以各不相同。

> 举个栗子：类好比汽车设计图，对象是根据图纸制造出来的具体的汽车

### 面向对象编程的四大特性

| 特性 | 比喻 | 核心作用 |
|------|------|----------|
| **封装** (Encapsulation) | 黑盒子 | 隐藏实现细节，保护数据安全 |
| **抽象** (Abstraction) | 简化模型 | 忽略非本质特征，关注核心 |
| **继承** (Inheritance) | 亲子遗传 | 复用父类代码，扩展新功能 |
| **多态** (Polymorphism) | 一词多义 | 同一接口，不同实现 |

---

## 类的定义

```cpp
class ClassName {
private:
    // 私有成员（属性）
    type member1;
    type member2;

public:
    // 公有成员函数（方法）
    returnType func1() {
        // 函数体
    }
};  // 末尾必须有分号！
```

!!! warning "分号陷阱"
    类定义结束后的 `}` 后面必须紧跟 `;`。这是一个比较常见的容易产生编译错误的地方！

### 成员变量/属性

```cpp
class Student {
private:
    string _name;   // 加下划线前缀表示私有成员变量
    int _id;
    double _score;
};
```

!!! tip "命名规范"
    推荐给成员变量加前缀（如 `_name` 或 `m_name`），以区分普通局部变量和函数参数。

### 成员函数/方法

成员函数分为两类：

- **访问器 (Accessor)**: 名称一般以 `get` 开头，表示这个函数是用来读取数据的
- **修改器 (Mutator)**: 名称一般以 `set` 开头，表示这个函数是用来修改数据的

同时，一般会在修改器中加入数据验证逻辑，保证数据的有效性。

```cpp
class Student {
private:
    string _name;
public:
    // 内联函数（定义在类内）
    string getName() const { return _name; }
    void setName(string n) { _name = n; }

    // 外联函数（类内声明，类外实现）
    void showInfo();
};

// 类外定义：使用 类名:: 作用域解析符
void Student::showInfo() {
    cout << "Name: " << _name << endl;
}
```

---

## 对象的使用

### 创建对象

```cpp
// 栈上创建（自动管理）
Student stu1;

// 堆上创建（需手动释放）
Student* pStu2 = new Student();
// ... 使用 pStu2
delete pStu2;
```

### 成员访问

```cpp
// 栈对象：使用点操作符 .
stu1.setName("张三");
cout << stu1.getName() << endl;

// 指针对象：使用箭头操作符 ->
Student* p = new Student();
p->setName("李四");
cout << p->getName() << endl;
delete p;
```

!!! warning "堆对象必须手动释放"
    使用 `new` 创建的对象在使用完毕后必须用 `delete` 释放，否则可能导致内存泄漏。

---

## 封装与访问控制

### 什么是封装？

**封装 (Encapsulation)** 指将数据成员和操作数据的成员函数捆绑在同一个单元（类）中，并对外部隐藏实现细节。

| 目的 | 说明 |
|------|------|
| **数据保护** | 防止外部代码直接修改内部数据 |
| **模块化** | 各模块独立，降低耦合度 |
| **简化使用** | 用户只需通过接口交互，无需了解内部实现 |
| **维护性** | 内部实现可自由修改，不影响外部调用 |

### 访问控制修饰符

| 修饰符 | 可访问范围 | 典型用途 |
|--------|-----------|----------|
| `public` | 任何代码均可访问 | 对外接口（成员函数） |
| `private` | 仅该类内部可访问 | 内部数据（成员变量） |
| `protected` | 该类及派生类可访问 | 继承中需共享的成员 |

!!! warning "类 vs 结构体的默认权限"
    类（`class`）中默认为 `private`；结构体（`struct`）中默认为 `public`。

### 封装示例：Clock

```cpp
class Clock {
private:
    int _hour, _minute, _second;

public:
    void setTime(int h, int m, int s) {
        if (h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60) {
            _hour = h; _minute = m; _second = s;
        } // 进行合法性检查，防止非法时间设置
    }
    void showTime() const {
        cout << _hour << ":" << _minute << ":" << _second << endl;
    }
};

// myClock._hour = 12;  // 编译错误！_hour 是 private，不能直接访问
```

!!! important "封装的价值"
    通过 `setTime` 做数据验证。没封装的话，外部可以随便把 `_hour` 设成 25。

---

## Getter/Setter 最佳实践

### 为什么要用 Getter/Setter？

```cpp
// BAD case: 直接使用 public 暴露数据成员
class BadClock { public: int hour, minute, second; };

// GREAT case: 使用 private + Getter/Setter 封装数据成员
class GoodClock {
private:
    int _hour;
public:
    int getHour() const { return _hour; }
    void setHour(int h) {
        if (h >= 0 && h < 24) _hour = h;  // 数据验证
    }
};
```

| 类型 | 命名 | 示例 |
|------|------|------|
| Getter | `get` + 成员名 | `getBalance()`, `getName()` |
| Setter | `set` + 成员名 | `setName()`, `setAge()` |
| Boolean Getter | `is` + 特征 | `isEmpty()`, `isValid()` |

### 推荐的数据成员布局

```cpp
class Account {
private:            // 1. 数据区
    string _accountNumber;
    double _balance;
public:             // 2. 接口区
    Account(string accNo, double initBal);   // 构造/析构
    string getAccountNumber() const;         // 访问器
    double getBalance() const;
    void deposit(double amount);             // 业务方法
    bool withdraw(double amount);
};
```

---

## 封装实战：全功能 BankAccount

```cpp
class BankAccount {
private:
    string _accountNumber, _ownerName;
    double _balance;
public:
    BankAccount(string accNo, string owner, double initBal)
        : _accountNumber(accNo), _ownerName(owner), _balance(initBal) {}

    string getAccountNumber() const { return _accountNumber; }
    string getOwnerName() const { return _ownerName; }
    double getBalance() const { return _balance; }

    void deposit(double amount) {
        if (amount > 0) _balance += amount;
    }

    bool withdraw(double amount) {
        if (amount <= 0 || amount > _balance) return false;
        _balance -= amount;
        return true;
    }

    void display() const {
        cout << "账号: " << _accountNumber
             << ", 户主: " << _ownerName
             << ", 余额: " << _balance << endl;
    }
};
```

---

## mutable 关键字

`mutable` 用于修饰成员变量，即使在 `const` 成员函数中也可以修改该变量。

```cpp
class Counter {
private:
    mutable int _accessCount = 0;
    int _value;
public:
    int getValue() const {
        _accessCount++;   // const 函数中可以修改 mutable 变量
        return _value;
    }
};
```

!!! tip "mutable 的适用场景"
    - 缓存数据（如计算结果缓存）
    - 访问统计/日志计数
    - 线程安全相关的互斥锁

---

## 封装的层次设计

| 层次 | 工具 |
|------|------|
| 类内部 | `private` / `protected` / `public` |
| 文件内部 | `static` 函数/全局变量 |
| 链接层面 | `namespace` 隔离、匿名命名空间 |
| 模块层面 | 头文件只暴露必要的声明 |

```cpp
// 匿名命名空间：文件内部可见，对外不可见
namespace {
    void helperFunc() { /* 仅当前文件可使用 */ }
}
```

---

## this 指针

`this` 是指向**当前对象**的隐含指针，类型为 `ClassName* const`。

```cpp
class Point {
private:
    int _x, _y;
public:
    Point& setX(int x) {
        this->_x = x;
        return *this;   // 支持链式调用
    }

    void setY(int y) { this->_y = y; }
};

// 链式调用
Point p;
p.setX(10).setY(20);
```

程序中最后一行的执行顺序为：
1. `p.setX(10)` 修改 `_x`，返回 `*this`（即 `p` 本身）
2. 后半部分 `.setY(20)` 修改 `_y`

### this 的主要用途

| 用途 | 示例 | 说明 |
|------|------|------|
| 区分同名参数 | `this->_x = x;` | 参数名与成员名相同时 |
| 返回当前对象 | `return *this;` | 链式调用（chaining） |
| 比较对象身份 | `if (this == &other)` | 自赋值检查 |

---

## const 成员函数深入

### const 的重载

```cpp
class Array {
private:
    int _data[10];
public:
    int& operator[](int index) { return _data[index]; }         // 读写版本
    const int& operator[](int index) const { return _data[index]; } // 只读版本
};
```

### const 对象只能调用 const 成员函数

```cpp
class Demo {
public:
    void normalFunc() { cout << "普通函数" << endl; }
    void constFunc() const { cout << "const 函数" << endl; }
};

const Demo cd;
// cd.normalFunc();   // WRONG! const 对象不能调用非 const 函数
cd.constFunc();       // CORRECT!
```

!!! tip "小 tips"
    只要不修改对象状态，就将成员函数声明为 `const`，编译器会在编译阶段进行检查

---

## 静态成员 (Static Members)

静态成员属于**整个类**，而不是某个对象。所有对象共享同一份数据。

| 成员类型 | 关键字 | 访问方式 | 特性 |
|--------|--------|--------|------|
| 静态变量 | `static` | `类名::成员` | 所有对象共享，类外单独定义 |
| 静态函数 | `static` | `类名::成员` | 只能访问静态成员，无 `this` 指针 |

```cpp
class Student {
private:
    string _name;
    static int _totalCount;      // 声明
public:
    Student(string name) : _name(name) { _totalCount++; }
    ~Student() { _totalCount--; }
    static int getTotalCount() { return _totalCount; }
};

int Student::_totalCount = 0;    // 必须在类外定义！
```

也就是说，我定义两个 `Student` 对象：

```cpp
Student s1("Alice");
Student s2("Bob");
cout << Student::getTotalCount();
```

会输出 `2`。

!!! important "静态成员的类外定义"
    静态成员变量**必须在类外单独定义和初始化**。C++17 起 `inline static` 可省去类外定义。

---

## 友元 (Friend)

友元是一种打破封装的机制，允许外部函数或类访问当前类的私有成员。

### 友元函数

```cpp
class Point {
private:
    int _x, _y;
public:
    Point(int x, int y) : _x(x), _y(y) {}
    friend Point add1(const Point& a, const Point& b);
    Point add2(const Point& a, const Point& b) {
        return Point(a._x + b._x, a._y + b._y);  // 成员函数可以访问私有成员
    }
};

Point add1(const Point& a, const Point& b) {
    return Point(a._x + b._x, a._y + b._y);
}

/*
Point add3(const Point& a, const Point& b) {
    return Point(a._x + b._x, a._y + b._y);
}
add3 不是 Point 的友元函数，无法访问私有成员 _x 和 _y，会编译报错
*/
```

这里 `add1` 函数是 `Point` 类的友元函数（拥有 `friend` 关键字），因此可以访问 `_x` 和 `_y`。

### 友元类

```cpp
class A {
private:
    int _secret;
    friend class B;    // B 是 A 的友元类
};
```

!!! warning "友元的代价"
    友元破坏了封装性，要**谨慎使用**！
    使用场景：运算符重载（`<<`、`>>`）、对称二元运算、迭代器实现
    友元关系**不可传递、不可继承**！

---

## 内联函数 (Inline)

`inline` 建议编译器将函数调用替换为函数体代码，减少调用开销。**类内定义的函数默认为 inline**。

```cpp
class Math {
public:
    int square(int x) { return x * x; }    // 自动 inline
    int cube(int x) { return x * x * x; }
};
```

!!! note "inline 只是建议"
    编译器可以忽略 inline。对长函数、递归函数和虚函数，inline 通常无效。

---

## 类的组合 (Composition)

一个类包含另一个类的对象作为成员，体现 **Has-a** 关系。

```cpp
class Date {
    int _day, _month, _year;
public:
    Date(int d, int m, int y) : _day(d), _month(m), _year(y) {}
};

class Person {
    string _name;
    Date _birthDate;     // 组合关系：Person has a Date
public:
    Person(string n, int d, int m, int y)
        : _name(n), _birthDate(d, m, y) {}  // 必须用初始化列表
};
```

---

## 前向声明 (Forward Declaration)

当两个类相互引用时使用：

```cpp
class ClassB;  // 前向声明

class ClassA {
public:
    void func(ClassB& b);  // 仅需声明
};
```

!!! note "前向声明的限制"
    只能声明指针、引用、函数参数/返回值；**不能**创建对象实例或访问成员！

---

## UML 类图简介

```
┌─────────────────────┐
│      Rectangle      │  <- 类名
├─────────────────────┤
│ - length: double    │  <- 属性
│ - width: double     │
├─────────────────────┤
│ + setDimensions()   │  <- 方法
│ + getArea(): double │
└─────────────────────┘
```

| 符号 | 含义 |
|------|------|
| `+` | public |
| `-` | private |
| `#` | protected |

---

## 常见错误与调试

| 错误 | 原因 | 解决 |
|------|------|------|
| 类定义后缺分号 | 忘记 `;` | 养成加分号的习惯 |
| 访问私有成员 | 混淆封装规则 | 通过公有接口访问 |
| 构造/析构命名错误 | 拼写不匹配 | 检查函数名 |
| const 函数修改数据 | 违背 const 承诺 | 检查函数体，使用 `mutable` |
| 组合类初始化错误 | 未用初始化列表 | 必须用初始化列表 |
