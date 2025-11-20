---
title: "Hash Tables"
layout: "article_ds.njk"
tags: "datastructures"
order : 4
---

## Hash Tables

::: note In a Nutshell
Hash tables are space-time tradeoff. Infinite memory means the entire key can be used directly as an index. Infinite time means values can be stored without regard for their keys.
:::

Hash tables are the way to implement the associative array abstract data structure. A key is hashed using a hash function. The hash value is used to index the key in a memory. The key may be associated with a value (maps) or may not (sets).

- `len(table)` is small relative to `len(hashable_keys)` $\implies$ collisions are inevitable

The art of hash tables is the art of collision resolution.

- pointer solution: chaining
- index computing solution: probing

### Chaining Hash Tables

Each slot contains a list of items.

- C++ `std::unordered_map`
- Java `HashMap`

### Probing

The chaining hash table solves collisions by introducing pointers. The hash table slot points to the start of the list containing all the collided keys. Additionally, to be able to grow the slot at the start, we need to keep a dummy.

> TODO why not vectors for locality?

Pointers are an enemy of cache-friendliness. We want to make sure cache lines contain the collided sequence of keys. This also allows for SIMD-ing the probing.

A collision triggers a computation of new index:

- linear probing: the new index is the collided one incremented by 1
```mathematica
h, h+1, h+2, h+3, ...
```
- quadratic probing
```mathematica
h, h+1^2, h+2^2, h+3^2, ...
```
- double hashing
```mathematica
h + i * h2(key)
```

The con of probing is the difficulty when deleting an entry.

### Modern Probing

- Google SwissTable / Abseil `flat_hash_map` (metadata + SIMD acceleration)
- Rust `HashMap` (SwissTable)
- Robin Hood hashing (balances probe lengths)


