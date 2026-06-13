# 第二章：表、栈与队列

> 三驾基础数据结构马车——表存数据，栈管回溯，队列调度先后。

---

## 抽象数据类型 (ADT)

**ADT (Abstract Data Type)** 定义了数据结构的**逻辑行为**（支持哪些操作），而不涉及**具体实现**（用数组还是链表）。

!!! note "核心思想"
    ADT 是"规约"——它规定一段程序**做什么**，而不是**怎么做**。

---

## 表 (List)

### ADT 定义

| 操作 | 说明 |
|------|------|
| `printList()` | 打印表中所有元素 |
| `makeEmpty()` | 清空表 |
| `find(x)` | 查找值为 $x$ 的第一个元素，返回位置 |
| `insert(x, pos)` | 在位置 `pos` 插入 $x$ |
| `remove(x)` | 删除第一个值为 $x$ 的元素 |
| `findKth(k)` | 返回第 $k$ 个位置的元素 |

### 数组实现

```cpp
class ArrayList {
private:
    int _size;
    int* _data;    // 也可以替换为 vector<int>
public:
    ArrayList(int maxSize);
    int find(int val) const;
    void insert(int val, int pos);
    void remove(int val);
};
```

| 操作 | 复杂度 |
|------|:------:|
| 随机访问 (`findKth`) | $O(1)$ |
| 查找 (`find`) | $O(N)$ |
| 插入/删除 | $O(N)$（需要移动元素） |

!!! tip "数组实现的优劣"
    - 优点：随机访问 $O(1)$，内存连续，cache 友好
    - 缺点：插入/删除需移动大量元素，大小固定（或需动态扩容）

### 链表实现 (Linked List)

```cpp
struct Node {
    int data;
    Node* next;
};

class LinkedList {
private:
    Node* _head;
    int _size;
public:
    LinkedList();
    void pushFront(int val);   // O(1)
    void popFront();           // O(1)
    Node* find(int val);       // O(N)
    void insertAfter(Node* p, int val);  // O(1)
    void removeAfter(Node* p);           // O(1)
};
```

| 操作 | 复杂度 |
|------|:------:|
| 头插入/删除 | $O(1)$ |
| 查找 | $O(N)$ |
| 尾插入（无尾指针） | $O(N)$ |
| 删除指定节点 | $O(N)$（需找到前驱） |

### 双向链表

```cpp
struct DoublyNode {
    int data;
    DoublyNode* prev;
    DoublyNode* next;
};
```

双向链表支持 $O(1)$ 地在给定节点前后插入/删除，但每个节点多了 `prev` 指针的开销。

### STL 中的 List

| 容器 | 底层结构 | 特点 |
|------|----------|------|
| `vector` | 动态数组 | 随机访问 $O(1)$，尾部增删快 |
| `list` | 双向链表 | 任意位置插入/删除 $O(1)$，无随机访问 |
| `deque` | 双端队列 | 头尾增删 $O(1)$，随机访问 $O(1)$ |

---

## 栈 (Stack)

**LIFO (Last In, First Out)** — 后进先出。

### ADT 定义

| 操作 | 说明 |
|------|------|
| `push(x)` | 压入栈顶 |
| `pop()` | 弹出栈顶元素 |
| `top()` | 查看栈顶元素（不弹出） |
| `isEmpty()` | 判断栈是否为空 |

### 数组实现

```cpp
class Stack {
private:
    vector<int> _data;
public:
    void push(int x) {
        _data.push_back(x);      // O(1) 均摊
    }
    void pop() {
        if (!_data.empty()) _data.pop_back();
    }
    int top() const {
        return _data.back();
    }
    bool isEmpty() const {
        return _data.empty();
    }
};
```

### 链表实现

```cpp
struct StackNode {
    int data;
    StackNode* next;
};

class Stack {
private:
    StackNode* _top = nullptr;
public:
    void push(int x) {
        StackNode* node = new StackNode{x, _top};
        _top = node;             // O(1)
    }
    void pop() {
        if (_top) {
            StackNode* tmp = _top;
            _top = _top->next;
            delete tmp;
        }
    }
    int top() const { return _top->data; }
};
```

!!! tip "两种实现的对比"
    - 数组：连续内存，cache 友好；可能需扩容
    - 链表：无扩容问题；每个元素多一个指针开销

### 栈的经典应用

| 应用 | 说明 |
|------|------|
| **后缀表达式求值** | 遇数字入栈，遇运算符弹出两个运算 |
| **括号匹配** | 左括号入栈，遇右括号弹栈配对 |
| **函数调用栈** | 递归/函数调用时的局部变量与返回地址 |
| **深度优先搜索** | 用栈实现非递归 DFS |
| **撤销操作 (Undo)** | 操作历史压栈，撤销时弹栈 |

---

## 队列 (Queue)

**FIFO (First In, First Out)** — 先进先出。

### ADT 定义

| 操作 | 说明 |
|------|------|
| `enqueue(x)` | 入队（尾部） |
| `dequeue()` | 出队（头部） |
| `front()` | 查看队首元素 |
| `isEmpty()` | 判断队列是否为空 |

### 循环数组实现

```cpp
class Queue {
private:
    vector<int> _data;
    int _front = 0;
    int _rear = -1;
    int _count = 0;

public:
    Queue(int capacity) : _data(capacity) {}

    void enqueue(int x) {
        if (_count == _data.size()) throw overflow;
        _rear = (_rear + 1) % _data.size();
        _data[_rear] = x;
        _count++;
    }

    int dequeue() {
        if (_count == 0) throw underflow;
        int val = _data[_front];
        _front = (_front + 1) % _data.size();
        _count--;
        return val;
    }
};
```

### 队列的经典应用

| 应用 | 说明 |
|------|------|
| **广度优先搜索** | 逐层访问图/树节点 |
| **任务调度** | 先到先处理（FCFS） |
| **消息队列** | 生产者-消费者模型 |
| **缓冲区** | 键盘输入缓冲、打印队列 |

---

## 复杂度总结

| 数据结构 | push/入队 | pop/出队 | 查找 | 随机访问 |
|----------|:--------:|:--------:|:----:|:--------:|
| 栈（数组） | $O(1)$ | $O(1)$ | $O(N)$ | — |
| 栈（链表） | $O(1)$ | $O(1)$ | $O(N)$ | — |
| 队列（循环数组） | $O(1)$ | $O(1)$ | $O(N)$ | — |
| 队列（链表） | $O(1)$ | $O(1)$ | $O(N)$ | — |
| `vector` | $O(1)$ 尾 | $O(1)$ 尾 | $O(N)$ | $O(1)$ |
| `list` | $O(1)$ 任意 | $O(1)$ 任意 | $O(N)$ | — |
