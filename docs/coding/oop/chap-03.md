---
title: Chapter 3：控制语句（下）
authors: [Quinn]
comments: true
date: 2026-05-04
tags:
  - 面向对象编程
---

# Chapter 3: 控制语句（下）

上一章我们介绍了 `if`、`if...else` 和 `while` 三种控制语句，以及自顶向下逐步细化的算法开发方法。本章将继续介绍 C++ 剩余的控制语句——`for`、`do...while`、`switch`、`break` 和 `continue`，并引入 C++20 的文本格式化功能和逻辑运算符。

## 计数控制迭代的要素

在上一章中我们用 `while` 循环做过计数控制迭代的例子，现在让我们来归纳一下计数控制迭代的四个关键要素：

1. **控制变量**（或循环计数器）
2. 控制变量的**初始值**
3. **循环继续条件**——决定循环是否继续执行
4. 控制变量的**增量**——在每次循环迭代中应用

下面用一个简单的例子来回顾：输出 1 到 10。

```cpp
// fig04_01.cpp
// Counter-controlled iteration with the while iteration statement.
#include <iostream>
using namespace std;

int main() {
   int counter{1}; // declare and initialize control variable

   while (counter <= 10) { // loop-continuation condition
      cout << counter << " ";
      ++counter; // increment control variable
   }

   cout << "\n";
}
```
```output
1 2 3 4 5 6 7 8 9 10
```

第 7、9、11 行分别定义了计数控制迭代的四个要素中的三个——控制变量的声明与初始化、循环继续条件和控制变量的增量。第 10 行在每次循环迭代中显示控制变量的值。循环在控制变量超过 10 时终止。

!!! warning
    始终使用**整数**来控制计数循环。浮点数是近似值，用浮点变量控制计数循环可能导致不精确的计数值和不准确的终止测试，甚至导致循环无法终止。

!!! warning
    在 `while` 条件右括号后直接放分号会使循环体变成一个空语句，这通常是一个**逻辑错误**。

## for 循环

`for` 迭代语句将计数控制迭代的所有细节集中在**一行代码**中。图 4.2 用 `for` 语句重新实现了上面的例子。

```cpp
// fig04_02.cpp
// Counter-controlled iteration with the for iteration statement.
#include <iostream>
using namespace std;

int main() {
   // for statement header includes initialization,
   // loop-continuation condition and increment
   for (int counter{1}; counter <= 10; ++counter) {
      cout << counter << " ";
   }

   cout << "\n";
}
```
```output
1 2 3 4 5 6 7 8 9 10
```

### for 语句头部的结构

`for` 语句的头部包含了计数控制迭代所需的全部信息：

```
for (int counter{1}; counter <= 10; ++counter)
     ↑                ↑                 ↑
     初始化          循环继续条件       增量
```

- **初始化**：声明循环控制变量并赋予初始值（第 9 行的 `int counter{1}`）
- **循环继续条件**：两个分号之间的条件（`counter <= 10`），决定是否继续循环
- **增量**：修改控制变量的值（`++counter`），使循环继续条件最终变为 `false`

### 执行流程

当第 9–11 行开始执行时，`for` 语句声明控制变量 `counter` 并初始化为 1。然后测试循环继续条件 `counter <= 10`，因为初始值为 1，条件为 true，所以执行循环体输出 `counter` 的值。执行完循环体后，执行增量表达式 `++counter`，将 `counter` 加 1。然后再次测试循环继续条件……这个过程一直持续到 `counter` 变为 11，此时循环继续条件为 false，迭代终止。

!!! warning
    如果循环继续条件误写为 `counter < 10` 而不是 `counter <= 10`，循环只会迭代 9 次而非 10 次。这种错误叫做**差一错误**（off-by-one error），非常常见。

### 一般格式

```cpp
for (initialization; loopContinuationCondition; increment) {
    statement(s)
}
```

初始化表达式和增量表达式都可以是用逗号分隔的列表，包含多个初始化或多个增量表达式，从左到右依次求值。

### 控制变量的作用域

如果在初始化表达式中声明了控制变量，那么它只能在 `for` 语句内部使用，不能超出 `for` 语句。这种受限的使用范围叫做变量的**作用域**（scope）。将变量的作用域限制在需要的地方是一种好习惯。

### 头部表达式是可选的

`for` 头部中的三个表达式都是可选的：

- **省略循环继续条件**：条件永远为 true，创建无限循环。有时这是有意为之的。
- **省略初始化表达式**：如果程序在循环前已经初始化了控制变量。
- **省略增量表达式**：如果程序在循环体中计算增量，或者不需要增量。

### 增量表达式的等价写法

在 `for` 的增量表达式中，以下写法都是等价的（因为在 `for` 中增量表达式像独立语句一样在循环体末尾执行）：

```cpp
counter = counter + 1
counter += 1
++counter
counter++
```

我们推荐使用前置自增 `++counter`。在运算符重载的讨论中你会看到，前置自增可能有性能优势。

!!! warning
    在 `for` 条件右括号后直接放分号会使循环体变成空语句，这通常是一个**逻辑错误**。同样，如果循环继续条件永远不会变为 false，会导致**无限循环**。

## for 循环示例

下面展示了几种不同的 `for` 循环头部，控制变量以不同的方式变化：

| 控制变量的变化 | `for` 头部 |
|---|---|
| 从 1 到 100，步长 1 | `for (int i{1}; i <= 100; ++i)` |
| 从 100 递减到 1，步长 1 | `for (int i{100}; i >= 1; --i)` |
| 从 7 到 77，步长 7 | `for (int i{7}; i <= 77; i += 7)` |
| 从 20 递减到 2，步长 2 | `for (int i{20}; i >= 2; i -= 2)` |
| 2, 5, 8, 11, 14, 17, 20 | `for (int i{2}; i <= 20; i += 3)` |
| 99, 88, 77, ..., 11, 0 | `for (int i{99}; i >= 0; i -= 11)` |

!!! warning
    不要在循环继续条件中使用相等运算符（`!=` 或 `==`），如果控制变量的增减步长大于 1 的话。例如：

    ```cpp
    for (int counter{1}; counter != 10; counter += 2)
    ```

    `counter` 每次增加 2，产生 3, 5, 7, 9, 11, ...，永远不会等于 10，所以 `counter != 10` 永远为 true，导致无限循环。

!!! warning
    在**递减**循环中使用了错误的关系运算符也是常见的逻辑错误，比如用 `i <= 1` 而不是 `i >= 1`。

## 求偶数和 —— C++20 文本格式化

下面的程序使用 `for` 语句计算 2 到 20 之间所有偶整数的和，并引入了 C++20 的文本格式化功能。

```cpp
// fig04_03.cpp
// Summing integers with the for statement; introducing text formatting.
#include <format>
#include <iostream>
using namespace std;

int main() {
   int total{0};

   // total even integers from 2 through 20
   for (int number{2}; number <= 20; number += 2) {
      total += number;
   }

   cout << format("Sum is {}\n", total);
}
```
```output
Sum is 110
```

### C++20 文本格式化 `format` 函数

C++20 引入了强大的字符串格式化功能，通过 `<format>` 头文件中的 `format` 函数使用。语法类似于 Python、C# 和 Rust 的格式化语法。

```cpp
cout << format("Sum is {}\n", total);
```

`format` 函数的第一个参数是**格式字符串**（format string），其中包含一个或多个用花括号 `{}` 定界的**占位符**（placeholder）。函数将占位符替换为后面参数的值。如果有多个占位符，它们从左到右依次对应后面的参数。

!!! note
    `format` 函数中的 `{}` 是最基本的占位符，它只是简单地将值插入字符串。后面我们会看到，占位符中还可以指定更多的格式化指令。

## 复利计算 —— 格式说明符

下面我们来做一个复利计算的例子，同时引入更多的格式化说明符。

> 某人投资 $1,000，年利率 5%，假设所有利息留在账户中，计算并打印每年末的账户余额，持续 10 年。公式如下：
>
> $a = p(1 + r)^n$
>
> 其中 $p$ 是本金，$r$ 是年利率，$n$ 是年数，$a$ 是第 $n$ 年末的金额。

```cpp
// fig04_04.cpp
// Compound-interest calculations with for.
#include <format>
#include <iostream>
#include <cmath> // for pow function
using namespace std;

int main() {
   double principal{1000.00}; // initial amount before interest
   double rate{0.05}; // interest rate

   cout << format("Initial principal: {:>7.2f}\n", principal)
        << format("    Interest rate: {:>7.2f}\n", rate);

   // display headers
   cout << format("\n{}{:>20}\n", "Year", "Amount on deposit");

   // calculate amount on deposit for each of ten years
   for (int year{1}; year <= 10; ++year) {
      // calculate amount on deposit at the end of the specified year
      double amount{principal * pow(1.0 + rate, year)} ;

      // display the year and the amount
      cout << format("{:>4d}{:>20.2f}\n", year, amount);
   }
}
```
```output
Initial principal: 1000.00
    Interest rate:    0.05

Year       Amount on deposit
   1                 1050.00
   2                 1102.50
   3                 1157.63
   4                 1215.51
   5                 1276.28
   6                 1340.10
   7                 1407.10
   8                 1477.46
   9                 1551.33
  10                 1628.89
```

### 格式说明符详解

占位符 `{}` 中可以包含以冒号 `:` 开头的**格式说明符**（format specifier），指定如何格式化对应的值。

#### 格式化本金和利率

```cpp
format("Initial principal: {:>7.2f}\n", principal)
```

占位符 `{:>7.2f}` 的含义：

| 部分 | 含义 |
|------|------|
| `>` | 右对齐（right-align） |
| `7` | 字段宽度为 7 个字符 |
| `.2` | 小数点后保留 2 位 |
| `f` | 浮点数格式（fixed-point） |

`principal` 的值为 1000.00，恰好需要 7 个字符（包括小数点），所以填满整个 7 字符宽度。`rate` 的值为 0.05，只需要 4 个字符，所以左填充 3 个空格，右对齐显示。

!!! note
    数值默认就是右对齐的，所以 `>` 在这里可以省略。你也可以用 `<` 来左对齐。

#### 格式化表头

```cpp
format("\n{}{:>20}\n", "Year", "Amount on deposit")
```

第一个 `{}` 只是简单地将字符串 `"Year"` 插入。第二个 `{:>20}` 表示将字符串 `"Amount on deposit"`（17 个字符）右对齐在 20 个字符的字段中，因此前面填充 3 个空格。

!!! note
    字符串默认是**左对齐**的，所以需要用 `>` 来强制右对齐。如果要显示的字符串长度超过了指定的字段宽度，字段宽度会自动扩展以容纳所有字符。

#### 格式化年份和金额

```cpp
format("{:>4d}{:>20.2f}\n", year, amount)
```

- `{:>4d}`：将 `year` 格式化为十进制整数（`d`），右对齐在 4 字符宽度内，使所有年份值对齐在 "Year" 列下
- `{:>20.2f}`：将 `amount` 格式化为浮点数，右对齐在 20 字符宽度内，小数点后 2 位，使金额的小数点垂直对齐

### pow 函数

C++ 没有内置的幂运算符，所以使用 `<cmath>` 头文件中的标准库函数 `pow(x, y)` 来计算 $x^y$。`pow` 接收两个 `double` 参数，返回 `double` 值。第 21 行执行的就是 $a = p(1+r)^n$ 的计算。

### 浮点数精度与内存

| 类型 | 精度 | 内存 |
|------|------|------|
| `float` | 约 7 位有效数字 | 4 字节 |
| `double` | 约 15 位有效数字 | 8 字节 |
| `long double` | 至少与 `double` 相同 | 取决于实现 |

大多数程序员使用 `double`。C++ 将源代码中的浮点数字面量（如 3.14159）默认视为 `double` 类型。

### 浮点数是近似值

浮点类型（如 `double`）存在**表示误差**（representational error）。计算机为浮点数分配固定数量的空间来存储，所以存储的值只能是近似值。例如，将 10 除以 3 的结果是 $3.3333333...$，3 无限循环，但计算机只能存储有限位数。

!!! warning
    假设浮点数精确表示（例如在相等比较中使用它们）可能导致错误结果。下面的情况就是一个典型的例子：

    假设计算得到两个金额分别为 14.234（显示为 14.23）和 18.673（显示为 18.67），它们的和为 32.907，显示为 32.91。但一个人手动将显示的数字相加会期望得到 32.90。

### 浮点字面量

C++ 将浮点数字面量（如 1000.00、0.05）视为 `double` 类型，将整数（如 7、-22）视为 `int` 类型。

## do...while 循环

`while` 语句在执行循环体**之前**测试循环继续条件，如果条件为 false，循环体一次也不会执行。而 `do...while` 语句在执行循环体**之后**测试循环继续条件，所以循环体**至少执行一次**。

```cpp
// fig04_05.cpp
// do...while iteration statement.
#include <iostream>
using namespace std;

int main() {
   int counter{1};

   do {
      cout << counter << " ";
      ++counter;
   } while (counter <= 10); // end do...while

   cout << "\n";
}
```
```output
1 2 3 4 5 6 7 8 9 10
```

程序进入 `do...while` 语句后，首先输出 `counter` 的值，然后递增 `counter`，最后在循环底部（第 12 行）评估循环继续条件。如果条件为 true，循环继续从循环体的第一条语句开始执行。如果为 false，循环终止。

!!! note
    `do...while` 的循环继续条件放在**末尾**，这是它与 `while` 和 `for` 的关键区别。正因为如此，`do...while` 适用于至少需要执行一次循环体的场景，比如先执行操作再询问用户是否继续。

## switch 多选语句

C++ 提供了 `switch` 多选语句，可以根据变量或表达式的可能值在多个不同动作中选择执行。每个动作与一个**整型常量表达式**的值相关联。

### 成绩统计示例

下面这个程序计算一组数字成绩的平均分，并使用 `switch` 语句统计每个字母等级（A、B、C、D、F）的数量。

```cpp
// fig04_06.cpp
// Using a switch statement to count letter grades.
#include <format>
#include <iostream>
using namespace std;

int main() {
   double total{0.0}; // sum of grades
   int gradeCounter{0}; // number of grades entered
   int aCount{0}; // count of A grades
   int bCount{0}; // count of B grades
   int cCount{0}; // count of C grades
   int dCount{0}; // count of D grades
   int fCount{0}; // count of F grades

   cout << "Enter the integer grades in the range 0-100.\n"
      << "Type the end-of-file indicator to terminate input:\n"
      << "   On UNIX/Linux/macOS type <Ctrl> d then press Enter\n"
      << "   On Windows type <Ctrl> z then press Enter\n";

   int grade;

   // loop until user enters the end-of-file indicator
   while (cin >> grade) {
      total += grade; // add grade to total
      ++gradeCounter; // increment number of grades

      // increment appropriate letter-grade counter
      switch (grade / 10) {
         case 9: // grade was between 90
         case 10: // and 100, inclusive
            ++aCount;
            break; // exits switch

         case 8: // grade was between 80 and 89
            ++bCount;
            break; // exits switch

         case 7: // grade was between 70 and 79
            ++cCount;
            break; // exits switch

         case 6: // grade was between 60 and 69
            ++dCount;
            break; // exits switch

         default: // grade was less than 60
            ++fCount;
            break; // optional; exits switch anyway
      } // end switch
   } // end while

   // display grade report
   cout << "\nGrade Report:\n";

   // if user entered at least one grade...
   if (gradeCounter != 0) {
      // calculate average of all grades entered
      double average{total / gradeCounter};

      // output summary of results
      cout << format("Total of the {} grades entered is {}\n",
                 gradeCounter, total)
           << format("Class average is {:.2f}\n\n", average)
           << "Summary of student's grades:\n"
           << format("A: {}\nB: {}\nC: {}\nD: {}\nF: {}\n",
                 aCount, bCount, cCount, dCount, fCount);
   }
   else { // no grades were entered, so output appropriate message
      cout << "No grades were entered\n";
   }
}
```
```output
Enter the integer grades in the range 0-100.
Type the end-of-file indicator to terminate input:
   On UNIX/Linux/macOS type <Ctrl> d then press Enter
   On Windows type <Ctrl> z then press Enter
99
92
45
57
63
71
76
85
90
100
^Z

Grade Report:
Total of the 10 grades entered is 778
Class average is 77.80

Summary of student's grades:
A: 4
B: 1
C: 2
D: 1
F: 2
```

### 从用户读取成绩

第 24 行 `while (cin >> grade)` 在 `while` 语句的条件中执行输入。如果 `cin` 成功读取了一个 `int` 值，条件为 true。如果用户输入了文件结束符，条件为 false，循环终止。

文件结束符是一个系统相关的按键组合：
- **UNIX/Linux/macOS**：`Ctrl + d`
- **Windows**：`Ctrl + z`（有时还需要按 Enter）

### 处理成绩

第 29 行的 `switch` 语句使用 `grade / 10` 作为控制表达式。由于整除会截断小数部分，0 到 100 之间的整数除以 10 的结果总是 0 到 10 的整数。

- 成绩 90–100：控制表达式为 9 或 10，匹配 `case 9:` 和 `case 10:`，递增 `aCount`
- 成绩 80–89：控制表达式为 8，匹配 `case 8:`，递增 `bCount`
- 成绩 70–79：控制表达式为 7，匹配 `case 7:`，递增 `cCount`
- 成绩 60–69：控制表达式为 6，匹配 `case 6:`，递增 `dCount`
- 成绩 0–59：控制表达式为 0–5，不匹配任何 `case`，执行 `default:`，递增 `fCount`

### 多个 case 执行相同语句

注意 `case 9:` 和 `case 10:` 之间没有任何语句。当控制表达式的值为 9 或 10 时，程序会"穿透"（fall through）到 `++aCount;` 处执行。`switch` 语句没有测试值范围的机制，所以每个需要测试的值都必须在单独的 `case` 标签中列出。

### break 语句

每个 `case` 通常以 `break` 语句结尾，用于退出 `switch` 语句。如果没有 `break`，程序会继续执行后续 `case` 的语句，直到遇到 `break` 或 `switch` 结束。

!!! warning
    忘记写 `break` 语句是一个常见的**逻辑错误**。如果有意让程序"穿透"到下一个 `case`，可以使用 `[[fallthrough]];` 属性告诉编译器这是有意为之。

### default 分支

如果控制表达式的值不匹配任何 `case` 标签，则执行 `default` 分支。在 `switch` 语句中提供 `default` 分支是一种好习惯，它促使你考虑异常情况的处理。`default` 可以出现在 `switch` 的任何位置，但通常放在最后。

## 带初始化器的选择语句（C++17）

C++17 允许你在 `if`、`if...else` 和 `switch` 语句的条件部分声明变量，这些变量的作用域仅限于该语句内部。

```cpp
// fig04_07.cpp
// if statements with initializers.
#include <format>
#include <iostream>
using namespace std;

int main() {
   if (int value{7}; value == 7) {
      cout << format("value is {}\n", value);
   }
   else {
      cout << format("value is not 7; it is {}\n", value);
   }

   if (int value{13}; value == 9) {
      cout << format("value is {}\n", value);
   }
   else {
      cout << format("value is not 9; it is {}\n", value);
   }
}
```
```output
value is 7
value is not 9; it is 13
```

### 语法

在 `if` 或 `if...else` 语句中，将初始化器放在条件括号的最前面，以分号 `;` 结尾：

```cpp
if (int value{7}; value == 7) { ... }
```

初始化器可以声明多个同类型的变量，用逗号分隔。

### 作用域

在初始化器中声明的变量可以在整个语句的剩余部分使用。当语句结束时，变量就不再存在了。正因为如此，两个 `if...else` 语句可以使用相同的变量名 `value` 而不会冲突。

## break 和 continue 语句

除了选择和迭代语句外，C++ 还提供了 `break` 和 `continue` 语句来改变控制流。

### break 语句

在 `while`、`for`、`do...while` 或 `switch` 中执行 `break` 语句会**立即退出**该语句，继续执行控制语句之后的第一条语句。

```cpp
// fig04_08.cpp
// break statement exiting a for statement.
#include <iostream>
using namespace std;

int main() {
   int count; // control variable also used after loop

   for (count = 1; count <= 10; ++count) { // loop 10 times
      if (count == 5) {
         break; // terminates for loop if count is 5
      }

      cout << count << " ";
   }

   cout << "\nBroke out of loop at count = " << count << "\n";
}
```
```output
1 2 3 4
Broke out of loop at count = 5
```

当嵌套在 `for` 语句中的 `if` 语句检测到 `count` 为 5 时，`break` 语句执行，立即终止 `for` 循环，程序跳到第 17 行继续执行。注意这里 `count` 是在 `for` 外部声明的，所以循环结束后仍然可以使用它。

### continue 语句

执行 `continue` 语句会跳过循环体中剩余的语句，进入循环的下一次迭代。在 `while` 和 `do...while` 中，`continue` 之后立即评估循环继续条件。在 `for` 中，先执行增量表达式，然后评估循环继续条件。

```cpp
// fig04_09.cpp
// continue statement terminating an iteration of a for statement.
#include <iostream>
using namespace std;

int main() {
   for (int count{1}; count <= 10; ++count) { // loop 10 times
      if (count == 5) {
         continue; // skip remaining code in loop body if count is 5
      }

      cout << count << " ";
   }

   cout << "\nUsed continue to skip printing 5\n";
}
```
```output
1 2 3 4 6 7 8 9 10
Used continue to skip printing 5
```

当 `count` 为 5 时，`continue` 语句执行，跳过 `cout << count << " "`，但 `for` 循环的增量表达式 `++count` 仍然会执行，然后评估循环继续条件。所以输出中跳过了 5，但循环正常继续。

!!! note
    在 `for` 循环中，`continue` 会先执行增量表达式，再评估循环继续条件。而在 `while` 和 `do...while` 中，`continue` 之后直接评估循环继续条件。

## 逻辑运算符

到目前为止我们使用的都是简单条件，如 `count <= 10`、`number != sentinelValue`。有时控制语句需要更复杂的条件，C++ 的逻辑运算符使你能将简单条件组合成复合条件：

| 运算符 | 名称 | 描述 |
|--------|------|------|
| `&&` | 逻辑与（AND） | 两个条件都为 true 时结果为 true |
| `\|\|` | 逻辑或（OR） | 两个条件中至少一个为 true 时结果为 true |
| `!` | 逻辑非（NOT） | 反转条件的真假值 |

### 逻辑与 `&&`

逻辑与运算符 `&&` 要求两个条件**都**为 true 时，整个表达式才为 true。

```cpp
if ((employeeType == PILOT) && (age >= 63)) {
   ++seniorPilots;
}
```

**真值表**：

| expression1 | expression2 | expression1 && expression2 |
|---|---|---|
| false | false | **false** |
| false | true | **false** |
| true | false | **false** |
| true | true | **true** |

### 逻辑或 `||`

逻辑或运算符 `||` 要求两个条件中**至少一个**为 true 时，整个表达式就为 true。

```cpp
if ((semesterAverage >= 90) || (finalExam >= 90)) {
   cout << "Student grade is A\n";
}
```

**真值表**：

| expression1 | expression2 | expression1 \|\| expression2 |
|---|---|---|
| false | false | **false** |
| false | true | **true** |
| true | false | **true** |
| true | true | **true** |

!!! note
    `&&` 的优先级高于 `||`。两者都是从左到右分组的。如果存在歧义，应使用括号。

### 短路求值

包含 `&&` 或 `||` 运算符的表达式只在已知条件结果为 true 或 false 之前进行求值。对于 `&&`，如果第一个条件为 false，则不再评估第二个条件（因为整个表达式必定为 false）。对于 `||`，如果第一个条件为 true，则不再评估第二个条件。

这种特性叫做**短路求值**（short-circuit evaluation），是一种性能优化。同时它还能防止错误：

```cpp
(i != 0) && (10 / i == 2)
```

如果 `i` 为 0，`i != 0` 为 false，短路求值会跳过 `10 / i == 2`，从而避免了除以零的错误。因此，**依赖条件应该放在 `&&` 的后面**。

### 逻辑非 `!`

逻辑非运算符 `!` 是一个一元运算符，用于**反转**条件的真假值。

```cpp
if (!(grade == sentinelValue)) {
   cout << "The next grade is " << grade << "\n";
}
```

上面这段代码等价于：

```cpp
if (grade != sentinelValue) {
   cout << "The next grade is " << grade << "\n";
}
```

大多数情况下，你可以通过使用适当的关系或相等运算符来避免使用 `!`，这样代码更可读。

**真值表**：

| expression | !expression |
|---|---|
| false | **true** |
| true | **false** |

### 逻辑运算符示例

下面这个程序生成三个逻辑运算符的真值表：

```cpp
// fig04_10.cpp
// Logical operators.
#include <format>
#include <iostream>
using namespace std;

int main() {
   // create truth table for && (logical AND) operator
   cout << "Logical AND (&&)\n"
      << format("false && false: {}\n", false && false)
      << format("false && true: {}\n", false && true)
      << format("true && false: {}\n", true && false)
      << format("true && true: {}\n\n", true && true);

   // create truth table for || (logical OR) operator
   cout << "Logical OR (||)\n"
      << format("false || false: {}\n", false || false)
      << format("false || true: {}\n", false || true)
      << format("true || false: {}\n", true || false)
      << format("true || true: {}\n\n", true || true);

   // create truth table for ! (logical negation) operator
   cout << "Logical negation (!)\n"
      << format("!false: {}\n", !false)
      << format("!true: {}\n", !true);
}
```
```output
Logical AND (&&)
false && false: false
false && true: false
true && false: false
true && true: true

Logical OR (||)
false || false: false
false || true: true
true || false: true
true || true: true

Logical negation (!)
!false: true
!true: false
```

`format` 函数默认将 `bool` 值显示为 `true` 或 `false`（而不是 `cout` 的默认 1 和 0）。

### 运算符优先级（更新版）

加入了逻辑运算符后的完整优先级表（从高到低）：

| 运算符 | 结合性 |
|--------|--------|
| `++`（后置）`--`（后置） | 从左到右 |
| `+`（一元正）`-`（一元负）`!` `++`（前置）`--`（前置） | 从右到左 |
| `*` `/` `%` | 从左到右 |
| `+` `-`（二元加法、减法） | 从左到右 |
| `<<` `>>` | 从左到右 |
| `<` `<=` `>` `>=` | 从左到右 |
| `==` `!=` | 从左到右 |
| `&&` | 从左到右 |
| `\|\|` | 从左到右 |
| `?:`（条件运算符） | 从右到左 |
| `=` `+=` `-=` `*=` `/=` `%=` | 从右到左 |

注意 `!` 的优先级很高，与一元正负号相同，高于所有二元运算符。`&&` 的优先级高于 `||`。

## 混淆 == 和 =

这是一个几乎所有 C++ 程序员都犯过的错误——不小心将相等运算符 `==` 和赋值运算符 `=` 搞混了。这个错误之所以危害大，是因为它通常不会导致编译错误，而是产生运行时的逻辑错误。

### 将 == 误写为 =

假设你想写：

```cpp
if (payCode == 4) { // 正确
   cout << "You get a bonus!\n";
}
```

但不小心写成了：

```cpp
if (payCode = 4) { // 错误！
   cout << "You get a bonus!\n";
}
```

这是一个赋值表达式，将 4 赋给 `payCode`，然后整个表达式的值为 4（非零值），被视为 true。所以条件**永远为 true**，无论 `payCode` 原来是什么值，奖金都会发放！更糟的是，`payCode` 的值还被修改了。

### 将 = 误写为 ==

反过来也有问题：

```cpp
x = 1;    // 想要赋值
```

误写为：

```cpp
x == 1;   // 只是比较，不赋值！
```

这里只是计算了一个表达式的值（true 或 false），但值被丢弃了，`x` 的值没有被修改。

!!! warning
    在条件中用 `=` 代替 `==`，或者用 `==` 代替 `=`，都是**逻辑错误**。

### 防止 ==/= 混淆的技巧

一个简单的技巧是**Yoda 条件**——将字面量放在比较的左边：

```cpp
if (7 == payCode) { // 如果误写为 7 = payCode，编译器会报错
```

变量名是 **lvalue**（左值），可以出现在赋值号的左边。字面量是 **rvalue**（右值），只能出现在赋值号的右边。如果将 `==` 误写为 `=`，编译器会检测到尝试给字面量赋值的错误。

### 开启编译器警告

大多数现代编译器（如 g++、clang++）在 `==` 被误写为 `=` 时会发出警告。使用 `-Wall` 编译选项可以开启所有警告：

```bash
g++ -Wall -o program program.cpp
```

## 结构化编程小结

结构化编程使程序更容易理解、测试、调试和修改。C++ 的所有控制语句都是**单入口/单出口**的——只有一种方式进入，也只有一种方式退出每个控制语句。

### 控制语句的两种组合方式

1. **堆叠**（stacking）：将控制语句按顺序排列
2. **嵌套**（nesting）：将控制语句放在其他控制语句内部

### 三种控制形式

结构化编程只需要三种控制形式：

| 控制形式 | 实现方式 |
|----------|----------|
| **顺序**（sequence） | 按顺序列出语句 |
| **选择**（selection） | `if`（单选）、`if...else`（双选）、`switch`（多选） |
| **迭代**（iteration） | `while`、`do...while`、`for` |

实际上，仅用 `if` 语句就能实现所有选择功能（虽然不如 `if...else` 和 `switch` 清晰高效），仅用 `while` 语句就能实现所有迭代功能。所以，任何 C++ 程序需要的控制形式都可以用以下三者表达：

- 顺序
- `if`（选择）
- `while`（迭代）

而且它们只能通过堆叠和嵌套两种方式组合。

### 形成结构化程序的规则

1. 从最简单的活动图（一个初始状态、一个动作状态、一个最终状态）开始
2. 任何动作状态都可以被替换为两个顺序排列的动作状态
3. 任何动作状态都可以被替换为任何控制语句
4. 规则 2 和 3 可以按任意顺序应用任意次数
