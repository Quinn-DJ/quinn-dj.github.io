# 02: 正定矩阵的分解

> 当矩阵对称正定时，LU 分解退化为更高效的 Cholesky 分解——计算量减半、无需选主元。进一步推广到带状矩阵，可以得到 $O(n)$ 的直接法。

---

## Cholesky 分解: $A = LL^T$

设 $A \in \mathbb{R}^{n \times n}$ 对称正定（$A = A^T$，$x^T A x > 0$ 对所有 $x \neq 0$）。

存在唯一的**下三角矩阵** $L$（对角元为正）使得

$$
A = LL^T
$$

### 逐列计算

对 $j = 1,\dots,n$：

$$
l_{jj} = \sqrt{a_{jj} - \sum_{k=1}^{j-1} l_{jk}^2}
$$

对 $i = j+1,\dots,n$：

$$
l_{ij} = \frac{1}{l_{jj}} \left( a_{ij} - \sum_{k=1}^{j-1} l_{ik}l_{jk} \right)
$$

```python
import math

def cholesky(A):
    n = len(A)
    L = [[0.0] * n for _ in range(n)]
    for j in range(n):
        s = sum(L[j][k] ** 2 for k in range(j))
        L[j][j] = math.sqrt(A[j][j] - s)
        for i in range(j + 1, n):
            s = sum(L[i][k] * L[j][k] for k in range(j))
            L[i][j] = (A[i][j] - s) / L[j][j]
    return L
```

!!! note "为什么可以免选主元？"
    对称正定矩阵的**所有顺序主子式均大于零**，这意味着每一步的对角元 $l_{jj}$ 始终合法（被开方数 $>0$），消元过程中不会出现零主元。

| 特性 | LU 分解 | Cholesky 分解 |
|------|--------|:---:|
| 计算量 | $\sim 2n^3/3$ | $\sim n^3/3$ |
| 存储 | $n^2$ | $n(n+1)/2$（下三角） |
| 选主元 | 列主元常需 | 不需要 |
| 适用条件 | 一般非奇异 | 对称正定 |

---

## 改进的平方根分解: $A = LDL^T$

为避免 Cholesky 中的开方运算：

$$
A = LDL^T
$$

其中
- $L$：单位下三角矩阵（对角元全为 1）
- $D = \operatorname{diag}(d_1,\dots,d_n)$：对角矩阵

对 $j = 1,\dots,n$：

$$
d_j = a_{jj} - \sum_{k=1}^{j-1} d_k l_{jk}^2
$$

对 $i = j+1,\dots,n$：

$$
l_{ij} = \frac{1}{d_j} \left( a_{ij} - \sum_{k=1}^{j-1} d_k l_{ik} l_{jk} \right)
$$

```python
def ldl_decomposition(A):
    n = len(A)
    L = [[0.0] * n for _ in range(n)]
    D = [0.0] * n
    for i in range(n):
        L[i][i] = 1.0
    for j in range(n):
        s = sum(D[k] * L[j][k] ** 2 for k in range(j))
        D[j] = A[j][j] - s
        for i in range(j + 1, n):
            s = sum(D[k] * L[i][k] * L[j][k] for k in range(j))
            L[i][j] = (A[i][j] - s) / D[j]
    return L, D
```

---

## 推广：带状矩阵

我们只研究三对角矩阵，即

$$
A = \begin{bmatrix}
a_1 & b_1 & & & \\
c_2 & a_2 & b_2 & & \\
& \ddots & \ddots & \ddots & \\
& & c_{n-1} & a_{n-1} & b_{n-1} \\
& & & c_n & a_n
\end{bmatrix}
$$

### 进行 LU 分解

对三对角矩阵 $A$ 作 $LU$ 分解，$L$ 为**单位下双对角**、$U$ 为**上双对角**：

$$
A = LU = \begin{bmatrix}
\alpha_1 & & & \\
r_2 & \alpha_2 & & \\
& \ddots & \ddots & \\
& & r_n & \alpha_n
\end{bmatrix}
\begin{bmatrix}
1 & \beta_1 & & \\
& 1 & \beta_2 & \\
& & \ddots & \ddots \\
& & & 1
\end{bmatrix}
$$

比较等式两边的每一个元素，就得到：

$$
\begin{align*}
& r_i = c_i \\
& \alpha_i = a_i - c_i \beta_{i-1},\quad \beta_0 = 0 \\
& \beta_i = \frac{b_i}{\alpha_i}
\end{align*}
$$

### 追赶法

求 $Ax = f = (f_1, f_2, \cdots, f_n)^T$，$A$ 为三对角矩阵
$$
\begin{align*}
Ly = f & \implies y_i = (f_i - c_i y_{i-1}) / \alpha_i, \quad && i = 1,2,\dots,n \\
Ux = y & \implies x_i = y_i - \beta_i x_{i+1}, \quad && i = n, n-1, \dots, 1, \quad \beta_n = 0
\end{align*}
$$

两者结合，得到

$$
\begin{align*}
& \alpha_i = a_i - c_i \beta_{i-1},\quad \beta_0 = 0 \\
& \beta_i = \frac{b_i}{\alpha_i} \\
& y_i = (f_i - c_i y_{i-1}) / \alpha_i \\
& x_i = y_i - \beta_i x_{i+1}
\end{align*}
$$

```python
def thomas_algorithm(a, b, c, f):
    n = len(a)
    # Forward sweep
    alpha = [0] * n
    beta = [0] * n
    y = [0] * n
    alpha[0] = a[0]
    beta[0] = b[0] / alpha[0]
    y[0] = f[0] / alpha[0]
    for i in range(1, n):
        alpha[i] = a[i] - c[i] * beta[i - 1]
        beta[i] = b[i] / alpha[i]
        y[i] = (f[i] - c[i] * y[i - 1]) / alpha[i]
    # Back substitution
    x = [0] * n
    x[-1] = y[-1]
    for i in range(n - 2, -1, -1):
        x[i] = y[i] - beta[i] * x[i + 1]
    return x
```

!!! note "追赶法的数值稳定性"
    若 $A$ 是**严格对角占优**的三对角矩阵（$|a_i| > |b_i| + |c_i|$），则追赶法数值稳定，且 $|l_i| < 1$、$u_i \neq 0$，不会出现零主元。

| 特性 | 一般 LU | 追赶法 |
|------|:-------:|:------:|
| 计算量 | $\sim 2n^3/3$ | $O(8n)$ |
| 存储 | $n^2$ | $4n$（三个对角线 + 右端项） |
| 适用条件 | 一般非奇异 | 三对角（对角占优更佳） |

---

## 分解方法全览

| 分解 | 适用条件 | 计算量 | 选主元 | 备注 |
|------|---------|:---:|:---:|------|
| $A = LU$ | 顺序主子式 $\neq 0$ | $\sim 2n^3/3$ | 否 | 基本分解 |
| $PA = LU$ | 一般非奇异 | $\sim 2n^3/3$ | 列主元 | 最通用 |
| $A = LL^T$ | 对称正定 | $\sim n^3/3$ | 否 | 存储/计算减半 |
| $A = LDL^T$ | 对称正定 | $\sim n^3/3$ | 否 | 避免开方 |
| $A = LU$ | 三对角 | $O(8n)$ | 否 | 追赶法 |