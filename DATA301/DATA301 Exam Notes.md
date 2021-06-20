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

Problem: given vector of data-points (possibly a flattened matrix) and a distance function $d(x_1, x_2)$, find all points closer than some threshold $s$.

### Distance Measures

Axioms:

- Greater than zero, unless points are the same
- Commutative: $d(x, y) = d(y, x)$
- Triangle inequality: direct path never longer

#### Cosine Distance

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

#### L_2 Norm/Euclidean Distance

Root of sum of squares of differences. If the vectors have $n$ dimensions:

$$
d(x, y) = \sqrt{\sum_{i=1}^{n}{(x^2 - y^2)}}
$$

#### Jaccard Distance

For sets - dimensions are Boolean values.

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

Jaccard bag similarity:

- Duplicates not removed; if element appears multiple times, count it multiple times
- Divide number of pairs in intersection by sum of sizes of the two sets
- Max similarity of $0.5$

### Finding Similar Documents

$O(n)$ approach to finding similar documents.

#### Shingling

A $k$-shingle is any sequence of length $k$ of tokens (character, words) appearing in a document.

The shingles are sets, not bags, so there should be no repeated shingles within the set of shingles.

Pick $k$ such that the probability of any one shingle appearing in any particular document is low - if it is too small, it is likely to appear in most documents. Values of 5-10 are good starting points.
#### Hashing

Out of the domain of all possible shingles, only a small subset are likely to appear.

Hence, hashing can be used to map shingles to a bucket via a hash function with a smaller range (and hence require less memory). A bucket may contain multiple shingles.

With this, a document can be represented as a Boolean vector - one Boolean for every bucket (element in the hash range), true if the document contains a shingle in the bucket.

Hence, a set of documents can be represented as a matrix, rows being buckets and columns documents.

Since most documents are unlikely to contain most shingles, store this as an sparse matrix.

#### Min-Hashing

If a permutation of rows is picked, the min-hash of the document is the first element that is true (e.g. if permutation is $2, 1, 0$ and document is $<1, 1, 0>$, output is $1$).

If this is done with $n$ permutations, each document can be mapped to a $n$-wide vector - the document **signature**.

This can be done to every document to get a signature matrix.

The probability of two sets having the same min-hash value is the Jaccard similarity.

#### Locality-Sensitive Hashing

The signature matrix can be partitioned into $b$ bands of $r$ rows each (splitting the document signature).

For each band, group documents into the same bucket if their signatures are the same for that band.

With min-hashes, the probability of two documents sharing a bucket grows linearly with their Jaccard similarity.

With $b$ bands of $r$ rows, this becomes:

$$
P(\textrm{bucket shared}) = 1 - (1 - t^r)^b
$$

Where $t$ is the Jaccard similarity.

The shape of the curve can be modified by picking the values of $r$ and $b$ for a given $s$ (threshold for document similarity), dependent on how many false positives and negatives you are willing to get.

Note that this outputs **candidate pairs** and so a proper Jaccard similarity calculation should be doe to confirm their similarity.

## PageRank

More in-links = page is more important.

In-links from important page = link worth more.

Page's importance split between its out-links:

- If a page $j$ with importance $r_j$ has $n$ out-links, each link gets $r_j/n$ votes

### Flow Model

Start with base-model which uses the number of in-links for page importance.

Page rank, $r$ given by:

$$
r_j = \sum_{i \rightarrow j}\frac{r_i}{d_i}
$$

Where $d_i$ is the out-degree of $i$.

Under this current implementation there is no unique solution. Hence, a constraint is added: the sum of page ranks sums to $1$. However, Gaussian elimination does not work well in large graphs.

#### Matrix Formulation

Matrix $M$ is a square matrix where for each row $j$, column $i$ ($M_{ji}$) is $1/d_i$ if there is a in-link from $i$ to $j$.

$$
M_{ji} =
\begin{cases}
  \frac{1}{d_i}, & i \rightarrow j\\
  0            , & \textrm{otherwise}
\end{cases}
$$

$M$ is an column stochastic adjacency matrix; columns sum to 1.

The rank vector $r$ stores the page importance, $r_i$ being the importance of page $i$.

The importance of all pages sum to $1$:

$$
\sum_i{r_i} = 1
$$

At time $0$, the importance of each page can be set to $1/n$, $n$ being the number of pages.

At time $t$, the importance of page $r_j$ for time $t + 1$ can be calculated as:

$$
r_j = \sum_{i \rightarrow j}{\frac{r_i}{d_i}}
$$

Hence, for the entire rank vector:

$$
r = M \cdot r
$$

If enough iterations are done and the Markov chain is **strongly connected** (every state accessible from any state), the **stationary distribution** will be unique and be reached regardless of the initial probability distribution.

#### Random Walk Interpretation

Model it as having a 'surfer' on some page $i$ at time $t$, following a random out-link on the page at random at time $t + 1$.

$p(t)$ is a vector where $p(t)_i$ is the probability of the surfer being on page $i$ at time $t$.

#### Teleports

Dead ends: some pages have no out-links. Random walker gets stuck and importance of page increases.

Spider-traps: all out-links within a group; all importance eventually absorbed by the trap.

Solution to both solutions (and to graph not being strongly connected): teleport to a random page with probability $1 - \beta$ where $\beta \approx 0.8-0.9$.

This leads us to the actual equations.

If $N$ is the number of of pages, $r_j$ is given by:
$$
r_j = \frac{1 - \beta}{N} + \beta \sum_{i \rightarrow j}{\frac{r_i}{d_i}}
$$

The first term is from the page the walker is currently on teleporting (with probability $1 - \beta$) to page $j$ (probability $1/N$). The multiplication by $\beta$ in the second term reflects that fact the the walker can only reach $j$ from an out-link $\beta$ of the time.

If $\left[\frac{1}{N}\right]_{N\times N}$ is a $N$ by $N$ matrix where all entries are $1/N$ :
$$
A = \beta M + (1 - \beta)\left[\frac{1}{N}\right]_{N\times N}
$$

PageRank can then be applied iteratively using:

$$
r = A \cdot r
$$
