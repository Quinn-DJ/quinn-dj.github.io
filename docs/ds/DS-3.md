---
title: DS-3 后缀表达式求值
authors: [Quinn]
comments: true
date: 2025-10-23
tags:
  - 数据结构与算法
---

### **题目描述**

给定一个后缀表达式，请你计算它的值。您需要支持加、减、乘、除、幂 (`+`, `-`, `*`, `/`, `^`)
五种运算。例如：
`3 5 2 - * 7 + 0.5 ^`
上式的计算结果应为 $4$。

### **交互格式**

为避免繁琐的字符串读取与数据转换，本题为您准备好了结构化的输入数据。

```cpp
struct Type {
    char op;
    double num;
};

double calcRPN(const vector<Type> & expr);
```

`expr` 的元素为 `Type` 类型，对于一个 `Type` 类型的变量 `x`，我们规定：

- 若 `x.op == '#'`，则 `x` 表示一个数字，它的值存储在 `x.num` 里。
- 否则，`x.op` 是 `+`, `-`, `*`, `/`, `^` 里的一种符号，表示运算符。

运算过程均使用 `double`，保证不会出现非法运算。将运算结果作为 `calcRPN` 函数的返回值。

### **解题思路**

本题是经典的后缀表达式求值问题，通常使用栈来解决。我们遍历表达式的每一个元素：

- 如果当前元素是数字，我们将它压入栈中。
- 如果当前元素是运算符，我们从栈中弹出两个数字，进行相应的运算，然后将结果压回栈中。

```cpp
for (int i = 0; i < expr.size(); ++i) {
    if (expr[i].op == '#') {
        num.push_back(expr[i].num);
    } else {
        double a = num.back();
        num.pop_back();
        double b = num.back();
        num.pop_back();
        switch (expr[i].op) {
            case '+':
                num.push_back(b + a);
                break;
            case '-':
                num.push_back(b - a);
                break;
            case '*':
                num.push_back(b * a);
                break;
            case '/':
                num.push_back(b / a);
                break;
            case '^':
                num.push_back(pow(b, a));
                break;
        }
    }
}
```

最终栈中只会剩下一个数字，即为表达式的计算结果。

### **参考代码**

```cpp
#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

struct Type {
    char op;
    double num;
};

double calcRPN(const vector<Type> & expr) {
    int size = expr.size(); // get the size of the expression
    vector<double> num; // stack to store numbers
    for (int i = 0; i < size; ++i) { // traverse the expression
        if (expr[i].op == '#') { // it's a number
            num.push_back(expr[i].num); // push the number onto the stack
        } else { // it's an operator
            double a = num.back();
            num.pop_back();
            double b = num.back();
            num.pop_back(); // pop two numbers
            switch (expr[i].op) {
                case '+':
                    num.push_back(b + a); // push the result
                    break; // remember to add break statements here
                case '-':
                    num.push_back(b - a);
                    break;
                case '*':
                    num.push_back(b * a);
                    break;
                case '/':
                    num.push_back(b / a);
                    break;
                case '^':
                    num.push_back(pow(b, a));
                    break;
                // default:
                //    break;
                // No need for default case since there won't be invalid operators
            }
        }
    }
    return num[0]; // the final result
}
```

测试代码：

```cpp
// 您可以使用下面的代码在本地测试自己的程序，但在提交时请勿包含 main 函数
int main() {
    vector<Type> expr;
    expr.push_back({'#', 3.0});
    expr.push_back({'#', 5.0});
    expr.push_back({'#', 2.0});
    expr.push_back({'-', 0});
    expr.push_back({'*', 0});
    expr.push_back({'#', 7.0});
    expr.push_back({'+', 0});
    expr.push_back({'#', 0.5});
    expr.push_back({'^', 0});
    double ans = calcRPN(expr);
    cout << ans << endl; // the output should be 4.0
    return 0;
}
```