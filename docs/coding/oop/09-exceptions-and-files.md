# 09: 异常处理与文件操作

> 异常处理把错误检测和错误处理分开。文件操作把内存数据存到磁盘——这是写健壮程序的两项基本功。

---

## Part 1: 异常处理

### 什么是异常？

**异常 (Exception)** 是程序运行时发生的非正常事件，它会中断正常的控制流程。异常机制将**错误检测**与**错误处理**清晰分离。

```cpp
// 学生成绩系统
double getScore(int studentID) {
    if (studentID < 0)
        throw invalid_argument("student ID must be non-negative");
    // ... 正常逻辑
}

void processScore(int studentID) {
    cout << "Score: " << getScore(studentID) << endl;
}

try {
    processScore(-1);                     // 尝试可能出错的代码
} catch (const invalid_argument& e) {     // 捕获特定异常
    cerr << "Error: " << e.what() << endl;
}
```

---

### try-catch-throw 机制

| 关键字 | 作用 |
|--------|------|
| `try` | 包裹可能抛出异常的代码块 |
| `throw` | 抛出异常对象 |
| `catch` | 根据异常类型捕获并处理 |

```cpp
try {
    // Step 1: 尝试执行
    vector<int> v(5);
    v.at(10) = 42;  // 抛出 out_of_range
} catch (const out_of_range& e) {
    // Step 2: 捕获特定异常
    cerr << "Out of range: " << e.what() << endl;
} catch (const exception& e) {
    // Step 3: 捕获其他标准异常
    cerr << "Exception: " << e.what() << endl;
} catch (...) {
    // Step 4: 万能"兜底"捕获
    cerr << "Unknown exception!" << endl;
}
```

### 异常匹配规则

1. **按 catch 顺序匹配**，第一个匹配的 catch 块被选中
2. **精确匹配**优先于 const/reference 匹配
3. 派生类异常被基类 catch 捕获（一般**基类放后面**）

---

### 异常的传递与栈展开

当异常抛出时，程序从抛出点沿函数调用链逐层回溯，直到找到匹配的 `catch` 或终止：

```cpp
void funcC() { throw runtime_error("Deep error"); }
void funcB() { funcC(); }   // 异常穿透 funcB
void funcA() {
    try {
        funcB();
    } catch (const runtime_error& e) {
        cerr << "Caught in funcA: " << e.what() << endl;
    }
}
```

调用链：`funcA()` -> `funcB()` -> `funcC()` -> `throw` -> 沿链回溯 -> `funcA` 捕获

---

### 构造函数中的异常

如果构造函数抛出异常，**对象被视为未构造完成**，已构造的成员自动析构，但析构函数不会执行。

```cpp
class DatabaseConnection {
    Connection* _conn;
    string _name;
public:
    DatabaseConnection(const string& cfg) : _name(cfg) {
        // _name 构造成功
        _conn = new Connection(cfg);      // _conn 分配成功
        if (!_conn->isValid())
            throw runtime_error("Failed"); // 异常！
            // 此时 _name 和 _conn 会自动清理，但是不调用析构函数
    }
};
```

---

### 自定义异常类

```cpp
class FileException : public runtime_error {
private:
    string _filename;
public:
    FileException(const string& msg, const string& filename)
        : runtime_error(msg), _filename(filename) {}
    string getFilename() const { return _filename; }
};
```

这里定义了一个继承自 `runtime_error` 的自定义异常类 `FileException`，它包含了额外的文件名信息。如果程序抛出了 `FileException`，可以通过 `getFilename()` 获取相关文件名。

需要注意的是，如果将基类 `runtime_error` 的 `catch` 放在 `FileException` 的 `catch` 之前，`FileException` 将被基类捕获，无法访问 `_filename`，同时后方的 `FileException catch` 块也不会被执行。

---

### 异常与智能指针

```cpp
// SAFE：unique_ptr 自动清理内存
void safeFunction() {
    unique_ptr<Resource> ptr1(new Resource("A"));
    unique_ptr<Resource> ptr2(new Resource("B"));
    throw runtime_error("Error!");
    // ptr1 和 ptr2 自动析构
}
```

使用智能指针（如 `unique_ptr` 或 `shared_ptr`）可以确保在异常发生时自动释放资源，不需要手动编写代码来释放指针，避免内存泄漏。

---

### 标准异常库

```
exception
├── logic_error
│   ├── invalid_argument
│   ├── out_of_range
│   └── length_error
├── runtime_error
│   ├── range_error
│   ├── overflow_error
│   └── underflow_error
└── bad_alloc (new 失败时抛出)
```

### noexcept 关键字 (C++11)

声明函数不会抛出异常，用于优化和契约：

```cpp
int safeFunc() noexcept { return 42; }  // 承诺不抛异常

// 条件 noexcept：如果 T 的移动不抛异常
template <typename T>
void mySwap(T& a, T& b) noexcept(noexcept(T(std::move(a)))) {
    T tmp(std::move(a)); a = std::move(b); b = std::move(tmp);
}
```

---

## Part 2: 文件操作

### 数据持久化

| 内存 | 磁盘 |
|------|------|
| 数据是**临时**的 | 数据可以**持久存储** |
| 程序退出后丢失 | 程序重启后依然存在 |

### C++ 文件流类的继承体系

```
ios_base
└── ios
    ├── istream ────── ifstream (文件输入)
    ├── ostream ────── ofstream (文件输出)
    └── iostream ───── fstream  (文件输入+输出)
```

---

### 文本文件写入

```cpp
#include <fstream>
#include <iostream>
using namespace std;

int main() {
    ofstream outFile("data.txt");

    if (!outFile.is_open()) {
        cerr << "Error: Cannot open file!" << endl;
        return 1;
    }

    outFile << "Hello World" << endl;
    outFile << "C++ File Operations" << endl;

    outFile.close();
    cout << "File written successfully" << endl;
    return 0;
}
```

### 文本文件读取

```cpp
ifstream inFile("data.txt");

if (!inFile) {
    cerr << "Error: Cannot open file!" << endl;
    return 1;
}

string line;
while (getline(inFile, line)) {
    cout << line << endl;
}

inFile.close();
```

这里 `cerr` 是标准错误输出流，通常用于打印错误信息。

---

### 二进制文件写入

```cpp
struct Student {
    int id;
    char name[50];
    double gpa;
};

Student s1 = {1001, "Alice", 3.8};

ofstream outFile("student.dat", ios::binary);
outFile.write(reinterpret_cast<const char*>(&s1), sizeof(Student));
outFile.close();
```

### 二进制文件读取

```cpp
Student s2;
ifstream inFile("student.dat", ios::binary);
inFile.read(reinterpret_cast<char*>(&s2), sizeof(Student));
inFile.close();
```

!!! warning "二进制文件不跨平台"
    `sizeof` 在不同平台/不同编译器可能不同。跨平台需自定义序列化格式（JSON、Protobuf 等）。

---

### 打开模式

| 模式 | 含义 |
|------|------|
| `ios::in` | 打开用于读取（ifstream 默认） |
| `ios::out` | 打开用于写入，清空已有内容（ofstream 默认） |
| `ios::app` | 追加模式，写入到文件末尾 |
| `ios::binary` | 二进制模式 |
| `ios::ate` | 打开后定位到文件末尾 |
| `ios::trunc` | 打开时清空文件内容 |

组合模式：`ios::in | ios::out`（读写）

---

### 文件指针操作

```cpp
// 读取位置
streampos pos = inFile.tellg();
inFile.seekg(0, ios::beg);   // 跳到开头
inFile.seekg(10, ios::cur);  // 后移 10 字节
inFile.seekg(-5, ios::end);  // 从末尾前移 5 字节

// 写入位置
outFile.seekp(0, ios::end);  // 跳到末尾
```

---

### 比较完整的文件操作

```cpp
// 错误检查
if (!outFile) { cerr << "File error!" << endl; return 1; }

// try-catch 包裹
try {
    outFile.write(reinterpret_cast<const char*>(&s), sizeof(Student));
    outFile.close();
} catch (const exception& e) {
    cerr << "Write error: " << e.what() << endl;
    outFile.close();
}

// RAII 确保资源释放
{
    ofstream outFile("data.txt");
    // ... 写入 ...
}   // 离开作用域，outFile 自动调用 close()
```

---

## C++17 Filesystem 库

```cpp
#include <filesystem>
namespace fs = std::filesystem;

// 创建目录
fs::create_directory("myDir");

// 检查路径是否存在
if (fs::exists("data.txt")) { /* ... */ }

// 遍历目录
for (const auto& entry : fs::directory_iterator("myDir")) {
    cout << entry.path() << endl;
}

// 文件大小
cout << fs::file_size("data.txt") << " bytes" << endl;
```
