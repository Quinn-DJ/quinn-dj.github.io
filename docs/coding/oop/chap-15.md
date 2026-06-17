# Chapter 15: C++ 实战项目深度解析

> 从基础语法到 SOLID 设计原则，通过四个由浅入深的实战项目，系统串联 C++ 核心编程技术、面向对象设计思想及现代 C++ 最佳实践。

---

## 项目一：学生信息管理系统

### 项目目标

构建一个基础的学生信息增删改查系统，综合运用面向对象三大支柱（封装、继承、多态），实践文件流操作实现数据持久化，并引入异常处理提升程序健壮性。

### 核心技术点

| 技术 | 应用场景 |
|------|----------|
| **封装** | `Student` 类的私有成员与公开接口 |
| **继承与多态** | `Person` 基类 → `Student`/`Teacher` 派生类 |
| **智能指针** | `unique_ptr<Person>` 管理动态对象 |
| **STL 容器** | `map<string, PersonPtr>` 按 ID 索引，`vector` 灵活排序 |
| **文件 I/O** | 将学生信息序列化保存到文件并恢复 |
| **异常处理** | 非法输入校验、文件操作失败处理 |

### 核心代码剖析

#### Person 基类与多态设计

```cpp
class Person {
protected:
    string id;
    string name;
    int age;
public:
    virtual string getId() const = 0;
    virtual void display() const = 0;
    virtual void save(ostream& out) const = 0;  // 序列化
    virtual void load(istream& in) = 0;         // 反序列化
    virtual ~Person() = default;
};

class Student : public Person {
private:
    double score;
public:
    // 实现所有纯虚函数
    string getId() const override { return id; }
    void display() const override { /* ... */ }
    void save(ostream& out) const override { /* ... */ }
    void load(istream& in) override { /* ... */ }
};
```

#### SchoolSystem 管理类

```cpp
using PersonPtr = unique_ptr<Person>;
using PersonMap = map<string, PersonPtr>;

class SchoolSystem {
private:
    PersonMap people_;  // 按 ID 有序存储，O(log n) 查找
public:
    // 多态添加：接收任意 Person 派生类
    void addPerson(PersonPtr person) {
        string id = person->getId();  // 多态调用
        if (people_.contains(id))
            throw SystemException("Duplicate ID!");
        people_[id] = std::move(person);  // 所有权转移
    }
};
```

!!! tip "设计亮点"
    - 依赖抽象（`Person`）而非具体类型，符合**依赖倒置原则 (DIP)**
    - 使用 `unique_ptr` 独占所有权，系统是对象的唯一拥有者
    - `std::move` 转移所有权，避免深拷贝

#### 类型动态识别：从文件加载

```cpp
void loadFromFile() {
    size_t count; in >> count;
    for (size_t i = 0; i < count; ++i) {
        string type; getline(in >> ws, type);
        PersonPtr p;
        if (type == "STUDENT")      p = make_unique<Student>();
        else if (type == "TEACHER") p = make_unique<Teacher>();
        p->load(in);                     // 多态调用
        people_[p->getId()] = move(p);  // 所有权转移
    }
}
```

!!! tip "虚拟构造函数模式"
    通过"类型标识 + 多态 + 智能指针"的组合，解决了异构对象集合的序列化与反序列化问题。

#### 异常处理

```cpp
class SystemException : public runtime_error {
public:
    SystemException(const string& msg) : runtime_error(msg) {}
};

// 业务逻辑中抛出
void setAge(int age) {
    if (age < 0 || age > 150)
        throw SystemException("Invalid age: " + to_string(age));
    age_ = age;
}

// 统一捕获
try {
    system.run();
} catch (const SystemException& e) {
    cerr << "Error: " << e.what() << endl;
}
```

---

## 项目二：通用数据结构实现

### 项目目标

利用模板编程从零实现泛型链表容器 `LinkedList<T>`，设计标准迭代器使其兼容 STL 风格的范围 for 循环与算法库，并引入函数式编程接口（`forEach`、`filter`、`map`）。

### 核心技术点

| 技术 | 应用 |
|------|------|
| **类模板** | `template<typename T> class LinkedList` |
| **迭代器设计** | 五种关联类型，指针式行为重载 |
| **拷贝控制** | 深拷贝构造、拷贝-交换赋值 |
| **移动语义** | 右值引用转移所有权，性能优化 |
| **函数式接口** | `forEach`、`filter`、`map` |

### 类模板框架

```cpp
template<typename T>
class LinkedList {
private:
    unique_ptr<ListNode<T>> head_;
    size_t size_ = 0;
public:
    void push_back(const T& value);
    void push_front(const T& value);
    // ...
};

// 实例化：编译器按需生成具体类
LinkedList<int> intList;
LinkedList<Student> stuList;
```

!!! tip "模板的核心思想"
    模板本身是"蓝图"，只有实际使用时编译器才实例化出针对具体类型的代码。每种不同类型生成独立的二进制代码，兼顾通用性与效率。

### 迭代器设计

```cpp
template<typename T>
class LinkedList {
public:
    class iterator {
    public:
        // 五种关联类型：STL 兼容的关键
        using iterator_category = forward_iterator_tag;
        using value_type = T;
        using difference_type = ptrdiff_t;
        using pointer = T*;
        using reference = T&;

        // 指针式行为重载
        T& operator*()  { return current_->data; }
        T* operator->() { return &(current_->data); }
        iterator& operator++() { current_ = current_->next.get(); return *this; }
        bool operator==(const iterator& o) const { return current_ == o.current_; }
        bool operator!=(const iterator& o) const { return !(*this == o); }
    private:
        ListNode<T>* current_;
    };

    iterator begin() { return iterator(head_.get()); }
    iterator end()   { return iterator(nullptr); }
};
```

实现迭代器后，自定义容器即可无缝接入标准库遍历范式：

```cpp
// 显式迭代器遍历
for (auto it = list.begin(); it != list.end(); ++it) {
    cout << *it << " ";
}

// C++11 范围 for 循环
for (int x : list) {
    cout << x << " ";
}
```

### 深拷贝：拷贝-交换技巧

```cpp
// 拷贝构造：逐节点重建
LinkedList(const LinkedList& other) : head_(nullptr), size_(0) {
    ListNode<T>* curr = other.head_.get();
    while (curr) { push_back(curr->data); curr = curr->next.get(); }
}

// 拷贝赋值：Copy-and-Swap（异常安全 + 自动处理自赋值）
LinkedList& operator=(const LinkedList& other) {
    if (this != &other) {
        LinkedList temp(other);  // 拷贝构造临时对象
        swap(*this, temp);       // 交换资源指针
    }   // temp 析构自动清理旧资源
    return *this;
}
```

!!! tip "拷贝-交换 = 黄金法则"
    先构造临时对象完成深拷贝，再交换指针转移资源。临时对象析构自动清理旧资源，天然异常安全且正确处理自赋值。

### 移动语义

```cpp
// 移动构造："窃取"源对象的资源
LinkedList(LinkedList&& other) noexcept
    : head_(std::move(other.head_)), size_(other.size_) {
    other.size_ = 0;
}

// 移动赋值
LinkedList& operator=(LinkedList&& other) noexcept {
    if (this != &other) {
        head_ = std::move(other.head_);
        size_ = other.size_;
        other.size_ = 0;
    }
    return *this;
}
```

### 函数式编程接口

```cpp
// forEach: 对每个元素执行回调
void forEach(function<void(const T&)> func) const {
    ListNode<T>* current = head_.get();
    while (current) {
        func(current->data);
        current = current->next.get();
    }
}

// filter: 返回满足条件的新链表
LinkedList<T> filter(function<bool(const T&)> predicate) const {
    LinkedList<T> result;
    forEach([&](const T& val) {
        if (predicate(val)) result.push_back(val);
    });
    return result;
}

// map: 类型转换
template<typename U>
LinkedList<U> map(function<U(const T&)> f) const {
    LinkedList<U> result;
    forEach([&](const T& val) { result.push_back(f(val)); });
    return result;
}

// 使用示例
auto evens = list.filter([](int x) { return x % 2 == 0; });
auto strs = list.map<string>([](int x) { return "n" + to_string(x); });
```

---

## 项目三：迷你电商系统

### 项目目标

以电商业务为载体，深入实践 **SOLID 设计原则**，结合 C++20 Concepts 和 C++23 `std::print` 等现代特性，构建高内聚、低耦合、可扩展的订单管理系统。

### SOLID 设计原则

| 原则 | 核心思想 | 体现 |
|------|---------|------|
| **S** 单一职责 | 一个类只应有一个变化原因 | `Product` 接口只定义产品行为 |
| **O** 开放封闭 | 对扩展开放，对修改关闭 | 新增 `Product` 子类无需修改 `Order` |
| **L** 里氏替换 | 子类可替换基类 | `PhysicalProduct`/`DigitalProduct` 无缝替换 `Product` |
| **I** 接口隔离 | 不依赖不需要的接口 | 保持接口精简，无冗余方法 |
| **D** 依赖倒置 | 依赖抽象而非具体 | `Order` 依赖 `Product` 接口而非具体类 |

### 代码剖析

```cpp
// 产品接口（单一职责：只定义产品通用行为）
class Product {
public:
    virtual ~Product() = default;
    virtual string getName() const = 0;
    virtual double getPrice() const = 0;
    virtual string getType() const = 0;
    virtual void printDetails() const = 0;
};

// 具体产品类（里氏替换：可无缝替换接口）
class PhysicalProduct : public Product { /* ... */ };
class DigitalProduct : public Product { /* ... */ };

// Order 类（开放封闭 + 依赖倒置）
class Order {
private:
    vector<shared_ptr<Product>> products_;  // 依赖抽象，非具体类
public:
    void addProduct(shared_ptr<Product> p) {
        products_.push_back(p);  // 支持任意 Product 子类
    }

    double calculateTotal() const {
        double total = 0;
        for (auto& p : products_) total += p->getPrice();  // 多态
        return total;
    }
};
```

!!! tip "为什么用 shared_ptr？"
    同一产品可能被多个订单引用，`shared_ptr` 的共享所有权语义更适合此场景。

### C++20 Concepts 应用

```cpp
// 编译时类型约束：T 必须是 Product 的派生类
template<typename T>
requires derived_from<T, Product>
vector<shared_ptr<T>> getProductsByType() const {
    vector<shared_ptr<T>> result;
    for (const auto& product : products_) {
        if (auto ptr = dynamic_pointer_cast<T>(product)) {
            result.push_back(ptr);
        }
    }
    return result;
}
```

### C++23 std::print

```cpp
// 传统方式：繁琐且易错
cout << "Name: " << name << ", Price: " << price << endl;

// C++23 现代方式：格式化字符串，类型安全
print("Name: {}, Price: ${:.2f}\n", name, price);
```

---

## 项目四：综合学生管理系统

### 项目目标

将 C++ 面向对象的核心特性进行系统化整合：封装保证数据安全，继承与多态实现复用与扩展，STL 算法简化业务逻辑，智能指针自动管理内存，Lambda 表达式灵活定义行为。

### 核心代码

```cpp
// 封装：数据隐藏 + 受控访问
class Student {
private:
    int id;
    string name;
    double score;
public:
    Student(int id_, string n_, double s_) : id(id_), name(n_), score(s_) {}
    int getId() const { return id; }
    void setScore(double s_) { score = s_; }  // 可添加验证逻辑
};

// 多态：接口与实现分离
class BaseManager {
public:
    virtual void addStudent(shared_ptr<Student> s) = 0;
    virtual shared_ptr<Student> findStudent(int id) = 0;
    virtual void printAll() = 0;
    virtual ~BaseManager() {}
};

class StudentManager : public BaseManager {
    vector<shared_ptr<Student>> students_;
public:
    void addStudent(shared_ptr<Student> s) override {
        students_.push_back(s);
    }
    // 扩展独有功能
    void sortByScore() {
        sort(students_.begin(), students_.end(),
            [](const auto& s1, const auto& s2) {
                return s1->getScore() > s2->getScore();
            });
    }
};

// STL 算法 + Lambda 表达式
auto it = find_if(students.begin(), students.end(),
    [id](const shared_ptr<Student>& s) {
        return s->getId() == id;
    });

sort(students.begin(), students.end(),
    [](const auto& s1, const auto& s2) {
        return s1->getScore() > s2->getScore();
    });
```

---

## 核心知识点回顾

| 知识领域 | 核心内容 |
|----------|---------|
| **面向对象三大支柱** | 封装隐藏实现细节，继承实现代码复用，多态提供灵活的动态行为 |
| **内存管理** | 告别手动 `new`/`delete`，使用 `unique_ptr`、`shared_ptr` 等智能指针实现 RAII 自动管理 |
| **泛型编程** | 利用模板编写类型无关的通用代码，是 STL 实现的基础技术 |
| **STL** | 容器存储数据，算法处理逻辑，迭代器充当桥梁 |
| **现代 C++ 特性** | 移动语义减少拷贝，Lambda 简化函数式编程，Concepts 增强模板约束 |
| **SOLID 设计原则** | 构建高内聚、低耦合、可扩展、可维护系统的核心指导思想 |

---

## 学习路径建议

### 核心知识深入

- **STL 深度剖析**：跳出 API 调用，深入理解容器、算法和迭代器的底层实现原理
- **并发编程**：熟练运用 `std::thread`、`std::mutex` 等工具编写高性能并发程序

### 从实践中沉淀

- **扩展项目能力**：尝试集成 Qt 图形界面，或手动实现红黑树、哈希表等复杂数据结构
- **参与开源社区**：在代码审查、Issue 讨论和版本迭代中学习优秀工程师的思维方式

> 学习的终点是创造。保持好奇心，将理论知识转化为解决实际问题的能力，在持续的探索与实践中构建属于自己的技术护城河。
