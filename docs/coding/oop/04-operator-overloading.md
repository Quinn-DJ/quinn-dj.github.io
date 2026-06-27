# 04: 运算符重载 (Operator Overloading)

> 运算符重载让自定义类型也能用 `+` `==` `<<` 这些操作符，代码读起来更自然。

---

## 什么是运算符重载？

运算符重载 (Operator Overloading) 允许为自定义类型赋予运算符语义：

```cpp
Complex a(1, 2), b(3, 4);
Complex c = a + b;   // 比 Complex c = a.add(b) 更直观
```

!!! tip "基本原则"
    运算符重载的目的是让代码**更自然、更易读**，不是炫技。重载后应该保持运算符原有的含义。

### 可以重载的运算符

- **绝大多数可以重载**：`+` `-` `*` `/` `%` `==` `!=` `<` `>` `[]` `()` `<<` `>>` 等
- **少数不能重载**：`.` `::` `?:` `sizeof` `.*` `#` `##`

---

## 两种重载形式

| 形式 | 语法 | 适用场景 |
|------|------|----------|
| **成员函数** | `T T::operator+(const T&) const` | 左操作数为当前对象 |
| **非成员函数** | `T operator+(const T&, const T&)` | 对称运算、左操作数非当前类 |

### 成员函数形式

```cpp
class Point {
private:
    int _x, _y;
public:
    Point(int x = 0, int y = 0) : _x(x), _y(y) {}

    Point operator+(const Point& other) const {
        return Point(_x + other._x, _y + other._y);
    }

    Point& operator+=(const Point& other) {
        _x += other._x; _y += other._y;
        return *this;
    }
};
```

### 非成员函数形式

当**左操作数不是当前类类型**时（如 `cout << point`），必须使用非成员函数形式，通常设为**友元**。

```cpp
class Point {
private:
    int _x, _y;
public:
    Point(int x = 0, int y = 0) : _x(x), _y(y) {}

    // 必须设为友元才能访问私有成员
    friend ostream& operator<<(ostream& os, const Point& p);
    friend istream& operator>>(istream& is, Point& p);
};

ostream& operator<<(ostream& os, const Point& p) {
    os << "(" << p._x << ", " << p._y << ")";
    return os;   // 返回 os 以支持链式调用
}

istream& operator>>(istream& is, Point& p) {
    is >> p._x >> p._y;
    return is;
}
```

!!! important "选择标准"
    - 左操作数必须是当前类对象 → 成员函数
    - 左操作数非当前类（如 `cout`）→ 非成员函数
    - 对称二元运算符（如 `+`、`==`）→ 推荐非成员函数

---

## 二元算术运算符

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
    让 `2 * v` 也合法（左操作数是 `double`）：
    ```cpp
    Vector2D operator*(double scalar, const Vector2D& v) {
        return v * scalar;  // 复用成员函数版本
    }
    ```

---

## 复合赋值运算符

通常返回**引用**，以支持链式赋值：

```cpp
class Vector2D {
    double _x, _y;
public:
    Vector2D& operator+=(const Vector2D& v) {
        _x += v._x; _y += v._y;
        return *this;
    }
    Vector2D& operator-=(const Vector2D& v) {
        _x -= v._x; _y -= v._y;
        return *this;
    }
    Vector2D& operator*=(double scalar) {
        _x *= scalar; _y *= scalar;
        return *this;
    }
};
```

!!! tip "最佳实践"
    先实现 `operator+=` 作为成员函数，再用非成员 `operator+` 复用其逻辑：
    ```cpp
    Complex operator+(Complex a, const Complex& b) {
        a += b;
        return a;
    }
    ```

---

## 关系运算符

```cpp
class Point {
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

## 自增/自减运算符

前置与后置的区别在于参数：

```cpp
class Counter {
    int _count = 0;
public:
    // 前置 ++c
    Counter& operator++() { ++_count; return *this; }

    // 后置 c++（占位 int 参数）
    Counter operator++(int) {
        Counter temp = *this;
        ++_count;
        return temp;
    }
};
```

| 形式 | 签名 | 返回 | 效率 |
|------|------|------|------|
| 前置 `++c` | `T& operator++()` | 引用 | 更高 |
| 后置 `c++` | `T operator++(int)` | 值 | 需拷贝 |

!!! tip "优先使用前置 ++"
    对于自定义类型，前置 `++` 效率更高（不产生临时对象）。

---

## 输入/输出运算符 (`<<` `>>`)

左操作数是 `ostream`/`istream`，**必须是非成员函数**。

!!! important "为什么必须是非成员函数？"
    因为 `cout << p` 翻译为 `operator<<(cout, p)`，左操作数是 `ostream`。

---

## 下标运算符 `[]`

模拟数组式访问：

```cpp
class IntArray {
    int _data[10];
public:
    // 非 const 版本：可读写
    int& operator[](int index) {
        if (index < 0 || index >= 10) throw out_of_range("out of bounds");
        return _data[index];
    }
    // const 版本：只读
    const int& operator[](int index) const {
        if (index < 0 || index >= 10) throw out_of_range("out of bounds");
        return _data[index];
    }
};
```

---

## 函数调用运算符 `()`（Functor）

允许对象像函数一样调用：

```cpp
class Adder {
    int _value;
public:
    Adder(int v) : _value(v) {}
    int operator()(int x) const { return _value + x; }
};

Adder add5(5);
cout << add5(10) << endl;  // 输出 15

// 标准库中的函数对象
sort(vec.begin(), vec.end(), less<int>());
```

---

## 类型转换运算符

定义从自定义类型到其他类型的转换：

```cpp
class Fraction {
    int _num, _den;
public:
    Fraction(int n, int d = 1) : _num(n), _den(d) {}

    operator double() const {
        return static_cast<double>(_num) / _den;
    }
};

Fraction f(3, 4);
double d = f;  // 隐式调用 operator double()
```

!!! warning "隐式转换需谨慎"
    C++11 中可使用 `explicit` 限制：
    ```cpp
    explicit operator double() const;  // 只能显式转换
    ```

---

## 最佳实践总结

| 准则 | 说明 |
|------|------|
| **保持语义一致** | `+` 不能做减法，`==` 不能做排序 |
| **尊重优先级** | 无法改变运算符优先级 |
| **不重载 `&&` `\|\|` `,`** | 会失去短路求值特性 |
| **提供对称性** | 重载 `+` 通常也要重载 `+=` |
| **复合赋值 + 非成员** | 先实现 `+=` 为成员，再用非成员 `+` 复用 |
