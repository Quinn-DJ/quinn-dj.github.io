# 03: 范数与精度估计

> 数值计算的每一步都伴随着误差。范数是对向量和矩阵"大小"的度量，是分析误差传播的基础工具。条件数刻画问题本身对扰动的敏感程度，而舍入误差分析则揭示算法的数值稳定性。

---

## 向量范数

### 定义

设 $\mathbb{R}^n$（或 $\mathbb{C}^n$）上的实值函数 $\|\cdot\|$，若满足：

1. **正定性**：$\|x\| \ge 0$，且 $\|x\| = 0 \iff x = 0$
2. **齐次性**：$\|\alpha x\| = |\alpha|\,\|x\|$，$\forall \alpha \in \mathbb{R}$（或 $\mathbb{C}$）
3. **三角不等式**：$\|x + y\| \le \|x\| + \|y\|$

则称 $\|\cdot\|$ 为向量范数。

### p-范数

也被称为 Holder 范数，对于 $x = (x_1, \cdots, x_n)^T$，p-范数为

$$
\|x\|_p = \left(\sum_{i=1}^{n} |x_i|^p\right)^{1/p}
$$

常见的有 $p = 1, 2, \infty$，即
$$
\|x\|_1 = \sum_{i=1}^{n} |x_i| \\
\|x\|_2 = \sqrt{\sum_{i=1}^{n} |x_i|^2} \\
\|x\|_\infty = \max_{1 \le i \le n} |x_i|
$$

```python
import math

def vector_norm(x, p=2):
    """计算向量 x 的 p-范数"""
    if p == float('inf'):
        return max(abs(v) for v in x)
    if p == 1:
        return sum(abs(v) for v in x)
    return sum(abs(v) ** p for v in x) ** (1 / p)
```

### 连续性

向量范数是其 n 个分量的连续函数，因此向量范数是连续的。

### 等价性

有限维空间中，所有范数等价：对任意范数 $\|\cdot\|_\alpha$ 和 $\|\cdot\|_\beta$，存在 $m, M > 0$ 使

$$
m \|x\|_\alpha \le \|x\|_\beta \le M \|x\|_\alpha, \quad \forall x \in \mathbb{R}^n
$$

常用不等式：

$$
\|x\|_2 \leq \|x\|_1 \leq \sqrt{n}\,\|x\|_2 \\
\|x\|_\infty \leq \|x\|_2 \leq \sqrt{n}\,\|x\|_\infty \\
\|x\|_\infty \leq \|x\|_1 \leq n\,\|x\|_\infty
$$

### 收敛性

记 $x^{(m)} = (x_1^{(m)}, \ldots, x_n^{(m)})^T$，若存在 $x = (x_1, \ldots, x_n)^T$ 使得 $\lim_{m \to \infty} \|x^{(m)} - x\| = 0$，则称 $x^{(m)}$ 收敛于 $x$，同时等价于 $\lim_{m \to \infty} x_i^{(m)} = x_i$ 对所有 $i = 1, \ldots, n$ 成立。

---

## 矩阵范数

### 定义

定义 $\|\cdot\|: \mathbb{R}^{m \times n} \to \mathbb{R}$，若满足对所有的 $A \in \mathbb{R}^{m \times n}$：

1. **正定性**：$\|A\| \ge 0$，且 $\|A\| = 0 \iff A = 0$
2. **齐次性**：$\|\alpha A\| = |\alpha|\,\|A\|$，$\forall \alpha \in \mathbb{R}$
3. **三角不等式**：$\|A + B\| \le \|A\| + \|B\|$
4. **相容性**：$\|AB\| \le \|A\| \cdot \|B\|$，$\forall B \in \mathbb{R}^{n \times p}$

### 连续性

矩阵范数是其 $m \times n$ 个元素的连续函数，因此矩阵范数是连续的。

### 等价性

有限维空间中，所有矩阵范数等价：对任意范数 $\|\cdot\|_\alpha$ 和 $\|\cdot\|_\beta$，存在 $m, M > 0$ 使

$$
m \|A\|_\alpha \le \|A\|_\beta \le M \|A\|_\alpha, \quad \forall A \in \mathbb{R}^{m \times n}
$$

### 诱导范数

设 $A \in \mathbb{R}^{n \times n}$，定义

$$
||| A ||| = \max_{x \in \mathbb{R}^n, x \neq 0} \frac{\|Ax\|}{\|x\|} = \max_{\|x\|=1} \|Ax\|
$$

$||| \cdot |||$ 是矩阵范数，并且由向量范数 $\|\cdot\|$ 诱导而来，后面简记为 $\|\cdot\|$.

特别的，由 $\|\cdot\|_p$ 诱导出的矩阵范数定义为

$$
\|A\|_p = \max_{\|x\|_p = 1} \|Ax\|_p
$$

### 常用矩阵范数

**1-范数**

$$
\|A\|_1 = \max_{1 \le j \le n} \sum_{i=1}^{m} |a_{ij}|
$$

也被称为列和范数。

**$\infty$-范数**

$$
\|A\|_\infty = \max_{1 \le i \le m} \sum_{j=1}^{n} |a_{ij}|
$$

也被称为行和范数。

**2-范数**

$$
\|A\|_2 = \sqrt{\rho(A^T A)}
$$

其中 $\rho(\cdot)$ 为谱半径，$\|A\|_2$ 也被称为谱范数。

!!! note "谱半径"
    若 $A$ 有特征值 $\lambda_1, \ldots, \lambda_n$，则 $A$ 的谱半径为
    $$ \rho(A) = \max_{1 \le i \le n} |\lambda_i| $$

特别的，若 $A$ 是对称矩阵，则 $\|A\|_2 = \rho(A)$。

```python
def matrix_norm_1(A):
    """矩阵 1-范数：最大绝对列和"""
    n = len(A[0])
    m = len(A)
    return max(sum(abs(A[i][j]) for i in range(m)) for j in range(n))

def matrix_norm_inf(A):
    """矩阵 ∞-范数：最大绝对行和"""
    return max(sum(abs(v) for v in row) for row in A)
```

### 谱半径与矩阵范数的关系

1. $\rho(A) \le \|A\|$ 对任意诱导范数成立
2. $\forall \varepsilon > 0$，存在某个诱导范数使得 $\|A\| \le \rho(A) + \varepsilon$

### 收敛性

1. 矩阵收敛

记 $A^{(m)} = (a_{ij}^{(m)})$，若存在矩阵 $A = (a_{ij})$ 使得 $\lim_{m \to \infty} \|A^{(m)} - A\| = 0$，则称 $A^{(m)}$ 收敛于 $A$，记作 $\lim_{m \to \infty} A^{(m)} = A$。等价于 $\lim_{m \to \infty} a_{ij}^{(m)} = a_{ij}$ 对所有 $i, j$ 成立。

**$\{A^{(m)}\}$ 的收敛性与范数定义无关！**

2. 收敛矩阵

对于 $A = (a_{ij})$，若 $\lim_{k \to \infty} A^k = 0$（零矩阵），则称 $A$ 为**收敛矩阵**。

若 $A$ 是收敛矩阵，则 $\rho(A) < 1$。并且有推论：若 $\|A\| < 1$，则 $A$ 是收敛矩阵。

3. 矩阵级数

设 $A^{(m)} = (a_{ij}^{(m)})$，若级数 $\sum_{m=1}^{\infty} a_{ij}^{(m)}$ 对所有 $i, j$ 收敛，则称矩阵级数 $\sum_{m=1}^{\infty} A^{(m)}$ 收敛。

$\sum_{k=0}^{\infty} A^k$ 收敛的充要条件是 $A$ 是收敛矩阵。

若 $\sum_{k=0}^{\infty} A^k$ 收敛，则 $(I - A)$ 可逆，且
$$ (I - A)^{-1} = \sum_{k=0}^{\infty} A^k $$
并存在诱导范数 $\|\cdot\|_\alpha$，
$$ \|(I - A)^{-1} - \sum_{k=0}^{m} A^k\|_\alpha \leq \frac{\|A\|_\alpha^{m+1}}{1 - \|A\|_\alpha} $$

推论：若 $\|A\| < 1$，且 $\|I\| = 1$，则 $I - A$ 可逆，且
$$ \|(I - A)^{-1}\| \leq \frac{1}{1 - \|A\|} $$

---

## 敏度分析与条件数

### 矩阵 $A$ 扰动

$$
(A + \delta A)(x + \delta x) = b
$$

$$
\frac{\|\delta x\|}{\|x\|} \leq \frac{\|A^{-1}\| \|A\| \frac{\|\delta A\|}{\|A\|}}{1 - \|A^{-1}\| \|A\| \frac{\|\delta A\|}{\|A\|}}
\sim \|A^{-1}\| \|A\| \frac{\|\delta A\|}{\|A\|}
$$

### 常数项 $b$ 波动

$$
A(x + \delta x) = b + \delta b
$$

$$
\frac{\|\delta x\|}{\|x\|} \leq \|A^{-1}\| \|A\| \frac{\|\delta b\|}{\|b\|}
$$

### 条件数

$A$ 非奇异，记 $A$ 的条件数为
$$ \kappa(A) = \|A^{-1}\| \|A\| $$

!!! note "条件数性质"
    1. 条件数大（小），$A$ 是病（良）态的
    2. 任意两个范数下的条件数是等价的
    3. $\kappa(A) \geq 1$
   
若 $A \in \mathbb{R}^{n \times n}$ 非奇异，$b \in \mathbb{R}^n$，假定 $\delta A \in \mathbb{R}^{n \times n}$，满足 $\|A^{-1}\| \|\delta A\| < 1$，则
$$ \frac{\|\delta x\|}{\|x\|} \leq \kappa(A) \left(\frac{\|\delta A\|}{\|A\|} + \frac{\|\delta b\|}{\|b\|}\right)
$$

---

## 精度估计

设 $Ax = b$ 计算出的计算解为 $\hat{x}$，令
$$ r = b - A\hat{x} $$
那么 $x - \hat{x} = A^{-1}r$，即有
$$ \frac{\|x - \hat{x}\|}{\|x\|} \leq \kappa(A) \frac{\|r\|}{\|b\|} $$
取无穷范数时，有
$$ \frac{\|x - \hat{x}\|_\infty}{\|x\|_\infty} \leq \kappa_\infty(A) \frac{\|r\|_\infty}{\|b\|_\infty} $$