# 06: 多态 (Polymorphism)

> 多态让同一句代码，在不同对象上表现出不同的行为。

---

## 什么是多态？

**多态 (Polymorphism)** 指通过**基类指针或引用**调用虚函数时，实际执行的是**派生类版本**的函数。一句话：**一个接口，多种实现**。

```cpp
class Animal {
public:
    virtual void makeSound() const {
        cout << "Some generic animal sound." << endl;
    }
};

class Dog : public Animal {
public:
    void makeSound() const override { cout << "Woof! Woof!" << endl; }
};

class Cat : public Animal {
public:
    void makeSound() const override { cout << "Meow~" << endl; }
};

void playSound(const Animal& animal) {
    animal.makeSound();   // 多态：实际调用取决于对象的真实类型
}

playSound(Dog());   // Woof! Woof!
playSound(Cat());   // Meow~
```

### 多态的作用

| 作用 | 说明 |
|------|------|
| **代码通用化** | 用基类接口处理所有派生类，无需逐个判断类型 |
| **可扩展性** | 新增派生类无需修改已有代码（开闭原则 OCP） |
| **框架设计** | 定义抽象接口，让用户提供具体实现 |

!!! tip "多态 vs 重定义"
    没有 `virtual` → **重定义**（静态绑定）。
    有 `virtual` → **多态**（动态绑定）。两种完全不同的机制。

---

## 虚函数 (Virtual Function)

### 基本语法

```cpp
class Base {
public:
    virtual returnType funcName(parameters) {
        // 基类默认实现
    }
};

class Derived : public Base {
public:
    returnType funcName(parameters) override {
        // 派生类重写实现
    }
};
```

### 虚函数的使用规则

1. 基类中使用 `virtual` 关键字声明
2. 派生类中可加 `override`（C++11，推荐）表示重写
3. 通过**基类指针或引用**调用时触发多态
4. **构造函数不能是虚函数**，但析构函数可以是（且通常是）

!!! warning "通过值传递会丢失多态"
    值传递会发生**对象切割 (Slicing)**：
    ```cpp
    void func(Animal a) { a.makeSound(); }  // 总是调用 Animal 的版本
    ```

---

## 虚函数表与动态绑定 (vtable & Dynamic Binding)

### C++ 实现多态的底层原理

每个包含虚函数的类都有一个**虚函数表 (vtable)**，存储所有虚函数地址。

### 内存布局

```
Animal 对象内存布局：
┌─────────────────────┐
│ vptr (虚表指针)      │ ← 指向 Animal 的 vtable
├─────────────────────┤
│ 其他数据成员...       │
└─────────────────────┘

Animal 的 vtable:              Derived 的 vtable（重写了 eat）:
┌─────────────────────┐       ┌─────────────────────┐
│ &Animal::eat()       │       │ &Derived::eat()      │ ← 指向派生类版本
│ &Animal::sleep()     │       │ &Animal::sleep()     │ ← 未重写，指向基类
│ &Animal::~Animal()   │       │ &Derived::~Derived() │
└─────────────────────┘       └─────────────────────┘
```

### 动态绑定过程

```cpp
Animal* p = new Dog();
p->eat();
```

1. 通过 `p` 找到对象的 **vptr**
2. 通过 vptr 找到 **vtable**
3. 在 vtable 中找到 `eat()` 的地址
4. 调用实际地址（`Dog::eat`）

---

## 静态绑定 vs 动态绑定

| 特性 | 静态绑定 | 动态绑定 |
|------|----------|----------|
| 时机 | 编译期 | 运行期 |
| 依据 | 指针/引用静态类型 | 对象实际类型 |
| 性能 | 快（无额外开销） | 稍慢（通过 vtable 间接调用） |
| 适用 | 非虚函数 | 虚函数 |

---

## 纯虚函数与抽象类

### 纯虚函数

在基类中没有实现的虚函数，语法上赋值为 0：

```cpp
class Shape {
public:
    virtual double getArea() const = 0;       // 纯虚函数
    virtual double getPerimeter() const = 0;  // 纯虚函数
};
```

### 抽象类

- **包含纯虚函数的类**称为抽象类
- **不能实例化**
- 派生类必须实现所有纯虚函数，否则自身也是抽象类

```cpp
class Circle : public Shape {
    double _radius;
public:
    Circle(double r) : _radius(r) {}
    double getArea() const override { return 3.14159 * _radius * _radius; }
    double getPerimeter() const override { return 2 * 3.14159 * _radius; }
};

class Rectangle : public Shape {
    double _width, _height;
public:
    Rectangle(double w, double h) : _width(w), _height(h) {}
    double getArea() const override { return _width * _height; }
    double getPerimeter() const override { return 2 * (_width + _height); }
};

// 多态遍历
Shape* shapes[] = { new Circle(5), new Rectangle(3, 4) };
for (auto s : shapes) {
    cout << "Area: " << s->getArea() << endl;  // 多态
    delete s;
}
```

---

## 虚析构函数

### 为什么需要虚析构函数？

如果通过基类指针删除派生类对象，而析构函数不是虚函数，则**只调用基类的析构函数**，资源泄漏！

```cpp
// ❌ 错误：非虚析构
class Base {
public:
    ~Base() { cout << "Base destructor" << endl; }
};
class Derived : public Base {
    int* _data = new int[100];
public:
    ~Derived() { delete[] _data; cout << "Derived destructor" << endl; }
};

Base* p = new Derived();
delete p;   // ❌ 只调用 Base 的析构！Derived 的资源泄漏！
```

```cpp
// ✅ 正确：虚析构
class Base {
public:
    virtual ~Base() { cout << "Base destructor" << endl; }
};
class Derived : public Base {
    int* _data = new int[100];
public:
    ~Derived() override { delete[] _data; cout << "Derived destructor" << endl; }
};

Base* p = new Derived();
delete p;   // ✅ 先调用 Derived 析构，再调用 Base 析构
```

!!! important "黄金法则"
    如果一个类**有可能被作为基类使用**，请为其定义**虚析构函数**。

---

## 多态的典型设计模式：策略模式

```cpp
// 抽象策略
class SortStrategy {
public:
    virtual void sort(vector<int>& data) const = 0;
    virtual ~SortStrategy() = default;
};

// 具体策略
class BubbleSort : public SortStrategy {
public:
    void sort(vector<int>& data) const override {
        cout << "Using Bubble Sort" << endl;
    }
};

class QuickSort : public SortStrategy {
public:
    void sort(vector<int>& data) const override {
        cout << "Using Quick Sort" << endl;
    }
};

// 上下文
class Sorter {
    const SortStrategy* _strategy;
public:
    Sorter(const SortStrategy* strategy) : _strategy(strategy) {}
    void sort(vector<int>& data) const { _strategy->sort(data); }
};
```

---

## 多态要点总结

| 规则 | 说明 |
|------|------|
| **virtual 声明** | 基类中必须用 `virtual` 声明 |
| **override 检查** | C++11 用 `override` 让编译器检查重写是否正确 |
| **指针/引用** | 多态必须通过指针或引用，值传递会切割对象 |
| **虚析构** | 有继承关系时，基类必须有虚析构 |
| **纯虚函数** | 用 `=0` 声明，类变为抽象类 |
| **抽象类** | 不能实例化，派生类必须实现所有纯虚函数 |
| **final 关键字** | 修饰虚函数禁止重写；修饰类禁止被继承 |
