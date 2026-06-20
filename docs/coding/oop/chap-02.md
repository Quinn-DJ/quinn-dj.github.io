# Chapter 2: 类与对象 (Part 1)

> 从结构化编程到面向对象编程的转变，是思维方式的一次跃迁——不再关注"如何做"，而是关注"谁来做"。

---

## 从 C 到 C++：编程范式的转变

| 维度 | 过程式编程（C） | 面向对象编程（C++） |
|------|---------------|-------------------|
| 核心 | 以过程/函数为中心 | 以对象为中心 |
| 数据与操作 | 分离，全局共享 | 封装在对象内部 |
| 代码组织 | 按功能切分 | 按现实实体映射 |
| 扩展性 | 大型项目维护困难 | 高内聚、低耦合 |

!!! tip "核心转变"
    C 语言关注"如何做"（How to do），面向对象关注"做什么"（What to do）。

---

## 什么是类与对象？

**类 (Class)** 是抽象的模板——定义事物的属性（数据）和行为（方法），是创建对象的蓝图。

**对象 (Object)** 是类的具体实例——拥有类定义的结构，但属性值可以各不相同。

> 类好比汽车设计图，对象是根据图纸制造出来的具体汽车。图纸不能驾驶，但汽车可以。

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
};  // ← 注意：末尾必须有分号！
```

!!! warning "分号陷阱"
    类定义结束后的 `}` 后面必须紧跟 `;`。这是一个非常常见的编译错误！

### 成员变量/属性 (Member Variables / Attributes)

```cpp
class Student {
private:
    string _name;   // 推荐命名：加下划线前缀
    int _id;
    double _score;
};
```

!!! tip "命名规范"
    推荐给成员变量加前缀（如 `_name` 或 `m_name`），以区分普通局部变量和函数参数。

### 成员函数/方法 (Member Functions / Methods)

成员函数定义了对象的行为，分为两类：

- **访问器 (Accessor)** — 以 `get` 开头，读取数据
- **修改器 (Mutator)** — 以 `set` 开头，修改数据

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

## 访问控制（Access Control）

| 修饰符 | 访问权限 | 典型用途 |
|--------|----------|----------|
| `public` | 任何代码均可访问 | 对外接口（成员函数） |
| `private` | 仅该类内部可访问 | 内部数据（成员变量） |
| `protected` | 该类及子类可访问 | 继承扩展 |

!!! important "默认访问权限"
    如果没有显式指定访问控制符，类的成员默认是 `private`。

```cpp
class Rectangle {
private:        // 私有区域：数据成员
    double _length;
    double _width;

public:         // 公有区域：成员函数
    void setDimensions(double l, double w) {
        _length = l;
        _width = w;
    }
    double getArea() const { return _length * _width; }
};
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
    使用 `new` 创建的对象必须用 `delete` 释放，否则会导致内存泄漏。

---

## 构造函数 (Constructor)

构造函数是一种特殊的成员函数，在**创建对象时自动调用**，用于初始化对象状态。

### 核心特点

1. 函数名与类名完全相同
2. 没有返回值（连 `void` 也不写）
3. 可以重载（不同的参数列表）
4. 自动调用，不可显式调用

```cpp
class Student {
private:
    string _name;
    int _id;
public:
    // 1. 默认构造函数（无参）
    Student() {
        _name = "Unknown";
        _id = 0;
    }

    // 2. 带参数构造函数（重载）
    Student(string n, int i) : _name(n), _id(i) {
        // 初始化列表方式
    }
};

int main() {
    Student s1;          // 调用默认构造
    Student s2("Alice", 1001); // 调用带参构造
    return 0;
}
```

### 初始化列表 (Initializer List) 的优势

```cpp
class Point {
private:
    const int _x;   // const 成员
    int& _r;        // 引用成员
public:
    // 必须使用初始化列表！
    Point(int x, int& r) : _x(x), _r(r) {
        // 函数体内不能初始化 const 和引用
    }
};
```

!!! important "初始化列表 vs 函数体赋值"
    初始化列表直接调用成员变量的构造函数，**一步到位**；函数体内赋值是"先默认构造、再赋值"，多了一步操作。初始化列表是唯一能初始化 `const` 成员和引用成员的方式。

### 默认构造函数的注意事项

- 如果**没有定义任何构造函数**，编译器自动生成一个空实现的默认构造函数
- 如果**定义了任何带参构造函数**，编译器不再自动生成默认构造函数

```cpp
class Rectangle {
public:
    Rectangle(double l, double w) { /* ... */ }
    // 此时默认构造 Rectangle() 已不存在！
};

// Rectangle r;  // 编译错误！
Rectangle r(5, 3);  // 正确
```

---

## 析构函数 (Destructor)

析构函数在**对象销毁时自动调用**，用于完成清理工作（释放动态内存、关闭文件等）。

### 核心特点

1. 函数名：`~` + 类名（如 `~Student()`）
2. 无返回值、无参数
3. **不能重载**（每个类只有一个析构函数）
4. 自动调用，不可显式调用

```cpp
class Student {
public:
    ~Student() {
        cout << "Student destroyed." << endl;
    }
};

void func() {
    Student s;  // 构造
}               // s 离开作用域，析构自动调用
```

### 构造与析构的调用顺序

| 操作 | 调用顺序 |
|------|----------|
| 构造 | 先构造的对象后析构 |
| 析构 | 后构造的先析构（栈式，先进后出） |

```cpp
void test() {
    Student s1("A");  // 构造 A
    Student s2("B");  // 构造 B
}                     // 析构 B → 析构 A
```

---

## const 成员函数

在成员函数参数列表后加 `const`，承诺该函数**不会修改对象的非静态成员变量**。

```cpp
class Circle {
private:
    double _radius;
public:
    // const 成员函数：只读
    double getRadius() const { return _radius; }

    // 非 const 成员函数：可修改
    void setRadius(double r) { _radius = r; }
};

int main() {
    const Circle c(5.0);
    // c.setRadius(3.0);     // 错误！const 对象只能调用 const 函数
    cout << c.getRadius();    // 正确
}
```

!!! tip "黄金法则"
    只要不修改对象状态，就将成员函数声明为 `const`。这能让编译器帮你捕获意外的修改操作。

---

## 类的组合 (Composition)

一个类包含另一个类的对象作为成员，体现 **Has-a** 关系。

```cpp
class Date {
private:
    int _day, _month, _year;
public:
    Date(int d, int m, int y) : _day(d), _month(m), _year(y) {}
};

class Person {
private:
    string _name;
    Date _birthDate;     // 组合关系：Person has a Date
public:
    // 必须使用初始化列表初始化成员对象
    Person(string n, int d, int m, int y)
        : _name(n), _birthDate(d, m, y) {}
};
```

!!! warning "组合类的初始化"
    包含对象成员的类，其构造函数**必须使用初始化列表**来初始化成员对象。

---

## 前向声明 (Forward Declaration)

当两个类相互引用时，需要前向声明。

```cpp
class ClassB;  // 前向声明

class ClassA {
public:
    void func(ClassB& b);  // 仅需声明，可用
};

class ClassB {
public:
    void func(ClassA& a) { /* 需要完整定义 */ }
};
```

!!! note "前向声明的限制"
    前向声明后**只能**声明指针、引用、函数参数/返回值类型；**不能**创建对象实例或访问成员。

---

## UML 类图简介 (UML Class Diagram)

```
┌───────────────────┐
│    Rectangle       │  ← 类名
├───────────────────┤
│ - length: double   │  ← 属性（- 表示 private）
│ - width: double    │
├───────────────────┤
│ + setDimensions()  │  ← 方法（+ 表示 public）
│ + getArea(): double│
│ + getPerimeter()   │
└───────────────────┘
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
| 缺少构造函数 | 定义了带参构造却未定义默认构造 | 显式提供默认构造 |
| const 函数修改数据 | 违背 const 承诺 | 检查函数体，使用 `mutable`（如果确实需要）|
| 组合类初始化错误 | 未用初始化列表 | 必须用初始化列表 |
