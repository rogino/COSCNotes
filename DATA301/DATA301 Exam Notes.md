# DATA301 Exam Notes

## Five Vs

- Variety: dealing with different data sources and formats
- Velocity: processing data in a timely fashion and merging the existing state with the new data
- Volume: dealing with large volumes of data
- Veracity: determining the accuracy and trustworthiness of the data and results
- Value: extracting useful information from the data

## Three Perspectives

Look at the problem from three levels of abstractions:

- Architecture:
  - Von-Neumann architecture
  - Large Scale Cluster Computing
  - GPU
- Algorithms:
  - Parallelism - data and functional parallelism
  - Scalability: processors and problem size
  - Distributed data (file systems)
- Programming:
  - Map-Reduce - Spark
  - Distributed processes - MPI
  - Shared memory - CUDA

### TODO HEADING Distributed File Systems (DFS)

Scale + durability + consistency.

Only useful in cases with large files and few file changes.

Master node stores metadata.

Chunk servers store contiguous chunks of 16-64 MB that have been replicated onto a few different machines.

Computation done directly on chunk servers instead of dealing with network transfer.

## Map-Reduce

Handles data partitioning, execution scheduling, machine failures, inter-machine communications.

If map task produces many elements with the same key and the reduce task is associative (re-grouping allowed) and commutative (left and right operands can be switched), reduction can be done on the map node, reducing the amount of data sent to the reduce node.

### Spark

Uses lazy computing; reduces disk/network use but causes more progress to be lost if there is a failure.

Actions: convert RDD to local data structure.

Transformations: RDD to RDD and joins - multiple RDDs to an RDD.

When map task completes, master sent list of file locations/sizes, one for each reducer and sends this to the reduce nodes.

#### Failure

If worker fails (no ping response), master will just reschedule it on another node.

If this was a map worker then it must notify the reduce tasks that the location of their input files have changed.

If master node fails, MapReduce task aborted and client notified.

#### Skew

Some keys will have more values than others so some reduce tasks will finish sooner than others - *skew*. Hence, each reduce task should process multiple keys.

Creating more reduce tasks than compute nodes helps further if any finish sooner, some of the remaining tasks can be picked up.

#### Matrix-Vector Multiplication

Matrix $M$, vector $v$. $i$th element (row) of the resultant vector, $Mv$:

$$
(Mv)_i = \sum_j{m_{ij}v_j}
$$

Matrix stored as triplets $(i, j, m_ij)$ for non-zero entries, vectors as pairs $(i, v_i)$.

Vector fits in memory:

- Each map task given row of matrix and full vector
- Calculate product for each column, returning $(i, m_{ij}v_j)$
- Reduce task sums products, returning $(i, x_i)$

Vector does not fit in memory:

- Divide matrix into vertical stripes, vector into horizontal
- Reduce tasks act as before

Matrix-matrix multiplication: matrix-vector multiplication, but repeated for each column of the second matrix.

#### Method Examples

```python
# INPUT
sc.textFile(file_path)
sc.parallelize(list)


# SPECIAL
# Use var.value to access array
sc.broadcast(arr)



# TRANSFORMATION
# el => (el, index)
rdd.zipWithIndex()

# [(key, val_1), (key, val_2)] => [(key, [val_1, val_2])]
rdd.groupByKey()

# reduceByKey must be **associative** (a*b*c = b*a*c) and **commutative** (a+b = b+a)
# fn(val_1, val_2) => val. Either input may be the output from fn and hence, output type must be the same as input type
# [(key, val)] => [(key, combined_vals)]
rdd.reduceByKey(fn)

# seq_op(aggregated_val, el) => new_aggregated_val
# comb_op(aggregated_val_1, aggregated_val_2) => new_aggregated_val
# Type of aggregated value can be different from element type
rdd.aggregateByKey(zero_val, seq_op, comb_op)

rdd.flatMap(fn)
rdd.map(fn)

# for each 'partition', iterator passed to some function. Yield some value
# e.g. sc.parallelize([1, 2, 3, 4], 2) splits data into two partitions
# iter => yield sum(iter) returns [3, 7]
# fn can yield multiple values; acts like flatMap
rdd.mapPartitions(fn)

# elements where `fn(el) is True` remain
rdd.filter(fn)



## SETS
# [a, b], [c, d] => [a, b, c, d]
rdd_1.union(rdd_2)
sc.union([rdd_1, rdd_2])

# Inner join
# [(key, val_1)], [(key, val_2)] => (key, (val_1, val_2))
# If key is duplicated, one tuple for every combination
# e.g. [(a, 1), (a, 2)].join([(a, 3)]) = [(a, (1, 3)), (a, (2, 3))]
rdd_1.join(rdd_2)

# Kinda-Union
# [(key, val_1), (key, val_2)], [(key, val_3)] => (key, ([val_1, val_2], [val_3])
rdd_1.cogroup(rdd_2)



# ACTION
rdd.count()

# el => Number
rdd.max(fn)

# (val_1, val_2) => val
# Run locally on driver, does not need to be associative
rdd.reduce(fn)

# [(val, 1), (val, 2)] => [1, 2]
rdd.lookup(val)

# [el_1, el_1, el_2] => { el_1: 2, el_2: 1}
rdd.countByValue()

# [(key, val_1), (key, val_2)] => [val_1, val_2]
rdd.lookup(key)

# Return everything
rdd.collect()

# [(key, val)] => {key: val}
rdd.collectAsMap()

# Returns first n values - if not previously sorted, ordering is non-deterministic
rdd.take(n)
rdd.first()

# Returns first n values, sorted by fn - smallest first
rdd.takeOrdered(n, sort_fn)
```

## TODO HEADING Architecture: Cloud Computing

IaaS, PaaS, SaaS: infrastructure, platform, software

Cloud advantages: scaling, high-level services, no personnel required.

Disadvantages: data transfer from local to cloud, no control when things go wrong, privacy.

## Scalability

How much speed-up you get from parallelizing:

$$
\textrm{S} = \frac{T_{\textrm{sequential}}}{T_{\textrm{parallel}}}
$$

### Amdahl's Law

Some code inherently sequential; as $p$, number of processors tends to infinity, the time taken for the parallelizeable section will tend to zero.

if $s$ is proportion of time spent on sequential code:

$$
S = \frac{1}{s + \frac{1 - s}{p}} \le \frac{1}{s}
$$

### Gustafson's Law

$$
S = P - s(P - 1)
$$

Strong scalability: time vs cores when problem size fixed

Weak scalability: time vs problem size/cores fixed. Sub-linear scalability if time increases.

### Communication

- Communication cost: total I/O of all processes
  - Count input file size
  - I/O between map and reduce tasks counted twice
- Elapsed communication cost: max I/O along any path
  - Partition size (number of map processes) chosen to not reach I/O bandwidth limits
  - Limit amount of input/output of any one process - main memory/local disk
- Elapsed computation cost: max running time of any process

## Frequent Item-sets

### Market-Basket Model

Basket: small subset of items

Want to know how items are related.

*Support* for item-set $I$: number of baskets containing all items in $I$.

If the support is greater than the *support threshold* $s$, it is called a *frequent item-set*.

#### Association Rules

If $I = \{ i_1, ..., i_k \}$ and $I -> j$, baskets containing all elements of $I$ are likely to contain $j$.

Confidence:

$$
\textrm{confidence}(I \rightarrow j) =
\frac
  {\textrm{support}(I \cup j)}
  {\textrm{support}(I)}
$$

High confidence != interesting: some items may just be frequent (e.g. 'the'). Hence, use *interest*; confidence minus the probability of the item appearing in any basket.

$$
\textrm{Interest}(I \rightarrow j) =
  \left|\textrm{confidence}(I \rightarrow j) - P(j)\right|
$$

High-confidence rules ($> ~0.5$) are usually 'interesting'.

#### A-Priori

If set $I$ appears as least $s$ times, every subset $J$  must also appear at least $s$ times.

- Read baskets, count number of occurrences of each item
  - $O(n)$ memory
- Filter items that appear less than $s$ times
- Read baskets again, finding pairs where each item appears more than $s$ times
  - $O(n^2)$ memory

## Similarity

Finding neighbours in a high-dimensional space.

Given vector of data-points (possibly a flattened matrix) and a distance function $d(x_1, x_2)$, find all points closer than some threshold $s$.

### Distance Measures

- Greater than zero, unless points are the same
- Commutative: $d(x, y) = d(y, x)$
- Triangle inequality: direct path never longer

### Jaccard Distance

Jaccard Similarity:

$$
\textrm{sim}(C_1, C_2) =
\frac{\left| C_1 \cap C_2 \right|}
     {\left| C_1 \cup C_2 \right|}
$$

Jaccard Distance:

$$
d(C_1, C_2) = 1 - \textrm{sim}(C_1, C_2)
$$

### Cosine Distance

$$
p_1 \cdot p_2 = |p_1||p_2| \cdot cos(\theta)
$$

Hence cosine distance is:

$$
d(p_1, p_2) = cos^{-1}\left(\frac
    {p_1 \cdot p_2}
    {|p_1||p_2|}
\right)
$$

### L_2 Norm/Euclidean Distance

Root of sum of squares of differences. If the vectors have $n$ dimensions:

$$
d(x, y) = \sqrt{\sum_{i=1}^{n}{(x^2 - y^2)}}
$$