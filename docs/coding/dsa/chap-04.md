# 第四章：散列

> 散列的核心思想：用 $O(1)$ 的时间做查找——把键值直接"映射"到位置，而不是"比较"。

---

## 散列的基本概念

### 什么是散列？

散列 (Hashing) 通过**散列函数 $h(key)$** 将键值映射到数组的某个位置，理想情况下实现 $O(1)$ 的插入、删除和查找。

!!! tip "散列 vs 二叉查找树"
    - 散列：$O(1)$ 平均查找，但无序
    - AVL/BST：$O(\log N)$ 查找，但支持有序遍历、求最小/最大

### 散列函数的要求

一个好的散列函数应当：
1. **计算快**：能在常数时间内计算出结果
2. **分布均匀**：键值尽可能均匀地散列到各个槽位上

### 常用散列函数

**对于整数键值**：

```cpp
int hash(int key, int tableSize) {
    return key % tableSize;
}
```

!!! warning "tableSize 最好取素数"
    模运算中，若 `tableSize` 为合数（如 2 的幂），可能导致某些位的信息丢失。取一个不接近 2 的幂的素数可减少冲突。

**对于字符串键值**：

```cpp
int hash(const string& key, int tableSize) {
    int hashVal = 0;
    for (char ch : key) {
        hashVal = (hashVal * 37 + ch) % tableSize;
    }
    return hashVal;
}
```

---

## 冲突处理

当 $h(key_1) = h(key_2)$ 时称为**冲突 (Collision)**，即使散列函数再好，冲突也不可避免。

### 分离链接法 (Separate Chaining)

每个槽位维护一个链表，冲突的元素挂在同一链表中。

```
Table:  [0] → [12] → [22]
        [1] → [1]  → [11]
        [2] → null
        [3] → [3]  → [13] → [33]
        ...
```

```cpp
class HashTable {
private:
    vector<list<int>> _table;
    int _size;

public:
    HashTable(int size) : _size(size), _table(size) {}

    void insert(int key) {
        int idx = key % _size;
        _table[idx].push_front(key);  // O(1)
    }

    bool contains(int key) const {
        int idx = key % _size;
        for (int val : _table[idx])
            if (val == key) return true;
        return false;
    }

    void remove(int key) {
        int idx = key % _size;
        _table[idx].remove(key);
    }
};
```

| 操作 | 平均 | 最坏 |
|------|:---:|:---:|
| 插入 | $O(1)$ | $O(N)$（所有键冲突到同一槽） |
| 查找 | $O(\lambda)$ | $O(N)$ |

其中 $\lambda$ = 元素数 / 表大小 = **装填因子 (Load Factor)**。

!!! tip "装填因子"
    $\lambda \approx 1$ 时性能较好。$\lambda$ 过大时，链表变长，性能下降，需要**再散列 (Rehashing)** 扩容。

---

### 开放定址法 (Open Addressing)

发生冲突时，在表中寻找**下一个空位**存放元素。整个表只有一份数据（无链表）。

#### 线性探测 (Linear Probing)

$$h_i(x) = (h(x) + i) \bmod N \qquad (i = 0, 1, 2, \ldots)$$

冲突时依次尝试下一个位置。

```cpp
int linearProbe(int key, int i, int tableSize) {
    return (key % tableSize + i) % tableSize;
}
```

**问题：一次聚集 (Primary Clustering)**——连续的已占用槽位会导致后续插入的聚集。

#### 平方探测 (Quadratic Probing)

$$h_i(x) = (h(x) + i^2) \bmod N \qquad (i = 0, 1, 2, \ldots)$$

!!! important "平方探测的条件"
    若表大小是**素数**且装填因子 $\lambda < 0.5$，平方探测保证能找到空位。这就是为什么开放定址法的哈希表不能装太满。

#### 双散列 (Double Hashing)

$$h_i(x) = (h_1(x) + i \cdot h_2(x)) \bmod N$$

其中 $h_2(x)$ 是第二个散列函数，且 $h_2(x)$ 与表大小互质。

```cpp
int h1(int key, int size) { return key % size; }
int h2(int key, int size) { return 7 - (key % 7); }  // 第二个散列函数

int doubleHash(int key, int i, int size) {
    return (h1(key, size) + i * h2(key, size)) % size;
}
```

---

## 三种冲突处理的比较

| 方法 | 空间 | 删除 | 实现 | 集群问题 |
|------|------|------|------|----------|
| 分离链接 | 额外指针开销 | 简单 | 简单 | 无 |
| 线性探测 | 无额外开销 | 需惰性删除 | 最简单 | 一次聚集 |
| 平方探测 | 无额外开销 | 需惰性删除 | 中等 | 二次聚集 |
| 双散列 | 无额外开销 | 需惰性删除 | 较复杂 | 较少聚集 |

---

## 再散列 (Rehashing)

当装填因子 $\lambda$ 超过阈值（如分离链接法 > 1.0，开放定址法 > 0.5），需要**再散列**：

1. 创建一个约两倍大的新表（取下一个素数）
2. 将旧表中的每个元素重新散列到新表
3. 释放旧表

```cpp
void rehash() {
    int oldSize = _size;
    vector<list<int>> oldTable = move(_table);

    _size = nextPrime(2 * oldSize);
    _table.assign(_size, list<int>());

    for (int i = 0; i < oldSize; i++) {
        for (int key : oldTable[i]) {
            insert(key);  // 重新散列到新表
        }
    }
}
```

!!! warning "再散列的代价"
    再散列的复杂度为 $O(N)$，但这属于**均摊分析**——分散到每次操作中，均摊代价仍为 $O(1)$。

---

## 时间复杂度总结

| 操作 | 平均（分离链接/开放定址） | 最坏 |
|------|:----------------------:|:---:|
| 插入 | $O(1)$ | $O(N)$ |
| 查找 | $O(1)$ | $O(N)$ |
| 删除 | $O(1)$ | $O(N)$ |

!!! tip "直觉总结"
    散列表在**平均情况下**提供 $O(1)$ 的操作，但**最坏情况下**可能退化为 $O(N)$。一个好的散列函数 + 合理的装填因子是散列表高效的前提。
