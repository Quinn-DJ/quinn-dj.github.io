---
title: Chapter 1：C++20 介绍
authors: [Quinn]
comments: true
date: 2026-03-04
tags:
  - 面向对象编程
---
# Chapter 1: C++20 介绍

## 第一个程序: Hello, World!

```cpp
// fig02_01.cpp
// Text-printing program.
#include <iostream> // enables program to output data to the screen

// function main begins program execution
int main() {
   std::cout << "Welcome to C++!\n"; // display message

   return 0; // indicate that program ended successfully
} // end function main
```
``` bash
Welcome to C++!
```

### 注释

这两行都以 `//` 开头，表示它们是**注释行**，一般用于对代码进行解释说明，编译器会忽略注释。

`//` 只会注释掉在它之后的同一行内容，如果需要注释多行，可以使用 `/*` 和 `*/` 来包裹注释内容。

```cpp
/* fig02_01.cpp
   Text-printing program. */
```

### 预处理指令

第三行 `#include <iostream>` 是一个**预处理指令**，告诉编译器在编译之前要包含 `<iostream>` 头文件，这个头文件包含了**输入输出流**的定义。

### 学会空行

第四行是一个空行，提高代码的可读性，使代码看起来更清晰。编译器会忽略空行。

### 主函数

第六行 `int main()` 是每一个 C++ 程序的入口点，程序从这里开始执行。`main` 后的括号表明它是一个函数，关键字 `int` 表示main函数执行完毕后，它会**返回**一个整数值。像 `return` 这样的关键字是C++保留使用的。

左花括号 `{`（第6行末尾）必须开始每个函数的函数体，函数体包含函数执行的指令。相应的右花括号 `}`（第10行）必须结束每个函数的函数体。

### 输出语句

第七行 `std::cout << "Welcome to C++!\n";` 表示将双引号中的文本输出到屏幕上。

双引号及其之间的字符被称为字符串、字符型字符串或字符串字面量。我们将双引号之间的字符简称为字符串。编译器不会忽略字符串中的空格。

第7行整行——包括`std::cout`、`<<`运算符、字符串`“Welcome to C++!\n”`以及分号（`;`）——被称作一个语句。大多数C++语句以分号结尾。预处理指令（如 `#include`）不是C++语句，因此不以分号结尾。

在 C++ 中，输出和输入通常是通过数据流来完成的。当执行上述语句时，它会将字符流 `“Welcome to C++!\n”` 发送到标准输出流对象（`std::cout`），该对象通常“连接”到屏幕上。

### 缩进

在函数体的大括号内，一般将每个函数体缩进一级，让程序的功能结构更加清晰，更易于阅读。一般使用Tab键来创建缩进，一般为 4 个空格的宽度。

!!! note
    教材中使用的是 3 个空格的缩进。

### 命名空间

当我们使用从标准库头文件（如 `<iostream>`）引入程序中的名称时，需要在 `cout` 前加上 `std::`。符号 `std::cout` 表明我们正在使用属于 `std` 命名空间的 `cout` 名称。

实际使用中，我们可以使用 `using` 声明来避免每次使用标准库名称时都要加上 `std::` 前缀。

### 流插入操作符和转义序列

当与 `cout` 一起使用时，`<<` 运算符是流插入运算符。运算符右边的值（右操作数）会被插入到输出流中。请注意，`<<` 指向数据流向的位置。字符串中的字符通常与引号之间的输入完全一致地显示。然而，在这个程序的输出中并未显示字符 `\n`。反斜杠(`\`)是一个转义符。当 C++ 在字符串中遇到反斜杠时，它会将下一个字符与反斜杠组合起来形成一个转义序列。转义序列 `\n` 表示换行符。它会使光标（即当前屏幕位置指示器）移动到屏幕下一行的开头。

下表列出了一些常见的转义序列：

| Escape sequence | Description |
|-----------------|-------------|
| `\n` | Newline. Positions the screen cursor to the beginning of the next line. |
| `\t` | Horizontal tab. Moves the screen cursor right to the next tab stop. |
| `\r` | Carriage return. Positions the screen cursor to the beginning of the current line; does not advance to the next line. |
| `\a` | Alert. Sounds the system bell. |
| `\\` | Backslash. Includes a backslash character in a string. |
| `\'` | Single quote. Includes a single-quote character in a string. |
| `\"` | Double quote. Includes a double-quote character in a string. |

### 返回值

第九行 `return 0;` 是我们用来退出函数的几种方式之一。在`main`函数末尾的这条`return`语句中，值 0 表示程序成功终止。如果程序执行到达右花括号而未遇到`return`语句，则`main`函数会隐式返回 0。

!!! note
    在 C++20 中，以下代码也是合法的：

    ```cpp
    int main() {
        std::cout << "Welcome to C++!\n";
    }
    ```

    但是并不建议这样做。

## A + B Problem

我们的下一个程序会获取用户通过键盘输入的两个整数，计算它们的和，并使用`std::cout`输出结果。

``` cpp
// fig02_04.cpp
// Addition program that displays the sum of two integers.
#include <iostream> // enables program to perform input and output

// function main begins program execution
int main() {
   // declaring and initializing variables
   int number1{0}; // first integer to add (initialized to 0)  
   int number2{0}; // second integer to add (initialized to 0) 
   int sum{0}; // sum of number1 and number2 (initialized to 0)

   std::cout << "Enter first integer: "; // prompt user for data
   std::cin >> number1; // read first integer from user into number1

   std::cout << "Enter second integer: "; // prompt user for data
   std::cin >> number2; // read second integer from user into number2

   sum = number1 + number2; // add the numbers; store result in sum

   std::cout << "Sum is " << sum << "\n"; // display sum
} // end function main
```
``` bash
Enter first integer: 45
Enter second integer: 72
Sum is 117
```

### 变量声明和初始化

第八到十行
```cpp
int number1{0}; // first integer to add (initialized to 0)  
int number2{0}; // second integer to add (initialized to 0) 
int sum{0}; // sum of number1 and number2 (initialized to 0)
```
表示声明了三个变量 `number1`、`number2` 和 `sum`，它们都是 `int` **整型**，并且都被初始化为 0。

这被称为大括号初始化，是 C++11 中引入的特性。尽管并非总是需要显式初始化每个变量，但这样做有助于避免多种问题。

!!! note
    这三行代码也可以写成以下形式：

    ```cpp
    int number1 = 0; // first integer to add (initialized to 0)
    int number2 = 0; // second integer to add (initialized to 0)
    int sum = 0; // sum of number1 and number2 (initialized to 0)
    ```

    在后续章节中，我们将讨论花括号初始化器的各种好处。

当然，我们也可以在一行中声明多个变量：

```cpp
int number1{0}, number2{0}, sum{0}; // declare and initialize three int variables
```

### 基本类型

我们很快就会讨论用于指定实数的`double`类型和用于字符数据的`char`类型。实数是有小数点的数字，如 3.4、0.0 和 -11.19。`char`变量可以保存一个小写字母、大写字母、数字或特殊字符（例如`$`或`*`）。`int`、`double`、`char`和`long`等类型被称为基本类型，它们是 C++ 内置的类型。基本类型名称通常由一个或多个关键字组成，并且必须全部以小写字母出现。有关 C++ 基本类型及其范围的完整列表，请参阅 [https://en.cppreference.com/w/cpp/language/types](https://en.cppreference.com/w/cpp/language/types)。

### 标识符与命名

变量名（如`number1`）可以是任何有效的标识符。标识符是由字母、数字和下划线（`_`）组成的一系列字符，它不能以数字开头，且不能是关键字。C++ 区分大小写，所以`a1`和`A1`是不同的标识符。

C++允许标识符具有任意长度。

按照惯例，变量名标识符以小写字母开头，名称中除第一个单词外的每个单词都以大写字母开头。例如，`firstNumber`的第二个单词`Number`以大写字母 N 开头。这种命名约定被称为驼峰式大小写，因为大写字母像骆驼的驼峰一样突出。选择有意义的标识符有助于使程序具有自文档性，而无需参考程序注释或外部文档。避免在标识符中使用缩写，以提高程序的可读性。

!!! note
    不要以一个下划线和大写字母或两个下划线开头作为标识符，因为C++编译器会在内部将这些名称用于其特定目的！

### 变量声明的位置

变量声明几乎可以放在程序的任何位置，但必须在使用变量之前声明。

### 输入语句

第十三行 `std::cin >> number1;` 是一个输入语句，当执行该语句时，程序会等待你为变量`number1`输入一个值。您通过键入一个整数（以字符形式），然后按下回车键将字符发送给程序来做出响应。`std::cin`对象将数字的字符表示转换为整数值，并将该值赋给变量`number1`。按下回车键还会使光标移动到屏幕上下一行的开头。

当你的程序期望用户输入一个整数时，用户可能会输入字母字符、特殊符号（如#或@）或带有小数点的数字（如73.5）。在这些早期程序中，我们假设用户输入的是有效数据。稍后我们将介绍处理数据输入问题的各种技巧。

### 算术表达式

第十八行 `sum = number1 + number2;` 是一个赋值语句，将 `number1` 和 `number2` 的值相加，并使用赋值运算符 `=` 将结果赋值给 `sum`。大多数计算都是在赋值语句中完成的。`=` 运算符和 `+` 运算符都是二元运算符——每个运算符都有两个操作数。对于 `+` 运算符，两个操作数是 `number1` 和 `number2`。对于前面的 `=` 运算符，两个操作数是 `sum` 和表达式 `number1 + number2` 的值。在二元运算符的两侧加上空格，可以使运算符更加突出，并提高程序的可读性。

### 复杂的输出语句

第二十行 `std::cout << "Sum is " << sum << "\n";` 是一个更复杂的输出语句。它使用了两个流插入运算符 `<<` 来将三个值（字符串字面量`"Sum is "`、变量`sum`的值和换行符`\n`）插入到输出流中。在单个语句中使用多个流插入运算符（`<<`）被称为连接、链式操作或级联流插入操作。
计算也可以在输出语句中执行。我们本可以通过将第18行和第20行的语句合并为一个语句来消除变量`sum`。

```cpp
std::cout << "Sum is " << number1 + number2 << "\n";
```

!!! note
    C++的一个标志性特性是，你可以创建自己的数据类型，称为类，我们将在第9章及后续章节中深入讨论。然后，你可以分别使用`>>`和`<<`运算符来“教” C++ 如何输入和输出这些新数据类型的值。这被称为运算符重载，我们将在第11章中探讨。

## 内存概念

当你声明一个变量的时候，计算机会为这个变量分配内存。每一个变量都包含

- 名称（如`number1`）
- 数据类型（如`int`）
- 大小（由数据类型决定）
- 值（如45）

## 算术运算符

以下是 C++ 中的算术运算符：

| Operator | Arithmetic operator | Algebraic expression | C++ expression |
|----------|---------------------|----------------------|----------------|
| `+` | Addition | $a + b$ | `a + b` |
| `-` | Subtraction | $a - b$ | `a - b` |
| `*` | Multiplication | $a \times b$ | `a * b` |
| `/` | Division | $a \div b$ | `a / b` |
| `%` | Modulus (remainder) | $a \bmod b$ | `a % b` |

### 整除

当分子和分母都是整数时，整数除法得到一个整数商。整数除法产生的任何分数部分都会被截断，不会进行四舍五入。

```bash
5 / 3 = 1
17 / 3 = 5
```

### 求余

也被称为取模，用于计算整数除法后的余数。

### 圆括号

与数学表达式一样，圆括号 `()` 且仅有圆括号能用来提高表达式的优先级。

## 比较运算符

| Operator | C++ Operator | Sample C++ condition |
|----------|--------------|----------------------|
| $>$ | `>` | `a > b` |
| $<$ | `<` | `a < b` |
| $\geq$ | `>=` | `a >= b` |
| $\leq$ | `<=` | `a <= b` |
| $=$ | `==` | `a == b` | 
| $\neq$ | `!=` | `a != b` |

!!! note
    颠倒运算符中的符号顺序通常会导致语法错误以及逻辑错误。

## if 语句

C++ 中的 `if` 语句允许程序根据条件的真假来执行不同的代码块。如果给定的if语句的条件为真，则执行该if语句体中的输出语句；否则，程序将跳过该if语句体中的输出语句。

```cpp
// fig02_05.cpp
// Comparing integers using if statements, relational operators
// and equality operators.
#include <iostream> // enables program to perform input and output

using std::cout; // program uses cout
using std::cin; // program uses cin

// function main begins program execution
int main() {
   int number1{0}; // first integer to compare (initialized to 0)
   int number2{0}; // second integer to compare (initialized to 0)
   
   cout << "Enter two integers to compare: "; // prompt user for data
   cin >> number1 >> number2; // read two integers from user

   if (number1 == number2) {
      cout << number1 << " == " << number2 << "\n";
   }

   if (number1 != number2) {
      cout << number1 << " != " << number2 << "\n";
   }

   if (number1 < number2) {
      cout << number1 << " < " << number2 << "\n";
   }

   if (number1 > number2) {
      cout << number1 << " > " << number2 << "\n";
   }

   if (number1 <= number2) {
      cout << number1 << " <= " << number2 << "\n";
   }

   if (number1 >= number2) {
      cout << number1 << " >= " << number2 << "\n";
   }
} // end function main
```
```bash
Enter two integers to compare: 5 7
5 != 7
5 < 7
5 <= 7
```

### using 声明

我们使用了 `using` 声明来避免每次使用 `std::cout` 和 `std::cin` 时都要加上 `std::` 前缀。小型程序中，我们也可以使用 `using namespace std;` 来避免每次使用标准库名称时都要加上 `std::` 前缀，但这会引入命名冲突的风险，特别是在大型项目中，因此不建议使用。

## string 类的使用

类不能自行执行。一个人可以通过“告诉”车该做什么（加速、减速、左转、右转等）来驾驶它，而无需了解汽车的内部机制是如何运作的。同样，`main` 函数可以通过调用其成员函数来“驾驶”一个字符串对象，而无需了解类的具体实现方式。从这个意义上说，以下程序中的`main`被称为驱动程序。

```cpp
// fig02_06.cpp
// Standard library string class test program. 
#include <iostream>
#include <string> 
using namespace std;

int main() {
   string s1{"happy"};    
   string s2{" birthday"};
   string s3; // creates an empty string
              
   // display the strings and show their lengths (length is C++20)
   cout << "s1: \"" << s1 << "\"; length: " << s1.length()
      << "\ns2: \"" << s2 << "\"; length: " << s2.length()
      << "\ns3: \"" << s3 << "\"; length: " << s3.length();

   // compare strings with == and !=
   cout << "\n\nThe results of comparing s2 and s1:" << boolalpha
      << "\ns2 == s1: " << (s2 == s1)
      << "\ns2 != s1: " << (s2 != s1);
   
   // test string member function empty 
   cout << "\n\nTesting s3.empty():\n";

   if (s3.empty()) {
      cout << "s3 is empty; assigning to s3;\n";
      s3 = s1 + s2; // assign s3 the result of concatenating s1 and s2
      cout << "s3: \"" << s3 << "\"";
   } 

   // testing new C++20 string member functions 
   cout << "\n\ns1 starts with \"ha\": " << s1.starts_with("ha") << "\n";
   cout << "s2 starts with \"ha\": " << s2.starts_with("ha") << "\n";
   cout << "s1 ends with \"ay\": " << s1.ends_with("ay") << "\n";
   cout << "s2 ends with \"ay\": " << s2.ends_with("ay") << "\n";
}
```
```bash
s1: "happy"; length: 5
s2: " birthday"; length: 9
s3: ""; length: 0

The results of comparing s2 and s1:
s2 == s1: false
s2 != s1: true

Testing s3.empty():
s3 is empty; assigning to s3;
s3: "happy birthday"

s1 starts with "ha": true
s2 starts with "ha": false
s1 ends with "ay": false
s2 ends with "ay": true
```

### 初始化变量

我们声明了三个 `string` 变量

- `s1` 被初始化为字符串字面量 `"happy"`
- `s2` 被初始化为字符串字面量 `" birthday"`
- `s3` 没有被显式初始化，因此它默认是一个空字符串

当我们像之前那样声明整型变量时，编译器知道int是什么——它是C++内置的一种基本类型。但是当我们声明一个 `string` 变量时，编译器不知道 `string` 是什么。我们必须告诉编译器 `string` 是一个类，并且它的定义在 `<string>` 头文件中。因此，我们必须包含 `<string>` 头文件。

如果封装得当，类可以被其他程序员重用。这是像 C++ 这样支持面向对象编程的语言最显著的优势之一。这类语言拥有丰富的、功能强大的预构建类库。例如，通过包含适当的头文件（例如 `<string>` 头文件），你可以在任何程序中重用 C++ 标准库中的类。与`cout`一样，`string` 也属于 `std` 命名空间。

### string 成员函数 length

`string` 类提供了一个成员函数 `length`，它返回字符串中的字符数。成员函数是与类相关联的函数。要调用成员函数，必须使用点运算符（`.`）将成员函数名称连接到一个对象上。例如，`s1.length()` 调用 `s1` 对象的 `length` 成员函数，返回字符串 `s1` 中的字符数。

### 字符串的比较

`string` 类重载了关系运算符 `==` 和 `!=`，因此你可以使用这些运算符来比较字符串对象，字符串比较是区分大小写的。

通常，在输出条件语句的值时，C++会显示 0 表示假，显示 1 表示真。`<iostream>`头文件中的流操作符`boolalpha`告诉输出以更自然的方式将条件值显示为`false`或`true`字样。

### string 成员函数 empty

这是一个用来检查字符串是否为空的成员函数。如果字符串不包含任何字符，则 `empty` 成员函数返回 `true`；否则返回 `false`。

### string 的连接与赋值

字符串可以使用 `+` 运算符连接在一起。连接两个字符串会产生一个新字符串，该新字符串包含了两个原始字符串的内容。连接操作不会修改原始字符串。

### string 成员函数 starts_with 和 ends_with

`string` 类提供了两个成员函数 `starts_with` 和 `ends_with`，它们分别检查字符串是否以指定的子字符串开头或结尾。