---
title: DS-5 AVL 树的功能扩展
authors: [Quinn]
comments: true
date: 2025-12-04
tags:
  - 数据结构与算法
---

### **题目描述**

> 题目描述部分代码均为精简版

```cpp
#include <algorithm>
#include <iostream> 
#include <vector>
using namespace std;

// AvlTree class
//
// CONSTRUCTION: zero parameter
//
// ******************PUBLIC OPERATIONS*********************
// void insert( x )       --> Insert x
// void remove( x )       --> Remove x (unimplemented)
// bool contains( x )     --> Return true if x is present
// Comparable findMin( )  --> Return smallest item
// Comparable findMax( )  --> Return largest item
// boolean isEmpty( )     --> Return true if empty; else false
// void makeEmpty( )      --> Remove all items
// void printTree( )      --> Print tree in sorted order
// ******************ERRORS********************************
// Throws UnderflowException as warranted
```

在已有代码的基础上，您需要增加以下三个 `public` 权限的成员函数：

- `int rank(const Comparable & x) const`，该函数返回元素 $x$ 在 AVL 树中的排名，即，有多少个元素 $\leq x$。
- `const Comparable & kth(int k) const`，该函数返回 AVL 树中排名为 $k$ 的元素。
- `void merge(AvlTree && other)`，该函数将 `other` 树中的所有元素合并到自身。如果传入的 `other` 是空树，则什么都不做。
AVL 维护的元素是**不可重**的，因此在 `merge` 的过程中，如果有重复元素，合并后请将其视为一个元素。

#### 提示
您可以为 AvlNode 增加一个 `size` 属性，表示子树大小。在 `rotate` 的过程中不要忘了更新 `size`。

### **解题思路**

#### **1. rank()**

我们知道对 AVL 树的每个节点来说，左子树的所有节点值都小于该节点值，右子树的所有节点值都大于该节点值。
对于一个节点 `t`，可以分以下三种情况讨论：
1. 如果 `x` 小于 `t->element`，那么 `x` 的排名只可能出现在左子树中，因此令 `t = t->left` 继续查找。
2. 如果 `x` 大于 `t->element`，那么 `x` 的排名等于左子树的大小加上 `t` 本身再加上右子树中小于等于 `x` 的节点数，因此令 `rank += nodeSize(t->left) + 1`，然后令 `t = t->right` 继续查找。
3. 如果 `x` 等于 `t->element`，那么 `x` 的排名等于左子树的大小加上 `t` 本身，因此返回 `rank + nodeSize(t->left) + 1`。

```cpp
int rank(const Comparable & x) const {
    AvlNode* t = root;
    int r = 0; // 1-based rank; return 0 if not found
    while (t != nullptr) {
        if (x < t->element) {
            t = t->left;
        } else if (t->element < x) {
            r += nodeSize(t->left) + 1; // all in left + this node are < x
            t = t->right;
        } else {
            r += nodeSize(t->left) + 1; // found; include left subtree and self
            return r;
        }
    }
    return 0;
}
```

#### **2. kth()**

对于一个节点 `t`，我们同样可以分三种情况讨论：
1. 如果 `k` 小于等于左子树的大小，那么排名为 `k` 的节点一定在左子树中，因此令 `t = t->left` 继续查找。
2. 如果 `k` 等于左子树的大小加一，那么当前节点 `t` 就是排名为 `k` 的节点，因此返回 `t->element`。
3. 如果 `k` 大于左子树的大小加一，那么排名为 `k` 的节点就是右子树中排名为 `k - nodeSize(t->left) - 1` 的节点，因此令 `k -= nodeSize(t->left) + 1`，然后令 `t = t->right` 继续查找。

```cpp
const Comparable & kth(int k) const {
    if (root == nullptr) throw UnderflowException{};
    AvlNode* t = root;
    while (t != nullptr) {
        int leftSz = nodeSize(t->left);
        if (k == leftSz + 1) {
            return t->element;
        } else if (k <= leftSz) {
            t = t->left;
        } else {
            k -= leftSz + 1;
            t = t->right;
        }
    }
    return root->element;
}
```

#### **3. merge()**

题目给出了将 AVL 树转化成有序数组的函数 `inorderCollect()`，以及将有序数组转化成 AVL 树的函数 `buildBalancedFromSorted()`。
我们可以利用这两个函数来实现 `merge()`。具体步骤如下：
1. 如果 `other` 树为空，直接返回。
2. 将当前树和 `other` 树分别转化成有序数组 `arr1` 和 `arr2`。
3. 依次遍历 `arr1` 和 `arr2`，将它们合并成一个新的有序数组 `merged`，在合并过程中跳过重复元素。
4. 使用 `buildBalancedFromSorted()` 函数将 `merged` 数组转化成新的 AVL 树，并将其赋值给当前树的根节点。

```cpp
void merge(AvlTree && other) {
    if (other.root == nullptr) return;
    if (root == nullptr) {
        root = other.root;
        other.root = nullptr;
        return;
    }

    // Collect sorted elements from both trees
    vector<Comparable> a, b;
    inorderCollect(root, a);
    inorderCollect(other.root, b);

    // Merge two sorted arrays uniquely (duplicates kept once)
    vector<Comparable> merged;
    merged.reserve(a.size() + b.size());
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] < b[j]) {
            merged.push_back(a[i++]);
        } else if (b[j] < a[i]) {
            merged.push_back(b[j++]);
        } else {
            merged.push_back(a[i]);
            ++i; ++j;
        }
    }
    while (i < a.size()) merged.push_back(a[i++]);
    while (j < b.size()) merged.push_back(b[j++]);

    makeEmpty(root);
    makeEmpty(other.root);
    root = buildBalancedFromSorted(merged, 0, static_cast<int>(merged.size()) - 1);
    other.root = nullptr;
}
```

### **题目代码**
```cpp
#ifndef AVL_TREE_H
#define AVL_TREE_H

class UnderflowException { };
class IllegalArgumentException { };
class ArrayIndexOutOfBoundsException { };
class IteratorOutOfBoundsException { };
class IteratorMismatchException { };
class IteratorUninitializedException { };

#include <algorithm>
#include <iostream> 
using namespace std;

// AvlTree class
//
// CONSTRUCTION: zero parameter
//
// ******************PUBLIC OPERATIONS*********************
// void insert( x )       --> Insert x
// void remove( x )       --> Remove x (unimplemented)
// bool contains( x )     --> Return true if x is present
// Comparable findMin( )  --> Return smallest item
// Comparable findMax( )  --> Return largest item
// boolean isEmpty( )     --> Return true if empty; else false
// void makeEmpty( )      --> Remove all items
// void printTree( )      --> Print tree in sorted order
// ******************ERRORS********************************
// Throws UnderflowException as warranted

template <typename Comparable>
class AvlTree
{
  public:
    AvlTree( ) : root{ nullptr }
      { }
    
    AvlTree( const AvlTree & rhs ) : root{ nullptr }
    {
        root = clone( rhs.root );
    }

    AvlTree( AvlTree && rhs ) : root{ rhs.root }
    {
        rhs.root = nullptr;
    }
    
    ~AvlTree( )
    {
        makeEmpty( );
    }

    /**
     * Deep copy.
     */
    AvlTree & operator=( const AvlTree & rhs )
    {
        AvlTree copy = rhs;
        std::swap( *this, copy );
        return *this;
    }
        
    /**
     * Move.
     */
    AvlTree & operator=( AvlTree && rhs )
    {
        std::swap( root, rhs.root );
        
        return *this;
    }
    
    /**
     * Find the smallest item in the tree.
     * Throw UnderflowException if empty.
     */
    const Comparable & findMin( ) const
    {
        if( isEmpty( ) )
            throw UnderflowException{ };
        return findMin( root )->element;
    }

    /**
     * Find the largest item in the tree.
     * Throw UnderflowException if empty.
     */
    const Comparable & findMax( ) const
    {
        if( isEmpty( ) )
            throw UnderflowException{ };
        return findMax( root )->element;
    }

    /**
     * Returns true if x is found in the tree.
     */
    bool contains( const Comparable & x ) const
    {
        return contains( x, root );
    }

    /**
     * Test if the tree is logically empty.
     * Return true if empty, false otherwise.
     */
    bool isEmpty( ) const
    {
        return root == nullptr;
    }

    /**
     * Print the tree contents in sorted order.
     */
    void printTree( ) const
    {
        if( isEmpty( ) )
            cout << "Empty tree" << endl;
        else
            printTree( root );
    }

    /**
     * Make the tree logically empty.
     */
    void makeEmpty( )
    {
        makeEmpty( root );
    }

    /**
     * Insert x into the tree; duplicates are ignored.
     */
    void insert( const Comparable & x )
    {
        insert( x, root );
    }
     
    /**
     * Insert x into the tree; duplicates are ignored.
     */
    void insert( Comparable && x )
    {
        insert( std::move( x ), root );
    }
     
    /**
     * Remove x from the tree. Nothing is done if x is not found.
     */
    void remove( const Comparable & x )
    {
        remove( x, root );
    }

  private:
    struct AvlNode
    {
        Comparable element;
        AvlNode   *left;
        AvlNode   *right;
        int       height;

        AvlNode( const Comparable & ele, AvlNode *lt, AvlNode *rt, int h = 0 )
          : element{ ele }, left{ lt }, right{ rt }, height{ h } { }
        
        AvlNode( Comparable && ele, AvlNode *lt, AvlNode *rt, int h = 0 )
          : element{ std::move( ele ) }, left{ lt }, right{ rt }, height{ h } { }
    };

    AvlNode *root;


    /**
     * Internal method to insert into a subtree.
     * x is the item to insert.
     * t is the node that roots the subtree.
     * Set the new root of the subtree.
     */
    void insert( const Comparable & x, AvlNode * & t )
    {
        if( t == nullptr )
            t = new AvlNode{ x, nullptr, nullptr };
        else if( x < t->element )
            insert( x, t->left );
        else if( t->element < x )
            insert( x, t->right );
        
        balance( t );
    }

    /**
     * Internal method to insert into a subtree.
     * x is the item to insert.
     * t is the node that roots the subtree.
     * Set the new root of the subtree.
     */
    void insert( Comparable && x, AvlNode * & t )
    {
        if( t == nullptr )
            t = new AvlNode{ std::move( x ), nullptr, nullptr };
        else if( x < t->element )
            insert( std::move( x ), t->left );
        else if( t->element < x )
            insert( std::move( x ), t->right );
        
        balance( t );
    }
     
    /**
     * Internal method to remove from a subtree.
     * x is the item to remove.
     * t is the node that roots the subtree.
     * Set the new root of the subtree.
     */
    void remove( const Comparable & x, AvlNode * & t )
    {
        if( t == nullptr )
            return;   // Item not found; do nothing
        
        if( x < t->element )
            remove( x, t->left );
        else if( t->element < x )
            remove( x, t->right );
        else if( t->left != nullptr && t->right != nullptr ) // Two children
        {
            t->element = findMin( t->right )->element;
            remove( t->element, t->right );
        }
        else
        {
            AvlNode *oldNode = t;
            t = ( t->left != nullptr ) ? t->left : t->right;
            delete oldNode;
        }
        
        balance( t );
    }
    
    static const int ALLOWED_IMBALANCE = 1;

    // Assume t is balanced or within one of being balanced
    void balance( AvlNode * & t )
    {
        if( t == nullptr )
            return;
        
        if( height( t->left ) - height( t->right ) > ALLOWED_IMBALANCE )
            if( height( t->left->left ) >= height( t->left->right ) )
                rotateWithLeftChild( t );
            else
                doubleWithLeftChild( t );
        else
        if( height( t->right ) - height( t->left ) > ALLOWED_IMBALANCE )
            if( height( t->right->right ) >= height( t->right->left ) )
                rotateWithRightChild( t );
            else
                doubleWithRightChild( t );
                
        t->height = max( height( t->left ), height( t->right ) ) + 1;
    }
    
    /**
     * Internal method to find the smallest item in a subtree t.
     * Return node containing the smallest item.
     */
    AvlNode * findMin( AvlNode *t ) const
    {
        if( t == nullptr )
            return nullptr;
        if( t->left == nullptr )
            return t;
        return findMin( t->left );
    }

    /**
     * Internal method to find the largest item in a subtree t.
     * Return node containing the largest item.
     */
    AvlNode * findMax( AvlNode *t ) const
    {
        if( t != nullptr )
            while( t->right != nullptr )
                t = t->right;
        return t;
    }


    /**
     * Internal method to test if an item is in a subtree.
     * x is item to search for.
     * t is the node that roots the tree.
     */
    bool contains( const Comparable & x, AvlNode *t ) const
    {
        if( t == nullptr )
            return false;
        else if( x < t->element )
            return contains( x, t->left );
        else if( t->element < x )
            return contains( x, t->right );
        else
            return true;    // Match
    }
/****** NONRECURSIVE VERSION*************************
    bool contains( const Comparable & x, AvlNode *t ) const
    {
        while( t != nullptr )
            if( x < t->element )
                t = t->left;
            else if( t->element < x )
                t = t->right;
            else
                return true;    // Match

        return false;   // No match
    }
*****************************************************/

    /**
     * Internal method to make subtree empty.
     */
    void makeEmpty( AvlNode * & t )
    {
        if( t != nullptr )
        {
            makeEmpty( t->left );
            makeEmpty( t->right );
            delete t;
        }
        t = nullptr;
    }

    /**
     * Internal method to print a subtree rooted at t in sorted order.
     */
    void printTree( AvlNode *t ) const
    {
        if( t != nullptr )
        {
            printTree( t->left );
            cout << t->element << endl;
            printTree( t->right );
        }
    }

    /**
     * Internal method to clone subtree.
     */
    AvlNode * clone( AvlNode *t ) const
    {
        if( t == nullptr )
            return nullptr;
        else
            return new AvlNode{ t->element, clone( t->left ), clone( t->right ), t->height };
    }
        // Avl manipulations
    /**
     * Return the height of node t or -1 if nullptr.
     */
    int height( AvlNode *t ) const
    {
        return t == nullptr ? -1 : t->height;
    }

    int max( int lhs, int rhs ) const
    {
        return lhs > rhs ? lhs : rhs;
    }

    /**
     * Rotate binary tree node with left child.
     * For AVL trees, this is a single rotation for case 1.
     * Update heights, then set new root.
     */
    void rotateWithLeftChild( AvlNode * & k2 )
    {
        AvlNode *k1 = k2->left;
        k2->left = k1->right;
        k1->right = k2;
        k2->height = max( height( k2->left ), height( k2->right ) ) + 1;
        k1->height = max( height( k1->left ), k2->height ) + 1;
        k2 = k1;
    }

    /**
     * Rotate binary tree node with right child.
     * For AVL trees, this is a single rotation for case 4.
     * Update heights, then set new root.
     */
    void rotateWithRightChild( AvlNode * & k1 )
    {
        AvlNode *k2 = k1->right;
        k1->right = k2->left;
        k2->left = k1;
        k1->height = max( height( k1->left ), height( k1->right ) ) + 1;
        k2->height = max( height( k2->right ), k1->height ) + 1;
        k1 = k2;
    }

    /**
     * Double rotate binary tree node: first left child.
     * with its right child; then node k3 with new left child.
     * For AVL trees, this is a double rotation for case 2.
     * Update heights, then set new root.
     */
    void doubleWithLeftChild( AvlNode * & k3 )
    {
        rotateWithRightChild( k3->left );
        rotateWithLeftChild( k3 );
    }

    /**
     * Double rotate binary tree node: first right child.
     * with its left child; then node k1 with new right child.
     * For AVL trees, this is a double rotation for case 3.
     * Update heights, then set new root.
     */
    void doubleWithRightChild( AvlNode * & k1 )
    {
        rotateWithLeftChild( k1->right );
        rotateWithRightChild( k1 );
    }
};

#endif
```