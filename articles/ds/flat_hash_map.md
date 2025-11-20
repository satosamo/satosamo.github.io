---
title: "flat_hash_map"
layout: "article_ds.njk"
tags: "datastructures"
order : 4
---

*Based on: CppCon 2017: Matt Kulukundis “Designing a Fast, Efficient, Cache-friendly Hash Table, Step by Step”*

## Designing and Implementing flat_hash_map

The hash table described by Matt Kulukundis in his presentation at CppCon 2017 is a **swiss table** (designed in Zürich by Abseil) family of hash tables design. They are meant to replace `std::unordered_set` and `std::unordered_map`.

The **flat** variant of the swiss table is a open-addressed hash table with extra metadata to hold information about the slots, allowing for fast lookup, delete and insert times.

### all items are stored in a single backing array

items:
: the values distributed according to the hash values of their keys modulo table size

In `flat_hash_map` all items are stored in a single array, also called **backing array**. We call each location in the array a **slot**. This sets the scene for cache-friendliness.

### the backing array is divided into groups of 16 slots

The defining feature of swiss tables is that it utilizes SIMD to effectively compare metadata when performing an operation on the table. The result of such comparison is a 16-bit long word that acts as a mask for our 16 slots in a group.

### metadata is tightly packed

The metadata uses 8 bits (a WHOLE BYTE) for each element and is tightly packed in memory. This means we have 16 bytes of tightly packed metadata.

- Store 1 bit (msb) as a flag:
    - 0 - full slot, follows by 7 bits of hash
    - 1 - non-full slot
- Store 7 bits of hash code in the least significant bits

**If** a slot is full, the first bit will be 0 followed by the hash value:
`0b0xxxxxxx`

**Else if** a slot is not full but was never occupied, then the value is
`kEmpty = -128` or `0b10000000`

**Else if** a slot is not full but was once occupied and deleted, then it is a tombstone with a value
`kDeleted = -2` or `0b11111110`

**Else** the slot is a padding, allowing us to stop scanning metadata for table scan and uses
`kSentinel = -1` or `0b11111111`

### the hash value is thus divided into two

Every time we hash a key, we divide the hash value into two parts:
- **H1** - 57 bits and determines the position in the array
- **H2** - 7 bits and is used in the metadata

:::note Entropy
Since we split the hash value into two distinct parts we need a hash function that distributes entropy evenly. This prevents collisions in either H1 or H2 since unevenly distributed entropy makes one of those two collision-prone.
:::

**Implementation**

For H1 we just shift 7 bits, leaving the 57 msb bits. For H2 we filter out the msb bits with `01111111` AND operation, leaving us with 7 lsb. 

```cpp
size_t H1(size_t hash) { return hash >> 7; }
ctrl_t H2(size_t hash) { return hash & 0x7F; }
```

### find operation

**Sequential**

- when looking for a key in the table we first compute the hash value of the key
- the hash value is then split into H1 and H2
- H1 is ran through modulo `num_groups` to find the index of the group it should fall into
- sequentially iterate over all elements in the group
- **if is full**: compare H2 hash value
    - **if same**: hit
    - **if not same**: move to the next slot
- **if is not full**: move to the next slot

**SIMD-based**

- find the group index
- compare ALL H2 entries in metadata
- jump to the matching element

**Implementation**

The 16 slot group allows us to compute the H2 values extremely fast.

:::note SSE
Streaming SIMD Extensions (SSE) is a single instruction, multiple data (SIMD) instruction set extension to the x86 architecture.
:::

The `find` function is:

```cpp
iterator find(const K& key, size_t hash) const {
    size_t group = H1(hash) % num_groups_;
    while (true) {
        Group g{ctrl_ + group * 16};
        for (int i : g.Match(h2)) {
            if (key == slots[group * 16 + i])
                return iterator_at(group * 16 + i);
        }
        if (g.MatchEmpty()) return end();
        group = (group + 1) % num_groups_;
    }
}
```

:::note Compiler Details
The `if (key == slots[group * 16 + i])` equality operator is ALMOST always true at least once, since we already know the kay should fall into that group as we are comparing the H2 hashes. This allows for `predict true`.
:::

:::note Full Groups
If `(g.MatchEmpty()) return end();` is false, we hit an empty, never filled slot and the search may stop since it means no other collisions and potential matches occur after that. If it is true for the whole group we must probe to the next group. This almost never happens pre Matt Kulukundis.
:::

The SIMD `match` function is:

```cpp
BitMask<unit32_t> Match(h2_t hash) const {
    auto match = _mm_set1_epi8(hash);
    return BitMask <uint32_t>(
        _mm_movemask_epi8(_mm_cmpeq_epi8(match, crtl))
    );
}
```

Where:

- `_mm_set1_epi8(arg)` initializes array of 16 elements each of size one byte with value of argument
- `_mm_cmpeq_epi8(arg1, arg2)` compares the arguments byte wise and returns `FF` in place of match and `00` otherwise
- `_mm_movemask_epi8(arg)` takes 16 byte array and squished it into 16 bits (according to the msb of the array)

### some naming

A group consists of the backing array and the metadata array. A position in the backing array is slot and position in the metadata is called **control**. A table has $N$ groups.

### erasing is easy

```cpp
void erase(iterator it) {
    --size_;
    Group g{(it.ctrl_ - ctrl_) / 16 * 16 + crtl_};
    *it.ctrl_ = g.MatchEmpty() ? kEmpty : kDeleted;
    it.slot_.~K()
}
```