---
title: 卷积：从数学到深度学习
authors:
  - name: Quinn
comments: true
date: 2026-07-15
description: 从翻转滑动的数学定义出发，到图像处理中的滤波核，再到 CNN 中可学习的卷积层——三重视角理解卷积。
---

卷积是一个奇怪的东西。学信号处理的时候第一次见它，翻来覆去搞不明白为什么要"翻转"；后来做图像处理，发现高斯模糊、边缘检测全都靠它；再后来看 CNN，卷积层直接成了深度学习的基本砖块。同一个运算，三层含义，越看越有意思。

这篇文章是我自己的理解整理，从数学定义一路推到 CNN。

---

## 1. 数学上的卷积

### 定义

连续情况下，两个函数 $f$ 和 $g$ 的卷积定义是：

$$(f * g)(t) = \int_{-\infty}^{\infty} f(\tau)\,g(t - \tau)\,d\tau$$

离散版本更接地气，也是实际上计算机里用的：

$$(f * g)[n] = \sum_{m=-\infty}^{\infty} f[m]\,g[n - m]$$

### 这个 $t-\tau$ 到底在干什么？

刚看这个公式的时候，最困惑的就是为什么是 $g(t-\tau)$ 而不是 $g(t+\tau)$。

分三步理解就清楚了：

1. **$g(\tau)$** —— 原始信号（比如一个滤波器响应）
2. **$g(-\tau)$** —— 沿纵轴翻转（镜面对称）
3. **$g(t-\tau) = g(-(\tau - t))$** —— 翻转后再向右平移 $t$

然后把翻转平移后的 $g$ 和 $f$ 逐点相乘，再加起来，就得到了卷积在 $t$ 这一点的值。$t$ 从 $-\infty$ 滑到 $+\infty$，每滑一步算一个值，最终得到完整的 $(f*g)(t)$。

下面这张图把这个过程可视化了：

<iframe src="diagrams/conv-flip-slide.html" width="100%" height="520" style="border:none;"></iframe>

??? tip "为什么必须翻转？"
    如果你跳过翻转这一步，得到的是**互相关** (cross-correlation)，不是卷积。
    
    翻不翻转在信号处理里区别很大——卷积有交换律，相关没有。不过有意思的是，在 CNN 里大家嘴上说"卷积层"，实际上做的是互相关，只是习惯上还叫卷积。

### 基本性质

卷积有几条基本性质：

- **交换律**：$f * g = g * f$。把两个函数换位置，结果不变。
- **结合律**：$(f * g) * h = f * (g * h)$。多层滤波可以合并成一个。
- **分配律**：$f * (g + h) = f * g + f * h$。线性性保证了叠加原理成立。
- **与 $\delta$ 函数的关系**：$f * \delta = f$。$\delta$ 函数是卷积的单位元——任何函数和它卷完还是自己。

### 几个常见的例子

**多项式乘法**：$(a_0 + a_1 x + a_2 x^2)(b_0 + b_1 x) = \sum c_k x^k$，其中 $c_k = \sum_i a_i b_{k-i}$。这就是离散卷积。

**移动平均**：拿一个全是 $1/N$ 的窗口去卷积信号，得到的就是平滑后的结果。窗口越长，平滑得越狠。

**概率论**：两个独立随机变量 $X$ 和 $Y$，$X+Y$ 的密度函数是 $f_X * f_Y$。两个独立随机变量之和的分布，恰好是各自分布的卷积。

---

## 2. 图像处理中的卷积

从一维跳到了二维。图像是一个二维矩阵 $F(i,j)$，滤波器（也叫核、kernel）是另一个小矩阵 $K(u,v)$。

二维离散卷积：

$$(F * K)(i,j) = \sum_u \sum_v F(i-u,\,j-v)\,K(u,v)$$

实际操作中，就是把核在图像上一格一格地滑过去，每个位置逐元素相乘再求和，得到一个输出值。

<iframe src="diagrams/image-convolution.html" width="100%" height="540" style="border:none;"></iframe>

### 卷积 vs 互相关

前面提到过，真正的卷积要翻转核（上下左右各翻一次），互相关不翻转。在图像处理里：

- 严格卷积：$K$ 翻转 180° 再滑动
- 互相关：$K$ 直接滑动

因为大多数手工设计的核（比如高斯核）本身就是中心对称的，翻不翻转都一样，所以实际上两种操作经常混着用。关键是理解"滑动 → 乘积累加"这个核心动作就够了。

### padding 和 stride

滑动的时候有两个实际问题：

- **padding**：边缘像素参与卷积的次数少，如果不补边，输出尺寸会比输入小。补 0（zero-padding）是最常见的做法。`same` padding 会让输出尺寸和输入一样。
- **stride**：核每次滑动的步长。stride=2 意味着隔一个像素算一次，输出尺寸减半，但计算量也减半。

### 几种经典的核

不同核的数值设计，决定了从图像里提取什么特征。

| 核 | 矩阵 | 效果 |
| --- | --- | --- |
| 均值模糊 | $\dfrac{1}{9}\begin{bmatrix}1&1&1\\1&1&1\\1&1&1\end{bmatrix}$ | 最简单的平滑，每个像素变成周围 9 个像素的均值 |
| 锐化 | $\begin{bmatrix}0&-1&0\\-1&5&-1\\0&-1&0\end{bmatrix}$ | 增强边缘，中心 +5 周围 -1，相当于原图 + 拉普拉斯边缘 |
| Sobel X | $\begin{bmatrix}-1&0&1\\-2&0&2\\-1&0&1\end{bmatrix}$ | 检测竖直边缘（水平方向梯度） |
| Sobel Y | $\begin{bmatrix}-1&-2&-1\\0&0&0\\1&2&1\end{bmatrix}$ | 检测水平边缘（竖直方向梯度） |
| Laplacian | $\begin{bmatrix}0&1&0\\1&-4&1\\0&1&0\end{bmatrix}$ | 二阶导数，检测边缘方向无关 |
| 高斯模糊 | 权重按二维高斯分布衰减 | 比均值模糊更自然，中心权重最大 |

下面是这些核对同一张测试图的效果。代码就嵌在下面，改核、改参数都可以自己试：

```python exec="true" html="true" source="tabbed-right"
import numpy as np  # markdown-exec: hide
from PIL import Image, ImageDraw, ImageFont  # markdown-exec: hide
import io, base64  # markdown-exec: hide

# -- helpers --
def make_test_image(w=256, h=256):
    x = np.linspace(0, 4 * np.pi, w)
    y = np.linspace(0, 4 * np.pi, h)
    X, Y = np.meshgrid(x, y)
    img = 128 + 60*np.sin(X) + 40*np.cos(Y) + 30*np.sin(2*X)*np.cos(2*Y) + 20*np.sin(4*X)
    return np.clip(img, 0, 255).astype(np.uint8)

def convolve2d(img, kernel):
    kh, kw = kernel.shape; ph, pw = kh // 2, kw // 2
    padded = np.pad(img.astype(np.float64), ((ph, ph), (pw, pw)), mode='edge')
    out = np.zeros_like(img, dtype=np.float64)
    for i in range(img.shape[0]):
        for j in range(img.shape[1]):
            out[i, j] = np.sum(padded[i:i+kh, j:j+kw] * kernel)
    return out

def normalize_u8(arr):
    arr = arr.astype(np.float64); mn, mx = arr.min(), arr.max()
    return np.zeros_like(arr, dtype=np.uint8) if mx - mn < 1e-9 else ((arr-mn)/(mx-mn)*255).clip(0,255).astype(np.uint8)

# -- kernels --
kernels = [
    ('Original', None, ''),
    ('Gaussian Blur', None, '5x5, sigma=1.5'),
    ('Sharpen', np.array([[0,-1,0],[-1,5,-1],[0,-1,0]], dtype=np.float64), '[[0,-1,0],[-1,5,-1],[0,-1,0]]'),
    ('Sobel X (Horizontal Edges)', np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float64), '[[-1,0,1],[-2,0,2],[-1,0,1]]'),
    ('Sobel Y (Vertical Edges)', np.array([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=np.float64), '[[-1,-2,-1],[0,0,0],[1,2,1]]'),
    ('Laplacian', np.array([[0,1,0],[1,-4,1],[0,1,0]], dtype=np.float64), '[[0,1,0],[1,-4,1],[0,1,0]]'),
]

# Build gaussian kernel
ax = np.arange(-2, 3); xx, yy = np.meshgrid(ax, ax)
gk = np.exp(-(xx**2 + yy**2) / (2 * 1.5**2))
kernels[1] = ('Gaussian Blur', gk / gk.sum(), '5x5, sigma=1.5')

# -- apply all kernels --
img = make_test_image(256, 256)
results = []
for name, k, kstr in kernels:
    results.append((name, img if k is None else normalize_u8(convolve2d(img, k)), kstr))

# -- build composite grid --
tw, th = 256, 256; margin = 16; title_h = 28; kernel_h = 60; label_h = 30
cols, rows = 3, 2
cw = cols * tw + (cols + 1) * margin
ch = margin + rows * (title_h + th + kernel_h) + margin + label_h
canvas = Image.new('L', (cw, ch), 255)
draw = ImageDraw.Draw(canvas)

ft = fk = ImageFont.load_default()

for idx, (name, arr, kstr) in enumerate(results):
    row, col = divmod(idx, cols)
    x0 = margin + col * (tw + margin)
    y0 = margin + row * (title_h + th + kernel_h)
    draw.text((x0 + 2, y0 + 2), name, fill=0, font=ft)
    pil = Image.fromarray(arr).resize((tw, th), Image.LANCZOS)
    canvas.paste(pil, (x0, y0 + title_h))
    if kstr:
        for li, line in enumerate(kstr.split('\n')):
            draw.text((x0 + 2, y0 + title_h + th + 4 + li * 11), line, fill=60, font=fk)

draw.text((cw // 2 - 150, ch - 24), 'Image Convolution Kernels — Comparison', fill=100, font=ft)

# -- output as inline image --
buf = io.BytesIO()
canvas.save(buf, format='PNG')
b64 = base64.b64encode(buf.getvalue()).decode()
print(f'<img src="data:image/png;base64,{b64}" style="max-width:100%;display:block;margin:1rem auto"/>')
```

---

## 3. CNN 中的卷积

### 手工核 vs 学习出来的核

前面讲的核都是人手工设计的：高斯、Sobel、Laplacian……每个核提取一种特定的特征。

CNN 的想法直接得多：**让网络自己学该用什么核**。把核的数值当成可训练的参数，通过反向传播不断更新，最后网络自己找到最适合当前任务的滤波器。

这就是为什么 CNN 不需要人工设计特征——卷积层就是自动的特征提取器。

### 核心组件

**卷积层 (Conv2D)**

输入是 $H \times W \times C_{in}$ 的三维张量（高度、宽度、通道数），比如 RGB 图像是 $C_{in}=3$。一个卷积层包含多个滤波器（filter），每个滤波器是 $k \times k \times C_{in}$ 的小立方体。

每个滤波器在输入上滑动，产生一个 $H' \times W'$ 的特征图。如果有 $C_{out}$ 个滤波器，输出就是 $H' \times W' \times C_{out}$。不同滤波器学会了检测不同特征——有的对边缘敏感，有的对纹理敏感，有的对特定形状敏感。

参数量的计算很直观：每个滤波器有 $k \times k \times C_{in} + 1$ 个参数（+1 是偏置），$C_{out}$ 个滤波器就是 $C_{out}(k^2 C_{in} + 1)$。和全连接层比起来，参数量少得惊人——这就是卷积层的参数共享带来的好处。

**激活函数 (ReLU)**

卷积是线性运算，堆再多层也不过是一个大线性变换。ReLU（$f(x) = \max(0, x)$）给网络加上非线性，让它可以拟合任意复杂的函数。

**池化层 (Pooling)**

池化做降采样。最常用的是最大池化（MaxPool）：$2 \times 2$ 窗口里取最大值，stride=2。效果是把特征图尺寸减半，同时：
- 减少后续层的计算量
- 提供一定的平移不变性
- 增大每个神经元看到的原始图像范围（感受野）

平均池化（AvgPool）也是 $2 \times 2$ 取均值，但最大池化在实践中更常用。

**全连接层 (FC)**

卷积和池化提取完特征后，最后接一个或两个全连接层做分类（或回归）。全连接层把前面所有特征综合起来，输出每个类别的得分。

### 整体架构

下面这张图把整个流程串了起来。以 MNIST 手写数字识别（28×28 灰度图 → 10 个数字类别）为例：

<iframe src="diagrams/cnn-architecture.html" width="100%" height="350" style="border:none;"></iframe>

从 28×28×1 的输入图像，经过两层卷积+池化变成 4×4×16，展开成 256 维向量，再通过两个全连接层输出 10 个类别的概率。

??? note "输出尺寸的计算公式"
    输入尺寸 $W_{in}$，核大小 $K$，padding $P$，stride $S$：
    
    $$W_{out} = \left\lfloor \frac{W_{in} - K + 2P}{S} \right\rfloor + 1$$
    
    比如上面 Conv1：$W_{in}=28$，$K=5$，$P=0$，$S=1$ → $W_{out} = 28-5+0+1 = 24$。

### 为什么卷积适合图像？

三个关键原因：

1. **稀疏连接**：每个输出像素只和核覆盖的那一小块输入相关，不是和所有输入都连接。一个 $5 \times 5$ 的核只看 25 个像素，而不是整张图的 784 个。
2. **参数共享**：同一个核在图像的不同位置使用相同的权重。检测边缘的核在左上角和右下角是同一个东西，不需要为每个位置学一套参数。
3. **平移等变性**：输入平移了，输出也跟着平移。这是卷积运算本身决定的，不是学出来的。

这三条加起来，让 CNN 在处理图像时比全连接网络高效得多。

### 没展开的东西（但你应该知道它们存在）

这篇文章只讲了最基础的卷积。实际用的时候还有一些重要的变体：

- **1×1 卷积**：看起来只是个标量乘法，但在多通道场景下可以做通道间的线性组合，用来降维或升维
- **深度可分离卷积**：先对每个通道单独做空间卷积，再用 1×1 卷积混合通道。MobileNet 的核心
- **空洞/膨胀卷积**：核的元素之间留空隙，不增加参数量的前提下扩大感受野
- **转置卷积**：用来上采样，生成式模型和语义分割里常见
- **ResNet 的残差连接**：让梯度能跳过层直接回传，解决了深层网络训练不动的问题

---

## 总结

三个层次看下来，卷积的核心动作始终是同一件事：**拿一个函数（或核）去"扫描"另一个函数（或信号），每扫到一个位置就做加权求和**。

- 数学上：翻转、滑动、乘积累加
- 图像处理：手工设计核，提取想要的视觉特征
- CNN：把核变成可学习的参数，让网络自己找有用的特征

从手写规则到自动学习，卷积这个运算的内涵一直在扩展，但底层逻辑没变过。
