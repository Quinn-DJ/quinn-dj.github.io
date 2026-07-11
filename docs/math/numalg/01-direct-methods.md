# 01: 三角形方程组与高斯消元

## 三角形方程组

若系数矩阵已是三角形式，解可以逐行/逐列直接写出，无需消元。

一般的，我们将下三角矩阵记为 $L = (l_{ij})$，上三角矩阵记为 $U = (u_{ij})$，则：

### 前代法

用于**下三角**方程组 $Lx = b$，其中 $l_{ij} = 0$（$i < j$），原始方程组为：

$$
\begin{align*}
l_{11}x_1 & & & & = b_1 \\
l_{21}x_1 & + l_{22}x_2 & & & = b_2 \\
& \vdots & \ddots & & \vdots \\
l_{n1}x_1 & + l_{n2}x_2 & + \dots & + l_{nn}x_n & = b_n
\end{align*}
$$

从上到下逐行求解，得到：

$$
x_1 = \frac{b_1}{l_{11}}, \qquad
x_k = \frac{1}{l_{kk}}\left(b_k - \sum_{j=1}^{k-1} l_{kj}x_j\right), \quad k = 2,\dots,n
$$

```python
def forward_substitution(L, b):
    n = len(b)
    x = [0.0] * n
    for k in range(n):
        s = sum(L[k][j] * x[j] for j in range(k))
        x[k] = (b[k] - s) / L[k][k]
    return x
```

### 后代法

用于**上三角**方程组 $Ux = b$，其中 $u_{ij} = 0$（$i > j$），原始方程组为：

$$
\begin{align*}
u_{11}x_1 & + u_{12}x_2 & + \dots & + u_{1n}x_n & = b_1 \\
& u_{22}x_2 & + \dots & + u_{2n}x_n & = b_2 \\
& & \ddots & & \vdots \\
& & & u_{nn}x_n & = b_n
\end{align*}
$$

从下到上逐行求解，得到：

$$
x_n = \frac{b_n}{u_{nn}}, \qquad
x_k = \frac{1}{u_{kk}}\left(b_k - \sum_{j=k+1}^{n} u_{kj}x_j\right), \quad k = n-1,\dots,1
$$

```python
def backward_substitution(U, b):
    n = len(b)
    x = [0.0] * n
    for k in range(n - 1, -1, -1):
        s = sum(U[k][j] * x[j] for j in range(k + 1, n))
        x[k] = (b[k] - s) / U[k][k]
    return x
```

!!! tip "计算量"
    前代和后代各约 $n^2/2$ 次乘除、$n^2/2$ 次加减，总计 $O(n^2)$。

---

## 高斯消元法

### 基本流程

1. **消元过程**：对 $k = 1,\dots,n-1$，用第 $k$ 行消去第 $k+1$ 到第 $n$ 行中 $x_k$ 的系数
2. **回代过程**：对上三角方程组用后代法求解

!!! info "复杂度"
    消元约 $2n^3/3$ 次乘除 + 回代 $O(n^2)$，总计 $O(n^3)$。

### LU 分解

不选主元的高斯消元等价于 $A = LU$：

- $L$：单位下三角矩阵（对角元为 1），存储消元乘数 $l_{ik} = a_{ik}^{(k)} / a_{kk}^{(k)}$
- $U$：上三角矩阵，即消元后的系数矩阵

```python
def lu_decomposition(A):
    n = len(A)
    L = [[0.0] * n for _ in range(n)]
    U = [[0.0] * n for _ in range(n)]
    for i in range(n):
        L[i][i] = 1.0
    for k in range(n):
        U[k][k] = A[k][k]
        for i in range(k + 1, n):
            L[i][k] = A[i][k] / U[k][k]
            U[k][i] = A[k][i]
        for i in range(k + 1, n):
            for j in range(k + 1, n):
                A[i][j] -= L[i][k] * U[k][j]
    return L, U
```

### 普通高斯消元条件

消元乘数 $l_{ik}$ 的式子中 $a_{kk}^{(k)}$ 出现在分母中，为了高斯消元能顺利进行，这意味着对于所有的 $k$，$a_{kk}^{(k)} \neq 0$，从而推出

$$
\det(A_k) \neq 0, \quad k = 1,\dots,n-1
$$

### 全主元消去法

在第 $k$ 步，从整个剩余子矩阵中选取绝对值最大的元素，通过**行列交换**移至 $(k,k)$：

$$
|a_{pq}^{(k)}| = \max_{k \le i,j \le n} |a_{ij}^{(k)}|
$$

最终等价于 $PAQ = LU$，其中 $P$、$Q$ 是排列矩阵。

### 列主元消去法

全主元法在寻找主元时需要在剩余子矩阵中搜索，时间复杂度为 $O(n^2)$，因此在实际应用中不常用。列主元法只在第 $k$ 列中搜索主元，时间复杂度为 $O(n)$，因此更常用。

在第 $k$ 步，选取第 $k$ 列中绝对值最大的元素作为主元，通过**行交换**移至 $(k,k)$：

$$
|a_{pk}^{(k)}| = \max_{k \le i \le n} |a_{ik}^{(k)}|
$$

等价于 $PA = LU$，其中 $P$ 是排列矩阵。

其中

$$
P = P_{n-1} \cdots P_2 P_1, \quad L = P(L_{n-1}P_{n-1}\cdots L_1P_1)^{-1}
$$


| 策略 | 搜索范围 | 交换 | 稳定性 | 开销 |
|------|:---:|------|:---:|------|
| 无选主元 | — | — | 差 | 无 |
| 列主元 | 第 $k$ 列 | 行交换 | 良好 | $O(n^2)$ |
| 全主元 | 剩余子矩阵 | 行列交换 | 最优 | 较大 |

!!! tip "实践建议"
    列主元高斯消元是实际应用中最常用的直接法。LAPACK 中对应 `dgesv`（一般矩阵）和 `dposv`（对称正定）。

---

## 方法对比

| 方法 | 适用条件 | 复杂度 | 并行性 | 稳定性 |
|------|---------|:---:|:---:|:---:|
| 前代法 | 下三角矩阵 | $O(n^2)$ | 差（串行依赖） | 好 |
| 后代法 | 上三角矩阵 | $O(n^2)$ | 差（串行依赖） | 好 |
| 高斯消元（无选主元） | 顺序主子式 $\neq 0$ | $O(n^3)$ | 部分可并行 | 差 |
| 列主元高斯消元 | 一般非奇异 | $O(n^3)$ | 部分可并行 | 良好 |
