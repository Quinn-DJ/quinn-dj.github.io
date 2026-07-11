# 06: 共轭梯度法

> 当 $A$ 对称正定时，求解 $Ax = b$ 等价于最小化一个二次泛函。最速下降法用梯度方向搜索，但会在峡谷中"之字形"振荡；共轭梯度法用 $A$-共轭方向，在至多 $n$ 步内精确收敛——本质上是用迭代法实现了直接法的效果。

---

## 问题转化

$$
Ax = b \iff \min_x \phi(x), \quad \phi(x) = \frac{1}{2}x^\top A x - b^\top x
$$

梯度 $\nabla\phi(x) = Ax - b = -r$（$r$ 是残差）。因为 $A > 0$，$\phi$ 是严格凸函数，驻点即全局唯一极小点。

---

## 最速下降法

### 算法

每步沿负梯度方向（即残差方向）做精确线搜索：

1. $r_k = b - A x^{(k)}$（梯度方向）
2. $p_k = r_k$
3. $\alpha_k = \dfrac{r_k^\top r_k}{r_k^\top A r_k}$（精确步长）
4. $x^{(k+1)} = x^{(k)} + \alpha_k p_k$

```python
def steepest_descent(A, b, x0, tol=1e-6, max_iter=1000):
    x = x0[:]
    for k in range(max_iter):
        r = [b[i] - sum(A[i][j] * x[j] for j in range(len(b))) for i in range(len(b))]
        Ar = [sum(A[i][j] * r[j] for j in range(len(b))) for i in range(len(b))]
        rr = sum(r[i] * r[i] for i in range(len(b)))
        alpha = rr / sum(r[i] * Ar[i] for i in range(len(b)))
        x = [x[i] + alpha * r[i] for i in range(len(b))]
        if rr < tol * tol:
            break
    return x
```

### 收敛速度

$$
\|x^{(k)} - x^*\|_A \le \left(\frac{\kappa - 1}{\kappa + 1}\right)^k \|x^{(0)} - x^*\|_A
$$

其中 $\kappa = \lambda_{\max}/\lambda_{\min}$ 是条件数。

!!! warning "之字形振荡"
    当 $\kappa \gg 1$ 时，梯度方向在狭长峡谷中来回反弹，收敛极慢。例如 $\kappa = 100$ 时，每步仅减少约 2%。

---

## 共轭梯度法（CG）

### 核心思想

用 $A$-共轭方向 $\{p_0, p_1, \dots\}$ 代替正交方向：

$$
p_i^\top A p_j = 0, \quad i \neq j
$$

$n$ 个相互 $A$-共轭的方向构成 $\mathbb{R}^n$ 的一组基。沿每个方向精确搜索一次即可到达极小点——**至多 $n$ 步精确收敛**。

### 算法

1. $r_0 = b - A x^{(0)}$，$p_0 = r_0$
2. 对 $k = 0, 1, \dots$：
    - $\alpha_k = \dfrac{r_k^\top r_k}{p_k^\top A p_k}$
    - $x^{(k+1)} = x^{(k)} + \alpha_k p_k$
    - $r_{k+1} = r_k - \alpha_k A p_k$
    - $\beta_{k+1} = \dfrac{r_{k+1}^\top r_{k+1}}{r_k^\top r_k}$
    - $p_{k+1} = r_{k+1} + \beta_{k+1} p_k$

```python
def conjugate_gradient(A, b, x0, tol=1e-6, max_iter=None):
    n = len(b)
    if max_iter is None:
        max_iter = n
    x = x0[:]
    r = [b[i] - sum(A[i][j] * x[j] for j in range(n)) for i in range(n)]
    p = r[:]
    rr = sum(v * v for v in r)
    for k in range(max_iter):
        Ap = [sum(A[i][j] * p[j] for j in range(n)) for i in range(n)]
        pAp = sum(p[i] * Ap[i] for i in range(n))
        alpha = rr / pAp
        x = [x[i] + alpha * p[i] for i in range(n)]
        r = [r[i] - alpha * Ap[i] for i in range(n)]
        rr_new = sum(v * v for v in r)
        if rr_new < tol * tol:
            break
        beta = rr_new / rr
        p = [r[i] + beta * p[i] for i in range(n)]
        rr = rr_new
    return x
```

### CG 作为直接法

在精确算术下，CG 在**至多 $n$ 步**内给出精确解。这是因为：

- 残差 $\{r_0, r_1, \dots, r_{k-1}\}$ 是相互正交的
- 方向 $\{p_0, p_1, \dots, p_{k-1}\}$ 是相互 $A$-共轭的
- $x^{(k)} \in x^{(0)} + \operatorname{span}\{r_0, A r_0, \dots, A^{k-1} r_0\} = x^{(0)} + \mathcal{K}_k(A, r_0)$

$\mathcal{K}_k$ 称为 **Krylov 子空间**。

### CG 作为迭代法

实际使用中几乎从不跑到 $n$ 步。收敛速度取决于特征值分布：

$$
\|x^{(k)} - x^*\|_A \le 2\left(\frac{\sqrt{\kappa} - 1}{\sqrt{\kappa} + 1}\right)^k \|x^{(0)} - x^*\|_A
$$

对比最速下降法，CG 的收敛因子从 $\frac{\kappa-1}{\kappa+1}$ 改进为 $\frac{\sqrt{\kappa}-1}{\sqrt{\kappa}+1}$：

| $\kappa$ | 最速下降每步减少 | CG 每步减少 | 加速比 |
|:---:|:---:|:---:|:---:|
| 10 | ~82% | ~52% | 1.5× |
| 100 | ~2.0% | ~18% | 9× |
| 1000 | ~0.2% | ~6.1% | 30× |
| 10000 | ~0.02% | ~1.98% | 99× |

---

## 预处理共轭梯度（PCG）

通过**预处理器** $M \approx A$（$M$ 对称正定且 $M^{-1}v$ 容易计算），求解等价系统：

$$
M^{-1}Ax = M^{-1}b
$$

若 $\kappa(M^{-1}A) \ll \kappa(A)$，收敛将显著加速。

| 预处理器 | $M$ | 适用 |
|---------|-----|------|
| Jacobi | $\operatorname{diag}(A)$ | 对角占优 |
| 不完全 Cholesky | $\tilde{L}\tilde{L}^\top$ | 一般稀疏 SPD |
| 多重网格 | 分层粗化 | Poisson 类椭圆 PDE |
| SSOR | $(D-\omega L)D^{-1}(D-\omega U)$ | 一般 SPD |

!!! tip "实践建议"
    对大多数实际问题，PCG + 不完全 Cholesky 预处理是默认选择。若仍收敛慢，考虑代数多重网格（AMG）。

---

## 方法对比

| 方法 | 理论基础 | 收敛阶 | 至多 $n$ 步精确 | 适用 |
|------|---------|:---:|:---:|------|
| 最速下降 | 梯度方向 | 线性，慢 | 否 | 教学用 |
| CG | $A$-共轭方向 | 线性，快 | 是（精确算术） | $A > 0$ 的标准选择 |
| PCG | 预处理 + CG | 视预处理而定 | 是 | 大规模稀疏 SPD |
