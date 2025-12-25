---
title: Verlet算法
authors: [Quinn]
comments: true
date: 2025-08-29
tags:
  - Verlet算法
  - 数值计算
description: Verlet算法是一种用于数值模拟粒子动力学的积分方法，广泛应用于分子动力学（Molecular Dynamics）模拟中。它由法国物理学家Louise Jean Claude Verlet在1967年提出，因其高精度和良好的能量守恒特性而备受青睐。
---

## **前情提要**

在前一篇`Crazyfish`的文章介绍了著名的**三体问题**（Three-body problem），简单回顾一下我们在解决三体问题时候所使用的数学公式。

### **公式回顾**

此处简化为二体问题：

$$
\begin{align*}
    \frac{d\mathbf{r}_1}{dt} & = \mathbf{v}_1 \\
    \frac{d\mathbf{v}_1}{dt} & = G \frac{m_2}{r^3} (\mathbf{r}_2 - \mathbf{r}_1) \\
    \frac{d\mathbf{r}_2}{dt} & = \mathbf{v}_2 \\
    \frac{d\mathbf{v}_2}{dt} & = G \frac{m_1}{r^3} (\mathbf{r}_1 - \mathbf{r}_2)
\end{align*}
$$

通过使用**Euler法**，我们用有限增量 $\Delta  t$ 来近似求解：

$$
\begin{align*}
    \frac{d y}{dt} & = f(y, t) \\
    y(t + \Delta  t) & \approx y(t) + \Delta  t \cdot f(y, t)
\end{align*}
$$

其中：

- $\Delta  t$ 是时间步长，一般等距。
- $f(y, t) = y'(t)$ 是导数（即微分方程右边的函数）。

假设已知 $t$ 时刻的位置 $\mathbf{r}_1$, $\mathbf{r}_2$, 速度 $\mathbf{v}_1$, $\mathbf{v}_2$, 现在计算 $t + \Delta  t$ 时刻的位置和速度如下：

1. 计算当前距离：
   
   $$
   r = |\mathbf{r}_2 - \mathbf{r}_1|
   $$

2. 计算加速度：
   
   $$
   \mathbf{a}_1 = G \frac{m_2}{r^3} (\mathbf{r}_2 - \mathbf{r}_1)
   $$
   
   $$
   \mathbf{a}_2 = G \frac{m_1}{r^3} (\mathbf{r}_1 - \mathbf{r}_2)
   $$
   
3. 更新速度：
   $$
   \mathbf{v}_1 \leftarrow \mathbf{v}_1 + \Delta  t \cdot \mathbf{a}_1
   $$
   $$
   \mathbf{v}_2 \leftarrow \mathbf{v}_2 + \Delta  t \cdot \mathbf{a}_2
   $$
4. 更新位置：
   $$
   \mathbf{r}_1 \leftarrow \mathbf{r}_1 + \Delta  t \cdot \mathbf{v}_1
   $$
   $$
   \mathbf{r}_2 \leftarrow \mathbf{r}_2 + \Delta  t \cdot \mathbf{v}_2
   $$

### **精度问题**

在程序中，我们所使用的公式为：

$$
v(t + \Delta t) = v(t) + a(t)\Delta t \\
r(t + \Delta t) = r(t) + v(t)\Delta t
$$

虽然这是最直接、最直观的方法，但是在长时间模拟中会引入累积误差——特别是将误差积累到 $v(t)$ 后二次积累到 $r(t)$ 上，导致系统总能量随时间漂移，模拟结果不精确。

估计大家已经发现问题了：**精度**！一个很致命的问题，源自于 $\Delta t$ 无法充分小。那有没有什么方法降低误差呢？于是我们希望跳过 $v(t)$ 来计算 $r(t)$。

## **Verlet算法简介**

Verlet算法是一种用于数值模拟粒子动力学的积分方法，广泛应用于分子动力学（Molecular Dynamics, MD）模拟中。它由法国物理学家Louise Jean Claude Verlet在1967年提出，因其高精度和良好的能量守恒特性而备受青睐。

### **公式计算**

通过位置对时间的泰勒展开：

$$
\begin{align*}
    r(t + \Delta t) & = r(t) + v(t)\Delta t + \frac{a(t)}{2}\Delta t^2 + \frac{b(t)}{6}\Delta t^3 + \dots \\
    r(t - \Delta t) & = r(t) - v(t)\Delta t + \frac{a(t)}{2}\Delta t^2 - \frac{b(t)}{6}\Delta t^3 + \dots \\
    r(t + \Delta t) & = 2r(t) - r(t - \Delta t) + a(t)\Delta t^2 + O(\Delta t^4)
\end{align*}
$$

其中：
- $r(t)$ 是当前时刻的位置，
- $r(t − \Delta t)$ 是前一时刻的位置，
- $a(t)$ 是当前时刻的加速度（由力 $F(t)$ 计算得到，$a(t) = \frac{F(t)}{m}$），
- $\Delta t$ 是时间步长。

也就是说，我们下一步的位置是依赖于现在的位置以及上一步的位置的。但是我们的初始条件只会给出第0步的信息，因此我们需要使用**Eular算法**计算出第一步，才能开始用 **Verlet算法**。

### **编程实现**

**设计目标**

1. **使用面向对象方法** 组织代码，使其易于扩展和维护。
2. **定义配置结构体** 管理系统参数（如摆长、质量、初始条件等）。
3. **定义 `DoublePendulum` 类** 表示双摆系统，封装状态变量和运动方程。
4. **实现 `Verlet` 算法** 进行数值积分，提高计算精度和能量守恒性。
5. **支持数据输出** 用于可视化和分析。

**代码架构**
```
DoublePendulum
│── include/
│   └── DoublePendulum.hpp    // 双摆类声明
│── src/
│   ├── DoublePendulum.cpp    // 双摆类实现
│   └── main.cpp             // 主程序入口
│── config/
│   └── config               // 配置文件
│── Makefile                 // 构建脚本
└── ...
```

**主要数据结构和类设计**

## 给双摆问题做类设计

类似于三体问题中的设计思路，我们将双摆问题抽象为几个核心概念：

### **配置结构体（Config）**
**作用：**  
- 存储系统的 **物理参数**（摆长、质量、重力加速度）。
- 存储 **初始条件**（初始角度、初始角速度）。
- 存储 **数值计算参数**（时间步长、总时间）。

```cpp
/**
 * @file DoublePendulum.hpp
 * @brief 双摆系统模拟程序头文件
 * @details 本文件包含了双摆系统的类定义和相关数据结构，
 *          使用Verlet算法进行数值积分以提高精度和稳定性
 */

struct Config {
    double L1, L2;       ///< 摆长：第一个摆和第二个摆的长度
    double M1, M2;       ///< 质量：第一个摆球和第二个摆球的质量
    double G;            ///< 重力加速度
    double theta1, theta2;   ///< 初始角度：第一个摆和第二个摆的初始角位移
    double omega1, omega2;   ///< 初始角速度：第一个摆和第二个摆的初始角速度
    double dt;           ///< 时间步长：数值积分的时间间隔
    double totalTime;    ///< 总模拟时间
};
```

### **位置结构体（Point）**
**作用：**  
- 表示 **二维坐标点**，用于存储摆球在直角坐标系中的位置。
- 简化位置计算和数据输出。

```cpp
/**
 * @brief 二维点结构体
 * @details 用于表示摆球在直角坐标系中的位置
 */
struct Point {
    double x, y;         ///< x坐标和y坐标
    Point(double x = 0, double y = 0) : x(x), y(y) {}
};
```

### **双摆类（DoublePendulum）**
**作用：**  
- 封装双摆系统的 **状态变量**（当前角度、角速度、历史角度）。
- 实现 **运动方程**（计算角加速度）。
- 实现 **Verlet算法** 进行数值积分。
- 提供 **数据输出** 和 **可视化支持**。

```cpp
/**
 * @class DoublePendulum
 * @brief 双摆系统类
 * @details 该类封装了双摆系统的物理模型和数值求解方法，
 *          使用Verlet算法进行时间积分以获得更好的数值稳定性
 */
class DoublePendulum {
private:
    Config config;              ///< 系统配置参数
    double theta1, theta2;      ///< 当前角度：第一个摆和第二个摆的当前角位移
    double omega1, omega2;      ///< 当前角速度：第一个摆和第二个摆的当前角速度
    double theta1_old, theta2_old;  ///< 上一时刻角度：Verlet算法所需的历史状态
    double omega1_old, omega2_old;  ///< 上一时刻角速度：用于验证和调试
    
    /**
     * @brief 角度标准化函数
     * @param angle 待标准化的角度
     * @return 标准化后的角度，范围在[-π, π]内
     * @details 将角度标准化到[-π, π]范围内，避免数值误差累积
     */
    double normalizeAngle(double angle);
    
public:
    /**
     * @brief 构造函数
     * @param cfg 配置参数结构体
     * @details 初始化双摆系统的状态变量和配置参数
     */
    DoublePendulum(const Config& cfg);
    
    /**
     * @brief 从文件加载配置参数
     * @param filename 配置文件路径
     * @return 配置参数结构体
     * @details 从配置文件中读取系统参数，支持注释和键值对格式
     */
    static Config loadConfig(const std::string& filename);
    
    /**
     * @brief Verlet算法时间步进
     * @details 使用Verlet算法更新系统状态，提供更好的数值稳定性和能量守恒
     */
    void verletStep();
    
    /**
     * @brief 计算角加速度
     * @param alpha1 第一个摆的角加速度（输出参数）
     * @param alpha2 第二个摆的角加速度（输出参数）
     * @details 根据双摆的运动方程计算当前时刻的角加速度
     */
    void calculateAcceleration(double& alpha1, double& alpha2);
    
    /**
     * @brief 运行模拟并输出位置数据
     * @param dataFilename 输出数据文件名
     * @details 执行完整的模拟过程并将摆球位置数据保存到文件
     */
    void simulateAndOutputData(const std::string& dataFilename);
    
    /**
     * @brief 运行模拟并输出完整数据
     * @param positionFilename 位置数据文件名
     * @param angleFilename 角度数据文件名
     * @details 执行完整的模拟过程并分别保存位置和角度数据
     */
    void simulateAndOutputAllData(const std::string& positionFilename, 
                                  const std::string& angleFilename);
    
    /**
     * @brief 获取第一个摆球的位置
     * @return 第一个摆球在直角坐标系中的位置
     */
    Point getPendulum1Position();
    
    /**
     * @brief 获取第二个摆球的位置
     * @return 第二个摆球在直角坐标系中的位置
     */
    Point getPendulum2Position();
    
    /**
     * @brief 获取第一个摆的当前角度
     * @return 第一个摆的角度值
     */
    double getTheta1() const { return theta1; }
    
    /**
     * @brief 获取第二个摆的当前角度
     * @return 第二个摆的角度值
     */
    double getTheta2() const { return theta2; }
};
```

## Verlet算法的具体实现

### **核心算法实现**

在双摆问题中，我们需要求解两个耦合的非线性微分方程。与三体问题类似，我们使用面向对象的方法来组织代码，但这里我们处理的是角度而不是位置向量。

**关键实现细节：**

1. **初始化问题**  
   Verlet算法需要当前时刻和前一时刻的位置信息，但初始条件只给出当前状态。解决方案是使用向后Euler法计算第一个"旧"状态：

```cpp
// 第一步使用Euler方法初始化历史状态
// 数学公式: θ(t-Δt) = θ(t) - ω(t)Δt + 1/2 α(t)(Δt)²
double alpha1, alpha2;
calculateAcceleration(alpha1, alpha2);
theta1_old = theta1 - omega1 * config.dt + 0.5 * alpha1 * config.dt * config.dt;
theta2_old = theta2 - omega2 * config.dt + 0.5 * alpha2 * config.dt * config.dt;
```

2. **Verlet积分步骤**  
   使用标准Verlet公式更新角度，然后通过中心差分计算角速度：

```cpp
void DoublePendulum::verletStep() {
    double alpha1, alpha2;
    calculateAcceleration(alpha1, alpha2);
    
    // 使用Verlet算法更新位置
    // 数学公式: θ(t+Δt) = 2θ(t) - θ(t-Δt) + α(t)(Δt)²
    double theta1_new = 2 * theta1 - theta1_old + alpha1 * config.dt * config.dt;
    double theta2_new = 2 * theta2 - theta2_old + alpha2 * config.dt * config.dt;
    
    // 使用中心差分更新角速度
    // 数学公式: ω(t) = [θ(t+Δt) - θ(t-Δt)] / (2Δt)
    omega1 = (theta1_new - theta1_old) / (2 * config.dt);
    omega2 = (theta2_new - theta2_old) / (2 * config.dt);
    
    // 更新状态
    theta1_old = theta1;
    theta2_old = theta2;
    theta1 = normalizeAngle(theta1_new);
    theta2 = normalizeAngle(theta2_new);
}
```

3. **数值稳定性考虑**  
   双摆系统可能出现数值不稳定，特别是在两摆接近共线时。代码中加入了数值保护：

```cpp
// 检查数值稳定性 - 防止被非常小的数除法
const double MIN_DENOM = 1e-10;
if (std::abs(denom1) < MIN_DENOM) {
    denom1 = (denom1 >= 0) ? MIN_DENOM : -MIN_DENOM;
}

// 限制加速度以防止失控值
const double MAX_ACCEL = 1000.0;
alpha1 = std::max(-MAX_ACCEL, std::min(MAX_ACCEL, alpha1));
alpha2 = std::max(-MAX_ACCEL, std::min(MAX_ACCEL, alpha2));
```

### **配置文件设计**

系统使用简单的键值对格式配置文件，支持注释：

```plaintext
# 双摆系统配置文件
L1=1.0          # 第一个摆的长度
L2=1.0          # 第二个摆的长度
M1=1.0          # 第一个摆球的质量
M2=1.0          # 第二个摆球的质量
G=9.8           # 重力加速度
THETA1=0.0      # 第一个摆的初始角度
THETA2=0.0      # 第二个摆的初始角度
OMEGA1=1.0      # 第一个摆的初始角速度
OMEGA2=0.0      # 第二个摆的初始角速度
DT=0.000001     # 时间步长（需要足够小以保证精度）
TOTAL_TIME=10.0 # 总模拟时间
```

### **主程序结构**

```cpp
int main(int argc, char* argv[]) {
    std::string configFile = "./config/config";
    std::string positionDataFile = "pendulum_data.txt";
    std::string angleDataFile = "pendulum_angles.txt";

    try {
        // 加载配置
        Config config = DoublePendulum::loadConfig(configFile);

        // 创建双摆对象
        DoublePendulum pendulum(config);

        // 运行模拟并输出数据
        pendulum.simulateAndOutputAllData(positionDataFile, angleDataFile);
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

### **运动可视化**

在保存了必要的数据后，我使用`python`程序进行了可视化。

我们能够发现，`config_1`的运动轨迹是很混乱，没有什么规律的，说明这个初始条件下的“双摆”是混沌的；而看到`config_2`，下面的球的运动轨迹**似乎**有迹可循，所以在这个条件下的“双摆”**有可能**是一个非混沌系统。

**项目地址**： [https://github.com/Quinn-DJ/DoublePendulum](https://github.com/Quinn-DJ/DoublePendulum)

然而，如果我们将`TOTAL_TIME`不断延长，我们很轻易的发现“双摆”的运动似乎违背了自然！经过不断调试，我认为仍然是**精度**在作祟，毕竟前面也提到，我们是忽略了 $\Delta t^4$ 及更高次项，可能这些项的缺失在长时间的模拟后将导致严重后果，届时，我们就要探寻一个精度更高的计算方法了。