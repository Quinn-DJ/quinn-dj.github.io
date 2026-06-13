# Chapter 5: 类的成员函数进阶

> 掌握 this 指针、静态成员、友元、const 与 inline，才能写出真正优雅的 C++ 类。

---

## this 指针

`this` 指针是每个非静态成员函数中隐含的指针，指向**当前调用该函数的对象本身**。

!!! tip "this 的本质"
    `this` 是一个 `ClassName* const` 常量指针——不能修改它指向的对象，但可以修改它所指向对象的内容（在非 const 函数中）。

```cpp
class Point {
private:
    int _x, _y;
public:
    void setX(int x) {
        this->_x = x;   // this->_x 等价于 _x
    }

    Point& setY(int y) {
        this->_y = y;
        return *this;   // 返回当前对象引用，支持链式调用
    }
};

// 链式调用
Point p;
p.setX(10).setY(20);
```

### this 的主要用途

| 用途 | 示例 | 说明 |
|------|------|------|
| 区分同名参数 | `this->_x = x;` | 参数名与成员名相同时 |
| 返回当前对象 | `return *this;` | 链式调用（chaining） |
| 比较对象身份 | `if (this == &other)` | 自赋值检查 |

---

## const 成员函数深入

### const 的重载

一个函数可以同时存在 `const` 和非 `const` 版本，形成重载：

```cpp
class Array {
private:
    int _data[10];
public:
    // 非 const 版本：可读写
    int& operator[](int index) {
        return _data[index];
    }

    // const 版本：只读
    const int& operator[](int index) const {
        return _data[index];
    }
};

void demo() {
    Array arr;
    arr[0] = 42;          // 调用非 const 版本

    const Array carr;
    // carr[0] = 42;      // ❌ 错误！const 对象只能调用 const 版本
    int val = carr[0];    // ✅ 调用 const 版本
}
```

### const 对象只能调用 const 成员函数

```cpp
class Demo {
public:
    void normalFunc() {}
    void constFunc() const {}
};

int main() {
    const Demo cd;
    // cd.normalFunc();   // ❌ const 对象不能调用非 const 函数
    cd.constFunc();       // ✅

    Demo d;
    d.normalFunc();       // ✅
    d.constFunc();        // ✅
}
```

---

## 静态成员 (Static Members)

静态成员属于**整个类**，而不是某个对象。所有对象共享同一份静态数据。

| 成员类型 | 关键字 | 访问方式 | 特性 |
|----------|--------|----------|------|
| 静态变量 | `static` | `类名::成员` 或 `对象.成员` | 所有对象共享，类外单独定义 |
| 静态函数 | `static` | `类名::成员` 或 `对象.成员` | 只能访问静态成员，无 `this` 指针 |

### 静态成员变量

```cpp
class Student {
private:
    string _name;
    static int _totalCount;      // 声明：所有学生共享计数

public:
    Student(string name) : _name(name) {
        _totalCount++;
    }
    ~Student() {
        _totalCount--;
    }

    static int getTotalCount() { // 静态成员函数
        return _totalCount;
    }
};

// ★ 定义：必须在类外初始化静态成员变量
int Student::_totalCount = 0;
```

!!! important "静态成员的类外定义"
    静态成员变量**必须在类外单独定义和初始化**，否则会导致链接错误。从 C++17 开始，`inline static` 可以省去类外定义。

### 静态成员函数

- 只能访问类的静态成员（变量和函数）
- **没有 `this` 指针**
- 可以通过类名直接调用

```cpp
class MathUtils {
public:
    static constexpr double PI = 3.1415926;

    static double circleArea(double radius) {
        return PI * radius * radius;
    }
};

// 调用
double area = MathUtils::circleArea(5.0);
```

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

    // 声明友元函数：允许该函数访问私有成员
    friend Point add(const Point& a, const Point& b);
};

// 友元函数定义：可以访问 Point 的私有成员
Point add(const Point& a, const Point& b) {
    return Point(a._x + b._x, a._y + b._y);
}
```

!!! warning "友元的双刃剑"
    友元破坏了封装性，应该**谨慎使用**。典型适用场景：
    - 运算符重载（如 `<<`、`>>`）
    - 对称的二元运算函数
    - 迭代器实现

### 友元类

```cpp
class A {
private:
    int _secret;
    friend class B;    // B 是 A 的友元类
};

class B {
public:
    void revealSecret(A& a) {
        a._secret = 42;     // 可以访问 A 的私有成员
    }
};
```

### 友元的相互性

友元关系**不可传递、不可继承**：如果 B 是 A 的友元，C 是 B 的友元，C 不能访问 A 的私有成员。

---

## 内联函数 (Inline)

`inline` 建议编译器将函数调用替换为函数体代码，以减少函数调用的开销。

```cpp
class Math {
public:
    inline int square(int x) {
        return x * x;
    }

    // 在类内定义的函数默认为 inline
    int cube(int x) { return x * x * x; }
};
```

| 方式 | 说明 |
|------|------|
| 类内定义 | 自动成为 inline |
| 类外声明 `inline` | 手动指定 inline |
| 频繁调用的短小函数 | 最适合 inline |

!!! note "inline 只是建议"
    `inline` 对编译器来说只是"建议"，编译器可以忽略。现代编译器会自动决定是否内联。对于长函数、递归函数和虚函数，inline 通常无效。

---

## 运算符重载入门

运算符重载让自定义类型支持 C++ 内置运算符语法，提高代码可读性。

```cpp
class Point {
private:
    int _x, _y;
public:
    Point(int x = 0, int y = 0) : _x(x), _y(y) {}

    // 重载 + 运算符（成员函数形式）
    Point operator+(const Point& other) const {
        return Point(_x + other._x, _y + other._y);
    }

    // 重载 += 运算符
    Point& operator+=(const Point& other) {
        _x += other._x;
        _y += other._y;
        return *this;
    }

    // 友元形式重载 << 运算符
    friend ostream& operator<<(ostream& os, const Point& p) {
        os << "(" << p._x << ", " << p._y << ")";
        return os;
    }
};

int main() {
    Point a(1, 2), b(3, 4);
    Point c = a + b;          // 调用 operator+
    cout << c << endl;        // 输出：(4, 6)
}
```

!!! tip "运算符重载的黄金法则"
    运算符重载应当尊重原有运算符的**语义**和**优先级**。不要重载 `+` 来实现减法，这只会让代码难以理解。

---

## Date 类综合示例

```cpp
#include <iostream>
using namespace std;

class Date {
private:
    int _year, _month, _day;

    // 辅助函数：判断闰年
    static bool isLeapYear(int year) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }

    // 辅助函数：获取指定月份的天数
    static int daysInMonth(int year, int month) {
        static const int days[] = {
            31, 28, 31, 30, 31, 30,
            31, 31, 30, 31, 30, 31
        };
        if (month == 2 && isLeapYear(year)) return 29;
        return days[month - 1];
    }

public:
    // 构造函数
    Date(int y, int m, int d) : _year(y), _month(m), _day(d) {}

    // const 访问器
    int getYear() const { return _year; }
    int getMonth() const { return _month; }
    int getDay() const { return _day; }

    // 日期校验
    bool isValid() const {
        return _month >= 1 && _month <= 12 &&
               _day >= 1 && _day <= daysInMonth(_year, _month);
    }

    // 运算符重载：比较
    bool operator==(const Date& other) const {
        return _year == other._year &&
               _month == other._month &&
               _day == other._day;
    }

    bool operator<(const Date& other) const {
        if (_year != other._year) return _year < other._year;
        if (_month != other._month) return _month < other._month;
        return _day < other._day;
    }

    // 友元：输出运算符
    friend ostream& operator<<(ostream& os, const Date& d) {
        os << d._year << "-" << d._month << "-" << d._day;
        return os;
    }

    // 静态工具函数
    static Date today() {
        // 简化：实际应该获取系统日期
        return Date(2026, 6, 13);
    }
};

int main() {
    Date d1(2026, 6, 13);
    Date d2(2026, 12, 25);

    cout << "d1 = " << d1 << endl;
    cout << "d2 = " << d2 << endl;
    cout << "d1 == d2? " << (d1 == d2) << endl;
    cout << "d1 < d2? " << (d1 < d2) << endl;
    cout << "Today is " << Date::today() << endl;

    return 0;
}
```
