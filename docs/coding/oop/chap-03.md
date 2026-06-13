# Chapter 3: 封装特性与访问控制

> 封装是 OOP 的第一道防线——将数据和操作数据的函数捆绑在一起，对外隐藏实现细节，只暴露必要的接口。

---

## 什么是封装？

**封装 (Encapsulation)** 是面向对象的三大核心特性之一，指将数据成员和操作数据的成员函数捆绑在同一个单元（类）中，并对外部隐藏实现细节。

### 封装的目的

| 目的 | 说明 |
|------|------|
| **数据保护** | 防止外部代码直接修改内部数据 |
| **模块化** | 各模块独立，降低耦合度 |
| **简化使用** | 用户只需通过接口交互，无需了解内部实现 |
| **维护性** | 内部实现可自由修改，不影响外部调用 |

!!! tip "封装的思想"
    就像使用遥控器——你只需要知道按下按钮就能换台，而不需要了解遥控器内部的电路原理。

---

## 访问控制修饰符

C++ 提供三种访问控制修饰符，用于实现封装：

| 修饰符 | 可访问范围 | 典型用途 |
|--------|-----------|----------|
| `public` | 任何代码均可访问 | 对外接口（成员函数） |
| `private` | 仅该类内部可访问 | 内部数据（成员变量） |
| `protected` | 该类及派生类可访问 | 继承中需共享的成员 |

!!! warning "类的默认访问权限"
    类（`class`）中，成员的默认访问权限是 `private`；而结构体（`struct`）中默认是 `public`。

### 访问控制示例

```cpp
class Clock {
private:
    int _hour;
    int _minute;
    int _second;

public:
    void setTime(int h, int m, int s) {
        if (h >= 0 && h < 24 &&
            m >= 0 && m < 60 &&
            s >= 0 && s < 60) {
            _hour = h;
            _minute = m;
            _second = s;
        }
    }

    void showTime() const {
        cout << _hour << ":" << _minute << ":" << _second << endl;
    }
};
```

```cpp
int main() {
    Clock myClock;

    myClock.setTime(10, 30, 0);   // 正确：通过公有接口设置
    myClock.showTime();           // 正确：通过公有接口显示

    // myClock._hour = 12;        // 错误！_hour 是 private，无法直接访问

    return 0;
}
```

!!! important "封装 == 安全性"
    通过 `setTime` 设置时间的代码中，做了**数据验证**（检查时分秒的范围）。如果没有封装，外部可以随意将 `_hour` 设为 25，导致对象进入不合法状态。

---

## 公有接口设计 (Public Interface)

公有接口是类对外提供的服务，设计的核心原则是：**提供最少的、最清晰的、最稳定的公开方法**。

### 设计原则

```cpp
class BankAccount {
private:
    string _accountNumber;
    double _balance;

public:
    // 构造函数
    BankAccount(string accNum, double initBalance);

    // 访问器 (Getter) — 查询状态
    string getAccountNumber() const;
    double getBalance() const;

    // 修改器 (Setter) — 修改状态（包含业务逻辑验证）
    void deposit(double amount);
    bool withdraw(double amount);
};
```

!!! note "接口与实现分离"
    公有接口应该保持稳定，内部实现可以自由变化。这就是接口设计中的"最小承诺原则"。

---

## Getter 与 Setter 的最佳实践

### 为什么要用 Getter/Setter？

直接暴露 `public` 数据成员的问题：

```cpp
// ❌ 糟糕的设计：数据暴露，无法控制
class BadClock {
public:
    int hour;     // 任何人都可以 hour = 25
    int minute;
    int second;
};

// ✅ 良好的封装
class GoodClock {
private:
    int _hour;
public:
    int getHour() const { return _hour; }

    void setHour(int h) {
        if (h >= 0 && h < 24) {   // 数据验证
            _hour = h;
        }
    }
};
```

### Getter/Setter 命名规范

| 类型 | 命名 | 示例 |
|------|------|------|
| Getter | `get` + 成员名 | `getBalance()`, `getName()` |
| Setter | `set` + 成员名 | `setName()`, `setAge()` |
| Boolean Getter | `is` + 特征 | `isEmpty()`, `isValid()` |

```cpp
class Employee {
private:
    string _name;
    int _age;
    bool _active;

public:
    string getName() const { return _name; }
    void setName(const string& name) { _name = name; }

    int getAge() const { return _age; }
    void setAge(int age) {
        if (age > 0 && age < 150) _age = age;
    }

    bool isActive() const { return _active; }
};
```

---

## 推荐的数据成员布局

良好的习惯是将数据成员统一放在 `private` 区域顶部，构成类的"核心数据区"：

```cpp
class Account {
// 1. 私有成员（数据区）
private:
    string _accountNumber;
    double _balance;

// 2. 公有接口（方法区）
public:
    // 构造/析构
    Account(string accNo, double initBal);

    // 访问器
    string getAccountNumber() const;
    double getBalance() const;

    // 业务方法
    void deposit(double amount);
    bool withdraw(double amount);
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
        _accessCount++;          // 即使是 const 函数也可以修改 mutable 变量
        return _value;
    }

    int getAccessCount() const {
        return _accessCount;
    }
};
```

!!! tip "mutable 的适用场景"
    - 缓存数据（如计算结果缓存）
    - 访问统计/日志计数
    - 线程安全相关的互斥锁

---

## 全局函数与封装

封装并不排斥全局函数——对于**不直接操作类的私有成员**的辅助功能，全局函数是合适的：

```cpp
class Circle {
private:
    double _radius;
public:
    Circle(double r) : _radius(r) {}
    double getRadius() const { return _radius; }
};

// 全局函数：计算两个圆是否面积相等
bool isAreaEqual(const Circle& c1, const Circle& c2) {
    double area1 = 3.14159 * c1.getRadius() * c1.getRadius();
    double area2 = 3.14159 * c2.getRadius() * c2.getRadius();
    return area1 == area2;
}
```

---

## 封装的层次设计

在大型项目中，封装不仅仅是类层面的，还包括文件层面：

| 层次 | 工具 |
|------|------|
| 类内部 | `private` / `protected` / `public` |
| 文件内部 | `static` 函数/全局变量 |
| 链接层面 | `namespace` 隔离、匿名命名空间 |
| 模块层面 | 头文件只暴露必要的声明 |

```cpp
// 匿名命名空间：文件内部可见，对外不可见
namespace {
    void helperFunc() {
        // 仅当前文件可使用
    }
}
```

---

## 封装实战：全功能 BankAccount

```cpp
#include <iostream>
#include <string>
using namespace std;

class BankAccount {
private:
    string _accountNumber;
    string _ownerName;
    double _balance;

public:
    // 构造函数
    BankAccount(string accNo, string owner, double initBal)
        : _accountNumber(accNo), _ownerName(owner), _balance(initBal) {}

    // 访问器
    string getAccountNumber() const { return _accountNumber; }
    string getOwnerName() const { return _ownerName; }
    double getBalance() const { return _balance; }

    // 存款
    void deposit(double amount) {
        if (amount > 0) {
            _balance += amount;
            cout << "存入 " << amount << " 元，当前余额: " << _balance << endl;
        } else {
            cout << "存款金额必须为正数！" << endl;
        }
    }

    // 取款（含余额检查）
    bool withdraw(double amount) {
        if (amount <= 0) {
            cout << "取款金额必须为正数！" << endl;
            return false;
        }
        if (amount > _balance) {
            cout << "余额不足！当前余额: " << _balance << endl;
            return false;
        }
        _balance -= amount;
        cout << "取款 " << amount << " 元，当前余额: " << _balance << endl;
        return true;
    }

    // 显示账户信息
    void display() const {
        cout << "账号: " << _accountNumber << endl;
        cout << "户主: " << _ownerName << endl;
        cout << "余额: " << _balance << " 元" << endl;
    }
};

int main() {
    BankAccount acc("6222021234567890", "张三", 1000.0);

    acc.display();
    acc.deposit(500.0);
    acc.withdraw(200.0);
    acc.withdraw(2000.0);   // 余额不足

    // acc._balance = 999999;  // ❌ 编译错误！private 成员不能直接访问

    return 0;
}
```
