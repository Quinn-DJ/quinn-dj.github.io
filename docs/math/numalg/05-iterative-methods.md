# 05: 迭代法

> 当矩阵规模上百万且每行只有几十个非零元时，$O(n^3)$ 的直接法完全不可行。迭代法每步只需稀疏矩阵-向量乘法（$O(\text{nnz})$），是处理大规模稀疏问题的标准工具。

---

## 迭代法的一般框架

### 分裂法

将 $A$ 分裂为 $A = M - N$，其中 $M$ 非奇异且"易于求逆"（如对角、三角矩阵）：

$$
Ax = b \iff Mx = Nx + b \iff x = M^{-1}Nx + M^{-1}b
$$

定义**迭代矩阵** $G = M^{-1}N$ 和常向量 $f = M^{-1}b$：

$$
x^{(k+1)} = G x^{(k)} + f
$$

### 收敛性定理

迭代法收敛的**充要条件**：

$$
\rho(G) < 1
$$

其中 $\rho(G) = \max_i |\lambda_i(G)|$ 是迭代矩阵的**谱半径**。

!!! important "收敛速度"
    $\|e^{(k)}\| \approx \rho^k \|e^{(0)}\|$，每步约减少因子 $\rho$。达到精度 $\varepsilon$ 所需迭代步数：
    $$
    k \approx \frac{\log \varepsilon}{\log \rho}
    $$

### 收敛的充分条件

以下均保证 $\rho(G) < 1$：

- $\|G\| < 1$ 对某诱导范数成立
- $A$ **严格对角占优** $\implies$ Jacobi 和 Gauss-Seidel 均收敛
- $A$ **对称正定** $\implies$ Gauss-Seidel 收敛；SOR 当 $0 < \omega < 2$ 时收敛
- $A$ 是 **M-矩阵** $\implies$ Jacobi、Gauss-Seidel、SOR（$0<\omega\le 1$）均收敛

---

## Jacobi 迭代

### 分裂方式

将 $A$ 写为 $A = D - L - U$：

- $D$：对角部分
- $-L$：严格下三角部分
- $-U$：严格上三角部分

取 $M = D$，$N = L + U$：

$$
x^{(k+1)} = D^{-1}(L+U)x^{(k)} + D^{-1}b
$$

### 分量形式

$$
x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j \neq i} a_{ij} x_j^{(k)}\right), \quad i = 1,\dots,n
$$

```python
def jacobi(A, b, x0, tol=1e-6, max_iter=1000):
    n = len(b)
    x = x0[:]
    x_new = [0.0] * n
    for it in range(max_iter):
        for i in range(n):
            s = sum(A[i][j] * x[j] for j in range(n) if j != i)
            x_new[i] = (b[i] - s) / A[i][i]
        if max(abs(x_new[i] - x[i]) for i in range(n)) < tol:
            return x_new
        x = x_new[:]
    return x
```

!!! tip "并行性"
    Jacobi 的每个分量更新互不依赖——天然适合 GPU / 多核并行。

---

## Gauss-Seidel 迭代

### 分裂方式

取 $M = D - L$，$N = U$：

$$
x^{(k+1)} = (D - L)^{-1} U x^{(k)} + (D - L)^{-1} b
$$

### 分量形式

$$
x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j < i} a_{ij} x_j^{(k+1)} - \sum_{j > i} a_{ij} x_j^{(k)}\right)
$$

!!! important "关键区别"
    计算 $x_i^{(k+1)}$ 时**立即使用**已算出的 $x_1^{(k+1)},\dots,x_{i-1}^{(k+1)}$。这使收敛通常比 Jacobi 快约一倍，但牺牲了并行度。

```python
def gauss_seidel(A, b, x0, tol=1e-6, max_iter=1000):
    n = len(b)
    x = x0[:]
    for it in range(max_iter):
        x_old = x[:]
        for i in range(n):
            s1 = sum(A[i][j] * x[j] for j in range(i))      # 已更新的分量
            s2 = sum(A[i][j] * x_old[j] for j in range(i+1, n))  # 旧分量
            x[i] = (b[i] - s1 - s2) / A[i][i]
        if max(abs(x[i] - x_old[i]) for i in range(n)) < tol:
            return x
    return x
```

---

## SOR 松弛迭代

在 Gauss-Seidel 基础上引入**松弛因子** $\omega$：

$$
x_i^{(k+1)} = (1 - \omega)\, x_i^{(k)} + \omega \cdot \frac{1}{a_{ii}}\left(b_i - \sum_{j < i} a_{ij} x_j^{(k+1)} - \sum_{j > i} a_{ij} x_j^{(k)}\right)
$$

对应分裂：$M = \dfrac{1}{\omega}D - L$。

| $\omega$ 取值 | 效果 |
|:---:|------|
| $0 < \omega < 1$ | 低松弛（欠松弛）—— 用于不收敛的 Gauss-Seidel |
| $\omega = 1$ | 退化为 Gauss-Seidel |
| $1 < \omega < 2$ | 超松弛（SOR）—— 加速收敛 |

!!! tip "最优 $\omega$"
    存在 $\omega_{\text{opt}} \in (1, 2)$ 使 $\rho(G_\omega)$ 最小。对某些特殊矩阵（如一致排序矩阵）可解析求解：
    $$
    \omega_{\text{opt}} = \frac{2}{1 + \sqrt{1 - \rho(J)^2}}
    $$
    其中 $\rho(J)$ 是 Jacobi 迭代矩阵的谱半径。一般情形需通过实验估计。

---

## 方法对比

| 方法 | $M$ | 并行性 | 收敛速度 | 存储 |
|------|-----|:---:|:---:|:---:|
| Jacobi | $D$ | 好 | 基准 | 旧向量 + 新向量 |
| G-S | $D - L$ | 差 | $\approx 2\times$ Jacobi | 原位更新 |
| SOR | $\frac{1}{\omega}D - L$ | 差 | 选 $\omega_{\text{opt}}$ 可大幅加速 | 原位更新 |

!!! warning "经典迭代法的局限"
    Jacobi、Gauss-Seidel、SOR 统称**经典迭代法**（也称定常迭代法），收敛速度受限于谱半径，对病态问题极慢。现代大规模求解器通常优先使用 **Krylov 子空间方法**（CG、GMRES、BiCGSTAB 等），这些方法将在下一章开始介绍。
