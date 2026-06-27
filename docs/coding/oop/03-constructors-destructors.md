# 03: 构造函数与析构函数 (Constructors & Destructors)

> 构造函数负责对象的初始化，析构函数负责对象的清理。

---

## 构造函数概览

构造函数是一种在**对象创建时自动调用**的特殊成员函数，用于初始化对象的数据成员。

### 核心特点

1. 函数名与类名完全一致
2. 无返回值（连 `void` 都不能写）
3. 可以重载（多个不同参数的构造函数）
4. 自动调用，无需手动调用
5. 不能被继承

### 构造函数的类型

| 类型 | 语法 | 调用时机 |
|------|------|----------|
| 默认构造 | `ClassName()` | 创建无参对象 |
| 带参构造 | `ClassName(type param)` | 创建时传入参数 |
| 拷贝构造 | `ClassName(const ClassName& other)` | 用已有对象创建新对象 |
| 移动构造 (C++11) | `ClassName(ClassName&& other)` | 移动临时对象 |

---

## 默认构造函数 (Default Constructor)

不带参数的构造函数。如果程序员没有定义任何构造函数，编译器会自动生成一个空的默认构造。

```cpp
class Simple {
private:
    int _value;
    // 编译器自动生成：Simple() {}  —— _value 不会被初始化！
};
```

!!! warning "默认构造的陷阱"
    编译器自动生成的默认构造函数**不会初始化内置类型**（如 `int`、`double`）成员，它们的值是随机的。建议始终手动初始化。

```cpp
class Safe {
private:
    int _value = 0;            // C++11 类内初始化
public:
    Safe() = default;          // 显式要求编译器生成
};

class Explicit {
    int _value;
public:
    Explicit() : _value(0) {}  // 手动定义，确保初始化
};
```

### 默认构造的"消失"规则

一旦定义了**任何一个**带参构造函数，编译器就**不再生成默认构造函数**。

```cpp
class Rectangle {
public:
    Rectangle(double w, double h) : _width(w), _height(h) {}
private:
    double _width, _height;
};

// Rectangle r;     // ❌ 编译错误！没有默认构造函数
Rectangle r(3, 4);  // ✅ 正确
```

!!! tip "同时提供两种构造"
    ```cpp
    Rectangle() = default;           // C++11 方式
    // 或 Rectangle() : _width(0), _height(0) {}
    ```

---

## 带参构造函数与初始化列表

### 初始化列表 (Initializer List)

在构造函数的参数列表后使用冒号引出，用于直接初始化成员变量：

```cpp
ClassName(type param1, type param2)
    : member1(param1), member2(param2) {
    // 函数体
}
```

**初始化列表 vs 函数体赋值：**

| 方面 | 初始化列表 | 函数体赋值 |
|------|-----------|-----------|
| 效率 | 直接构造，一步到位 | 先默认构造再赋值，多一步 |
| const 成员 | ✅ 可以 | ❌ 不可以 |
| 引用成员 | ✅ 可以 | ❌ 不可以 |
| 对象成员（无默认构造） | ✅ 可以 | ❌ 不可以 |

!!! important "必须使用初始化列表的场景"
    1. 初始化 `const` 成员
    2. 初始化引用类型成员
    3. 初始化没有默认构造函数的对象成员

```cpp
class MustUseList {
private:
    const int _id;       // const 成员
    int& _ref;           // 引用成员
    Student _s;          // 对象成员（无默认构造）
public:
    MustUseList(int id, int& ref, string name)
        : _id(id), _ref(ref), _s(name, id, 0.0) {}
};
```

---

## 构造函数重载

一个类可以有多个构造函数，通过参数的数量或类型区分：

```cpp
class Time {
private:
    int _hour, _minute, _second;
public:
    Time() : _hour(0), _minute(0), _second(0) {}

    explicit Time(int h) : _hour(h), _minute(0), _second(0) {
        if (_hour < 0 || _hour >= 24) _hour = 0;
    }

    Time(int h, int m, int s)
        : _hour(h), _minute(m), _second(s) {
        if (_hour < 0 || _hour >= 24) _hour = 0;
        if (_minute < 0 || _minute >= 60) _minute = 0;
        if (_second < 0 || _second >= 60) _second = 0;
    }
};
```

### explicit 关键字

`explicit` 阻止编译器通过单参数构造函数进行**隐式类型转换**。

```cpp
class Time {
public:
    explicit Time(int h) { /* ... */ }
};

void func(Time t) { /* ... */ }

// Time t1 = 10;   // ❌ explicit 阻止了隐式转换
Time t2(10);        // ✅ 显式调用
func(Time(10));     // ✅ 显式转换
```

!!! tip "什么时候用 explicit？"
    建议所有单参数构造函数都加上 `explicit`，除非你**明确需要**隐式转换。

---

## 委托构造函数 (Delegating Constructor, C++11)

一个构造函数可以调用同一个类的另一个构造函数，避免代码重复：

```cpp
class Time {
private:
    int _hour, _minute, _second;
public:
    Time() : Time(0, 0, 0) {}         // 委托给三参数构造
    Time(int h) : Time(h, 0, 0) {}    // 委托给三参数构造
    Time(int h, int m, int s)
        : _hour(h), _minute(m), _second(s) {
        // 核心初始化逻辑
    }
};
```

---

## 拷贝构造函数 (Copy Constructor)

使用**同一个类的已有对象**来初始化新对象。

```cpp
ClassName(const ClassName& source);
```

### 什么时候会被调用？

| 场景 | 说明 |
|------|------|
| 值传递 | `void func(Student s)` |
| 值返回 | `Student getStudent()` |
| 声明时拷贝 | `Student s2 = s1;` |
| 列表初始化 | `Student s2{s1};` |

```cpp
class Student {
    string _name;
    int _id;
public:
    Student(const Student& other)
        : _name(other._name), _id(other._id) {
        cout << "拷贝构造被调用" << endl;
    }
};
```

---

## 浅拷贝 vs 深拷贝

这是 C++ 中最容易踩的坑之一。

!!! warning "浅拷贝的问题"
    当类包含**指针成员且指向动态分配的内存**时，编译器自动生成的拷贝构造只拷贝指针值（浅拷贝），导致两个对象指向同一块内存，析构时产生"双重释放"。

```cpp
// ❌ 浅拷贝问题
class Shallow {
    int* _data;
public:
    Shallow(int val) : _data(new int(val)) {}
    ~Shallow() { delete _data; }
    // 没有定义拷贝构造 → 浅拷贝！
};

void problem() {
    Shallow a(42);
    Shallow b = a;   // a._data 和 b._data 指向同一地址
}                    // 析构时 double free!
```

```cpp
// ✅ 深拷贝：正确做法
class Deep {
    int* _data;
public:
    Deep(int val) : _data(new int(val)) {}
    Deep(const Deep& other)
        : _data(new int(*other._data)) {}  // 分配独立内存
    ~Deep() { delete _data; }
};
```

| 特性 | 浅拷贝 | 深拷贝 |
|------|--------|--------|
| 生成方式 | 编译器默认生成 | 程序员手动定义 |
| 指针复制 | 只复制地址值 | 分配新内存再复制内容 |
| 内存独立性 | 不独立 | 完全独立 |
| 适用场景 | 无指针成员 | 包含动态分配内存 |

---

## 析构函数 (Destructor)

析构函数在**对象生命周期结束时自动调用**，负责清理资源。

### 核心规则

1. 名称：`~ClassName()`
2. 无返回值、**无参数**
3. **不能重载**
4. 自动调用，不能显式调用
5. 如果未定义，编译器自动生成空析构

```cpp
class Resource {
private:
    int* _data;
public:
    Resource() : _data(new int[100]) {}
    ~Resource() { delete[] _data; }
};
```

### 构造与析构的顺序

```cpp
class Demo {
public:
    Demo(int id) : _id(id) { cout << "构造 " << _id << endl; }
    ~Demo() { cout << "析构 " << _id << endl; }
private:
    int _id;
};

int main() {
    Demo a(1);         // 构造 1
    Demo b(2);         // 构造 2
    {
        Demo c(3);     // 构造 3
    }                  // 析构 3
    Demo d(4);         // 构造 4
    return 0;
}
// 输出：构造1 构造2 构造3 析构3 构造4 析构4 析构2 析构1
// 规律：先构造的后析构（栈式，LIFO）
```

---

## 三大法则 (Rule of Three)

如果类需要自定义析构函数，通常也需要自定义拷贝构造函数和拷贝赋值运算符。

| 三件套 | 作用 |
|--------|------|
| 析构函数 | 释放动态资源 |
| 拷贝构造函数 | 深拷贝初始化 |
| 拷贝赋值运算符 | 深拷贝赋值 |

```cpp
class String {
private:
    char* _data;
    size_t _size;
public:
    String(const char* str = "") {
        _size = strlen(str);
        _data = new char[_size + 1];
        strcpy(_data, str);
    }

    ~String() { delete[] _data; }                      // 1. 析构

    String(const String& other) : _size(other._size) {  // 2. 拷贝构造
        _data = new char[_size + 1];
        strcpy(_data, other._data);
    }

    String& operator=(const String& other) {            // 3. 拷贝赋值
        if (this == &other) return *this;  // 自赋值检查
        delete[] _data;                    // 释放旧资源
        _size = other._size;
        _data = new char[_size + 1];       // 分配新资源
        strcpy(_data, other._data);
        return *this;
    }
};
```

!!! tip "Rule of Five (C++11)"
    现代 C++ 扩展为"五大法则"——还需加上**移动构造函数**和**移动赋值运算符**。
