# Chapter 14: 文件操作 (File Operations)

> 将内存中的临时数据保存到磁盘，让程序在重启后依然能延续之前的状态——这是构建可靠应用的基础能力。

---

## 文件操作概述

### 什么是数据持久化？

数据持久化是将程序运行时在内存中的临时数据，保存到磁盘、数据库等永久性存储介质中，确保程序重启或系统关机后数据依然存在。

### 常见应用场景

| 场景 | 说明 |
|------|------|
| **软件配置存储** | 保存用户设置、偏好选项 |
| **日志记录** | 记录运行状态、错误信息、操作轨迹 |
| **用户数据管理** | 游戏存档、用户资料、订单信息 |
| **数据交换与共享** | CSV、JSON 等格式在不同程序间传输数据 |

### C++ 中的文件操作方式

| 方式 | 特点 | 适用场景 |
|------|------|----------|
| **C 标准库** (`stdio.h`) | 底层、高效、兼容性好 | 简单操作，与 C 代码交互 |
| **C++ 文件流** (`<fstream>`) | 面向对象、类型安全、功能强大 | 现代 C++ 程序主流选择 |
| **C++17 Filesystem** (`<filesystem>`) | 标准库、现代设计、跨平台 | 新项目，追求代码现代化 |

---

## C++ 文件流类详解

### 三大核心类

| 类 | 头文件 | 作用 |
|----|--------|------|
| `std::ifstream` | `<fstream>` | 输入文件流，用于从文件**读取**数据 |
| `std::ofstream` | `<fstream>` | 输出文件流，用于向文件**写入**数据 |
| `std::fstream` | `<fstream>` | 文件流，支持同时**读写**操作 |

### 类层次结构

```
ios_base
 └── ios
      ├── istream  ←── ifstream (读文件)
      ├── ostream  ←── ofstream (写文件)
      └── iostream ←── fstream  (读写文件)
```

### 文件打开模式

| 模式 | 说明 |
|------|------|
| `ios::in` | 以读取模式打开（`ifstream` 默认） |
| `ios::out` | 以写入模式打开，存在则清空（`ofstream` 默认） |
| `ios::app` | 追加模式，写入数据添加到文件末尾 |
| `ios::ate` | 打开后定位到文件末尾，但可在文件中移动 |
| `ios::trunc` | 若文件存在，截断为空 |
| `ios::binary` | 二进制模式（非文本模式） |

模式可以通过 `|` 运算符组合：`ios::in | ios::out | ios::binary`。

### 基本操作流程

```
包含头文件 <fstream> → 创建流对象并打开 → 检查打开状态 → 执行读写 → 关闭文件
```

```cpp
#include <iostream>
#include <fstream>
using namespace std;

int main() {
    // 写入流程
    ofstream outFile("example.txt");
    if (outFile.is_open()) {
        outFile << "Hello, File!" << endl;
        outFile.close();
    }

    // 读取流程
    ifstream inFile;
    inFile.open("example.txt");
    if (inFile.is_open()) {
        string line;
        getline(inFile, line);
        cout << line << endl;
        inFile.close();
    }
    return 0;
}
```

---

## 文本文件操作

### 写入文本文件

```cpp
#include <fstream>

int main() {
    ofstream outFile("students.txt");
    if (!outFile) { /* 错误处理 */ }

    // 格式化写入
    outFile << "Zhang San" << " " << 1001 << " " << 95.5 << endl;
    outFile << "Li Si"    << " " << 1002 << " " << 88.0 << endl;
    outFile << "Wang Wu"  << " " << 1003 << " " << 92.0 << endl;
    outFile.close();
    return 0;
}
```

输出结果 (`students.txt`)：
```
Zhang San 1001 95.5
Li Si 1002 88.0
Wang Wu 1003 92.0
```

### 读取文本文件

```cpp
struct Student { string name; int id; float score; };

int main() {
    ifstream inFile("students.txt");
    if (!inFile) return 1;

    vector<Student> students;
    Student s;

    // 按格式逐条读取，读到文件末尾自动停止
    while (inFile >> s.name >> s.id >> s.score) {
        students.push_back(s);
    }

    for (const auto& stu : students) {
        cout << stu.name << ", " << stu.id << endl;
    }
    inFile.close();
}
```

### 逐行读取：getline

```cpp
string line;
while (getline(inFile, line)) {
    cout << "读取到: " << line << endl;
}
```

!!! warning "混合输入陷阱"
    先使用 `>>` 再使用 `getline` 时，缓冲区中残留的 `\n` 会被 `getline` 读取为空行。
    
    解决方案：
    ```cpp
    inFile.ignore();  // 忽略换行符后再 getline
    ```

---

## 二进制文件操作

### 文本文件 vs 二进制文件

| 特性 | 文本文件 | 二进制文件 |
|------|---------|-----------|
| 可读性 | 人类可直接阅读 | 不可读，需专门工具 |
| 存储效率 | 字符编码冗余，体积较大 | 直接存储内存数据，体积小 |
| 读写速度 | 需要格式转换 | 直接读写内存数据，速度快 |
| 适用场景 | 配置文件、日志、数据交换 | 程序内部持久化、大数据存储 |

### 二进制写入 (write)

```cpp
// 定义 POD 类型结构体（避免使用 std::string）
struct Student {
    char name[50];
    int id;
    float score;
};

int main() {
    Student s = {"Zhang San", 1001, 95.5f};

    // 必须指定 binary 模式
    ofstream f("data.bin", ios::out | ios::binary);

    // write(指针转 char*, 字节数)
    f.write(reinterpret_cast<const char*>(&s), sizeof(s));
    f.close();
}
```

!!! warning "POD 类型限制"
    二进制写入仅适合简单的 POD 类型。避免写入包含指针或复杂 STL 容器（如 `std::string`）的对象，防止序列化失效。

### 二进制读取 (read)

```cpp
Student s;
ifstream inFile("data.bin", ios::binary);

// read(接收地址转 char*, 字节数)
inFile.read(reinterpret_cast<char*>(&s), sizeof(s));
// 字节数必须与写入时严格一致
```

### 随机访问：seekg / seekp

```cpp
fstream fs("students.bin", ios::in | ios::out | ios::binary);

// seekg: 定位读指针到第二个学生
fs.seekg(1 * sizeof(Student), ios::beg);
fs.read(reinterpret_cast<char*>(&s), sizeof(s));

// 修改成绩
s.score = 99.0f;

// seekp: 定位写指针并回写
fs.seekp(1 * sizeof(Student), ios::beg);
fs.write(reinterpret_cast<const char*>(&s), sizeof(s));
fs.close();
```

| 偏移参考 | 说明 |
|----------|------|
| `ios::beg` | 相对于文件开头 |
| `ios::cur` | 相对于当前指针位置 |
| `ios::end` | 相对于文件末尾 |

---

## 健壮的文件操作

### 常见错误

| 错误类型 | 说明 |
|----------|------|
| 文件不存在 | 路径错误或文件未创建 |
| 权限不足 | 无读取/写入权限 |
| 文件被占用 | 被其他进程锁定 |
| 磁盘空间不足 | 写入时空间不够 |
| 数据格式错误 | 解析时格式不匹配 |

### 结合异常处理

```cpp
#include <fstream>
#include <stdexcept>

int main() {
    ofstream outFile;
    try {
        // 显式开启异常机制（默认不抛出）
        outFile.exceptions(ofstream::failbit | ofstream::badbit);
        outFile.open("protected.txt");
        outFile << "Data..." << endl;
        outFile.close();
    } catch (const exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
}
```

!!! tip "文件流异常默认关闭"
    默认情况下文件流不抛出异常。需要通过 `exceptions()` 方法显式设置 `failbit` 和 `badbit`。

### 智能指针管理文件资源

```cpp
#include <memory>
#include <fstream>

struct FileCloser {
    void operator()(ofstream* f) const {
        if (f && f->is_open()) f->close();
    }
};

int main() {
    unique_ptr<ofstream, FileCloser> pFile(
        new ofstream("auto_close.txt"));

    if (*pFile) {
        *pFile << "资源自动管理" << endl;
    }
    // 离开作用域自动调用 FileCloser，无需手动 close
}
```

!!! tip "自定义删除器"
    将 `FileCloser` 作为 `unique_ptr` 的删除器，确保在释放内存前先调用 `close()`。无论正常结束还是异常抛出，文件句柄都不会泄漏。

---

## C++17 Filesystem 库

### 概述

C++17 标准库的核心组件，提供跨平台、类型安全的文件系统操作，彻底替代传统的依赖操作系统 API 的繁琐方法。

```cpp
#include <filesystem>
namespace fs = std::filesystem;
```

### path 类

```cpp
fs::path p1 = "data";
fs::path p2 = "students.txt";

// 自动处理跨平台路径分隔符
fs::path full = p1 / p2;  // "data/students.txt" 或 "data\students.txt"

cout << "文件名: " << full.filename()      << endl;
cout << "扩展名: " << full.extension()     << endl;  // ".txt"
cout << "父目录: " << full.parent_path()  << endl;  // "data"

// 检查文件是否存在
if (fs::exists(full)) { /* ... */ }
```

### 常用操作

```cpp
// 路径与状态检查
fs::exists(path)            // 路径是否存在
fs::is_directory(path)      // 是否为目录
fs::is_regular_file(path)   // 是否为普通文件

// 目录操作
fs::create_directory(path)       // 创建单个目录
fs::create_directories(path)     // 递归创建（mkdir -p）

// 文件信息
fs::file_size(path)              // 文件大小（字节）
fs::last_write_time(path)        // 最后修改时间

// 文件操作
fs::copy(src, dst)               // 复制
fs::rename(old, new_name)        // 重命名/移动
fs::remove(path)                 // 删除文件或空目录
fs::remove_all(path)             // 递归删除（rm -rf）
```

### 遍历目录

```cpp
fs::path dir = ".";

// directory_iterator: 浅层遍历
for (const auto& entry : fs::directory_iterator(dir)) {
    cout << entry.path();
    if (entry.is_directory()) {
        cout << " [目录]";
    } else if (entry.is_regular_file()) {
        cout << " [文件] 大小: " << entry.file_size();
    }
    cout << endl;
}

// recursive_directory_iterator: 递归遍历所有子目录
```

---

## 总结

| 要点 | 说明 |
|------|------|
| **数据持久化** | 将内存数据保存到永久存储设备 |
| **三大文件流类** | `ifstream`(读)、`ofstream`(写)、`fstream`(读写) |
| **文本文件** | 使用 `<<` `>>` 格式化读写，`getline` 逐行读取 |
| **二进制文件** | 使用 `read()` `write()` 直接操作内存，需指定 `binary` 模式 |
| **随机访问** | `seekg` 定位读指针，`seekp` 定位写指针 |
| **健壮性** | 结合异常处理和智能指针，编写安全代码 |
| **C++17 Filesystem** | 标准化的跨平台文件系统操作接口 |
