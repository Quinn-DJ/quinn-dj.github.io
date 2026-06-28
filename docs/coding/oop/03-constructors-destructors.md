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

---

## 默认构造函数 (Default Constructor)

不带参数的构造函数。如果程序员没有定义任何构造函数，编译器会自动生成一个空的默认构造。

```cpp
class Simple {
private:
    int _value;
    // 编译器自动生成 public 的 构造函数 Simple() {}，此时 _value 不会被初始化
};
```

!!! warning "默认构造的陷阱"
    编译器自动生成的默认构造函数**不会初始化内置类型**（如 `int`、`double`）成员，它们的值是随机的。建议始终手动初始化。

```cpp
class Safe {
private:
    int _value = 0;            // 类内初始化（这样默认构造函数会初始化 _value 为 0）
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
private:
    double _width, _height;
public:
    Rectangle(double w, double h) : _width(w), _height(h) {}
};

// Rectangle r;     // 编译错误！编译器不生成默认构造函数，现有的构造函数是带参的
Rectangle r(3, 4);  // 编译通过！
```

!!! tip "同时提供两种构造"
    可以显式要求编译器生成默认构造函数，或者手动定义一个无参构造函数：
    ```cpp
    Rectangle() = default;
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

这段代码的执行顺序为：
1. 调用成员变量的构造函数，并传入参数 `param1`、`param2`
2. 按顺序依次对 `member1`、`member2` 进行初始化（分别初始化为 `param1` 和 `param2`）
3. 执行构造函数的函数体

**初始化列表 vs 函数体赋值：**

| 方面 | 初始化列表 | 函数体赋值 |
|------|-----------|-----------|
| 效率 | 直接构造 | 先默认构造再赋值，会多一步 |
| const 成员 | 可以 | 不可以 |
| 引用成员 | 可以 | 不可以 |
| 对象成员（无默认构造） | 可以 | 不可以 |

!!! important "必须使用初始化列表的场景"
    1. 初始化 `const` 成员
    2. 初始化引用类型成员
    3. 初始化没有默认构造函数的对象成员
    
    前两个场景是因为 `const` 和引用必须在创建时初始化，无法重新赋值；第三个场景是因为在执行函数体前，编译器会尝试调用对象成员的默认构造函数来对其进行初始化，如果没有默认构造函数就会编译错误！

```cpp
class Student {
private:
    string _name;
    int _id;
    double _score;
public:
    Student(string name, int id, double score)
        : _name(name), _id(id), _score(score) {}
};
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

### 默认参数 (Default Arguments)

```cpp
class Time {
private:
    int _hour, _minute, _second;
public:
    Time() : _hour(0), _minute(0), _second(0) {}

    Time(int h) : _hour(h), _minute(0), _second(0) {
        if (_hour < 0 || _hour >= 24) _hour = 0;
    }

    Time(int h, int m, int s)
        : _hour(h), _minute(m), _second(s) {
        if (_hour < 0 || _hour >= 24) _hour = 0;
        if (_minute < 0 || _minute >= 60) _minute = 0;
        if (_second < 0 || _second >= 60) _second = 0;
    }
};

Time t1;             // 调用默认构造
Time t2 = 10;        // 调用单参数构造（隐式转换）
Time t3(10);         // 调用单参数构造
Time t4(10, 30, 45); // 调用三参数构造
```

对于 `t2`，编译器会将 `10` 隐式转换为 `Time(10)`，然后调用单参数构造函数。

### explicit 关键字

`explicit` 阻止编译器通过单参数构造函数进行**隐式类型转换**。

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

// Time t2 = 10;    编译错误，因为 explicit 阻止了隐式转换，这行会被视为尝试将 int 转换为 Time
Time t3(10);     // 调用单参数构造函数，编译通过
```

!!! tip "什么时候用 explicit？"
    建议所有单参数构造函数都加上 `explicit`，除非你明确需要隐式转换。

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

### 使用场景

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
    Student(string name, int id) : _name(name), _id(id) {}
    Student(const Student& other)
        : _name(other._name), _id(other._id) {
        cout << "拷贝构造被调用" << endl;
    }
};

Student s1("Alice", 1001);
Student s2 = s1;  // 调用拷贝构造函数
```

程序会输出 `拷贝构造被调用`，`s2` 成员的值会和 `s1` 一样，因为 `s2` 是通过 `s1` 拷贝构造出来的。

---

## 浅拷贝 vs 深拷贝

一个很容易踩的坑

!!! warning "浅拷贝的问题"
    当类包含**指针成员且指向动态分配的内存**时，编译器自动生成的拷贝构造只拷贝指针值（浅拷贝），导致两个对象指向同一块内存，析构时产生"双重释放"。

```cpp
// 浅拷贝问题
class Shallow {
    int* _data;
public:
    Shallow(int val) : _data(new int(val)) {}
    ~Shallow() { delete _data; }
    // 没有定义拷贝构造！
};

void problem() {
    Shallow a(42);
    Shallow b = a;   // a._data 和 b._data 指向同一地址
}                    // 析构时 double free!
```

```cpp
// 深拷贝
class Deep {
    int* _data;
public:
    Deep(int val) : _data(new int(val)) {}
    Deep(const Deep& other)
        : _data(new int(*other._data)) {}  // 通过 new 分配新内存并拷贝内容
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

Demo e(5);             // 构造 5
int main() {
    Demo a(1);         // 构造 1
    Demo b(2);         // 构造 2
    {
        Demo c(3);     // 构造 3
    }                  // 析构 3
    Demo d(4);         // 构造 4
    return 0;
}
```

输出如下：
```bash
构造 5
构造 1
构造 2
构造 3
析构 3
构造 4
析构 4
析构 2
析构 1
析构 5
```

全局对象的生命周期跨越整个程序：最先构造，最后析构。同一作用域内的局部对象先构造的后解析（栈式结构）

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

    ~String() { delete[] _data; }                       // 1. 析构

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
