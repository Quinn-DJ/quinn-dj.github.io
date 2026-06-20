# Chapter 8: 运算符重载

> 运算符重载让自定义类型获得与内置类型一样的"书写优雅"。

---

## 什么是运算符重载？ (What is Operator Overloading?)

运算符重载 (Operator Overloading) 是 C++ 的一项强大特性，允许为自定义类型赋予运算符语义，使得用户定义的类型能够像基本类型一样使用运算符。

```cpp
Complex a(1, 2), b(3, 4);
Complex c = a + b;   // 比 Complex c = a.add(b) 更直观
```

!!! tip "核心理念"
    运算符重载不是为了炫技，而是为了让代码**更自然、更易读**。重载的运算符应当保持原有的语义。

### 可以重载的运算符

- **绝大多数运算符可以重载**：`+` `-` `*` `/` `%` `==` `!=` `<` `>` `[]` `()` `<<` `>>` 等
- **少数不能重载**：`.` `::` `?:` `sizeof` `.*` `#` `##`

---

## 两种重载形式 (Two Forms of Overloading)

| 形式 | 语法 | 适用场景 |
|------|------|----------|
| **成员函数（Member Function）** | `T T::operator+(const T&) const` | 左操作数为当前对象 |
| **非成员函数（Non-member Function）** | `T operator+(const T&, const T&)` | 对称运算、左操作数非当前类 |

### 成员函数形式 (Member Function Form)

```cpp
class Point {
private:
    int _x, _y;
public:
    Point(int x = 0, int y = 0) : _x(x), _y(y) {}

    // 成员函数形式：p + q → p.operator+(q)
    Point operator+(const Point& other) const {
        return Point(_x + other._x, _y + other._y);
    }

    // 成员函数形式：p += q
    Point& operator+=(const Point& other) {
        _x += other._x;
        _y += other._y;
        return *this;
    }
};
```

### 非成员函数形式 (Non-member Function Form)

当**左操作数不是当前类类型**时（如 `cout << point`），必须使用非成员函数形式。

```cpp
class Point {
private:
    int _x, _y;
public:
    Point(int x = 0, int y = 0) : _x(x), _y(y) {}
    int getX() const { return _x; }
    int getY() const { return _y; }
};

// 非成员函数，通常设为友元
Point operator+(const Point& a, const Point& b) {
    return Point(a.getX() + b.getX(), a.getY() + b.getY());
}
```

!!! important "选择标准"
    - 如果运算符的**左操作数**必须是当前类对象 → 成员函数
    - 如果左操作数非当前类（如 `cout`）→ 非成员函数
    - 对称二元运算符（如 `+`、`==`）→ 推荐非成员函数

---

## 常用运算符重载

### 二元算术运算符 (Binary Arithmetic Operators)

以成员函数形式：

```cpp
class Vector2D {
private:
    double _x, _y;
public:
    Vector2D(double x = 0, double y = 0) : _x(x), _y(y) {}

    Vector2D operator+(const Vector2D& v) const {
        return Vector2D(_x + v._x, _y + v._y);
    }

    Vector2D operator-(const Vector2D& v) const {
        return Vector2D(_x - v._x, _y - v._y);
    }

    Vector2D operator*(double scalar) const {
        return Vector2D(_x * scalar, _y * scalar);
    }
};
```

!!! tip "对称性的处理"
    如果想让 `2 * v` 也合法（左操作数是 `double` 而非 `Vector2D`），需要定义非成员函数：
    ```cpp
    Vector2D operator*(double scalar, const Vector2D& v) {
        return v * scalar;  // 复用成员函数版本
    }
    ```

### 复合赋值运算符 (Compound Assignment Operators)

复合赋值运算符通常返回**引用**，以支持链式赋值：

```cpp
class Vector2D {
private:
    double _x, _y;
public:
    // 复合赋值：+=, -=, *=, /=
    Vector2D& operator+=(const Vector2D& v) {
        _x += v._x;
        _y += v._y;
        return *this;
    }

    Vector2D& operator-=(const Vector2D& v) {
        _x -= v._x;
        _y -= v._y;
        return *this;
    }

    Vector2D& operator*=(double scalar) {
        _x *= scalar;
        _y *= scalar;
        return *this;
    }
};
```

### 关系运算符 (Relational Operators)

```cpp
class Point {
private:
    int _x, _y;
public:
    bool operator==(const Point& other) const {
        return _x == other._x && _y == other._y;
    }

    bool operator!=(const Point& other) const {
        return !(*this == other);
    }

    bool operator<(const Point& other) const {
        if (_x != other._x) return _x < other._x;
        return _y < other._y;
    }
};
```

---

## 自增/自减运算符 (Increment/Decrement Operators)

前置与后置的区别在于参数：

```cpp
class Counter {
private:
    int _count = 0;
public:
    // 前置 ++c
    Counter& operator++() {
        ++_count;
        return *this;
    }

    // 后置 c++（占位 int 参数）
    Counter operator++(int) {
        Counter temp = *this;
        ++_count;
        return temp;   // 返回旧值
    }
};
```

| 形式 | 签名 | 返回 | 效率 |
|------|------|------|------|
| 前置 `++c` | `T& operator++()` | 引用 | 更高 |
| 后置 `c++` | `T operator++(int)` | 值 | 需拷贝 |

!!! tip "优先使用前置 ++"
    对于自定义类型，前置 `++` 效率更高（不产生临时对象）。内置类型两者无区别。

---

## 输入/输出运算符 (I/O Operators — `<<` `>>`)

`<<` 和 `>>` 的左操作数是 `ostream`/`istream`，**必须是非成员函数**。

```cpp
#include <iostream>
using namespace std;

class Point {
private:
    int _x, _y;
public:
    Point(int x = 0, int y = 0) : _x(x), _y(y) {}

    // 必须设为友元才能访问私有成员
    friend ostream& operator<<(ostream& os, const Point& p);
    friend istream& operator>>(istream& is, Point& p);
};

// 输出运算符
ostream& operator<<(ostream& os, const Point& p) {
    os << "(" << p._x << ", " << p._y << ")";
    return os;   // 返回 os 以支持链式调用
}

// 输入运算符
istream& operator>>(istream& is, Point& p) {
    is >> p._x >> p._y;
    return is;
}

int main() {
    Point p;
    cout << "请输入坐标 (x y): ";
    cin >> p;
    cout << "输入的点是: " << p << endl;
}
```

!!! important "为什么必须是非成员函数？"
    因为 `cout << p` 翻译为 `operator<<(cout, p)`，左操作数是 `ostream`，不可能是 `Point` 的成员函数。

---

## 下标运算符 `[]` (Subscript Operator)

下标运算符用于模拟数组式访问：

```cpp
class IntArray {
private:
    int _data[10];
public:
    // 非 const 版本：可读写
    int& operator[](int index) {
        if (index < 0 || index >= 10)
            throw out_of_range("Index out of bounds");
        return _data[index];
    }

    // const 版本：只读
    const int& operator[](int index) const {
        if (index < 0 || index >= 10)
            throw out_of_range("Index out of bounds");
        return _data[index];
    }
};
```

---

## 函数调用运算符 `()` (Function Call Operator)

函数调用运算符允许对象像函数一样调用（函数对象 / Functor）：

```cpp
class Adder {
private:
    int _value;
public:
    Adder(int v) : _value(v) {}

    // 重载 ()
    int operator()(int x) const {
        return _value + x;
    }
};

int main() {
    Adder add5(5);
    cout << add5(10) << endl;  // 输出 15
}
```

函数对象在 STL 算法中广泛应用：

```cpp
// 标准库中的 less 函数对象
sort(vec.begin(), vec.end(), less<int>());
```

---

## 类型转换运算符 (Type Conversion Operator)

C++ 支持定义从自定义类型到其他类型的隐式转换：

```cpp
class Fraction {
private:
    int _num, _den;
public:
    Fraction(int n, int d = 1) : _num(n), _den(d) {}

    // 转换为 double
    operator double() const {
        return static_cast<double>(_num) / _den;
    }
};

int main() {
    Fraction f(3, 4);
    double d = f;             // 隐式调用 operator double()
    cout << d << endl;        // 输出 0.75
}
```

!!! warning "隐式转换需谨慎"
    类型转换运算符默认允许隐式转换，可能导致意外的类型转换。C++11 中可使用 `explicit` 限制：
    ```cpp
    explicit operator double() const;  // 只能显式转换
    ```

---

## 运算符重载的最佳实践 (Best Practices)

| 准则 | 说明 |
|------|------|
| **保持语义一致（Semantic Consistency）** | `+` 不能做减法，`==` 不能做排序 |
| **尊重优先级（Respect Precedence）** | 无法改变运算符优先级，设计时需注意 |
| **不重载陌生的（Don't Overload Unfamiliar）** | 不重载 `&&` `||` `,`（会失去短路求值特性） |
| **提供对称性（Provide Symmetry）** | 重载 `+` 通常也要重载 `+=` |
| **使用友元谨慎（Use Friend Judiciously）** | 仅在非成员函数需要访问私有成员时使用 |
