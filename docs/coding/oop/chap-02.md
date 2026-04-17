---
title: Chapter 2：算法开发与控制语句
authors: [Quinn]
comments: true
date: 2026-04-08
tags:
  - 面向对象编程
---

# Chapter 2: 算法开发与控制语句

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