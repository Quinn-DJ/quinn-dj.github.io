---
title: DS-1 斐波那契数列
authors: [Quinn]
comments: true
date: 2025-09-17
tags:
  - 数据结构与算法
---

### 题目描述

请根据以下公式计算斐波那契数列的第 $n$ 项：

$$
\begin{bmatrix}
    f_{n + 1} \\
    f_n
\end{bmatrix}
=
\begin{bmatrix}
    1 & 1 \\
    1 & 0
\end{bmatrix}
\begin{bmatrix}
    f_n \\
    f_{n - 1}
\end{bmatrix}
=
\begin{bmatrix}
    1 & 1 \\
    1 & 0
\end{bmatrix}^n
\begin{bmatrix}
    f_1 \\
    f_0
\end{bmatrix}
$$

其中 $f_0 = 0, f_1 = 1$。
为了避免答案太大，请将答案对 $10^9 + 7$ 取模后输出。

### 提示
矩阵的 $n$ 次幂可以用以下公式快速计算：

$$
A^n = 
\begin{cases}
    (A^{n / 2})^2, & \text{if n is even} \\
    (A^{(n - 1) / 2})^2 \cdot A, & \text{if n is odd} \\
\end{cases}
$$

你可以编写一个递归函数 `power(A, n)` 来计算 $A^n$。

### 数据范围

保证传入的参数 $n \leq 10^{18}$。

### 接口定义
```cpp
int fibonacci(long long n);
```

### 解题思路

根据：

$$
\begin{bmatrix}
    f_n \\
    f_{n - 1}
\end{bmatrix}
=
\begin{bmatrix}
    1 & 1 \\
    1 & 0
\end{bmatrix}^{n - 1}
\begin{bmatrix}
    f_1 \\
    f_0
\end{bmatrix}
=
\begin{bmatrix}
    1 & 1 \\
    1 & 0
\end{bmatrix}^{n - 1}
\begin{bmatrix}
    1 \\
    0
\end{bmatrix}
$$

我们令 $A = \begin{bmatrix}
    1 & 1 \\
    1 & 0
\end{bmatrix}$，则 $f_n$ 就是 $A^{n - 1}$ 的第一行第一列的元素。而 $A^{n - 1}$可以由递归快速计算出来。

为了方便未来拓展，我将矩阵定义成一个结构体 `Matrix`，方便用于函数返回值
```cpp
struct Matrix {
    // 由于题目中只可能是 2x2 矩阵，所以这里并没有添加行列数
    int m[2][2];
};
```

`cpp` 中没有内置矩阵乘法，所以我们需要自己实现一个矩阵乘法函数 `multiply`

```cpp
Matrix multiply(const Matrix &a, const Matrix &b) {
    Matrix c;
    for (int i = 0; i < 2; ++i) {
        for (int j = 0; j < 2; ++j) {
            c.m[i][j] = a[i][0] * b[0][j]
                      + a[i][1] * b[1][j];
        }
    }
    return c;
}
```

接下来我们就可以实现矩阵快速幂函数 `power`

```cpp
Matrix power(Matrix a, int n) {
    Matrix result;
    if (n == 1) {
        return a;
    }
    result = power(a, n / 2);
    result = multiply(result, result);
    if (n % 2) {
        result = multiply(result, a);
    }
    return result;
}
```

那么 `fibonacci` 函数就可以轻松实现了

### 测试代码

```cpp
#include <iostream>
#include "fibonacci.hpp"
#define MOD 1000000007
using namespace std;

/*
也可以删去 #include "fibonacci.hpp"
然后将你的代码放在这里
*/

int main() {
    int N;
    cin >> N;
    cout << "Your answer: " << fibonacci(N) << endl;
    int fib_prev = 0, fib_curr = 1;
    if (N == 0) {
        cout << "Correct answer: " << fib_prev << endl;
    } else if (N == 1) {
        cout << "Correct answer: " << fib_curr << endl;
    } else {
        for (int i = 2; i <= N; ++i) {
            int fib_next = (fib_prev + fib_curr) % MOD;
            fib_prev = fib_curr;
            fib_curr = fib_next;
        }
        cout << "Correct answer: " << fib_curr << endl;
    }
    return 0;
}
```
### 参考代码
```cpp
// 多处用到对 10^9 + 7 取模，所以定义成常量
#define MOD 1000000007

struct Matrix {
    // 为了防止乘法时溢出，改用 long long
    long long m[2][2];
};

Matrix multiply(const Matrix &a, const Matrix &b) {
    Matrix c;
    for (int i = 0; i < 2; ++i) {
        for (int j = 0; j < 2; ++j) {
            // 时刻注意取模
            c.m[i][j] = a.m[i][0] * b.m[0][j] % MOD
                      + a.m[i][1] * b.m[1][j] % MOD;
            c.m[i][j] %= MOD;
        }
    }
    return c;
}

Matrix power(Matrix a, long long n) {
    // 终止条件判断
    if (n == 1) {
        return a;
    }
    Matrix result;
    result = power(a, n / 2);
    result = multiply(result, result);
    if (n % 2) { // n 是奇数
        result = multiply(result, a);
    }
    return result;
}

int fibonacci(long long n) {
    // 特殊情况的处理
    if (n == 0) return 0;
    if (n == 1) return 1;
    Matrix a;
    a.m[0][0] = 1; a.m[0][1] = 1;
    a.m[1][0] = 1; a.m[1][1] = 0;
    Matrix result;
    result = power(a, n-1);
    return (int)result.m[0][0];
}
```