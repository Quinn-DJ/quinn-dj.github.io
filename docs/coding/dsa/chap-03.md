# 第三章：树

> 树是非线性数据结构的核心——从文件系统到数据库索引，树形结构无处不在。

---

## 树的基本概念

### 术语

| 术语 | 含义 |
|------|------|
| **根 (Root)** | 树的最顶层节点 |
| **叶 (Leaf)** | 没有子节点的节点 |
| **深度 (Depth)** | 从根到该节点的路径长度（根深度 = 0） |
| **高度 (Height)** | 从该节点到最深叶的路径长度（叶高度 = 0） |
| **度 (Degree)** | 某节点的子节点数量 |

### 二叉树 (Binary Tree)

每个节点最多有两个子节点的树。二叉树有以下遍历方式：

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
};

// 前序遍历：根 → 左 → 右
void preOrder(TreeNode* root) {
    if (!root) return;
    cout << root->val << " ";
    preOrder(root->left);
    preOrder(root->right);
}

// 中序遍历：左 → 根 → 右
void inOrder(TreeNode* root) {
    if (!root) return;
    inOrder(root->left);
    cout << root->val << " ";
    inOrder(root->right);
}

// 后序遍历：左 → 右 → 根
void postOrder(TreeNode* root) {
    if (!root) return;
    postOrder(root->left);
    postOrder(root->right);
    cout << root->val << " ";
}
```

### 二叉树的实现

**数组实现**：适合完全二叉树。节点 $i$ 的左子在 $2i$，右子在 $2i+1$，父节点在 $\lfloor i/2\rfloor$。

**链式实现**：每个节点包含数据 + 左右指针。

---

## 二叉查找树 (BST)

### 性质

对任意节点 $x$：
- 左子树的所有节点值 < $x$ 的值
- 右子树的所有节点值 > $x$ 的值

!!! note "BST 的查找效率"
    理想情况（平衡）：$O(\log N)$
    最坏情况（退化成链表）：$O(N)$

### 基本操作

```cpp
// 查找：若比当前节点小则走左边，大则走右边
TreeNode* search(TreeNode* root, int key) {
    if (!root || root->val == key) return root;
    if (key < root->val) return search(root->left, key);
    return search(root->right, key);
}

// 插入
TreeNode* insert(TreeNode* root, int key) {
    if (!root) return new TreeNode{key, nullptr, nullptr};
    if (key < root->val)
        root->left = insert(root->left, key);
    else if (key > root->val)
        root->right = insert(root->right, key);
    return root;
}
```

### BST 的删除

三种情况：

1. **叶节点**：直接删除
2. **只有一个子节点**：用子节点替换
3. **有两个子节点**：用右子树的最小值（或左子树的最大值）替换，然后删除该后继节点

```cpp
TreeNode* remove(TreeNode* root, int key) {
    if (!root) return nullptr;
    if (key < root->val)
        root->left = remove(root->left, key);
    else if (key > root->val)
        root->right = remove(root->right, key);
    else {
        // 找到要删除的节点
        if (!root->left) {         // 只有右子树或没有子树
            TreeNode* tmp = root->right;
            delete root;
            return tmp;
        } else if (!root->right) { // 只有左子树
            TreeNode* tmp = root->left;
            delete root;
            return tmp;
        }
        // 有两个子节点：找右子树最小值
        TreeNode* minNode = root->right;
        while (minNode->left) minNode = minNode->left;
        root->val = minNode->val;
        root->right = remove(root->right, minNode->val);
    }
    return root;
}
```

| 操作 | 平均 | 最坏 |
|------|:---:|:---:|
| 查找 | $O(\log N)$ | $O(N)$ |
| 插入 | $O(\log N)$ | $O(N)$ |
| 删除 | $O(\log N)$ | $O(N)$ |

---

## AVL 树

AVL 树是一种**自平衡二叉查找树**，每个节点的左右子树高度差不超过 1。

### 平衡因子

```
平衡因子 = 左子树高度 - 右子树高度
```

AVL 要求 $|\text{BF}| \le 1$（即只能是 -1、0、1）。

### 旋转操作

插入/删除后平衡因子可能变成 ±2，需要**旋转**来恢复平衡。

| 情形 | 不平衡模式 | 修复 |
|------|-----------|------|
| LL | 在左子树的左子树插入 | 右旋 (Right Rotation) |
| RR | 在右子树的右子树插入 | 左旋 (Left Rotation) |
| LR | 在左子树的右子树插入 | 先左旋左子，再右旋 |
| RL | 在右子树的左子树插入 | 先右旋右子，再左旋 |

**右旋 (LL 修复)**

```
      k2              k1
     /  \            /  \
    k1   Z   →     X    k2
   /  \                 /  \
  X    Y               Y    Z
```

**左旋 (RR 修复)**

```
    k1                   k2
   /  \                 /  \
  X   k2      →       k1   Z
      /  \           /  \
     Y    Z         X    Y
```

```cpp
TreeNode* rotateRight(TreeNode* k2) {
    TreeNode* k1 = k2->left;
    k2->left = k1->right;
    k1->right = k2;
    return k1;  // 新根
}

TreeNode* rotateLeft(TreeNode* k1) {
    TreeNode* k2 = k1->right;
    k1->right = k2->left;
    k2->left = k1;
    return k2;  // 新根
}
```

!!! important "AVL 树的关键性质"
    - 查找/插入/删除均为 $O(\log N)$
    - 插入最多需要**一次**旋转即可恢复平衡
    - 删除可能需要**多次**旋转（沿路径向上传播）
    - 最小 AVL 树的高度约为 $1.44\log_2 N$

---

## B 树

B 树是一种自平衡的多路搜索树，广泛应用于数据库和文件系统索引。

### 性质（$M$ 阶 B 树）

- 根节点至少有 2 个子节点（除非是叶）
- 每个内部节点有 $\lceil M/2\rceil$ 到 $M$ 个子节点
- 所有叶节点在同一深度
- 每个节点存储 $\lceil M/2\rceil-1$ 到 $M-1$ 个键值

### 查找与插入

- **查找**：从根开始，在每个节点中二分查找键值，确定下一层
- **插入**：找到合适的叶节点插入；若节点满（$M-1$ 个键），则**分裂**节点，中间键上移至父节点

!!! tip "B 树的优势"
    - 高度更低（相比二叉树），减少磁盘 I/O 次数
    - 广泛应用于数据库索引（如 MySQL 的 InnoDB B+ 树）

---

## Splay 树

Splay 树是一种**自调整二叉查找树**，核心操作是 **splay（伸展）**——每次访问后将节点旋转到根。

### 伸展策略

访问节点 $x$ 后，根据 $x$ 和父节点 $p$、祖父 $g$ 的相对位置执行旋转：

| 模式 | 条件 | 操作 |
|------|------|------|
| Zig | $p$ 是根 | 旋转 $x$ 到根 |
| Zig-Zig | $x$ 和 $p$ 同为左/右孩子 | 先旋转 $p$，再旋转 $x$ |
| Zig-Zag | $x$ 和 $p$ 不同侧 | 旋转 $x$ 两次 |

!!! tip "Splay 树的特点"
    - 均摊复杂度 $O(\log N)$（单次操作可能 $O(N)$，但多次操作均摊为 $\log N$）
    - 无需存储平衡因子或颜色，实现简单
    - 对近期访问的模式表现出接近最优的性能（工作集性质）

---

## 树的高度与复杂度

| 树类型 | 最坏高度 | 查找复杂度 |
|--------|:------:|:--------:|
| 普通 BST | $N$ | $O(N)$ |
| AVL 树 | $1.44\log N$ | $O(\log N)$ |
| 红黑树 | $2\log N$ | $O(\log N)$ |
| B 树 | $\log_{\lceil M/2\rceil} N$ | $O(\log N)$ |
| Splay 树 | $N$（单次） | $O(\log N)$ 均摊 |

---

## 表达式树

表达式树将中缀表达式表示为二叉树：
- **叶节点**：操作数
- **内部节点**：运算符

```
    (a + b) * (c - d)

         *
       /   \
      +     -
     / \   / \
    a   b c   d
```

后序遍历表达式树即可得到后缀表达式（逆波兰记法），中序遍历得到中缀表达式。

```cpp
void postOrder(TreeNode* root) {
    if (!root) return;
    postOrder(root->left);
    postOrder(root->right);
    cout << root->val;  // 输出后缀表达式
}
```
