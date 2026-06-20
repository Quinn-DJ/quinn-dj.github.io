# Chapter 9: 多态的基本概念与虚函数

> 多态是 OOP 的终极形态——同一句代码，在不同对象上表现出不同的行为。

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
    void makeSound() const override {
        cout << "Woof! Woof!" << endl;
    }
};

class Cat : public Animal {
public:
    void makeSound() const override {
        cout << "Meow~" << endl;
    }
};

void playSound(const Animal& animal) {
    animal.makeSound();   // 多态：实际调用取决于对象的真实类型
}

int main() {
    Dog dog;
    Cat cat;

    playSound(dog);       // Woof! Woof!
    playSound(cat);       // Meow~
}
```

### 多态的作用

| 作用 | 说明 |
|------|------|
| **代码通用化** | 用基类接口处理所有派生类，无需逐个判断类型 |
| **可扩展性** | 新增派生类无需修改已有代码（OCP — Open-Closed Principle，开闭原则） |
| **框架设计** | 定义抽象接口，让用户提供具体实现 |

!!! tip "多态 vs 重定义"
    没有 `virtual` 关键字，就是**重定义**（静态绑定）。
    有 `virtual` 关键字，就是**多态**（动态绑定）。
    这是两种完全不同的机制。

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
    如果函数参数使用值传递（而非指针/引用）会发生**对象切割 (Slicing)**：
    ```cpp
    void func(Animal a) {   // 值传递：切割！
        a.makeSound();      // 总是调用 Animal 的版本
    }
    ```

### 虚函数的访问控制

```cpp
class Base {
private:
    virtual void secretFunc() { cout << "Base secret" << endl; }
};

class Derived : public Base {
    void secretFunc() override { cout << "Derived secret" << endl; }
};

int main() {
    Base* p = new Derived;
    // p->secretFunc();     // ❌ 编译错误：private 不可访问
    delete p;
}
```

---

## 虚函数表与动态绑定 (Virtual Table & Dynamic Binding)

### C++ 实现多态的底层原理

每个包含虚函数的类都有一个**虚函数表 (vtable)**，表中存储了该类的所有虚函数地址。

```cpp
class Animal {
public:
    virtual void eat() { cout << "Animal eat" << endl; }
    virtual void sleep() { cout << "Animal sleep" << endl; }
    virtual ~Animal() {}
};
```

### 内存布局 (Memory Layout)

```
Animal 对象内存布局 (Memory Layout):
┌─────────────────────┐
│ vptr (虚表指针)      │ ← 指向 Animal 的 vtable
├─────────────────────┤
│ 其他数据成员...       │
└─────────────────────┘

Animal 的 vtable:
┌─────────────────────┐
│ &Animal::eat()       │
│ &Animal::sleep()     │
│ &Animal::~Animal()   │
└─────────────────────┘

Derived 的 vtable（重写了 eat）:
┌─────────────────────┐
│ &Derived::eat()      │  ← 指向派生类版本
│ &Animal::sleep()     │  ← 未重写，指向基类版本
│ &Derived::~Derived() │
└─────────────────────┘
```

### 动态绑定过程

```cpp
Animal* p = new Dog();
p->eat();
```

调用 `p->eat()` 时实际执行的是：

1. 通过 `p` 找到对象的 **vptr**
2. 通过 vptr 找到 **vtable**
3. 在 vtable 中找到 `eat()` 的位置
4. 调用 `eat()` 的实际地址（`Dog::eat`）

!!! tip "为什么多态需要指针/引用？"
    因为指针/引用的大小是固定的，编译器可以在运行时通过 vptr 去找实际类型。如果是值类型的对象，编译器**编译时就知道具体类型**，不需要动态绑定。

---

## 静态绑定 vs 动态绑定

| 特性 | 静态绑定 | 动态绑定 |
|------|----------|----------|
| 时机 | 编译期 | 运行期 |
| 依据 | 指针/引用静态类型 | 对象实际类型 |
| 性能 | 快（无额外开销） | 稍慢（通过 vtable 间接调用） |
| 适用 | 非虚函数 | 虚函数 |
| 灵活性 | 低 | 高 |

---

## 纯虚函数与抽象类

### 纯虚函数

纯虚函数是在基类中没有实现的虚函数，语法上赋值为 0：

```cpp
class Shape {
public:
    virtual double getArea() const = 0;    // 纯虚函数
    virtual double getPerimeter() const = 0; // 纯虚函数
};
```

### 抽象类

- **包含纯虚函数的类**称为抽象类
- **不能实例化抽象类**
- 派生类必须实现所有纯虚函数，否则自身也是抽象类

```cpp
// Shape 是抽象类：不能创建 Shape 对象
// Shape s;  // ❌ 编译错误！

class Circle : public Shape {
private:
    double _radius;
public:
    Circle(double r) : _radius(r) {}
    double getArea() const override { return 3.14159 * _radius * _radius; }
    double getPerimeter() const override { return 2 * 3.14159 * _radius; }
};

class Rectangle : public Shape {
private:
    double _width, _height;
public:
    Rectangle(double w, double h) : _width(w), _height(h) {}
    double getArea() const override { return _width * _height; }
    double getPerimeter() const override { return 2 * (_width + _height); }
};

int main() {
    Shape* shapes[] = { new Circle(5), new Rectangle(3, 4) };
    for (auto s : shapes) {
        cout << "Area: " << s->getArea() << endl;       // 多态
        cout << "Perimeter: " << s->getPerimeter() << endl; // 多态
        delete s;
    }
}
```

---

## 虚析构函数

### 为什么需要虚析构函数？

如果通过基类指针删除派生类对象，而析构函数不是虚函数，则**只调用基类的析构函数，不会调用派生类的析构函数**，导致资源泄漏。

```cpp
// ❌ 错误：非虚析构
class Base {
public:
    ~Base() { cout << "Base destructor" << endl; }
};

class Derived : public Base {
private:
    int* _data = new int[100];
public:
    ~Derived() {
        delete[] _data;
        cout << "Derived destructor" << endl;
    }
};

int main() {
    Base* p = new Derived();
    delete p;   // ❌ 只调用 Base 的析构！Derived 的资源泄漏！
}
```

```cpp
// ✅ 正确：虚析构
class Base {
public:
    virtual ~Base() { cout << "Base destructor" << endl; }
};

class Derived : public Base {
private:
    int* _data = new int[100];
public:
    ~Derived() override {
        delete[] _data;
        cout << "Derived destructor" << endl;
    }
};

int main() {
    Base* p = new Derived();
    delete p;   // ✅ 先调用 Derived 析构，再调用 Base 析构
}
```

!!! important "黄金法则"
    如果一个类**有可能被作为基类使用**，请为其定义**虚析构函数**。否则通过基类指针 `delete` 派生类对象时，派生类的析构函数不会被调用。

---

## 多态的典型设计模式

### 策略模式示例

```cpp
// 抽象策略
class SortStrategy {
public:
    virtual void sort(vector<int>& data) const = 0;
    virtual ~SortStrategy() = default;
};

// 具体策略 1
class BubbleSort : public SortStrategy {
public:
    void sort(vector<int>& data) const override {
        cout << "Using Bubble Sort" << endl;
        // 冒泡排序实现...
    }
};

// 具体策略 2
class QuickSort : public SortStrategy {
public:
    void sort(vector<int>& data) const override {
        cout << "Using Quick Sort" << endl;
        // 快速排序实现...
    }
};

// 上下文
class Sorter {
private:
    const SortStrategy* _strategy;
public:
    Sorter(const SortStrategy* strategy) : _strategy(strategy) {}
    void sort(vector<int>& data) const { _strategy->sort(data); }
};

int main() {
    vector<int> data = {5, 3, 1, 4, 2};

    Sorter s1(new BubbleSort());
    s1.sort(data);   // Using Bubble Sort

    Sorter s2(new QuickSort());
    s2.sort(data);   // Using Quick Sort
}
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
