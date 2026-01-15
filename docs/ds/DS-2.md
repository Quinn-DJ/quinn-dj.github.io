---
title: DS-2 完善 Array List
authors: [Quinn]
comments: true
date: 2025-09-24
tags:
  - 数据结构与算法
---

### **题目描述**

> 题目描述部分代码均为精简版

```cpp
typedef double t_ele;
typedef int t_idx;
class ArrayList 
{
private:
    t_idx size = 0;      // List 的大小.
    t_ele *data = nullptr;  // 存放数据的内存区域.
public:
    int find(t_ele _val) const;
    void makeEmpty();
};
```

如你所见，头文件里定义了 `find` 和 `makeEmpty` 两个函数，但在 `ArrayList.cpp` 里并没有实现。现在请你完善 `ArrayList.cpp`，实现这两个函数。

- find 函数接收一个值 $x$，你需要返回数组里第一个 $x$ 值的下标；若数组里找不到 $x$ 值，则返回 $-1$。
- `makeEmpty` 函数需要将 `ArrayList` 清空，注意避免出现内存泄露。

### **解题思路**

对于 `find` 函数，我们只需要遍历数组，找到第一个 $x$ 值的下标，然后返回即可，如果遍历完都没有找到 $x$，则返回 $-1$。

注意到存放的数据类型 `t_ele` 是 `double` 类型，所以我们不能使用 `==` 运算符。

```cpp
int ArrayList::find(t_ele _val) const {
    for (int i = 0; i < size; ++i) { // 遍历数组
        if (-1e-9 < data[i] - _val && data[i] - _val < 1e-9) { // double 类型数据的比较方式
            return i;
        }
    }
    return -1; // 找不到，返回 -1
}
```

对于 `makeEmpty` 函数，我们要做的就是清空数组，但是我们不能直接将数组的指针赋值为 `nullptr`，因为这样会导致内存泄露。

```cpp
void ArrayList::makeEmpty() {
    delete[] data; // 释放内存
    data = nullptr; // 避免野指针
    size = 0; // List 的大小也清零
    return;
}
```

---

### **参考代码**

`ArrayList.h`
```cpp
#ifndef __CRAZYFISH_ARRAYLIST__
#define __CRAZYFISH_ARRAYLIST__

typedef double t_ele;
typedef int t_idx;

class ArrayList 
{
private:
    t_idx size = 0;      // List 的大小.
    t_ele *data = nullptr;  // 存放数据的内存区域.
public:
    ArrayList(){}; 
    ArrayList(int _maxSize)
    {
        size = _maxSize;
        data = new double[size];
        for (int i = 0; i < size; i++)
            data[i] = 0.0;
    };

    ArrayList(const ArrayList &other)
    {
        size = other.size;
        data = new double[size];
        for (int i = 0; i < size; i++)
            data[i] = other.data[i];
    };
    
    ~ArrayList()
    {
        makeEmpty();
    };

    ArrayList &operator=(const ArrayList &other)
    {
        if (this == &other)
            return *this;
        if (data != nullptr)
            delete[] data;
        size = other.size;
        data = new double[size];
        for (int i = 0; i < size; i++)
            data[i] = other.data[i];
        return *this;
    };

    void insert(t_ele _val, t_idx _pos); // 在指定位置插入一个元素.
    void printList() const;  // 列出表内全部元素.

    int find(t_ele _val) const;
    void makeEmpty();
    
};  

#else
//DO NOTHING
#endif
```

`ArrayList.cpp`
```cpp
#include "ArrayList02.h"
#include <iostream>

void ArrayList::printList() const
{
    for (int i = 0; i < size; i++)
        std::cout << data[i] << " ";
    std::cout << std::endl;
}

void ArrayList::insert(t_ele _val, t_idx _pos)
{
    if (_pos < 0 || _pos >= size)
    {
        std::cerr << "Error: position out of range." << std::endl;
        return;
    }
    for (int i = size - 1; i > _pos; i--)
        data[i] = data[i - 1];
    data[_pos] = _val;
}

// 以下为所需要实现的部分
int ArrayList::find(t_ele _val) const {
    for (int i = 0; i < size; ++i) {
        if (-1e-9 < data[i] - _val && data[i] - _val < 1e-9) {
            return i;
        }
    }
    return -1;
}

void ArrayList::makeEmpty() {
    delete[] data;
    data = nullptr;
    size = 0;
    return;
}
```