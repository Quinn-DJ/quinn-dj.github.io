---
title: DS-4 二叉搜索树的功能扩展
authors: [Quinn]
comments: true
date: 2025-10-23
tags:
  - 数据结构与算法
---

### **题目描述**

> 题目描述部分代码均为精简版

```cpp
#ifndef BINARY_SEARCH_TREE_H
#define BINARY_SEARCH_TREE_H

// BinarySearchTree class
//
// CONSTRUCTION: zero parameter
//
// ******************PUBLIC OPERATIONS*********************
// void insert( x )       --> Insert x
// void remove( x )       --> Remove x
// bool contains( x )     --> Return true if x is present
// Comparable findMin( )  --> Return smallest item
// Comparable findMax( )  --> Return largest item
// boolean isEmpty( )     --> Return true if empty; else false
// void makeEmpty( )      --> Remove all items
// void printTree( )      --> Print tree in sorted order
// ******************ERRORS********************************
// Throws UnderflowException as warranted

template <typename Comparable>
class BinarySearchTree
{
  public:
  // ... Other public operations ...
  private:
    struct BinaryNode {
        Comparable element;
        BinaryNode *left;
        BinaryNode *right;

        BinaryNode( const Comparable & theElement, BinaryNode *lt, BinaryNode *rt )
          : element{ theElement }, left{ lt }, right{ rt } { }
        
        BinaryNode( Comparable && theElement, BinaryNode *lt, BinaryNode *rt )
          : element{ std::move( theElement ) }, left{ lt }, right{ rt } { }
    };

    BinaryNode *root;
  public:
     /**
     * Serialize the tree to a sorted vector.
     */
     std::vector<Comparable> serialize() const;

     /**
      * Deserialize from a sorted vector to build a balanced tree.
      */
     void deserialize(const std::vector<Comparable> &vec);
 
     /**
      * Remove all elements in the range [L, R] and return the count.
      */
     int removeRange(const Comparable& L, const Comparable& R);
};
#endif
```

您可以看到，在原本的教材代码下面，我们增加了三个成员函数，您需要实现它们。功能如下：

- `std::vector<Comparable> serialize() const;` 该函数返回一个 `std::vector`，表示二叉搜索树上的所有数据从小到大排序的结果。
- `void deserialize(const std::vector<Comparable> &vec);` 该函数接收一个从小到大排好序的 `std::vector`，您需要将这些数据插入二叉搜索树。保证调用这个函数之前二叉搜索树是空的。
- `int removeRange(const Comparable& L, const Comparable& R);` 该函数用于删除二叉搜索树中所有满足 $L \leq x \leq R$ 的值，并返回一个 `int` 表示您一共删除了多少个值。

### **解题思路**

#### **1. serialize()**

根据二叉搜索树的性质，我们只需对这棵树进行中序遍历，就能得到一个从小到大排序的结果。

我们新建一个栈 `stack` 用于模拟递归的中序遍历过程，同时新建一个 `result` 向量用于存储结果。我们从根节点开始，沿着左子树一直走到底，将经过的节点依次压入栈中。当无法继续向左走时，我们弹出栈顶节点，将其值加入结果向量，然后转向右子树，继续上述过程，直到栈为空且当前节点为 `nullptr`。

```cpp
std::vector<Comparable> serialize() const {
    std::vector<Comparable> vec; // result vector
    std::vector<BinaryNode*> stack; // stack for traversal
    BinaryNode* cur = root; // current node
    while (cur != nullptr || !stack.empty()) {
        while (cur != nullptr) {
            stack.push_back(cur);
            cur = cur->left; // go left
        }
        cur = stack.back(); // get top of stack
        vec.push_back(cur->element); // add to result
        stack.pop_back(); // pop from stack
        cur = cur->right; // go right
    }
    return vec;
}
```

#### **2. deserialize()**

我们先找到输入向量的中间位置，将该位置的值插入树中作为根节点。然后递归地对左半部分和右半部分重复这个过程，分别构建左子树和右子树。

我们使用一个栈来模拟递归过程。初始时将整个向量的范围 `[0, vec.size() - 1]` 压入栈中。每次从栈中弹出一个范围，计算中间位置，将对应的值插入树中，然后将左半部分和右半部分的范围压入栈中，直到栈为空。

```cpp
void deserialize(const std::vector<Comparable> &vec) {
    makeEmpty();
    int L = 0, R = vec.size() - 1;
    std::vector<std::pair<int, int>> stack;
    stack.push_back({L, R});
    while (!stack.empty()) {
        auto [l, r] = stack.back();
        stack.pop_back();
        if (l > r) continue;
        int mid = l + (r - l) / 2;
        insert(vec[mid]);
        stack.push_back({l, mid - 1});
        stack.push_back({mid + 1, r});
    }
}
```

#### **3. removeRange()**

我们先将这棵树序列化为一个排序向量。然后遍历该向量，将不在范围 `[L, R]` 内的元素收集到一个新的向量 `remain` 中。最后，我们计算删除的元素数量，并使用 `deserialize()` 函数将剩余的元素重新构建成一棵二叉搜索树。

```cpp
int removeRange(const Comparable& L, const Comparable& R) {
    std::vector<Comparable> vec = serialize();
    std::vector<Comparable> remain;
    for (auto it : vec) {
        if (it < L || R < it) {
            remain.push_back(it);
        }
    }
    int count = vec.size() - remain.size();
    deserialize(remain);
    return count;
}
```

### **参考代码**

```cpp
template <typename Comparable>
std::vector<Comparable> BinarySearchTree<Comparable>::serialize() const {
    std::vector<Comparable> vec;
    std::vector<BinaryNode*> stack;
    BinaryNode* cur = root;
    while (cur != nullptr || !stack.empty()) {
        while (cur != nullptr) {
            stack.push_back(cur);
            cur = cur->left;
        }
        cur = stack.back();
        vec.push_back(cur->element);
        stack.pop_back();
        cur = cur->right;
    }
    return vec;
}

template <typename Comparable>
void BinarySearchTree<Comparable>::deserialize(const std::vector<Comparable> &vec) {
    makeEmpty();
    int L = 0, R = vec.size() - 1;
    std::vector<std::pair<int, int>> stack;
    stack.push_back({L, R});
    while (!stack.empty()) {
        auto [l, r] = stack.back();
        stack.pop_back();
        if (l > r) continue;
        int mid = l + (r - l) / 2;
        insert(vec[mid]);
        stack.push_back({l, mid - 1});
        stack.push_back({mid + 1, r});
    }
}

template <typename Comparable>
int BinarySearchTree<Comparable>::removeRange(const Comparable& L, const Comparable& R) {
    std::vector<Comparable> vec = serialize();
    std::vector<Comparable> remain;
    for (auto it : vec) {
        if (it < L || R < it) {
            remain.push_back(it);
        }
    }
    int count = vec.size() - remain.size();
    deserialize(remain);
    return count;
}
```

### **教材代码**

```cpp
#ifndef DS_EXCEPTIONS_H
#define DS_EXCEPTIONS_H

class UnderflowException { };
class IllegalArgumentException { };
class ArrayIndexOutOfBoundsException { };
class IteratorOutOfBoundsException { };
class IteratorMismatchException { };
class IteratorUninitializedException { };

#endif

#ifndef BINARY_SEARCH_TREE_H
#define BINARY_SEARCH_TREE_H

#include <algorithm>
#include <vector>
#include <iostream>
#include <functional>
using namespace std;       

// BinarySearchTree class
//
// CONSTRUCTION: zero parameter
//
// ******************PUBLIC OPERATIONS*********************
// void insert( x )       --> Insert x
// void remove( x )       --> Remove x
// bool contains( x )     --> Return true if x is present
// Comparable findMin( )  --> Return smallest item
// Comparable findMax( )  --> Return largest item
// boolean isEmpty( )     --> Return true if empty; else false
// void makeEmpty( )      --> Remove all items
// void printTree( )      --> Print tree in sorted order
// ******************ERRORS********************************
// Throws UnderflowException as warranted

template <typename Comparable>
class BinarySearchTree
{
  public:
    BinarySearchTree( ) : root{ nullptr }
    {
    }

    /**
     * Copy constructor
     */
    BinarySearchTree( const BinarySearchTree & rhs ) : root{ nullptr }
    {
        root = clone( rhs.root );
    }

    /**
     * Move constructor
     */
    BinarySearchTree( BinarySearchTree && rhs ) : root{ rhs.root }
    {
        rhs.root = nullptr;
    }
    
    /**
     * Destructor for the tree
     */
    ~BinarySearchTree( )
    {
        makeEmpty( );
    }

    /**
     * Copy assignment
     */
    BinarySearchTree & operator=( const BinarySearchTree & rhs )
    {
        BinarySearchTree copy = rhs;
        std::swap( *this, copy );
        return *this;
    }
        
    /**
     * Move assignment
     */
    BinarySearchTree & operator=( BinarySearchTree && rhs )
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
    void printTree( ostream & out = cout ) const
    {
        if( isEmpty( ) )
            out << "Empty tree" << endl;
        else
            printTree( root, out );
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
    struct BinaryNode
    {
        Comparable element;
        BinaryNode *left;
        BinaryNode *right;

        BinaryNode( const Comparable & theElement, BinaryNode *lt, BinaryNode *rt )
          : element{ theElement }, left{ lt }, right{ rt } { }
        
        BinaryNode( Comparable && theElement, BinaryNode *lt, BinaryNode *rt )
          : element{ std::move( theElement ) }, left{ lt }, right{ rt } { }
    };

    BinaryNode *root;


    /**
     * Internal method to insert into a subtree.
     * x is the item to insert.
     * t is the node that roots the subtree.
     * Set the new root of the subtree.
     */
    void insert( const Comparable & x, BinaryNode * & t )
    {
        if( t == nullptr )
            t = new BinaryNode{ x, nullptr, nullptr };
        else if( x < t->element )
            insert( x, t->left );
        else if( t->element < x )
            insert( x, t->right );
        else
            ;  // Duplicate; do nothing
    }
    
    /**
     * Internal method to insert into a subtree.
     * x is the item to insert.
     * t is the node that roots the subtree.
     * Set the new root of the subtree.
     */
    void insert( Comparable && x, BinaryNode * & t )
    {
        if( t == nullptr )
            t = new BinaryNode{ std::move( x ), nullptr, nullptr };
        else if( x < t->element )
            insert( std::move( x ), t->left );
        else if( t->element < x )
            insert( std::move( x ), t->right );
        else
            ;  // Duplicate; do nothing
    }

    /**
     * Internal method to remove from a subtree.
     * x is the item to remove.
     * t is the node that roots the subtree.
     * Set the new root of the subtree.
     */
    void remove( const Comparable & x, BinaryNode * & t )
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
            BinaryNode *oldNode = t;
            t = ( t->left != nullptr ) ? t->left : t->right;
            delete oldNode;
        }
    }

    /**
     * Internal method to find the smallest item in a subtree t.
     * Return node containing the smallest item.
     */
    BinaryNode * findMin( BinaryNode *t ) const
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
    BinaryNode * findMax( BinaryNode *t ) const
    {
        if( t != nullptr )
            while( t->right != nullptr )
                t = t->right;
        return t;
    }


    /**
     * Internal method to test if an item is in a subtree.
     * x is item to search for.
     * t is the node that roots the subtree.
     */
    bool contains( const Comparable & x, BinaryNode *t ) const
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
    bool contains( const Comparable & x, BinaryNode *t ) const
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
    void makeEmpty( BinaryNode * & t )
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
    void printTree( BinaryNode *t, ostream & out ) const
    {
        if( t != nullptr )
        {
            printTree( t->left, out );
            out << t->element << endl;
            printTree( t->right, out );
        }
    }

    /**
     * Internal method to clone subtree.
     */
    BinaryNode * clone( BinaryNode *t ) const
    {
        if( t == nullptr )
            return nullptr;
        else
            return new BinaryNode{ t->element, clone( t->left ), clone( t->right ) };
    }

  public:
    /**
     * Serialize the tree to a sorted vector.
     */
    std::vector<Comparable> serialize() const;

    /**
     * Deserialize from a sorted vector to build a balanced tree.
     */
    void deserialize(const std::vector<Comparable> &vec);
 
    /**
     * Remove all elements in the range [L, R] and return the count.
     */
    int removeRange(const Comparable& L, const Comparable& R);
};
#endif
```