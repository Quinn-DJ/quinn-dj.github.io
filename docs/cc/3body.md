---
title: 三体问题
authors: CrazyFish
comments: true
date: 2025-08-26
tags:
  - Verlet算法
  - 三体问题
description: 三体问题（Three-body problem）是经典力学中的一个著名问题，指的是在牛顿引力作用下，研究三个质量有限的物体在彼此之间相互作用时的运动规律。该问题是天体力学中的一个重要课题，涉及行星、恒星、卫星等天体系统的运动。
---

<div class="grid cards" markdown>
-   :material-notebook-edit-outline:{ .lg .middle } __笔记来源__

    ---
    
    本文为王何宇老师介绍三体问题时的课件。
</div>

## 三体问题简介

**三体问题**（Three-body problem）是经典力学中的一个著名问题，指的是在**牛顿引力作用下，研究三个质量有限的物体在彼此之间相互作用时的运动规律**。
该问题是天体力学中的一个重要课题，涉及行星、恒星、卫星等天体系统的运动。

### **三体问题的定义**
三体问题描述的是**三个质量有限的物体**，在**仅受彼此的万有引力作用下运动**，并且遵循**牛顿运动定律和万有引力定律**。其数学描述如下：

- **牛顿第二定律**：

$$
m_i \frac{d^2 \mathbf{r}_i}{dt^2} = \sum_{j \neq i} G \frac{m_i m_j}{|\mathbf{r}_j - \mathbf{r}_i|^3} (\mathbf{r}_j - \mathbf{r}_i)
$$

  其中：
  - $ m_i $ 是第 $ i $ 个物体的质量
  - $ \mathbf{r}_i $ 是第 $ i $ 个物体的位置向量
  - $ G $ 是万有引力常数

- 由于这种系统是**非线性**的，并且其解对初始条件极为敏感，导致它成为一个**混沌系统**，即使是微小的初始变化也会导致长期行为的巨大差异。

### **三体问题的历史**
- **1687年**：牛顿在《自然哲学的数学原理》中提出了两体问题的严格数学解，但他发现三体问题无法解析求解。
- **18-19世纪**：
  - 拉格朗日和欧拉研究了特殊情况下的三体运动（如共线解、拉格朗日点）。
  - 亥姆霍兹、庞加莱等人逐步发现了该问题的混沌特性。
- **20世纪以来**：
  - 计算机数值方法的发展使得人们能够用数值模拟的方式研究三体系统的行为。
  - 2017年，中国数学家孙斌勇等人发现了一系列新的三体周期轨道。

## **二体问题及其数值模拟**

### **问题描述**
**二体问题（Two-body problem）** 描述的是两个物体在万有引力作用下的运动。根据牛顿力学，两个质量分别为 $m_1$ 和 $m_2$ 的物体，
分别位于位置向量 $\mathbf{r}_1 $ 和 $\mathbf{r}_2 $.

它们之间的万有引力的大小：

$$
F = G \frac{m_1 m_2}{r^2}
$$
其中：
- $G$ 是万有引力常数，
- $r = |\mathbf{r}_2 - \mathbf{r}_1|$ 是两物体之间的距离。

引力的方向总是指向对方，因此力的向量形式为：
$$
\mathbf{F}_{12} = G \frac{m_1 m_2}{r^3} (\mathbf{r}_2 - \mathbf{r}_1)
$$
$$
\mathbf{F}_{21} = G \frac{m_1 m_2}{r^3} (\mathbf{r}_1 - \mathbf{r}_2) = -\mathbf{F}_{12}
$$
其中：
- $ \mathbf{F}_{12} $ 是物体 1 受到的力（指向 2），
- $ \mathbf{F}_{21} $ 是物体 2 受到的力（指向 1）。

根据牛顿第二定律：
$$
m_1 \frac{d^2 \mathbf{r}_1}{dt^2} = \mathbf{F}_{12}
$$
$$
m_2 \frac{d^2 \mathbf{r}_2}{dt^2} = \mathbf{F}_{21}
$$
代入引力公式：
$$
m_1 \frac{d^2 \mathbf{r}_1}{dt^2} = G \frac{m_1 m_2}{r^3} (\mathbf{r}_2 - \mathbf{r}_1)
$$
$$
m_2 \frac{d^2 \mathbf{r}_2}{dt^2} = G \frac{m_1 m_2}{r^3} (\mathbf{r}_1 - \mathbf{r}_2)
$$

这就是**二体问题的基本运动方程**，它描述了两个物体在引力作用下的加速度。

为了数值求解，我们将二阶微分方程转换为一阶常微分方程组（ODEs）。

定义状态变量：
$$
\mathbf{v}_1 = \frac{d\mathbf{r}_1}{dt}, \quad \mathbf{v}_2 = \frac{d\mathbf{r}_2}{dt}
$$
$$
\mathbf{a}_1 = \frac{d\mathbf{v}_1}{dt}, \quad \mathbf{a}_2 = \frac{d\mathbf{v}_2}{dt}
$$

将二阶微分方程展开：
$$
\frac{d\mathbf{r}_1}{dt} = \mathbf{v}_1
$$
$$
\frac{d\mathbf{v}_1}{dt} = G \frac{m_2}{r^3} (\mathbf{r}_2 - \mathbf{r}_1)
$$
$$
\frac{d\mathbf{r}_2}{dt} = \mathbf{v}_2
$$
$$
\frac{d\mathbf{v}_2}{dt} = G \frac{m_1}{r^3} (\mathbf{r}_1 - \mathbf{r}_2)
$$

我们需要在每个时刻，根据上述方程，更新位置 $\mathbf{r}_1$, $\mathbf{r}_2$, 速度 $\mathbf{v}_1$, $\mathbf{r}_2$ 和加速度 
$\mathbf{a}_1$, $\mathbf{a}_2$.

### **Euler 法计算二体问题的格式**

欧拉法是数值求解常微分方程（ODEs）的最简单方法，它的基本思想是：  

给定一个 ODE：
$$
    \frac{d y}{dt} = f(y, t)
$$
我们用有限增量 $\Delta t$ 来近似求解：
$$
    y(t + \Delta t) \approx y(t) + \Delta t \cdot f(y, t)
$$
其中：
- $\Delta t$ 是时间步长，一般等距。
- $f(y, t) = y'(t)$ 是导数（即微分方程右边的函数）。

假设已知 $t$ 时刻的位置 $\mathbf{r}_1$, $\mathbf{r}_2$, 速度 $\mathbf{v}_1$, $\mathbf{v}_2$, 现在计算 $t + \Delta t$ 时刻的位置和速度如下：

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
   \mathbf{v}_1 \leftarrow \mathbf{v}_1 + \Delta t \cdot \mathbf{a}_1
   $$
   $$
   \mathbf{v}_2 \leftarrow \mathbf{v}_2 + \Delta t \cdot \mathbf{a}_2
   $$
4. 更新位置：
   $$
   \mathbf{r}_1 \leftarrow \mathbf{r}_1 + \Delta t \cdot \mathbf{v}_1
   $$
   $$
   \mathbf{r}_2 \leftarrow \mathbf{r}_2 + \Delta t \cdot \mathbf{v}_2
   $$

## C++ 的实现

我们之前设计生命游戏时，采用了一种数据结构 + 算法的设计思路。那么 C++ 的基本设计思路要更加抽象。它将一个抽象对象（概念）的数据结构和算法捆绑在一起，形成一个类（class）。和之前形式上的主要区别可以看成是结构体（struct）的成员除了变量，增加了函数。这样既有变量，又有函数的结构体，或者说现在叫类，能够表达更加丰富的概念，同时能够实现概念的封闭。也就是说，和一个具体概念有关的属性和操作，全部封装成一个抽象的类型，被称作类。程序不再是一个具体的流程，而是不同类之间的交互。我们举一个最简单的例子，我们要创造一个概念，鸡！那么我们怎么定义鸡（Chicken）？我们说一个（Chicken）一定有以下属性：
年龄（age），重量（weight），性别（gender），…… 这是熟悉的数据定义方式。而 C++ 表示，你还可以规定以下鸡能做什么……比如：吃(eat)，唱（sing），……

我们设计的类就可以是这样：

```c++
#include <iostream>

class Chicken
{
private:
   int age;
   double weight;
   bool gender;
   ...
public:
   void eat(double _food)
   {
      weight += _food * 0.1;
   }
   void sing()
   {
      std::cout << "You are indeed beatiful!" << std::endl;
   }
   ...
};
```
这样就定义了一个类，也就是规定了一个抽象的数据类型：`Chicken`，就像 `int`，`char` 这种内置类型一样，我们可以从这个类型产生具体的变量，比如：
```c++
Chicken broKun;
```
所以变量 `broKun` 就是自定义类型，也就是类 `Chicken` 的一个具体实例。`broKun` 和 `Chicken` 的关系就好比“鸡”这个抽象的概念，和你从菜场里买来的一只具体的鸡之间的关系。比如你去菜场买了一只鸡，发现它会唱歌，于是你把它当宠物养，并取名叫“昆哥”，那么你就可以声称：昆哥是一只鸡。同样的，在我们的代码，其实规定了这样一种逻辑关系：broKun **is-a** Chicken. 这是一种现代程序设计的基本逻辑关系，代表了抽象概念和具体实例，或者说，抽象类型和具体变量之间的关系。

我们可以检查一下：
```c++
#include "Chicken.h"

int main(int argc, char *argv[])
{
   Chicken brokun;

   brokun.sing();
   return 0;
}
```
这个程序能良好运行。但是问题来了，我们无法改变 `broKun` 的 `age`，`weight` 和 `gender`，直接修改是一个错误。比如：
```c++
 broKun.age = 24;
 ```
是一个语法错误。这是因为 C++ 规定了严格的修改权限，这里 `private` 表示只能被自己访问，不能被外部访问的数据和函数。而 `public` 部分则是外部可以访问的函数和变量。这种被称为“封装”的特性是为了软件开发的安全，也是所有面向对象编程的一个基本概念。所以这里我们需要增加一些专门用于读和写这些私有变量的函数，作为读写的“接口”。比如这里：
```c++
#include <iostream>

class Chicken
{
private:
   int age;
   double weight;
   bool gender;
public:
   void eat(double _food)
   {
      weight += _food * 0.1;
   }
   void sing()
   {
      std::cout << "You are indeed beatiful!" << std::endl;
   }
   int get_age()
   {
      return age;
   }
   void set_age(int _age)
   {
      age = _age;
   }
   double get_weight()
   {
      return weight;
   }
   void set_weight(double _weight)
   {
      weight = _weight;
   }
   bool get_gender()
   {
      return gender;
   }
   void set_gender(bool _gender)
   {
      gender = _gender;
   }
};

```

理论上说，每一个私有变量，都应该有一对 `get` 和 `set` 函数来读和写。比如这里，我们可以尝试：
```c++
#include "Chicken.h"

int main(int argc, char *argv[])
{
    Chicken broKun;
//   broKun.age = 24; // 错误：age 是私有的
    broKun.set_age(24); // 正确
    broKun.set_weight(60.0);
    broKun.set_gender(true);
    
    std::cout << "Hi! guys! I'm " << broKun.get_age() << " years old." << std::endl;
    broKun.sing();
    return 0;
}
```
这里顺便注意一个小细节，就是 C++ 是怎么输出的，也就是 `std::cout`，它是 `iostream` 中定义的一个对象，对应了标准输出。而 `<<` 是一个运算符，作用是把右边的部分的显示内容附加在自己后面再丢给左边，它可以连续使用，因此表现的就像把要输出的内容按照 `<<` 指示的方向流到最左边，因此被称为“流”（stream），所以`iostream`就是输入输出流的意思。上面这句话的意思就是把右边的这些字符串和函数值，按次序输出给 `std::cout`，也就是标准输出设备。注意它的逻辑和我们操作系统中的 `shell` 的重定向的逻辑一致。这里我们不必关心输出内容的格式，系统会自动根据它们的类型，给予正确的输出。但是对 `Chicken` 这样的自定义类型，系统就不知道该怎么输出了，这个我们以后再说。

到这里我们可能注意到另一个严重的问题，就是我们似乎没有办法初始化 `broKun` 这个变量，而只能等它创建之后，再赋值。这里涉及到一个变量的生存周期。当我们声明一个变量时：
```c++
Chicken broKun;
```
系统会直接查询是否存在一个和类名相同的函数 `Chicken`，它可以有参数，但是没有返回值。它是类实例化时总要运行的第一个函数，因此被称为**构造函数**（constructor）。如果不存在这个函数，系统会自动产生一个：
```c++
Chicken() {};
```
也就是除了必要的成员变量和函数的定义，什么也不做。因此这个被称为“默认构造函数”。于是如果我们想给变量赋初值，我们可以将这个过程放在构造函数中：
```c++
Chicken() 
{
   age = 0;
   weight =0.0;
   gender = true;
};
```
由于这个结构几乎每个类都想要，所以后续出现了两种变体，第一种是简略的赋值规定：
```c++
Chicken() : age(0), weight(0.0), gender(true)
{
};
```
这个完全和上面的函数等效。这里括号内的值也可以是有意义的表达式。在增加了这个初始函数后，我们现在可以再测试一下：
```c++
#include "Chicken.h"

int main(int argc, char *argv[])
{
    Chicken broKun;
    std::cout << "In the beginning, the status of broKun was " << broKun.get_age() << " years old," 
        << broKun.get_weight() << " weight, and " << broKun.get_gender() << std::endl;
//   broKun.age = 24; // 错误：age 是私有的
    broKun.set_age(24); // 正确
    broKun.set_weight(60.0);
    broKun.set_gender(true);
    
    std::cout << "Hi! guys! Now I'm " << broKun.get_age() << " years old." << std::endl;
    broKun.sing();
    return 0;
}
```
第二种做法更加简单，就是直接在声明时给成员属性一个初值：
```c++
#include <iostream>

class Chicken
{
private:
   int age = 0;
   double weight = 0.0;
   bool gender = true;
public:
   void eat(double _food)
   {
      weight += _food * 0.1;
   }
   void sing()
   {
      std::cout << "You are indeed beatiful!" << std::endl;
   }
   int get_age()
   {
      return age;
   }
   void set_age(int _age)
   {
      age = _age;
   }
   double get_weight()
   {
      return weight;
   }
   void set_weight(double _weight)
   {
      weight = _weight;
   }
   bool get_gender()
   {
      return gender;
   }
   void set_gender(bool _gender)
   {
      gender = _gender;
   }
};
```
这个规定在 C++ 11 时引入，目前绝大多数编译器都是符合的。它使得我们不必专门为了初始化成员变量而写一个构造函数。但是，如果我们仍然可以并鼓励提供一个构造函数，让用户在声明类的实例时，具体给一组初值，比如定义一只 24 岁，60 公斤重的公鸡。要实现这个功能，我们可以提供一个下面这样的构造函数：
```c++
Chicken(int _age, double _weight, bool _gender)
{
   age = _age;
   weight = _weight;
   gender = _gender;
};
```
或者等价地
```c++
Chicken(int _age, double _weight, bool _gender) : age(_age), weight(_weight), gender(_gender)
{
};
```
之后我们就可以在 `main` 当中这样初始化一个具体的实例：
```c++
Chicken broKun(24, 60, true);
```
提供这样的初始化时鼓励的。注意，任何自定义的初始化函数都会覆盖系统提供的默认初始化，但 C++ 的类允许重载（reload），也允许出现名字相同，但参数不同的函数。所以你只要同时声明一个默认初始化 `Chicken()` 和 `Chicken(int _age, double _weight, bool _gender) `，编译器会根据用户调用时给出的形参来匹配正确的函数调用。比如：
```
#include <iostream>

class Chicken
{
private:
    int age;
    double weight;
    bool gender;

public:
    void eat(double _food)
    {
        weight += _food * 0.1;
    }
    void sing()
    {
        std::cout << "You are indeed beatiful!" << std::endl;
    }
    int get_age()
    {
        return age;
    }
    void set_age(int _age)
    {
        age = _age;
    }
    double get_weight()
    {
        return weight;
    }
    void set_weight(double _weight)
    {
        weight = _weight;
    }
    bool get_gender()
    {
        return gender;
    }
    void set_gender(bool _gender)
    {
        gender = _gender;
    }
    Chicken(int _age, double _weight, bool _gender) : age(_age), weight(_weight), gender(_gender) {
                                                      };
    Chicken() : age(0), weight(0.0), gender(true) {
                };
};
```
然后就可以这样用：
```c++
#include "Chicken.h"

int main(int argc, char *argv[])
{
    Chicken iKun, broKun(24, 60.0, false);

    std::cout << "In the beginning, the status of broKun was " << broKun.get_age() << " years old," 
        << broKun.get_weight() << " weight, and " << broKun.get_gender() << std::endl;
//   broKun.age = 24; // 错误：age 是私有的
    broKun.set_age(24); // 正确
    broKun.set_weight(60.0);
    broKun.set_gender(true);
    
    std::cout << "Hi! guys! Now I'm " << broKun.get_age() << " years old." << std::endl;
    broKun.sing();

    std::cout << "Every iKun is " << iKun.get_age() << " years old," 
        << iKun.get_weight() << " weight, and " << iKun.get_gender() << std::endl;

    return 0;
}
```
即两种构造函数同时出现。

和构造函数对应的，还有析构函数（destructor），它负责在变量声明结束时回收所有资源，包括内存等等。它的命名规则是类名前加 `~`，比如 `Chicken` 类的析构函数应该是 `~Chicken`，它不能有返回值，也不能有参数！在没有动态内存分配的情况下，默认析构函数就很好，所以我们先不讨论，也不声明析构函数，等用到了再说。

## 给三体问题做类设计

**🛠️ 设计目标**

1. **使用面向对象方法** 组织代码，使其易于扩展（例如，支持多体问题）。
2. **使用 `Vec<2>` 处理 2D 向量运算**（如位置、速度、加速度）。
3. **定义 `Body` 类** 表示天体，存储其质量、位置、速度和加速度。
4. **定义 `Universe` 类** 负责模拟多个天体的运动，并更新它们的位置。
5. **使用 `Euler` 或 `Verlet` 方法** 进行数值积分，模拟地球轨迹。
6. **使用 `Constants.h` 统一管理物理常数**，确保计算的正确性。


**📌 代码架构**
```
📂 3Body
│── Vec.h         // 向量模板类（支持 N 维向量运算）
│── Body.h        // 天体类（存储质量、位置、速度，计算引力）
│── Body.cpp      // `Body` 类的实现
│── Universe.h    // 宇宙类（管理多个天体，更新它们的位置）
│── Universe.cpp  // `Universe` 类的实现
│── Constants.h   // 物理常数（G、AU、太阳质量等）
│── main.cpp      // 运行模拟，输出地球轨道数据
```

**主要类和功能**

**`Vec<N>`：N 维向量类(先跳过)**
**作用：**  
- 处理 **向量计算**（加法、减法、数乘、归一化）。
- 适用于 **2D/3D 运动模拟**（位置、速度、加速度）。

```cpp
template<int N>
class Vec {
private:
    std::array<double, N> data;
public:
    Vec(); // 默认构造
    Vec(std::initializer_list<double> values); // 列表初始化
    double magnitude() const; // 计算模长
    Vec normalized() const; // 归一化
    Vec operator+(const Vec& v) const; // 向量加法
    Vec operator*(double scalar) const; // 数乘
};
```

**`Body`：天体类**
**作用：**  
- 存储 **质量、位置、速度、加速度**。
- 计算 **引力加速度**（根据牛顿万有引力公式）。

```cpp
#ifndef CRAZYFISH_3BODY_BODY
#define CRAZYFISH_3BODY_BODY

#include "Vec.h"

class Body {
    private:
        double mass;
        Vec<2> position;
        Vec<2> velocity;
        Vec<2> acceleration;
    
    public:
        Body(double m, Vec<2> pos, Vec<2> vel);
        
        // Getter 方法
        double getMass() const { return mass; }
        Vec<2> getPosition() const { return position; }
        Vec<2> getVelocity() const { return velocity; }
        Vec<2> getAcceleration() const { return acceleration; }
    
        // 新增 Setter 方法
        void setPosition(const Vec<2>& newPos) { position = newPos; }
        void setVelocity(const Vec<2>& newVel) { velocity = newVel; }
        void setAcceleration(const Vec<2>& newAcc) { acceleration = newAcc; }
    
        static Vec<2> computeGravity(const Body& a, const Body& b);
    };


#endif // CRAZYFISH_3BODY_BODY
```

---

**`Universe`：宇宙模拟器**
**作用：**
- 存储多个 `Body`。
- 计算引力并更新物体位置。
- 使用 **数值积分方法**（Euler 或 Verlet）更新运动状态。

```cpp
class Universe {
private:
    std::vector<Body> bodies;
    double dt; // 时间步长
public:
    Universe(double timestep);
    void addBody(const Body& body);
    void update();
    const std::vector<Body>& getBodies() const;
};
```

考虑一个2维空间的三体问题的类设计：
文件如下：
```
│── Vec.h         // 向量模板类（支持 N 维向量运算）
│── Body.h        // Body 类声明
│── Body.cpp      // Body 类的实现
│── Universe.h    // Universe 类声明
│── Universe.cpp  // Universe 类的实现
```
在这个问题中，运动的物体用 Body 类抽象，它的属性是: position(向量)，velocity(向量)，acceleration(向量)，mass(double)。
这里的向量的定义在 Vec.h 中实现，用 Vec<2> 表示一个 2 维的向量。

成员函数有: 
1. 初始化函数，默认初始化函数；
2. position，velocity，acceleration，mass 的读/写接口函数；
3. update(double dt)，功能是根据 acceleration 和时间步长，用向前 Euler 法更新 velocity 和 position.

请给出 Body 类的代码，只要声明，不要实现。给代码增加 Doxygen 中文注释，同时也注释这个文件。

用 Universe 类来构建物体运动的环境，它的属性是：bodies（可以是动态向量，每一个元素都是一个 Body 的实例），t(double，类声明时设初值为 0)，dt(double)

成员函数有：
1. 初始化函数，默认初始化函数；
2. bodies, t, dt 的读/写基本函数；
3. computeGravity(int i) ，功能是计算 bodies[i] (存放在 bodies 中) 所受到的来自其他 body 的万有引力；
3. stepForward()， 功能是遍历 bodies 中的每一个成员，调用 computeGravity 来更新它们的加速度，然后通过各自的 update(dt) 更新各自的速度和位置，最后更新时间。

请给下面改进后的Body.h文件增加较为详细的 Doxygen 注释，包括文件说明，成员变量，函数的返回值和参数的说明。

请给出 Universe 类的代码，只要声明，不要实现。给代码增加 Doxygen 中文注释，同时也注释这个文件。

Doxygen 中修改了如下属性：

```ini
PROJECT_NAME           = "Three Body Problem"
PROJECT_NUMBER         = 1.0
EXTRACT_ALL            = YES
LATEX_CMD_NAME         = xelatex
EXTRA_PACKAGES         = ctex
CALL_GRAPH             = YES  # 生成调用关系图
CALLER_GRAPH           = YES  # 生成被调用关系图
```

以下是 Vec.h 的代码：
```c++
#ifndef CRAZYFISH_3BODY_VEC
#define CRAZYFISH_3BODY_VEC

#include <iostream>
#include <array>
#include <cmath>

template<int N>
class Vec {
private:
    std::array<double, N> data = {0}; // 存储 N 维向量数据

public:
    // 默认构造函数（零向量）
    Vec() = default;

    // 通过列表初始化向量（支持 2D, 3D, ...）
    Vec(std::initializer_list<double> values) {
        int i = 0;
        for (double val : values) {
            if (i < N) data[i++] = val;
        }
    }

    // 获取/设置向量分量
    double& operator[](int index) { return data[index]; }
    const double& operator[](int index) const { return data[index]; }

    // 向量加法
    Vec operator+(const Vec& v) const {
        Vec result;
        for (int i = 0; i < N; i++) result[i] = data[i] + v[i];
        return result;
    }

    // 向量减法
    Vec operator-(const Vec& v) const {
        Vec result;
        for (int i = 0; i < N; i++) result[i] = data[i] - v[i];
        return result;
    }

    // 乘以标量
    Vec operator*(double scalar) const {
        Vec result;
        for (int i = 0; i < N; i++) result[i] = data[i] * scalar;
        return result;
    }

    // 除以标量
    Vec operator/(double scalar) const {
        Vec result;
        for (int i = 0; i < N; i++) result[i] = data[i] / scalar;
        return result;
    }

    // 计算向量的模长（L2 范数）
    double magnitude() const {
        double sum = 0;
        for (int i = 0; i < N; i++) sum += data[i] * data[i];
        return std::sqrt(sum);
    }

    // 归一化向量
    Vec normalized() const {
        double mag = magnitude();
        return (mag > 0) ? (*this / mag) : Vec();
    }

    // 输出运算符重载
    friend std::ostream& operator<<(std::ostream& os, const Vec& v) {
        os << "(";
        for (int i = 0; i < N; i++) {
            os << v[i] << (i < N - 1 ? ", " : "");
        }
        os << ")";
        return os;
    }
};

#endif // CRAZYFISH_3BODY_VEC
```
请根据这个代码，重新实现 Body 类，并用向前 Euler 法更新位置和速度。

```c++
     /**
      * @brief 获取物体的质量。
      *
      * @return 物体质量的常量引用。
      */
     Vec<2> getMass() const;
```

我们首先实现一下可视化。还是用最简陋的解决方案：

1. 每个时间步，我们输出所有物体的位置信息；
2. 根据这些位置信息，我们可以给每个时间画一个 BMP 图，在一片空白上标记当前质点位置；
3. 将这些 BMP 图连贯起来，就得到电影。

在进一步探索之前，我们先观察一下最后没有讨论的 Vec.h 文件的设计：

`std::array` 是 C++11 引入的静态数组，它是 `std::vector` 之外的另一种数组管理方式，适用于大小固定的数组。
这里我们需要确保一个向量空间中的向量都具有一样的维数，所以适合使用这个模板类。

`std::array` 的基本用法和标准数组一致，并提供了一些新的功能：
```cpp
#include <iostream>
#include <array>

int main() {
    std::array<int, 5> arr = {1, 2, 3, 4, 5};  // 声明并初始化

    std::cout << "数组元素: ";
    for (int num : arr) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    std::cout << "数组大小: " << arr.size() << std::endl;
    std::cout << "首元素: " << arr.front() << std::endl;
    std::cout << "尾元素: " << arr.back() << std::endl;

    return 0;
}
```


| 方法 | 作用 |
|----------|---------|
| `arr[i]` | 直接访问元素（无边界检查） |
| `arr.at(i)` | 访问元素 **并检查越界**（越界会抛异常 `std::out_of_range`） |
| `arr.front()` | 获取第一个元素 |
| `arr.back()` | 获取最后一个元素 |

```cpp
#include <iostream>
#include <array>

int main() {
    std::array<int, 3> arr = {10, 20, 30};

    std::cout << "arr[1] = " << arr[1] << std::endl;  // 直接访问
    std::cout << "arr.at(2) = " << arr.at(2) << std::endl;  // 边界检查

    // arr.at(10);  // 越界访问，会抛出 `std::out_of_range` 异常

    return 0;
}
```
迭代 `std::array`

方式 1：`for` 循环
```cpp
for (size_t i = 0; i < arr.size(); i++) {
    std::cout << arr[i] << " ";
}
```

方式 2：范围 `for`
```cpp
for (int num : arr) {
    std::cout << num << " ";
}
```

方式 3：使用迭代器
```cpp
for (auto it = arr.begin(); it != arr.end(); ++it) {
    std::cout << *it << " ";
}
```
后两种方法从根本上避免了数组越界。

`std::array` 的成员函数
| 函数 | 作用 |
|----------|---------|
| `size()` | 返回数组大小 |
| `empty()` | 判断是否为空 |
| `front()` | 获取第一个元素 |
| `back()` | 获取最后一个元素 |
| `fill(value)` | 用 `value` 填充整个数组 |
| `swap(arr2)` | 交换两个 `std::array` |

示例
```cpp
#include <iostream>
#include <array>

int main() {
    std::array<int, 5> arr = {1, 2, 3, 4, 5};

    arr.fill(0);  // 全部填充为 0

    std::array<int, 5> arr2 = {9, 8, 7, 6, 5};
    arr.swap(arr2);  // 交换 arr 和 arr2

    for (int num : arr) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    return 0;
}
```
推荐在 C++ 中使用 `std::array` 代替原生数组！因为更加安全，效率更高。

解析 `Vec() = default;`
在 C++ 中，`Vec() = default;` 是默认构造函数的一种声明方式，表示编译器会自动生成一个默认构造函数。

`= default` 关键字告诉编译器自动生成默认构造函数，其行为等同于：
```cpp
Vec() {}
```
但`= default` 更高效，避免了手写空函数带来的额外开销。

C++11 引入了 `= default`，可以用于构造函数和特殊成员函数，比如：

| 特殊函数 | 作用 | 示例 |
|-------------|---------|---------|
| 默认构造函数 | 生成默认的构造函数 | `Vec() = default;` |
| 拷贝构造函数 | 生成默认的拷贝构造 | `Vec(const Vec&) = default;` |
| 移动构造函数 | 生成默认的移动构造 | `Vec(Vec&&) = default;` |
| 拷贝赋值运算符 | 生成默认的拷贝赋值 | `Vec& operator=(const Vec&) = default;` |
| 移动赋值运算符 | 生成默认的移动赋值 | `Vec& operator=(Vec&&) = default;` |
| 析构函数 | 生成默认的析构函数 | `~Vec() = default;` |

C++ 列表初始化（`std::initializer_list`）

列表初始化是 C++11 引入的一种统一初始化方式，允许用花括号 `{}` 直接初始化变量、数组、类对象等。  

主要特点
- 支持 `std::initializer_list<T>` 作为构造函数参数。
- 允许使用 `{}` 直接初始化对象，提供更直观的初始化方式。
- 避免窄化转换（Narrowing Conversion），提高类型安全性。

1. `std::initializer_list` 解析

示例：使用 `std::initializer_list` 构造 `Vec` 类
```cpp
#include <iostream>
#include <initializer_list>

class Vec {
public:
    static const int N = 3;  // 3D 向量
    double data[N] = {0};    // 默认初始化为 {0, 0, 0}

    // 使用 `std::initializer_list<double>` 进行列表初始化
    Vec(std::initializer_list<double> values) {
        int i = 0;
        for (double val : values) {
            if (i < N) data[i++] = val;  // 赋值到数组
        }
    }

    void print() const {
        std::cout << "Vec(";
        for (int i = 0; i < N; ++i) {
            std::cout << data[i] << (i < N - 1 ? ", " : "");
        }
        std::cout << ")\n";
    }
};

int main() {
    Vec v1 = {1.0, 2.0, 3.0};  // 使用列表初始化
    Vec v2 = {4.5, 5.5};       // 部分初始化，剩余元素保持默认值 0

    v1.print();  // 输出: Vec(1.0, 2.0, 3.0)
    v2.print();  // 输出: Vec(4.5, 5.5, 0.0)

    return 0;
}
```

2. `std::initializer_list` 的常见用法

方式 1：用于类的构造函数
```cpp
class MyClass {
public:
    MyClass(std::initializer_list<int> values) {
        for (int v : values) {
            std::cout << v << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    MyClass obj = {1, 2, 3, 4};  // 使用 `{}` 直接初始化
}
```

方式 2：用于函数参数
```cpp
#include <iostream>
#include <initializer_list>

void printList(std::initializer_list<int> lst) {
    for (int val : lst) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
}

int main() {
    printList({10, 20, 30, 40});  // 直接传 `{}` 作为参数
}
```

方式 3：用于 `std::vector`
```cpp
#include <vector>
#include <iostream>

int main() {
    std::vector<int> v = {1, 2, 3, 4, 5};  // 直接列表初始化
    for (int x : v) {
        std::cout << x << " ";
    }
    return 0;
}
```

4. `std::initializer_list` vs. 其他初始化方式

| 方式 | 示例 | 特点 |
|---------|---------|---------|
| 直接初始化 | `Vec v(1.0, 2.0, 3.0);` | 需要提供精确的构造函数匹配 |
| 列表初始化 | `Vec v = {1.0, 2.0, 3.0};` | **更直观，支持变长参数** |
| 数组初始化 | `double arr[] = {1.0, 2.0, 3.0};` | 仅适用于数组 |
| `std::vector` 初始化 | `std::vector<int> v = {1, 2, 3};` | 适用于动态数组 |

介绍运算符重载，内部和外部，friend.
