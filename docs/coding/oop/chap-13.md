# Chapter 13: 异常处理 (Exception Handling)

> 将错误检测与错误处理分离——让业务逻辑更清晰，让程序在异常场景下优雅降级。

---

## 异常处理概述

### 什么是异常？

异常是程序运行时发生的不正常情况（错误或意外），它打断了指令的正常流。

| 类别 | 说明 |
|------|------|
| **错误 (Error)** | 语法/逻辑错误，编译或测试阶段可发现修复 |
| **异常 (Exception)** | 运行时错误（除零、数组越界），无法在编译时完全预见 |

### 为什么需要异常处理？

传统 C 语言错误码机制（如 `errno`）存在诸多弊端：

| 问题 | 说明 |
|------|------|
| 易被忽略 | 错误码需要手动检查，容易因疏忽导致错误被掩盖 |
| 代码混杂 | 错误处理逻辑与正常业务代码交织，可读性差 |
| 传播困难 | 多层函数调用中，错误码需逐层传递，冗余且易出错 |

C++ 异常处理的优势：

| 优势 | 说明 |
|------|------|
| **错误集中处理** | 将错误检测 (`throw`) 和处理 (`catch`) 分离 |
| **强制错误处理** | 未捕获的异常会导致程序终止，杜绝错误被忽略 |
| **自动传播** | 异常沿调用栈自动向上传播，无需手动层层返回 |

```cpp
// C 语言方式：错误码
double divide(double a, double b) {
    if (b == 0) { errno = 1; return 0; }
    return a / b;
}
// 调用方必须手动检查 errno

// C++ 异常方式：try-catch-throw
double divide(double a, double b) {
    if (b == 0) throw "Division by zero!";
    return a / b;
}
// 调用方用 try-catch 捕获，不可忽略
```

---

## 基本语法：try-catch-throw

### 三大关键字

| 关键字 | 作用 |
|--------|------|
| `try` | 包含可能抛出异常的代码段（监控区域） |
| `throw` | 检测到错误时主动抛出异常对象，立即中断当前流程 |
| `catch` | 捕获并处理特定类型的异常 |

### 基本示例：除零错误

```cpp
#include <iostream>
using namespace std;

double divide(double n, double d) {
    if (d == 0) {
        throw string("Error: Division by zero.");
    }
    return n / d;
}

int main() {
    try {
        cout << divide(10, 0) << endl;
    } catch (const string& e) {
        cerr << "Exception caught: " << e << endl;
    }
    cout << "Program continues..." << endl;
    return 0;
}
```

!!! tip "捕获方式最佳实践"
    使用 `const T&` 捕获异常对象——引用避免了拷贝，`const` 防止意外修改。

### 数组越界示例

```cpp
#include <stdexcept>

int getElement(int arr[], int size, int idx) {
    if (idx < 0 || idx >= size) {
        throw out_of_range("Index out of bounds");
    }
    return arr[idx];
}

int main() {
    int nums[] = {1, 2, 3, 4, 5};
    try {
        cout << getElement(nums, 5, 10) << endl;
    } catch (const out_of_range& e) {
        cerr << "Caught: " << e.what() << endl;
    }
}
```

---

## 异常的规则与传递 (Exception Rules and Propagation)

### 捕获规则

```cpp
try {
    // ... 可能抛出多种异常
} catch (const DerivedException& e) {
    // 1. 子类异常（必须在前！）
} catch (const BaseException& e) {
    // 2. 父类异常
} catch (...) {
    // 3. 兜底：捕获所有异常
}
```

!!! important "捕获顺序至关重要"
    按从上到下顺序匹配。子类异常的 `catch` 块**必须放在父类之前**，否则会被父类截获。

### 异常传递 (Propagation)

若函数抛出异常但未捕获，异常会沿调用链自动向上传播，直到被某个 `catch` 块捕获或导致程序终止。

```cpp
void funcC() { throw "Error in C!"; }
void funcB() { funcC(); }          // 不处理，向上传播
void funcA() {
    try {
        funcB();
    } catch (const char* msg) {
        cout << "Caught: " << msg << endl;
    }
}

int main() {
    funcA();  // 异常在 funcA 被捕获
}
// 传播路径: funcC → funcB → funcA → main
```

### 栈展开 (Stack Unwinding)

当异常未被捕获时，程序终止当前函数执行，并**自动销毁**该函数栈帧中的所有局部对象（包括智能指针），防止资源泄漏。栈展开是智能指针实现异常安全的基础。

### 异常重新抛出

```cpp
catch (const SomeException& e) {
    // 部分处理...
    throw;  // 不带参数：重新抛出当前异常，继续向上传播
}
```

---

## 自定义异常类 (Custom Exception Classes)

### 为什么需要自定义异常？

| 优势 | 说明 |
|------|------|
| **更具体的错误信息** | 包含错误码、位置等上下文，便于调试 |
| **更好的类型区分** | 不同错误对应不同类，在 catch 中精确匹配 |
| **支持层次结构** | 通过继承构建异常体系，利用多态统一处理 |
| **符合 OOP 设计** | 封装错误信息与处理行为 |

### 实现步骤

```cpp
#include <exception>
#include <string>
using namespace std;

// 1. 继承 std::exception
class MyException : public std::exception {
protected:
    string message;
public:
    // 2. explicit 构造函数
    explicit MyException(const string& msg) : message(msg) {}
    
    // 3. 重写 what() 方法（noexcept）
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    virtual ~MyException() = default;
};

// 4. 派生具体的异常类
class InvalidScoreException : public MyException {
public:
    explicit InvalidScoreException(const string& msg)
        : MyException("InvalidScore: " + msg) {}
};
```

### 使用示例

```cpp
void setScore(double score) {
    if (score < 0 || score > 100) {
        throw InvalidScoreException(
            "Score " + to_string(score) + " is out of range [0, 100]");
    }
}

int main() {
    try {
        setScore(150);
    } catch (const InvalidScoreException& e) {
        cerr << "Caught: " << e.what() << endl;
    }
}
```

!!! tip "继承体系设计"
    建立基类 `MyException` → 派生 `InvalidScoreException` 等具体类，通过多态特性统一捕获基类引用，按需精确捕获子类。

---

## 异常与智能指针 (Exceptions and Smart Pointers)

### 裸指针的异常安全问题

```cpp
// ❌ 裸指针：异常导致内存泄漏
void unsafeFunction() {
    int* data = new int[100];
    if (someCondition) {
        throw runtime_error("Error!");  // 抛出异常
    }
    delete[] data;  // 永远不会执行！内存泄漏！
}
```

### 智能指针的解决方案

```cpp
// ✅ unique_ptr：RAII 自动释放
void safeFunction() {
    unique_ptr<int[]> data(new int[100]);
    if (someCondition) {
        throw runtime_error("Error!");  // 抛出异常
    }
    // 无需 delete！局部对象析构时自动释放
}
```

!!! important "RAII 核心价值"
    资源获取即初始化 (RAII)：将资源生命周期与对象绑定。无论正常结束还是异常退出，局部对象的析构函数都会被调用，资源必定被释放。

### shared_ptr 与共享资源

```cpp
void processResource(shared_ptr<Resource> res) {
    if (/* 处理失败 */) {
        throw runtime_error("Error");
    }
}

int main() {
    try {
        auto res = make_shared<Resource>();
        processResource(res);
    } catch (const exception& e) {
        cerr << "Error: " << e.what() << endl;
    }
    // res 自动释放，引用计数归零
}
```

!!! warning "警惕循环引用"
    若对象内部互相持有 `shared_ptr` 会形成循环引用导致内存泄漏，此时需使用 `weak_ptr` 打破循环。

---

## 标准异常库 (Standard Exception Library)

### 层次结构

```
std::exception
├── std::logic_error       // 逻辑错误（可在运行前检测）
│   ├── invalid_argument   // 无效参数
│   ├── out_of_range      // 越界访问
│   ├── length_error      // 长度错误
│   └── domain_error      // 域错误
├── std::runtime_error     // 运行时错误（仅运行时检测）
│   ├── range_error       // 范围错误
│   ├── overflow_error    // 上溢错误
│   └── underflow_error   // 下溢错误
├── std::bad_alloc        // 内存分配失败
├── std::bad_cast         // 类型转换失败
└── std::bad_typeid       // typeid 空指针
```

### 常用标准异常

| 异常类型 | 触发场景 |
|----------|---------|
| `std::invalid_argument` | 函数接收到无效参数（如空字符串） |
| `std::out_of_range` | 访问超出有效范围的元素（数组越界） |
| `std::length_error` | 创建超出最大长度的对象 |
| `std::runtime_error` | 运行时通用错误 |
| `std::bad_alloc` | `new` 操作符分配内存失败 |
| `std::bad_cast` | `dynamic_cast` 不安全的类型转换 |

### 使用标准异常

```cpp
#include <stdexcept>

void processData(const vector<int>& data, int index, const string& s) {
    if (index < 0 || index >= data.size()) {
        throw out_of_range("Index out of bounds.");
    }
    if (s.empty()) {
        throw invalid_argument("Empty string.");
    }
    // ... 处理逻辑 ...
}

int main() {
    vector<int> nums = {10, 20, 30};
    try {
        processData(nums, 5, "Hello");  // 越界
    } catch (const out_of_range& e) {
        cerr << "Error: " << e.what() << endl;
    }
}
```

---

## 最佳实践与注意事项

| 实践 | 说明 |
|------|------|
| **只在异常情况下使用异常** | 不要用异常控制正常流程（如代替 if-else） |
| **捕获具体类型** | 避免滥用 `catch(...)`，精确捕获便于处理 |
| **保持异常对象轻量** | 栈展开期间可能多次拷贝 |
| **析构函数禁止抛异常** | 必须在内部捕获处理 |
| **使用 RAII 管理资源** | 智能指针、容器等确保异常安全 |
| **使用 noexcept (noexcept specifier)** | 明确函数不抛出异常，有助于编译器优化 |
| **文档化异常** | 在函数注释中说明可能抛出的异常类型 |

### noexcept 关键字 (noexcept Keyword, C++11)

```cpp
// 明确声明不抛出异常的函数
void safeFunc() noexcept { /* 保证不抛异常 */ }

// 有助于编译器进行优化，并明确函数的异常安全等级
```

---

## 总结

| 核心要点 | 说明 |
|----------|------|
| 基本语法 | `try` 监控，`throw` 抛出，`catch` 捕获 |
| 捕获规则 | 类型匹配，子类在前父类在后，`catch(...)` 兜底 |
| 异常传播 | 沿调用栈自动向上传播，触发栈展开 |
| 自定义异常 | 继承 `std::exception`，重写 `what()` |
| 智能指针 | RAII 保证异常安全，杜绝内存泄漏 |
| 标准异常库 | `logic_error`（逻辑错误）与 `runtime_error`（运行错误）两类 |
| 最佳实践 | 只在异常情况下使用，析构函数不抛异常，文档化异常 |
