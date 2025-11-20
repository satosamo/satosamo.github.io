---
title: "Cache"
layout: "article_ds.njk"
tags: "datastructures"
order : 1
---

### CPU cache

CPU cache is a small, high-speed memory that is physically located near the CPU. It sotred frequently used data and instructions to reduce the time it takes the processor to access them from other memory, like the main memory (RAM).

Modern processors have multiple cache levels. These levels interact with each other and with the CPU based on the specific CPU architecture.

The main properties of cache are
- cache size
- cache block size
- the number of blocks in a set
- the cache set replacement policy
- the cache write policy

### Cache Loading

When a CPU wants to access a data stored in the main memory it first loads the data into the cache. This loading, however, only happens in chunks called **cache lines**. Typical cache line is 64 bytes (on modern x86-64 CPUs). This means that the cpu loads the amount of data it wants to access and the next however bytes to load full 64 bytes.

This also means that we may get unrelated memory in the cache to our interest. This is normal since cache behavior is not observable at the semantic level, it happens automatically and we need to work with it in order to maximize the performance of our program.

- L1 cache access: ~0.5ns
- L2 cache access: ~3ns
- L3 cache access: ~15ns
- RAM access: ~100ns
- SSD access: ~10ms (10000ns)

### Cache-Friendliness

Even a single trip to DRAM is about 200 CPU cycles. We want our programs to work with the CPU's natural prefetching and caching mechanism. Once the data is in cache, the operations are extremely fast so we want to design our algorithms so that we minimize:

#### Cache misses

Cpu fails to find the data it needs in cache and has to load another cache line. We minimize this waste by designing layouts so that elements of the data structure fit inside the cache lines.

- grouping 'hot' (frequently accessed) fields together
- using structs of arrays instead of arrays of structs
- *not* placing rarely used fields next to hot data
- *not* storing 32-byte pointers next to 8-byte ints

#### Pointer chasing

Every pointer-following step risks crossing to a new cache line. Meaning:

- hash maps with chained buckets perform poorly
- tree structures are slow
- `absl::flat_hash_map` hash maps put keys and values contiguously in arrays and are *fast*

