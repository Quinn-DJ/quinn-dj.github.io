---
title: 字节级 BPE：为什么 DeepSeek 的分词表里没有中文？
comments: true
date: 2026-08-31
tags:
  - Coding
description: 分析 DeepSeek V4 分词器时发现词表里似乎没有中文，于是探究字节级 BPE 如何用"乱码"形态的 token 支持中文，并记录 transformers 5.x 下中文输入返回空 token 的坑。
---

# 字节级 BPE：为什么 DeepSeek 的分词表里没有中文？

> 在学习词元（token）和分词器时，我下载了 DeepSeek 官方提供的 `deepseek_v4_tokenizer.zip`。打开 `tokenizer.json` 翻词表，第一眼完全没看到汉字，全是 `!`、`#`、`Ġthe` 和一堆像乱码一样的字符。当时的第一个疑问是：这样的词表，到底是怎么训练出中文的？

## 结论先说

这份词表并不是没有中文，而是用了**字节级 BPE（byte-level BPE）**。它的词条不是"字符/词语"，而是 UTF-8 字节片段；为了能放进 JSON 并且保持可读，每个字节会被映射成一个可见字符（GPT-2 风格的 `bytes_to_unicode`）。所以中文字符在词表里，就以"乱码"的形式存在。

比如词表里 id 30594 的词条长这样：

```text
ä½łå¥½
```

把它按同样的映射还原成 UTF-8，就是"你好"。

## 拆开 tokenizer.json

这份分词器的词表规模是 128,000：

```text
128,000 = 3 个特殊 token + 256 个单字节 token + 127,741 个 BPE 合并结果
```

其中 256 个单字节 token 全部都在，`unk_token` 为 `null`，所以任何 UTF-8 文本都不会出现 OOV。

它的预切分器（pre-tokenizer）是一个规则序列，中文有专门的规则：

```text
1. 数字：\p{N}{1,3}，1~3 位数字单独切
2. 中日文字符：[一-龥぀-ヿ]+，连续的中日文字符切成一个单元
3. 英文/标点/空白：Llama 风格的常规切分规则
4. 字节化：ByteLevel，把每个字节映射成可见字符
```

我用同样的映射把 128,000 个词条全部还原了一遍：其中有 35,334 个词条含有汉字。常用单字也都有独立 token，例如：

| 汉字 | token id |
|------|----------|
| 的   | 301      |
| 一   | 378      |
| 是   | 389      |
| 不   | 422      |
| 了   | 429      |
| 中   | 525      |
| 我   | 531      |

实际切分几个中文例子（token 字符串是 `tokenizer.json` 里的原始样子）：

| 文本 | token 字符串 | token id |
|------|--------------|----------|
| 你好 | `ä½łå¥½` | `[30594]` |
| 你好世界 | `ä½łå¥½` + `ä¸ĸçķĮ` | `[30594, 3427]` |
| 深度求索 | `æ·±åº¦` + `æ±Ĥ` + `ç´¢` | `[17180, 1645, 4568]` |

所以"词表没有中文"只是一个显示层面的错觉：中文不是以字形直接写进词表，而是以字节片段的形式藏在里面。

## 中文语料是怎么"训练"进去的

字节级 BPE 的训练流程可以概括成四步：

1. **预切分**：先把语料按规则切成"词"，连续的中文片段会被单独切出来，避免和英文、数字混在一起。
2. **字节化**：每个词转成 UTF-8 字节序列，每个字节对应一个基础 token。一个汉字是 3 个字节。
3. **统计合并**：统计相邻 token 对在语料中的频率，把最高频的一对合并成新 token，加入词表，然后重复这个过程，直到词表达到目标大小。
4. **训练完成**：所有合并结果就是 `merges`，最终词条就是 `vocab`。

关键点在于：**不需要预先准备一张中文词表**。只要训练语料里包含海量中文，"你 + 好"经常相邻出现，BPE 就会自然把它们合并成 id 30594 这个 token；"中文""世界""分词器"这类常见片段也一样。反过来，如果语料里完全没有中文，"你好"就永远是 6 个字节 token，永远不会有对应的合并。

## 踩坑：AutoTokenizer 返回空列表

按照官方示例，把输入从 `"Hello!"` 改成中文：

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("./", trust_remote_code=True)
print(tokenizer.encode("你好"))  # [] ?!
```

输出是空列表 `[]`。这不是文件编码问题（只要 `.py` 文件本身保存为 UTF-8），而是 transformers 5.x 的一个兼容问题。

原因：`tokenizer_config.json` 里写的 `tokenizer_class` 是 `LlamaTokenizerFast`。transformers 5.x 重构之后，加载这个类时会强制把预切分器换成 `Metaspace("▁")`，丢掉 `tokenizer.json` 里真正的 CJK/ByteLevel 规则。于是"你好"先变成 `▁你好`，但词表里没有 `你`、`好` 这两个直接字符（它们是以字节形态存在的），`unk_token` 又是 `null`，匹配不到的内容就被静默丢弃，最终得到空列表。英文还能正常输出，只是碰巧 ASCII 字母在两种规则下的样子完全一样。

| 加载方式 | `encode("你好")` |
|----------|------------------|
| transformers 5.16.1 + `AutoTokenizer` | `[]` |
| transformers 4.49.0 + `AutoTokenizer` | `[30594]` |
| `tokenizers.Tokenizer.from_file("tokenizer.json")` | `[30594]` |

修复办法任选其一：

```python
# 方案 1：直接读 tokenizer.json，绕开 transformers 的包装
from tokenizers import Tokenizer

tok = Tokenizer.from_file("tokenizer.json")
print(tok.encode("你好").ids)  # [30594]
```

```python
# 方案 2：HF 风格 API，但使用通用的 fast 包装
from transformers import PreTrainedTokenizerFast

tok = PreTrainedTokenizerFast(tokenizer_file="tokenizer.json")
print(tok.encode("你好"))  # [30594]
```

如果还想继续用 `AutoTokenizer.from_pretrained`，可以把 `tokenizer_config.json` 里的 `"tokenizer_class": "LlamaTokenizerFast"` 改成 `"PreTrainedTokenizerFast"`；或者直接安装旧版：`pip install "transformers<5"`。

## 小结

- 词表"没有中文"是字节级 BPE 的显示错觉，不是真的不支持中文。
- 中文 token 是语料统计出来的，藏在 `merges` 里。
- 同一份 `tokenizer.json`，在不同加载方式、不同 transformers 版本下行为可能不一样。遇到 `encode()` 返回空列表，先检查预切分器是不是被换掉了。

## 参考资料

- [DeepSeek V4 Tokenizer](https://cdn.deepseek.com/api-docs/deepseek_v4_tokenizer.zip)
- [Hugging Face Tokenizers 文档](https://huggingface.co/docs/tokenizers)
- [Hugging Face NLP Course：BPE 与字节级 BPE](https://huggingface.co/learn/nlp-course/chapter6/5)
- [OpenAI GPT-2 的 bytes_to_unicode 实现](https://github.com/openai/gpt-2/blob/master/src/encoder.py)
