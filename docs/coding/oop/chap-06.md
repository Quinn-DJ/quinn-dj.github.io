# Chapter 6: 继承的基本概念与实现

> 继承是 OOP 的基石之一——让代码**复用**不再是复制粘贴。

---

## 什么是继承？

**继承 (Inheritance)** 是从已有类（**基类/父类**）派生出新类（**派生类/子类**）的机制，派生类自动拥有基类的所有成员。

| 关系 | 含义 | 示例 |
|------|------|------|
| **Is-a** | 派生类是基类的一种 | 狗是一种动物 |
| **Has-a** | 类包含另一个类的对象（组合） | 车有一个引擎 |

!!! tip "区分 Is-a 与 Has-a"
    - Is-a → **继承**（inheritance）: `class Dog : public Animal {}`
    - Has-a → **组合**（composition）: `class Car { Engine _engine; }`

### 继承的核心作用

| 作用 | 说明 |
|------|------|
| 代码复用 | 派生类直接继承基类的代码，无需重新编写 |
| 层次建模 | 表达现实世界中的分类关系 |
| 多态基础 | 继承是实现运行时多态的先决条件 |

---

## 继承的语法

```cpp
class Base {
    // 基类定义
};

class Derived : 访问控制 Base {
    // 派生类定义
};
```

```cpp
// 基类：动物
class Animal {
protected:
    string _name;
    int _age;

public:
    Animal(string name, int age) : _name(name), _age(age) {}
    void eat() const { cout << _name << " is eating." << endl; }
    void sleep() const { cout << _name << " is sleeping." << endl; }
};

// 派生类：狗（公有继承）
class Dog : public Animal {
public:
    Dog(string name, int age) : Animal(name, age) {}

    void bark() const {
        cout << _name << " says: Woof! Woof!" << endl;
    }
};

int main() {
    Dog dog("Buddy", 3);
    dog.eat();        // 继承自 Animal
    dog.sleep();      // 继承自 Animal
    dog.bark();       // Dog 自己的方法
}
```

---

## 三种继承方式

| 继承方式 | 基类 `public` → | 基类 `protected` → | 基类 `private` → |
|----------|-----------------|--------------------|--------------------|
| `public` 继承 | `public` | `protected` | **不可访问** |
| `protected` 继承 | `protected` | `protected` | **不可访问** |
| `private` 继承 | `private` | `private` | **不可访问** |

!!! important "关键规则"
    无论哪种继承方式，基类的 `private` 成员在派生类中都**不可直接访问**——"爷爷的私房钱，儿子和孙子都动不了"。

### 公有继承 (public) — 最常用

```cpp
class Base {
public:
    int pub;
protected:
    int pro;
private:
    int pri;
};

class Derived : public Base {
    // pub → public
    // pro → protected
    // pri → 不可访问
};
```

### 保护继承 (protected)

```cpp
class Derived : protected Base {
    // pub → protected
    // pro → protected
    // pri → 不可访问
};
```

### 私有继承 (private) — 默认方式

```cpp
class Derived : private Base {    // 等价于 class Derived : Base
    // pub → private
    // pro → private
    // pri → 不可访问
};
```

---

## 继承中的构造与析构 (Construction & Destruction in Inheritance)

### 构造顺序 (Construction Order)

1. 先构造**基类**部分
2. 再构造**派生类**成员

```cpp
class Base {
public:
    Base() { cout << "Base constructor" << endl; }
    ~Base() { cout << "Base destructor" << endl; }
};

class Derived : public Base {
public:
    Derived() { cout << "Derived constructor" << endl; }
    ~Derived() { cout << "Derived destructor" << endl; }
};

int main() {
    Derived d;
    return 0;
}

// 输出：
// Base constructor
// Derived constructor
// Derived destructor
// Base destructor
```

!!! tip "记忆顺序"
    构造：基类 → 派生类（先建基础，再建上层）
    析构：派生类 → 基类（先拆上层，再拆基础）

### 派生类的初始化列表 (Derived Class Initializer List)

派生类初始化列表（initializer list）**必须**调用基类的构造函数：

```cpp
class Animal {
private:
    string _name;
public:
    Animal(string name) : _name(name) {}
};

class Dog : public Animal {
private:
    string _breed;
public:
    // 必须通过初始化列表调用基类构造
    Dog(string name, string breed)
        : Animal(name), _breed(breed) {}
};
```

!!! warning "基类默认构造不可用时"
    如果基类没有默认构造函数（只有带参构造），派生类必须在初始化列表中显式调用基类的带参构造函数，否则编译错误。

---

## 向上与向下转型 (Upcasting & Downcasting)

### 向上转型 (Upcasting) — 安全的隐式转换 (Safe Implicit Conversion)

派生类指针/引用可以隐式转换为基类指针/引用：

```cpp
Dog dog("Buddy", 3);
Animal* animalPtr = &dog;     // ✅ 向上转型，安全
Animal& animalRef = dog;      // ✅ 向上转型
```

### 向下转型 (Downcasting) — 不安全，需显式 (Unsafe, Explicit Required)

基类指针/引用转换为派生类指针/引用是不安全的，需要使用运行时类型检查：

```cpp
Animal* a = new Dog("Buddy", 3);
// Dog* d = a;                  // ❌ 编译错误
Dog* d = dynamic_cast<Dog*>(a); // ✅ 安全向下转型
```

---

## 继承中的隐藏/重定义 (Name Hiding / Redefinition)

如果派生类定义了与基类同名的方法，基类方法被**隐藏（重定义，name hiding）**。

```cpp
class Base {
public:
    void show() { cout << "Base show()" << endl; }
    void show(int x) { cout << "Base show(" << x << ")" << endl; }
};

class Derived : public Base {
public:
    void show() { cout << "Derived show()" << endl; }
};

int main() {
    Derived d;
    d.show();        // ✅ 派生类的 show()
    // d.show(10);   // ❌ 编译错误！基类的 show(int) 被隐藏了！
    d.Base::show(10); // ✅ 通过作用域解析访问
}
```

!!! warning "名字隐藏 (Name Hiding)"
    派生类只需方法名相同就会隐藏**基类所有同名函数**（不看参数列表）。可以使用 `using Base::show` 将基类函数引入派生类作用域。

---

## is-a 关系示例：Animal 继承体系

```cpp
#include <iostream>
#include <vector>
using namespace std;

// 基类：Animal
class Animal {
protected:
    string _name;
public:
    Animal(string name) : _name(name) {}
    virtual ~Animal() {}        // 虚析构（后面会详细讲）

    void eat() const {
        cout << _name << " is eating." << endl;
    }

    virtual void makeSound() const {
        cout << _name << " makes a sound." << endl;
    }
};

// 派生类：Dog
class Dog : public Animal {
public:
    Dog(string name) : Animal(name) {}

    void makeSound() const override {
        cout << _name << " says: Woof! Woof!" << endl;
    }

    void fetch() const {
        cout << _name << " is fetching the ball." << endl;
    }
};

// 派生类：Cat
class Cat : public Animal {
public:
    Cat(string name) : Animal(name) {}

    void makeSound() const override {
        cout << _name << " says: Meow~" << endl;
    }
};

int main() {
    vector<Animal*> animals;
    animals.push_back(new Dog("Buddy"));
    animals.push_back(new Cat("Kitty"));

    for (auto animal : animals) {
        animal->makeSound();   // 多态调用
        delete animal;
    }
    return 0;
}
```

!!! tip "继承的设计原则"
    - 使用继承来表达 **Is-a** 关系
    - 使用组合来表达 **Has-a** 关系
    - 尽量遵循**里氏替换原则（Liskov Substitution Principle, LSP）**：派生类应该能替换基类使用
    - 如果只是为了复用代码，优先考虑组合而非继承
