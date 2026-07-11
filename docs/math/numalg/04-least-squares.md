# 04: 最小二乘问题

> 当方程数量大于未知数数量时，$Ax = b$ 通常无解。最小二乘给出"最佳近似"——从正规方程到正交化方法，核心是如何避免条件数平方恶化。

---

## 问题提法

对于**超定**方程组（$A \in \mathbb{R}^{m \times n}$，$m > n$）：

$$
\min_{x \in \mathbb{R}^n} \|Ax - b\|_2
$$

目标函数 $f(x) = \|Ax - b\|_2^2$ 是凸二次函数，令梯度为零得**正规方程**：

$$
A^T A x = A^T b
$$

---

## 存在性与唯一性

| 条件 | 结论 |
|------|------|
| $\operatorname{rank}(A) = n$（列满秩） | $A^T A$ 非奇异，解唯一 |
| $\operatorname{rank}(A) < n$（秩亏） | 无穷多解，需额外条件（如最小范数解） |

当列满秩时：

$$
x = (A^T A)^{-1} A^T b
$$

$(A^T A)^{-1} A^T$ 是 $A$ 的**伪逆**（Moore-Penrose 伪逆在列满秩时的特例）。

!!! warning "数值陷阱：条件数平方"
    $\kappa(A^T A) = \kappa(A)^2$。若 $\kappa(A) = 10^3$，正规方程的条件数高达 $10^6$，单精度下可能完全失效。**实际计算中不推荐直接使用正规方程**。

---

## 正则化方法

当 $A$ 病态或秩亏时，加入正则化项以镇定解：

$$
\min_x \|Ax - b\|_2^2 + \lambda \|x\|_2^2
$$

正规方程变为：

$$
(A^T A + \lambda I) x = A^T b
$$

- $\lambda > 0$：**正则化参数**（Tikhonov 正则化 / 岭回归）
- 即使 $A^T A$ 奇异，$A^T A + \lambda I$ 也非奇异
- $\lambda$ 太小 $\to$ 近奇异；$\lambda$ 太大 $\to$ 过度平滑

| $\lambda$ 选择 | 效果 |
|------|------|
| 太大 | 解被过度平滑，偏离原始问题 |
| 太小 | 近似奇异，数值不稳定 |
| L-curve / GCV | 自动选择折中的 $\lambda$ |

---

## 正交化方法

回避构造 $A^T A$，直接对 $A$ 做正交三角化，数值稳定性远优于正规方程。

### 核心思想

求正交矩阵 $Q \in \mathbb{R}^{m \times m}$ 使得

$$
QA = \begin{bmatrix} R \\ 0 \end{bmatrix}, \quad R \in \mathbb{R}^{n \times n} \text{ 上三角}
$$

则

$$
\|Ax - b\|_2 = \|Q^T Ax - Q^T b\|_2
= \left\|\begin{bmatrix} R \\ 0 \end{bmatrix} x - \begin{bmatrix} c_1 \\ c_2 \end{bmatrix}\right\|_2
$$

取 $x = R^{-1}c_1$，残差范数 $= \|c_2\|_2$。

---

### Householder 变换

对向量 $v$，构造镜像反射，使其除第一分量外全部归零：

$$
H = I - 2\frac{uu^T}{u^T u}, \qquad u = v - \|v\|_2 e_1
$$

满足 $Hv = \pm\|v\|_2 e_1$，$H$ 是正交对称矩阵。

对 $A$ 的每一列依次施加 Householder 变换：

$$
H_n \cdots H_2 H_1 A = \begin{bmatrix} R \\ 0 \end{bmatrix}
$$

```python
import math

def householder(A):
    m, n = len(A), len(A[0])
    R = [row[:] for row in A]
    Q = [[1.0 if i == j else 0.0 for j in range(m)] for i in range(m)]
    for k in range(n):
        # 构造 Householder 向量
        x = [R[i][k] for i in range(k, m)]
        alpha = -math.copysign(math.sqrt(sum(v * v for v in x)), x[0])
        u = [x[0] - alpha] + x[1:]
        norm_u = math.sqrt(sum(v * v for v in u))
        if norm_u == 0:
            continue
        v = [val / norm_u for val in u]
        # 左乘 H 到 R
        for j in range(k, n):
            dot = sum(v[i - k] * R[i][j] for i in range(k, m))
            for i in range(k, m):
                R[i][j] -= 2 * v[i - k] * dot
        # 累积 Q
        for j in range(m):
            dot = sum(v[i - k] * Q[j][i] for i in range(k, m))
            for i in range(k, m):
                Q[j][i] -= 2 * v[i - k] * dot
    return Q, R
```

!!! info "计算量"
    约 $2n^2(m - n/3)$ 次浮点运算。适合稠密矩阵。

---

### Givens 旋转

通过平面旋转逐个消去元素：

$$
G = \begin{bmatrix} c & s \\ -s & c \end{bmatrix}, \quad c^2 + s^2 = 1
$$

选取 $r = \sqrt{a^2 + b^2}$，$c = a/r$，$s = b/r$，则：

$$
\begin{bmatrix} c & s \\ -s & c \end{bmatrix}
\begin{bmatrix} a \\ b \end{bmatrix} = \begin{bmatrix} r \\ 0 \end{bmatrix}
$$

每次旋转只修改两行。当 $A$ 是稀疏矩阵（只需消去少量非零元）时，Givens 比 Householder 更灵活。

| 特性 | Householder | Givens |
|------|:---:|:---:|
| 每次消去 | 一整列（子对角线全归零） | 一个元素 |
| 适用矩阵 | 稠密 | 稀疏（少量非零需消去） |
| 并行性 | 好 | 部分可并行 |
| 计算量 | $O(mn^2)$ | $O(mn^2)$（常数更大） |

---

## 方法对比

| 方法 | 稳定性 | 计算量 | 适用 |
|------|:---:|--------|------|
| 正规方程 | 差（$\kappa^2$ 恶化） | $O(mn^2)$ | 仅良态时可用 |
| Householder QR | 优 | $O(mn^2)$ | 稠密矩阵 |
| Givens QR | 优 | $O(mn^2)$ | 稀疏/需逐元消去 |
| SVD | 最优 | $O(mn^2)$ | 秩亏/严重病态 |
| Tikhonov 正则化 | 镇定 | $O(mn^2)$ | 病态/秩亏 |

!!! tip "实践建议"
    默认使用 Householder QR。秩亏或条件数极大时用 SVD（求伪逆）。正则化参数 $\lambda$ 可通过交叉验证或 L-curve 选取。
