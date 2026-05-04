---
title: Chapter 2：算法开发与控制语句（上）
authors: [Quinn]
comments: true
date: 2026-04-08
tags:
  - 面向对象编程
---

# Chapter 2: 算法开发与控制语句（上）

算法是一种解决问题的方法，它涉及
1. 要执行的动作
2. 这些动作执行的顺序。

本章节将引入**伪代码**，以下是一个使用伪代码编写的 A + B Problem:
```text
Prompt the user to enter the first integer
Input the first integer

Prompt the user to enter the second integer
Input the second integer

Add first integer and second integer, store result
Display result
```

Böhm 和 Jacopini 的研究表明，所有程序都可以仅用三种控制结构来编写——**顺序结构**、**选择结构**和**迭代结构**。

## 顺序结构

顺序结构是指程序中的指令按照它们出现的顺序执行。每条指令在前一条指令完成后执行，直到程序结束。例如上面的 A + B Problem 就是一个顺序结构的例子，每条指令从上到下依次执行。

## 选择结构

C++ 中有 3 种选择结构：`if` 语句、`if...else` 语句和 `switch` 语句。

- `if` 语句在条件为**真**时执行一个代码块，在条件为**假**时跳过。
- `if...else` 语句在条件为**真**时执行一个代码块，在条件为**假**时执行另一个代码块。
- `switch` 语句根据一个表达式的值执行不同的代码块。具体我们将在 [chapter 3](chapter03.md) 中详细介绍，但这里是一个基本的结构：

## 迭代结构

C++ 中有 4 种迭代结构(也被称为循环语句)：`while` 循环、`do...while` 循环、`for` 循环和范围 `for` 循环。

- `while` 和 `for` 循环在循环条件为**真**时执行代码块；
- `do...while` 循环至少执行一次代码块，然后在循环条件为**真**时继续执行。

我们将在 [chapter 3](chapter03.md) 中介绍 `do...while` 循环和范围 `for` 循环，在 [chapter 4](chapter04.md) 中介绍范围 `for` 循环。一下是 4 种循环的基本结构：

!!! note
    **Keywords**
    if、else、switch、while、do 和 for 都是 C++ 的关键字。关键字不能用作标识符，如变量名，并且只包含小写字母（有时也包含下划线）。下表列出了完整的 C++ 关键字列表：

    | **C++ keywords** | | | | |
    | --- | --- | --- | --- | --- |
    | alignas | alignof | and | and_eq | asm |
    | auto | bitand | bitor | bool | break |
    | case | catch | char | char16_t | char32_t |
    | class | compl | const | const_cast | constexpr |
    | continue | decltype | default | delete | do |
    | double | dynamic_cast | else | enum | explicit |
    | export | extern | false | final | float |
    | for | friend | goto | if | import |
    | inline | int | long | module | mutable |
    | namespace | new | noexcept | not | not_eq |
    | nullptr | operator | or | or_eq | override |
    | private | protected | public | register | reinterpret_cast |
    | return | short | signed | sizeof | static |
    | static_assert | static_cast | struct | switch | template |
    | this | thread_local | throw | true | try |
    | typedef | typeid | typename | union | unsigned |
    | using | void | volatile | virtual | wchar_t |
    | while | xor | xor_eq | | |

    | **Keywords new in C++20** | | | | |
    | --- | --- | --- | --- | --- |
    | char8_t | concept | consteval | constinit | co_await |
    | co_return | co_yield | requires | | |

## if 语句

程序使用选择语句来在多个可选操作方案中进行选择。例如，假设考试的及格分数为60分。如果学生的分数大于或等于60分，则学生通过考试；否则，学生未通过考试。以下伪代码描述了这个过程：

```text
if student’s grade is greater than or equal to 60
print “Passed”
```

如果这个条件为真，则打印语句会输出“Passed”——否则，打印语句将会被跳过。缩进这个选择语句的第二行是可选的，但为了清晰起见，建议进行缩进——这样能强调print语句位于if语句的主体部分。

```cpp
if (studentGrade >= 60) {
    cout << "Passed";
}
```

### bool 数据类型

在上一章中，我们使用关系运算符或相等运算符来创建条件。实际上，**任何**计算结果为 0 或非 0 的表达式都可以用作条件——0 被视为 false，非 0 被视为 true。C++ 还提供了 `bool` 数据类型，用于只能保存 `true` 和 `false` 值的布尔变量——两者都是 C++ 关键字。编译器可以隐式地将 `true` 转换为 1，将 `false` 转换为 0。

## if...else 双选语句

`if` 单选语句只在条件为真时执行指定的动作。`if...else` 双选语句允许你指定条件为真时执行的动作，以及条件为假时执行另一个动作。例如，以下伪代码表示一个 `if...else` 语句，如果学生的成绩大于或等于 60 则打印“Passed”，如果小于 60 则打印“Failed”：

```text
if student's grade is greater than or equal to 60
    print "Passed"
else
    print "Failed"
```

无论哪种情况，打印完成后，程序继续执行下一条语句。上述伪代码可以写成如下 C++ 代码：

```cpp
if (studentGrade >= 60) {
    cout << "Passed";
}
else {
    cout << "Failed";
}
```

`if` 和 `else` 主体都采用相同的缩进。无论选择哪种缩进约定，都应在整个程序中一致地应用。

### 嵌套 if...else 语句

程序可以通过将 `if...else` 语句放在其他 `if...else` 语句内部来测试多个条件，从而创建嵌套 `if...else` 语句。例如，以下伪代码表示一个嵌套 `if...else` 语句，根据成绩打印“A”到“F”：

```text
if student's grade is greater than or equal to 90
    print "A"
else
    if student's grade is greater than or equal to 80
        print "B"
    else
        if student's grade is greater than or equal to 70
            print "C"
        else
            if student's grade is greater than or equal to 60
                print "D"
            else
                print "F"
```

这段伪代码可以写成如下 C++ 代码：

```cpp
if (studentGrade >= 90) {
    cout << "A";
}
else {
    if (studentGrade >= 80) {
        cout << "B";
    }
    else {
        if (studentGrade >= 70) {
            cout << "C";
        }
        else {
            if (studentGrade >= 60) {
                cout << "D";
            }
            else {
                cout << "F";
            }
        }
    }
}
```

如果 `studentGrade` 大于或等于 90，嵌套 `if...else` 语句中的前四个条件都会为 true，但只有最外层 `if...else` 语句的 `if` 部分中的语句会被执行。执行完毕后，最外层 `if...else` 语句的 `else` 部分将被跳过。

上面的嵌套 `if...else` 语句也可以写成如下更简洁的形式，使用更少的大括号和缩进：

```cpp
if (studentGrade >= 90) {
    cout << "A";
}
else if (studentGrade >= 80) {
    cout << "B";
}
else if (studentGrade >= 70) {
    cout << "C";
}
else if (studentGrade >= 60) {
    cout << "D";
}
else {
    cout << "F";
}
```

这种写法避免了代码向右过度缩进，有时候过度缩进会迫使行换行。在整个教材中，我们始终用大括号（`{` 和 `}`）包裹控制语句的主体，这可以避免一种被称为“悬空 else”的逻辑错误。

### 代码块（Blocks）

`if` 语句的主体只能包含一条语句。如果要在 `if` 或 `else` 的主体中包含多条语句，需要用大括号将它们括起来。始终使用大括号是一种好习惯。一对大括号中的语句（例如控制语句或函数的主体）形成一个**代码块**。代码块可以放在函数中任何可以放置单条语句的位置。

以下示例在 `if...else` 语句的 `else` 部分包含了一个包含多条语句的代码块：

```cpp
if (studentGrade >= 60) {
    cout << "Passed";
}
else {
    cout << "Failed\n";
    cout << "You must retake this course.";
}
```

如果 `studentGrade` 小于 60，程序会执行 `else` 主体中的两条语句，输出：

```output
Failed
You must retake this course.
```

如果没有大括号，那么 `cout << "You must retake this course.";` 这条语句就不在 `else` 部分的主体中，无论 `studentGrade` 是否小于 60，它都会被执行——这就是一个**逻辑错误**。

!!! note
    **语法错误 vs 逻辑错误**：编译器可以捕获语法错误（如代码块中缺少一个大括号）。逻辑错误（如计算错误）在程序执行时才会产生影响。致命逻辑错误会导致程序崩溃并提前终止；非致命逻辑错误则允许程序继续执行，但会产生错误的结果。

!!! note
    **空语句**：就像代码块可以放在任何可以放置单条语句的位置一样，也可以有空语句——即一个分号（`;`）在通常应该有语句的地方。空语句没有任何效果。在 `if` 或 `if...else` 语句的括号条件后放置分号会导致逻辑错误（单选 `if` 语句）或语法错误（双选 `if...else` 语句，当 `if` 部分包含主体语句时）。

### 条件运算符（?:）

C++ 提供了条件运算符 `?:`，可以用来替代 `if...else` 语句，使代码更简短清晰。条件运算符是 C++ 唯一的三元运算符（即需要三个操作数的运算符）。例如，以下语句打印条件表达式的值：

```cpp
cout << (studentGrade >= 60 ? "Passed" : "Failed");
```

`?` 左边的操作数是一个条件。`?` 和 `:` 之间的第二个操作数是条件为 true 时条件表达式的值。`:` 右边的操作数是条件为 false 时条件表达式的值。这个条件表达式在 `studentGrade >= 60` 为 true 时计算为字符串 `"Passed"`，否则为 `"Failed"`。因此，这个带条件运算符的语句执行的功能与前面 `if...else` 语句基本相同。条件运算符的优先级很低，因此整个条件表达式通常放在括号中。

## while 迭代语句

迭代语句允许你指定程序在某些条件保持为 true 时重复执行某个动作。以下伪代码描述了购物时的迭代过程：

```text
while there are more items on my shopping list
    purchase next item and cross it off my list
```

条件“购物清单上还有更多物品”可能为 true 或 false。如果为 true，则执行“购买下一件物品并将其从清单中划掉”这个动作。这个动作将在条件保持为 true 期间反复执行。`while` 迭代语句中包含的语句构成其主体，可以是单条语句或一个代码块。最终，条件将变为 false（当购物清单上最后一件物品已被购买并划掉时）。此时，迭代终止，`while` 语句之后的第一条语句开始执行。

作为 `while` 迭代语句的示例，考虑以下程序段，它找到第一个大于 100 的 3 的幂：

```cpp
int product{3};
while (product <= 100) {
    product = 3 * product;
}
```

执行此 `while` 语句后，变量 `product` 包含结果。`while` 语句的每次迭代都将 `product` 乘以 3，因此 `product` 依次取值为 9、27、81 和 243。当 `product` 变为 243 时，`product <= 100` 变为 false，迭代终止，所以 `product` 的最终值为 243。此时程序继续执行 `while` 语句之后的下一条语句。

!!! warning
    如果在 `while` 语句的主体中没有提供最终使条件变为 false 的动作，会导致一种称为**无限循环**的逻辑错误（循环永远不会终止）。

## 计数控制迭代

为了说明如何开发算法，我们来解决班级平均成绩问题的两个变体。考虑以下问题：

> 一个有 10 名学生的班级参加了一次测验。测验成绩（0 到 100 之间的整数）已知。确定班级的平均成绩。

班级平均成绩等于所有成绩之和除以学生人数。程序必须输入每个成绩，对所有输入的成绩求和，执行平均计算并打印结果。

### 伪代码算法

我们使用伪代码来列出要执行的动作并指定它们的执行顺序。我们使用**计数控制迭代**来逐个输入成绩。这种技术使用一个称为**计数器**（或控制变量）的变量来控制一组语句执行的次数。计数控制迭代通常被称为**定数迭代**，因为在循环开始执行之前，迭代次数就已经知道了。

在这个例子中，当计数器超过 10 时迭代终止。以下是完整的伪代码算法：

```text
set total to zero
set grade counter to one
while grade counter is less than or equal to ten
    prompt the user to enter the next grade
    input the next grade
    add the grade into the total
    add one to the grade counter
set the class average to the total divided by ten
print the class average
```

请注意算法中对**总计**和**计数器**的引用。总计（total）是一个用于累加多个值之和的变量。计数器（counter）是一个用于计数的变量——grade counter 指示即将由用户输入的是 10 个成绩中的哪一个。用于存储总计的变量通常在使用前初始化为 0。

### 实现：fig03_01.cpp

```cpp
// fig03_01.cpp
// Solving the class-average problem using counter-controlled iteration.
#include <iostream>
using namespace std;

int main() {
   // initialization phase
   int total{0}; // initialize sum of grades entered by the user
   int gradeCounter{1}; // initialize grade # to be entered next

   // processing phase uses counter-controlled iteration
   while (gradeCounter <= 10) { // loop 10 times
      cout << "Enter grade: "; // prompt
      int grade;
      cin >> grade; // input next grade
      total = total + grade; // add grade to total
      gradeCounter = gradeCounter + 1; // increment counter by 1
   }

   // termination phase
   int average{total / 10}; // int division yields int result

   // display total and average of grades
   cout << "\nTotal of all 10 grades is " << total;
   cout << "\nClass average is " << average << "\n";
}
```
```output
Enter grade: 67
Enter grade: 78
Enter grade: 89
Enter grade: 67
Enter grade: 87
Enter grade: 98
Enter grade: 93
Enter grade: 85
Enter grade: 82
Enter grade: 100

Total of all 10 grades is 846
Class average is 84
```

#### main 中的局部变量

第 8、9、14 和 21 行分别声明了 `int` 变量 `total`、`gradeCounter`、`grade` 和 `average`。变量 `grade` 存储用户输入。在代码块（如函数体）中声明的变量是**局部变量**，只能从声明行到该代码块的闭合右大括号之间使用。

#### 初始化变量 total 和 gradeCounter

第 8-9 行声明并初始化 `total` 为 0、`gradeCounter` 为 1。这些初始化在变量被用于计算之前进行。应始终初始化每个总计和计数器。总计通常初始化为 0，计数器通常初始化为 0 或 1，具体取决于它们的用途。

#### 从用户读取 10 个成绩

`while` 语句在 `gradeCounter` 的值小于或等于 10 时继续迭代。每次迭代：显示提示、输入成绩、将新成绩加到 `total` 中、将 `gradeCounter` 加 1。递增 `gradeCounter` 最终会使它超过 10，从而终止循环。

#### 计算并显示班级平均成绩

当循环终止后，第 21 行在 `average` 变量的初始化器中执行平均计算。第 24 行显示 `total` 的值，第 25 行显示 `average` 的值。

### 整除和截断

这个例子中的平均计算产生一个 `int` 结果。程序示例运行显示成绩之和为 846——除以 10 应该得到 84.6。但是，因为 `total` 和 10 都是整数，`total / 10` 产生整数 84。两个整数相除的结果是**整数除法**——计算的任何小数部分都被**截断**（不是四舍五入）。例如，`7 / 4` 在常规算术中得到 1.75，但在整数算术中截断为 1。假设整数除法会四舍五入可能导致错误结果。

!!! note
    在 C++ 中，整数除法是向零截断的。例如 `-7 / 4` 的结果是 `-1`，而不是 `-2`。

### 算术溢出

在 fig03_01 中，`total = total + grade;` 这个简单的加法语句也有一个潜在问题——将整数相加可能产生一个太大的值，无法存储在 `int` 变量中。这被称为**算术溢出**（arithmetic overflow），会导致未定义行为，可能产生意想不到的结果和安全问题。

以下表达式返回系统的 `int` 最大值和最小值：

```cpp
std::numeric_limits<int>::max()
std::numeric_limits<int>::min()
```

它们使用了 C++ 标准库头文件 `<limits>` 中的 `numeric_limits` 类。

### 输入验证

当程序接收用户输入时，可能会出现各种问题。例如，`cin >> grade;` 假设用户会输入 0 到 100 之间的整数，但用户可能输入负数、大于 100 的数、包含小数点的数、甚至字母或特殊符号。

工业级程序必须测试所有可能的错误情况以确保输入有效。输入成绩的程序应该使用范围检查来验证成绩是 0 到 100 之间的值，然后要求用户重新输入任何超出范围的值。

## 哨兵控制迭代

让我们将上面的班级平均问题推广。考虑以下问题：

> 开发一个班级平均成绩程序，每次运行时处理任意数量学生的成绩。

在上一个例子中，问题陈述指定了学生人数，因此成绩的数量（10 个）是事先知道的。对于这个问题，我们不知道用户在程序执行期间会输入多少个成绩。程序必须处理任意数量的成绩。

解决此问题的一种方法是使用**哨兵值**（sentinel value，也称为信号值或标志值）来指示数据输入的结束。用户输入成绩直到所有有效成绩都已输入，然后输入哨兵值表示不再输入更多成绩。

你必须选择一个不会与可接受的输入值混淆的哨兵值。测验成绩是非负整数，因此 `-1` 是此问题的可接受哨兵值。因此，班级平均程序可能处理如 95、96、75、74、89 和 -1 这样的输入流，程序将计算并打印这些成绩（不包括 -1）的班级平均成绩。

!!! warning
    用户可能在输入成绩之前就输入 -1，这意味着成绩数量为零。我们必须在计算班级平均成绩之前测试这种情况。根据 C++ 标准，浮点算术中除以零的结果是未定义的。当执行除法（`/`）或求余（`%`）运算且右操作数可能为零时，应测试并处理这种情况。

### 自顶向下、逐步细化

我们使用一种称为**自顶向下、逐步细化**（top-down, stepwise refinement）的技术来开发这个程序，这对开发结构良好的程序至关重要。

**顶层**（top）用一条伪代码语句表达程序的整体功能：

```text
determine the class average for the quiz
```

**第一次细化**将顶层分解为更小的任务：

```text
initialize variables
input, sum and count the quiz grades
calculate and print the class average
```

**第二次细化**需要更多细节，我们确定需要以下变量：一个运行总计、一个计数器、一个接收用户输入的变量和一个存储计算平均值的变量。细化后的完整伪代码如下：

```text
initialize total to zero
initialize counter to zero
prompt the user to enter the first grade
input the first grade (possibly the sentinel)
while the user has not yet entered the sentinel
    add this grade into the running total
    add one to the grade counter
    prompt the user to enter the next grade
    input the next grade (possibly the sentinel)
if the counter is not equal to zero
    set the average to the total divided by the counter
    print the average
else
    print "No grades were entered"
```

注意第二次细化中要小心处理**除零**的问题——这是一个如果未检测到会导致程序失败或产生无效输出的逻辑错误。

### 实现：fig03_02.cpp

虽然用户输入的每个成绩都是整数，但平均计算很可能会产生浮点数，而 `int` 无法表示。C++ 提供了 `float`、`double` 和 `long double` 类型来存储浮点数。`double` 变量通常比 `float` 存储更大数量级和更高精度的数，`long double` 又比 `double` 更大。为了在这个例子中计算浮点平均数，我们将 `total` 声明为 `double`。

```cpp
// fig03_02.cpp
// Solving the class-average problem using sentinel-controlled iteration.
#include <iostream>
#include <iomanip> // parameterized stream manipulators
using namespace std;

int main() {
   // initialization phase
   double total{0.0}; // initialize sum of grades
   int gradeCounter{0}; // initialize # of grades entered so far

   // processing phase
   // prompt for input and read grade from user
   cout << "Enter grade or -1 to quit: ";
   int grade;
   cin >> grade;

   // loop until sentinel value is read from user
   while (grade != -1) {
      total = total + grade; // add grade to total
      gradeCounter = gradeCounter + 1; // increment counter

      // prompt for input and read next grade from user
      cout << "Enter grade or -1 to quit: ";
      cin >> grade;
   }

   // termination phase
   // if user entered at least one grade...
   if (gradeCounter != 0) { // avoid division by zero
      // calculate average of grades
      double average{total / gradeCounter};

      // display total and average (with two digits of precision)
      cout << "\nTotal of the " << gradeCounter
         << " grades entered is " << total;
      cout << setprecision(2) << fixed;
      cout << "\nClass average is " << average << "\n";
   }
   else { // no grades were entered, so output appropriate message
      cout << "No grades were entered\n";
   }
}
```
```output
Enter grade or -1 to quit: 97
Enter grade or -1 to quit: 88
Enter grade or -1 to quit: 72
Enter grade or -1 to quit: -1

Total of the 3 grades entered is 257
Class average is 85.67
```

#### 哨兵控制迭代 vs 计数控制迭代的逻辑

对比这两种迭代方式的逻辑：

- **计数控制迭代**：循环的每次迭代都从用户读取一个值，迭代次数在循环开始前已知。
- **哨兵控制迭代**：程序在到达 `while` 之前先提示并读取第一个值。这个值决定了控制流是否应该进入 `while` 的主体。如果条件为 false（用户直接输入了哨兵值），则主体不执行。如果条件为 true，主体执行，将成绩值加到 `total` 中并递增 `gradeCounter`，然后提示并输入下一个成绩。控制流回到循环的闭合大括号后，再次测试 `while` 条件。

在哨兵控制循环中，下一个成绩总是在测试 `while` 条件之前立即从用户输入。这允许程序在处理之前确定刚输入的值是否为哨兵值。如果 `grade` 包含哨兵值，循环终止而不会将 -1 加到 `total` 中。提示信息应该提醒用户哨兵值是什么。

### 混合类型表达式和隐式类型提升

如果至少输入了一个成绩，`double average{total / gradeCounter};` 将 `total` 除以 `gradeCounter` 来计算平均值。`total` 是 `double` 类型，`gradeCounter` 是 `int` 类型。编译器只能对操作数类型完全相同的表达式进行求值。为确保这一点，编译器会对选定的操作数执行一种称为**提升**（promotion，也称为隐式转换）的操作。在包含 `double` 和 `int` 类型的值的表达式中，C++ 会将 `int` 操作数提升为 `double` 值。因此在上面的除法中，C++ 会将 `gradeCounter` 的值的一个临时副本提升为 `double` 类型，然后执行除法。

### 格式化浮点数

#### 参数化流操纵器 setprecision

`setprecision(2)` 表示浮点值应输出小数点后两位精度（例如 92.37）。`setprecision` 是一个参数化流操纵器，因为它需要一个参数来执行其任务。使用参数化流操纵器的程序必须包含头文件 `<iomanip>`。

#### 非参数化流操纵器 fixed

`fixed` 流操纵器不需要参数，表示浮点值应以定点格式输出（而非科学计数法）。例如，在科学计数法中，值 3100.0 显示为 `3.1e+03`，而定点格式直接显示为 `3100.0`。

定点格式还强制打印小数点和尾随零，即使值是整数。例如，没有 `fixed` 格式化选项，88.00 会打印为 `88`，没有尾随零和小数点。

`setprecision` 和 `fixed` 执行**粘性设置**——程序中所有浮点值的格式化都将使用这些设置，直到你更改它们。

#### 浮点数的舍入

当同时使用 `fixed` 和 `setprecision` 流操纵器时，格式化后的值会被**舍入**到指定的小数位数。内存中的值保持不变。例如，精度为 2 时，87.946 和 67.543 将分别舍入为 87.95 和 67.54。

!!! note
    在 fig03_02 中，三个输入成绩总计 257，产生的平均值是 85.666...，显示的舍入值为 85.67。

## 嵌套控制语句

前面我们看到了控制语句可以**堆叠**（按顺序排列）在一起。在本节中，我们研究将一个控制语句**嵌套**在另一个控制语句中——这是控制语句连接的第二种结构化方式。

### 问题描述

> 某大学开设了一门帮助学生准备房地产经纪人州执照考试的课程。去年，10 名修完该课程的学生参加了考试。大学想了解学生们的考试表现。你被要求编写一个程序来总结结果。每位学生姓名旁边有一个 1（通过）或 2（未通过）。
>
> 1. 输入每个考试结果（1 或 2），每次程序请求另一个考试结果时显示“Enter result”。
> 2. 统计每种考试结果的数量。
> 3. 显示考试结果的摘要，指出通过和未通过的学生人数。
> 4. 如果超过 8 名学生通过，打印“Bonus to instructor!”

### 伪代码算法

经过自顶向下、逐步细化的过程，完整的第二次细化的伪代码如下：

```text
initialize passes to zero
initialize failures to zero
initialize student counter to one
while student counter is less than or equal to 10
    prompt the user to enter the next exam result
    input the next exam result
    if the student passed
        add one to passes
    else
        add one to failures
    add one to student counter
print the number of passes
print the number of failures
if more than eight students passed
    print "Bonus to instructor!"
```

注意在循环中嵌套了 `if...else` 语句来处理每个考试结果。

### 实现：fig03_03.cpp

```cpp
// fig03_03.cpp
// Analysis of examination results using nested control statements.
#include <iostream>
using namespace std;

int main() {
   // initializing variables in declarations
   int passes{0};
   int failures{0};
   int studentCounter{1};

   // process 10 students using counter-controlled loop
   while (studentCounter <= 10) {
      // prompt user for input and obtain value from user
      cout << "Enter result (1 = pass, 2 = fail): ";
      int result;
      cin >> result;

      // if...else is nested in the while statement
      if (result == 1) {
         passes = passes + 1;
      }
      else {
         failures = failures + 1;
      }

      // increment studentCounter so loop eventually terminates
      studentCounter = studentCounter + 1;
   }

   // termination phase; prepare and display results
   cout << "Passed: " << passes << "\nFailed: " << failures << "\n";

   // determine whether more than 8 students passed
   if (passes > 8) {
      cout << "Bonus to instructor!\n";
   }
}
```
```output
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 2
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 1
Enter result (1 = pass, 2 = fail): 1
Passed: 9
Failed: 1
Bonus to instructor!
```

`while` 语句循环 10 次，每次迭代输入并处理一个考试结果。`if...else` 语句（嵌套在 `while` 语句中）判断结果是 1 还是 2，分别递增 `passes` 或 `failures`。循环结束后，显示通过和未通过的数量，然后判断是否超过 8 人通过，如果是则输出奖励信息。

### 使用大括号初始化防止窄化转换

考虑 fig03_03 中的初始化：

```cpp
int studentCounter{1};
```

对于基本类型的变量，大括号初始化器可以防止可能导致数据丢失的**窄化转换**（narrowing conversion）。例如：

```cpp
int x = 12.6; // 允许，但 x 的值为 12（截断）
int x{12.6}; // 编译错误！防止窄化转换
```

使用 `=` 形式的初始化时，C++ 会将 `double` 值 12.6 截断为 `int` 值 12，编译器通常只会发出警告。而使用大括号初始化时，编译器会直接报错，帮助你避免潜在的逻辑错误。

!!! note
    在 fig03_01 中，`int average{total / 10};` 不包含窄化转换，因为 `total` 和 10 都是 `int` 值，所以初始化器的值是 `int` 类型。但如果 `total` 是 `double`，或者使用 `double` 字面量 `10.0` 作为分母，那么初始化器的值将是 `double` 类型，编译器会发出窄化转换的错误。

## 复合赋值运算符

你可以用加法复合赋值运算符 `+=` 来缩写 `c = c + 3;` 为 `c += 3;`。`+=` 运算符将其右操作数的值加到左侧变量的值上，然后将结果存储在左侧变量中。

以下是所有算术复合赋值运算符：

| 运算符 | 示例表达式 | 等价表达式 | 说明（假设 int c = 3, d = 5, e = 4, f = 6, g = 12） |
|--------|-----------|-----------|-------|
| `+=` | `c += 7` | `c = c + 7` | 将 10 赋给 c |
| `-=` | `d -= 4` | `d = d - 4` | 将 1 赋给 d |
| `*=` | `e *= 5` | `e = e * 5` | 将 20 赋给 e |
| `/=` | `f /= 3` | `f = f / 3` | 将 2 赋给 f |
| `%=` | `g %= 9` | `g = g % 9` | 将 3 赋给 g |

## 自增和自减运算符

C++ 提供两个一元运算符用于对数值变量加 1 或减 1——一元自增运算符 `++` 和一元自减运算符 `--`：

| 运算符 | 名称 | 示例表达式 | 说明 |
|--------|------|-----------|------|
| `++` | 前置自增 | `++number` | 先将 number 加 1，然后在表达式中使用新值 |
| `++` | 后置自增 | `number++` | 先在表达式中使用当前值，然后将 number 加 1 |
| `--` | 前置自减 | `--number` | 先将 number 减 1，然后在表达式中使用新值 |
| `--` | 后置自减 | `number--` | 先在表达式中使用当前值，然后将 number 减 1 |

放在变量前面（前置）的运算符称为前置自增或前置自减运算符。放在变量后面（后置）的运算符称为后置自增或后置自减运算符。

### 前置自增 vs 后置自增

fig03_04 演示了 `++` 自增运算符的前置和后置版本的区别。自减运算符 `--` 的工作方式类似。

```cpp
// fig03_04.cpp
// Prefix increment and postfix increment operators.
#include <iostream>
using namespace std;

int main() {
   // demonstrate postfix increment operator
   int c{5};
   cout << "c before postincrement: " << c << "\n"; // prints 5
   cout << "  postincrementing c: " << c++ << "\n"; // prints 5
   cout << " c after postincrement: " << c << "\n"; // prints 6

   cout << "\n"; // skip a line

   // demonstrate prefix increment operator
   c = 5;
   cout << " c before preincrement: " << c << "\n"; // prints 5
   cout << "  preincrementing c: " << ++c << "\n"; // prints 6
   cout << " c after preincrement: " << c << "\n"; // prints 6
}
```
```output
c before postincrement: 5
  postincrementing c: 5
 c after postincrement: 6

 c before preincrement: 5
  preincrementing c: 6
 c after preincrement: 6
```

程序首先将 `c` 初始化为 5。`c++` 是后置自增，所以 `c` 的原始值（5）被输出，然后 `c` 的值增加到 6。`++c` 是前置自增，`c` 的值先增加到 6，然后新值被输出。

### 简化语句

算术复合赋值运算符、自增和自减运算符可以用来简化程序语句。例如，fig03_03 中的三条赋值语句：

```cpp
passes = passes + 1;
failures = failures + 1;
studentCounter = studentCounter + 1;
```

可以用复合赋值运算符写为：
```cpp
passes += 1;
failures += 1;
studentCounter += 1;
```

或用前置自增运算符写为：
```cpp
++passes;
++failures;
++studentCounter;
```

或用后置自增运算符写为：
```cpp
passes++;
failures++;
studentCounter++;
```

当单独对变量进行自增或自减时，前置和后置形式效果相同。只有当变量出现在更大的表达式上下文中时，前置和后置才产生不同的效果。

!!! warning
    尝试对不能被赋值的表达式使用自增或自减运算符是编译错误。例如，`++(x + 1)` 是语法错误，因为 `(x + 1)` 不是一个变量。

### 运算符优先级和结合性

以下表格总结了到目前为止介绍的所有运算符的优先级和结合性。运算符按优先级从高到低排列：

| 运算符 | 结合性 |
|--------|--------|
| `++`（后置）`--`（后置） | 从左到右 |
| `+`（一元正）`-`（一元负）`++`（前置）`--`（前置） | 从右到左 |
| `*` `/` `%` | 从左到右 |
| `+` `-`（二元加法、减法） | 从左到右 |
| `<<` `>>` | 从左到右 |
| `<` `<=` `>` `>=` | 从左到右 |
| `==` `!=` | 从左到右 |
| `?:`（条件运算符） | 从右到左 |
| `=` `+=` `-=` `*=` `/=` `%=` | 从右到左 |

注意条件运算符 `?:`、一元运算符（`++`、`--`、`+`、`-`）以及赋值运算符都是**从右到左**结合的，其余运算符都是**从左到右**结合的。

## 基本类型的不可移植性

C++ 中，一个 `int` 在一台机器上可能用 16 位（2 字节）表示，在另一台机器上用 32 位（4 字节），在另一台机器上用 64 位（8 字节）表示。因此，使用整数的代码并不总是在不同平台之间可移植的。

C++ 标准要求：

- `int` 类型至少 16 位
- `long` 类型至少 32 位
- `long long` 类型至少 64 位
- `int` 的大小应小于或等于 `long`，`long` 的大小应小于或等于 `long long`

这种"模糊"的要求带来了可移植性挑战，但允许编译器实现者通过将基本类型大小匹配到机器硬件来优化性能。

!!! note
    头文件 `<cstdint>`（[cppreference](https://en.cppreference.com/w/cpp/types/integer)）中的整数类型可以用来确保整数变量在不同平台上都具有正确的大小，例如 `int32_t`、`int64_t` 等。