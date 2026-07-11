# 07: 特征值问题

> $Ax = \lambda x$ —— 从单特征值的幂法，到全部特征值的 QR 方法，再到对称矩阵特有的 Jacobi 方法和 Sturm 序列二分法。

---

## 问题分类

| 矩阵类型 | 特征值 | 主要方法 |
|---------|:---:|------|
| 一般方阵 | 复数 | 幂法、QR 方法 |
| 对称矩阵 | 实数 | 对称 QR、Jacobi、二分法 |
| 大规模稀疏 | 少数几个 | Lanczos / Arnoldi |

---

## 幂法（Power Method）

### 基本幂法

设 $A$ 有按模最大的单重特征值 $\lambda_1$（$|\lambda_1| > |\lambda_2| \ge \cdots \ge |\lambda_n|$）。

任取 $v^{(0)}$（不与 $\lambda_1$ 的特征向量正交），迭代：

$$
v^{(k+1)} = A v^{(k)}, \qquad \lambda_1 \approx \frac{v^{(k+1)}_i}{v^{(k)}_i} \;\text{（Rayleigh 商）}
$$

收敛速度取决于 $|\lambda_2 / \lambda_1|$。

```python
def power_method(A, v0, tol=1e-8, max_iter=1000):
    n = len(v0)
    v = v0[:]
    lam = 0.0
    for it in range(max_iter):
        w = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
        lam_new = w[0] / v[0] if v[0] != 0 else 0.0  # 任一分量比值
        norm = max(abs(x) for x in w)  # 无穷范数归一化
        v = [x / norm for x in w]
        if abs(lam_new - lam) < tol:
            return lam_new, v
        lam = lam_new
    return lam, v
```

!!! warning "限制"
    仅能收敛到**按模最大的特征值**。若 $|\lambda_1| = |\lambda_2|$（如一对共轭复根），幂法发散。

### 反幂法（Inverse Power Method）

若要求接近某 $\mu$ 的特征值，对 $(A - \mu I)^{-1}$ 使用幂法：

$$
v^{(k+1)} = (A - \mu I)^{-1} v^{(k)}
$$

按模最大的特征值是距离 $\mu$ 最近的那个。当 $\mu$ 接近某特征值时，收敛速度极快（$|\lambda_{\text{nearest}} - \mu| \ll 1$）。

实际实现中不显式求逆，而是解线性系统 $(A - \mu I) w = v^{(k)}$。

---

## QR 方法

QR 方法是求解一般矩阵**全部特征值**的标准方法。

### 基本 QR 迭代

1. $A_0 = A$
2. 迭代：$A_k = Q_k R_k$（QR 分解），$A_{k+1} = R_k Q_k$

序列 $\{A_k\}$ 保持与 $A$ 相似（因为 $A_{k+1} = Q_k^\top A_k Q_k$），且收敛到上三角形式（实 Schur 形式），对角块为特征值。

### 带位移的 QR 方法

引入位移加速收敛：

$$
(A_k - \mu_k I) = Q_k R_k, \qquad A_{k+1} = R_k Q_k + \mu_k I
$$

- **Rayleigh 商位移**：$\mu_k = a_{nn}^{(k)}$，对对称矩阵达到立方收敛
- **Francis 双位移**：用一对共轭复位移对实矩阵做等价实变换，避免复数运算

### 完整算法流程

```
1. 化为上 Hessenberg 形式 H（Householder 变换，约 10n³/3）
2. while not converged:
     (a) 选取位移 μ（Rayleigh / Francis 双位移）
     (b) H - μI = QR
     (c) H = RQ + μI
3. 读取特征值：
     - 实特征值 → 1×1 对角块
     - 复共轭特征值对 → 2×2 对角块
```

!!! info "计算量"
    Hessenberg 化约 $10n^3/3$；每次双位移 QR 迭代约 $6n^2$。LAPACK `dgeev`（一般）和 `dsyev`（对称）实现了此方法。

---

## 对称矩阵的专用方法

实对称矩阵 $A = A^\top$ 的特征值均为实数，特征向量可构成正交基。利用这一结构可设计更高效的算法。

### 对称 QR 方法

对称 Hessenberg 矩阵 = **三对角矩阵**。先将 $A$ 三对角化，再应用带位移的 QR 迭代：

- 三对角化：Householder 变换，约 $4n^3/3$
- QR 迭代：每步仅 $O(n)$（利用三对角结构）
- 收敛：Rayleigh 商位移达到**立方收敛**

---

### Jacobi 方法

通过 Givens 旋转逐个消去非对角元：

$$
A^{(k+1)} = J_{pq}^\top A^{(k)} J_{pq}
$$

旋转角度满足 $\tan(2\theta) = \dfrac{2a_{pq}^{(k)}}{a_{pp}^{(k)} - a_{qq}^{(k)}}$，使得 $a_{pq}^{(k+1)} = 0$。

```python
import math

def jacobi_eigenvalues(A, tol=1e-8, max_iter=100):
    n = len(A)
    V = [row[:] for row in A]
    for it in range(max_iter):
        # 找绝对值最大的非对角元
        p, q, max_off = 0, 1, 0.0
        for i in range(n):
            for j in range(i + 1, n):
                if abs(V[i][j]) > max_off:
                    max_off = abs(V[i][j])
                    p, q = i, j
        if max_off < tol:
            break
        # 计算旋转角度
        theta = 0.5 * math.atan2(2 * V[p][q], V[p][p] - V[q][q])
        c, s = math.cos(theta), math.sin(theta)
        # 更新 p, q 行列
        for j in range(n):
            if j not in (p, q):
                vp = c * V[p][j] - s * V[q][j]
                vq = s * V[p][j] + c * V[q][j]
                V[p][j] = V[j][p] = vp
                V[q][j] = V[j][q] = vq
        # 更新对角元和 pq 元
        V[p][p], V[q][q] = (
            c*c*V[p][p] + s*s*V[q][q] - 2*c*s*V[p][q],
            s*s*V[p][p] + c*c*V[q][q] + 2*c*s*V[p][q]
        )
        V[p][q] = V[q][p] = 0.0
    return [V[i][i] for i in range(n)]
```

!!! note "Jacobi 方法的特点"
    - 非对角元平方和**单调递减**
    - 结合循环策略可达到**三次收敛**（渐进）
    - 天然适合**并行**实现（可同时消去多对非对角元）
    - 精度极高，常被用作其他方法的校核

---

### 二分法（基于 Sturm 序列）

先将 $A$ 化为对称三对角形式：

$$
T = \begin{bmatrix}
\alpha_1 & \beta_1 & & \\
\beta_1 & \alpha_2 & \beta_2 & \\
& \ddots & \ddots & \ddots \\
& & \beta_{n-1} & \alpha_n
\end{bmatrix}
$$

定义多项式序列：

$$
\begin{aligned}
p_0(\lambda) &= 1 \\
p_1(\lambda) &= \alpha_1 - \lambda \\
p_k(\lambda) &= (\alpha_k - \lambda)\, p_{k-1}(\lambda) - \beta_{k-1}^2\, p_{k-2}(\lambda), \quad k = 2,\dots,n
\end{aligned}
$$

则 $\{p_0, p_1, \dots, p_n\}$ 构成 **Sturm 序列**。$\lambda$ 小于 $T$ 的特征值的个数等于序列 $\{p_k(\lambda)\}$ 中相邻项**符号变化**的次数。

```python
def count_eigenvalues_below(T, mu):
    """Sturm 序列法：计算三对角矩阵 T 中小于 mu 的特征值个数"""
    n = len(T)
    alpha = [T[i][i] for i in range(n)]
    beta = [T[i][i+1] for i in range(n - 1)]
    p_prev = 1.0
    p_curr = alpha[0] - mu
    count = 0
    if p_curr < 0:
        count = 1
    for k in range(2, n + 1):
        # 处理溢出：使用符号保护
        p_next = (alpha[k-1] - mu) * p_curr - (beta[k-2] ** 2) * p_prev
        if p_next * p_curr < 0:
            count += 1
        p_prev, p_curr = p_curr, p_next
    return count
```

!!! tip "何时使用二分法"
    当**只需要部分特征值**（如最小特征值、或某区间内的特征值）时，二分法比 QR 方法更高效。配合反幂法可同时求出对应的特征向量。

---

## 方法对比

| 方法 | 矩阵类型 | 求几个特征值 | 计算量 | 精度 |
|------|---------|:---:|--------|:---:|
| 幂法 | 一般方阵 | 1（最大模） | $O(n^2)$/步 | 一般 |
| 反幂法 | 一般方阵 | 1（靠近 $\mu$） | $O(n^3)$/步（解系统） | 高 |
| QR 方法 | 一般方阵 | 全部 | $O(n^3)$ | 高 |
| 对称 QR | 对称矩阵 | 全部 | $O(n^3)$（常数小） | 高 |
| Jacobi | 对称矩阵 | 全部 | $O(n^3)$ | 极高 |
| 二分法 | 对称三对角 | 任意子集 | $O(kn)$（$k$ 为所求个数） | 可控 |
| Lanczos | 稀疏对称 | $k \ll n$ | $O(k \cdot \text{nnz})$ | 良好（需重正交） |
| Arnoldi | 稀疏一般 | $k \ll n$ | $O(k \cdot \text{nnz})$ | 良好 |

!!! tip "实践建议"
    - 一般矩阵全部特征值 → QR（LAPACK `dgeev`）
    - 对称矩阵全部特征值 → 对称 QR / 分治法（LAPACK `dsyev`）
    - 对称矩阵部分特征值 → 二分法 + 反幂法（LAPACK `dstebz` + `dstein`）
    - 大规模稀疏的少数特征值 → Lanczos / Arnoldi（ARPACK、SLEPc）
