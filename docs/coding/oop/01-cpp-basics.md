# 01: C++ 语言基础 (C++ Basics)

## C++ 简介

### 什么是 C++？

C++ 由 Bjarne Stroustrup 于 1979 年在贝尔实验室开发，最初名为 "C with Classes"，1983 年更名为 C++。它是一种静态类型、编译式、通用的编程语言。

!!! note "C++ 名字的由来"
    C++ 中的 `++` 是 C 语言的自增运算符，即 "C 语言 +1"。

### 核心特点

- **高性能**: 接近汇编的运行效率
- **面向对象**: 封装（encapsulation）、继承（inheritance）、多态（polymorphism）
- **通用**: 从操作系统到游戏引擎，从嵌入式到数据库
- **持续更新**: 三年一更新（虽然标准拖很久）

### C++ 的应用领域

| 领域 | 典型应用 |
|------|----------|
| 操作系统 | Windows、Linux 内核部分 |
| 游戏开发 | Unreal Engine、Unity 底层 |
| 嵌入式 | 物联网设备、自动驾驶 |
| 金融系统 | 高频交易引擎 |
| 图形处理 | OpenCV、CAD 软件 |

### C++ 与 C 语言的关系

C++ 是 C 语言的超集——几乎所有 C 代码无需修改即可在 C++ 编译器中编译运行。

!!! important "C++ 对 C 的增强"
    - 面向对象机制（类与对象，class and object）
    - 更严格的类型检查（`const` 关键字）
    - I/O 流（`cout`/`cin`）替代 `printf`/`scanf`
    - 命名空间（`namespace`）解决命名冲突
    - `bool` 布尔类型

### 从结构化编程到面向对象编程

| 维度 | 结构化编程（C） | 面向对象编程（C++） |
|------|----------------|-------------------|
| 核心 | 以过程为中心 | 以对象为中心 |
| 数据 | 与函数分离，全局共享 | 封装在对象内部 |
| 组织 | 按功能切分代码 | 按实体映射 |
| 扩展性 | 规模大时维护困难 | 高内聚低耦合 |

---

## First C++ Program

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to C++!" << endl;
    return 0;
}
```

### 代码结构解析

1. **`#include <iostream>`**: 预处理指令，引入输入输出流库
2. **`using namespace std;`**: 使用标准命名空间，简化代码
3. **`int main() { ... }`**: 程序入口函数，所有 C++ 程序从这里开始
4. **`cout << ... << endl;`**: 输出语句，`endl` 换行并刷新缓冲区
5. **`return 0;`**: 向操作系统返回执行成功状态

!!! warning "cout 与 printf 的区别"
    - `cout` 是类型安全的 I/O 流，编译器自动推导类型；
    - `printf` 依赖格式化字符串，类型不匹配时可能产生未定义行为。

### 注释 (Comments)

```cpp
// 这是单行注释

/*
  这是多行注释
  可以跨越多行
*/
```

---

## 变量与数据类型

### 变量的声明与初始化

```cpp
int a;              // 声明但不初始化（未定义初值）
int x, y, z;        // 一行声明多个变量
int score = 100;    // 传统赋值初始化
double pi{3.14};    // C++11 统一初始化
```

!!! warning "未初始化变量的危险"
    声明变量时不进行初始化，变量的值将是**未定义**的（一般会分配随机值），后续使用可能导致不可预测的错误。

**命名规则：**
- 只能包含字母、数字和下划线，不能以数字开头
- 严格区分大小写，`age` 和 `Age` 是两个变量
- 不能使用 C++ 关键字，如 `int`, `if`, `while`）
- 推荐使用有意义的名称，如 `studentName`, `totalScore`
- 推荐使用驼峰命名法（camelCase）或下划线命名法（snake_case）

### 基本数据类型

| 类型 | 大小 | 范围 | 场景 |
|------|------|------|------|
| `short` | 至少 2 字节 | $-2^{15}$ ~ $2^{15}-1$ | 存储小范围数值 |
| `int` | 通常 4 字节 | $-2^{31}$ ~ $2^{31}-1$ | 最常用整数类型 |
| `long` | 至少 4 字节 | 至少与 `int` 相同 | 更大范围的整数 |
| `long long` | 8 字节 | $-9\times10^{18}$ ~ $9\times10^{18}$ | 超大数值 |
| `float` | 4 字节 | $\pm3.4\times10^{38}$，约 6-7 位有效数字 | 图形计算等 |
| `double` | 8 字节 | $\pm1.7\times10^{308}$，约 15-16 位有效数字 | 科学计算（默认浮点类型） |
| `char` | 1 字节 | -128 ~ 127 或 0 ~ 255 | 存储单个字符 |
| `bool` | 1 字节 | `true` (1) 或 `false` (0) | 逻辑判断 |

!!! note "浮点数精度问题"
    浮点数是近似表示，存在精度误差（如可能产生 $0.1 + 0.2 \neq 0.3$）。比较浮点数时避免使用 `==`，应判断差值是否小于极小阈值 `EPS = 1e-9`

### 字符类型与转义字符

```cpp
char ch1 = 'A';     // 普通字符
char ch2 = '\n';    // 换行转义字符
```

**常用转义字符：**

| 转义字符 | 含义 |
|----------|------|
| `\n` | 换行 (Newline) |
| `\t` | 水平制表符 (Tab) |
| `\\` | 反斜杠本身 |
| `\'` | 单引号 |
| `\"` | 双引号 |
| `\0` | 空字符，一般用于字符串末尾，作为字符串结束标志 |

### 布尔类型

```cpp
bool isSunny = true;     // 真 (1)
bool isRaining = false;  // 假 (0)

if (isSunny) {
    cout << "Sunny day!";
}
```

!!! tip "非零即真"
    C++ 中任何非零数值被视为 `true`，零被视为 `false`。我们时常用 `if (x)` 代替 `if (x != 0)`；`if (!x)` 代替 `if (x == 0)`。

### const 常量

一般定义常量有以下两种方式：

```cpp
const double PI = 3.14159;
#define PI 3.14159
```

一般使用第一种方式（编译时会做类型检查）

!!! important "const vs #define"
    `const` 有明确的数据类型，编译器会做类型检查；`#define` 只是简单的文本替换，不检查类型。

### C++11 现代初始化特性

**统一初始化 (Uniform Initialization)**：使用 `{}` 进行初始化，能防止类型收窄：

```cpp
int x{42};       // 编译通过
// int y{3.14};  // 编译错误：禁止窄化转换
```

**auto 类型推导**：编译器自动推断变量类型：

```cpp
auto ptr = std::make_unique<int>(42);
auto it = myMap.begin();       // 有时模板类型名会很长，auto 也可以简化代码
```

**decltype 类型查询**：查询表达式或变量的实际类型：

```cpp
int x = 10;
decltype(x) y = 20;
```

这里 `decltype(x)` 表示 `y` 的类型与 `x` 相同，即 `int`，后半部分将 `y` 初始化为 20

**nullptr**：类型安全的空指针，替代 `NULL` 和 `0`。

**using 别名**：支持模板别名

```cpp
template <typename T>
using Vec = std::vector<T>;  // Vec<int> 即 vector<int>
```

---

## 输入与输出

### cout 输出语句

```cpp
// 输出字符串
cout << "Hello, World!" << endl;

// 输出变量拼接
string name = "Alice";
int age = 25;
cout << "Name: " << name << ", Age: " << age << endl;

// 转义字符
cout << "Line 1\nLine 2" << endl;
cout << "He said: \"Hi!\"" << endl;
```

上面代码的输出为

```bash
Hello, World!
Name: Alice, Age: 25
Line 1
Line 2
He said: "Hi!"

```

### cin 输入语句

```cpp
int a, b, c;
double x, y;

cout << "请输入三个整数：";
cin >> a >> b >> c;

cout << "请输入两个浮点数：";
cin >> x >> y;
```

!!! note "cin 自动忽略空白字符"
    `cin` 会自动忽略输入中的空格、回车、制表符。

---

## 运算符

### 算术运算符 (Arithmetic Operators)

| 运算符 | 含义 | 示例 |
|--------|------|------|
| `+` | 加法 | `a + b` |
| `-` | 减法 | `a - b` |
| `*` | 乘法 | `a * b` |
| `/` | 除法 | `a / b`（整数除法截断） |
| `%` | 取模 | `a % b`（仅整数） |

### 赋值运算符

```cpp
int a = 10;
a += 5;   // a = a + 5
a -= 3;   // a = a - 3
a *= 2;   // a = a * 2
a /= 4;   // a = a / 4
```

### 关系运算符

| 运算符 | 含义 |
|--------|------|
| `==` | 等于 |
| `!=` | 不等于 |
| `<` | 小于 |
| `>` | 大于 |
| `<=` | 小于等于 |
| `>=` | 大于等于 |

### 逻辑运算符

| 运算符 | 含义 | 说明 |
|--------|------|------|
| `&&` | 逻辑与 | 两边都为真才为真 |
| `||` | 逻辑或 | 一边为真即为真 |
| `!` | 逻辑非 | 取反 |

### 自增自减运算符

```cpp
int a = 5, b;

// 前置：先自增，后使用
b = ++a;   // a=6, b=6

// 后置：先使用，后自增
b = a++;   // b=6, a=7
```

!!! tip "记忆口诀"
    什么在前就先执行什么。运算符在前就先执行运算符，变量在前就先取变量值。

### 运算符优先级（简表）

| 优先级 | 运算符 | 结合性 |
|--------|--------|--------|
| 1 (高) | `()` | 左结合 |
| 2 | `!` `++` `--` `-` (负号) | 右结合 |
| 3 | `*` `/` `%` | 左结合 |
| 4 | `+` `-` | 左结合 |
| 5 | `<` `<=` `>` `>=` | 左结合 |
| 6 | `==` `!=` | 左结合 |
| 7 | `&&` | 左结合 |
| 8 (低) | `||` | 左结合 |

---

## 流程控制

### 条件语句 (Conditional Statements)

#### if / if-else / else if

一个简单的成绩等级判断示例：

```cpp
if (score >= 90) {
    cout << "A";
} else if (score >= 80) {
    cout << "B";
} else if (score >= 70) {
    cout << "C";
} else if (score >= 60) {
    cout << "D";
} else {
    cout << "F";
}
```

#### switch 语句

```cpp
int choice;
cin >> choice;

switch (choice) {
    case 1: cout << "Game Start"; break;
    case 2: cout << "Settings";   break;
    case 3: cout << "Exit";       break;
    default: cout << "Invalid";
}
```

!!! warning "别忘了 break"
    每个 `case` 末尾必须有 `break`，否则会"贯穿"（fall-through）到下一个 case。

### 循环语句 (Loop Statements)

#### while 循环

先判断后执行，如果第一次判断条件不满足，循环体不会被执行

```cpp
int product = 3;
while (product <= 100) {
    product *= 3;
}
```

#### do-while 循环

先执行，后根据执行后的状态进行判断，也就是说至少执行一次

```cpp
int password;
do {
    cout << "请输入密码：";
    cin >> password;
} while (password != 123456);
```

#### for 循环

```cpp
for (int i = 1; i <= 10; i++) {
    cout << i << " ";
}
```

!!! tip "for 循环的灵活用法"
    - `for(;;)`: 无限循环，配合 `break` 退出
    - 逗号运算符扩展：`for (int i=0, j=10; i<j; i++, j--)`

#### 嵌套循环：九九乘法表

```cpp
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++) {
        cout << j << "x" << i << "=" << i*j << "\t";
    }
    cout << endl;
}
```

### 跳转语句 (Jump Statements)

| 语句 | 作用 |
|------|------|
| `break` | 跳出当前循环或 switch |
| `continue` | 跳过当前迭代剩余部分，进入下一次迭代 |

!!! note "嵌套循环中的作用范围"
    `break` 和 `continue` 只作用于**最近一层**循环。

---

## 编程规范与良好习惯

- **数据隐藏**: 始终将数据成员设为 `private`，通过公有接口访问
- **接口清晰**: 隐藏复杂实现，提供简洁的公有接口
- **初始化**: 始终通过构造函数初始化对象，避免未初始化
- **合理使用 const**: 不修改对象状态的成员函数声明为 `const`
- **声明与实现分离**: `.h` 放声明，`.cpp` 放实现
- **头文件保护**: 使用 `#ifndef` / `#define` / `#endif` 或 `#pragma once`

---

## 编译与运行

```bash
# 编译
g++ -o main main.cpp

# 运行
./main            # Linux/Mac
# .\main.exe      # Windows
```
