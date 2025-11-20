---
title: "Hash Functions"
layout: "article_ds.njk"
tags: "datastructures"
order : 3
---

## Hash Functions

> TODO: remove nutshell

::: note In a Nutshell
Put this key into a slot X.
:::

A hash function is a deterministic mapping:

$$
h:U \to [0, m-1]
$$

Where:
- **U** is the universe of possible key
- **m** is the number of slots in a hash table (buckets)
- the functional value **h(k)** is the chosen index from $[0,m-1]$

### Universe of Keys

The universe of key is everything we could ever hash. For example

- all possible 64-bit ints
- all possible strings
- all possible memory addresses

The problem in reality is that the universe is way bigger than the hash table. This means collisions are inevitable. This plays a role in choosing the right hash function.

### Choosing the Hash Function

- if hashing behaves unevenly $\implies$ some slots get overloaded
- overloading $\implies$ lookup costs rise
- potentially: lookup costs rise $\implies$ attacker can force $O(n)$ times

So we want the hash function to at least *look* random.

> TODO hash function families
