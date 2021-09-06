# Exam Notes

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

### Cluster Architecture

- Rack with 16-64 nodes, 1Gbps between any pair of nodes in rack
- 2-10 Gbps backbone between racks

### Distributed File Systems (DFS)

Scale + durability + consistency.

Only useful in cases with large files and few file changes.

Master node stores metadata.

Chunk servers store contiguous chunks of 16-64 MB that have been replicated onto a few different machines.

Computation done directly on chunk servers instead of dealing with network transfer.

### Cloud Computing

- Remotely hosted
- Commodified - a utility, charged by usage, little differentiation
- Ubiquitous - services available anywhere

IaaS, PaaS, SaaS: infrastructure, platform, software.

Cloud advantages: scaling, resilience, high-level services, no personnel required.

Disadvantages: data transfer from local to cloud, no control when things go wrong, privacy.

Service layers:

- Application focused:
  - Services: complete business services e.g. OAuth, Google Maps
  - Application: cloud-based software that replaces local apps e.g. Office online
  - Development: platforms for custom cloud-based PaaS and SaaS apps e.g. SalesForce
- Infrastructure focused:
  - Platform: cloud-based platforms e.g. Amazon ECC
  - Storage: e.g. cloud NAS
  - Hosting: physical data centers

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

#### PySpark Methods

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

# cogroup, but filters out elements if any of the values are False and returns only keys
rdd_1.intersection(rdd_2)

# ACTION
rdd.count()

# el => Number
rdd.max(fn)

# (val_1, val_2) => val
# Run locally on driver, does not need to be associative
rdd.reduce(fn)

# [el_1, el_1, el_2] => { el_1: 2, el_2: 1}
rdd.countByValue()

# [(key, val_1), (key, val_2)] => [val_1, val_2]
rdd.lookup(key)

rdd.cache()

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

## Scalability

How much speed-up you get from parallelizing:

$$
\text{S} = \frac{T_{\text{sequential}}}{T_{\text{parallel}}}
$$

### Amdahl's Law

Some code inherently sequential; as $p$, number of processors tends to infinity, the time taken for the parallelizable section will tend to zero.

if $s$ is proportion of time spent on sequential code:

$$
S = \frac{1}{s + \frac{1 - s}{p}} \le \frac{1}{s}
$$

### Gustafson's Law

$$
S = p - s \cdot (p - 1)
$$

Strong scalability: time vs cores when problem size fixed

Weak scalability: time vs problem size/cores fixed. Sub-linear scalability if time increases.

### Karp-Flatt Metric

Experimentally determining the serial fraction, $s$, on $P$ processors.

If $\psi$ is the speed-up on $P$ processors:

$$
e = \frac
  {\frac{1}{\psi} - \frac{1}{P}}
  {             1 - \frac{1}{P}}
$$

The lower the value of $e$, the greater the parallelization.

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

If $I = \{ i_1, \dots, i_k \}$ and $I -> j$, baskets containing all elements of $I$ are likely to contain $j$.

Confidence:

$$
\text{confidence}(I \rightarrow j) =
\frac
  {\text{support}(I \cup j)}
  {\text{support}(I)}
$$

High confidence != interesting: some items may just be frequent (e.g. 'the'). Hence, use *interest*; confidence minus the probability of the item appearing in any basket.

$$
\text{interest}(I \rightarrow j) =
  \left|\text{confidence}(I \rightarrow j) - P(j)\right|
$$

High-interest rules ($> ~0.5$) are 'interesting'.

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

- Never negative
- Zero if the points are the same
- Commutative: $d(x, y) = d(y, x)$
- Triangle inequality: direct path never longer

#### Cosine Distance

$$
p_1 \cdot p_2 = |p_1\|p_2| \cdot cos(\theta)
$$

Hence cosine distance is:

$$
d(p_1, p_2) = cos^{-1}\left(\frac
    {p_1 \cdot p_2}
    {|p_1\|p_2|}
\right)
$$

#### L_2 Norm/Euclidean Distance

Root of sum of squares of differences. If the vectors have $n$ dimensions:

$$
d(x, y) = \sqrt{\sum_{i=1}^{n}{(x_i^2 - y_i^2)}}
$$

#### Jaccard Distance

For sets - dimensions are Boolean values.

Jaccard similarity:

$$
\text{sim}(C_1, C_2) =
\frac{\left| C_1 \cap C_2 \right|}
     {\left| C_1 \cup C_2 \right|}
$$

Jaccard distance:

$$
d(C_1, C_2) = 1 - \text{sim}(C_1, C_2)
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
P(\text{bucket shared}) = 1 - (1 - t^r)^b
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
  0            , & \text{otherwise}
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

#### Performance

The matrix, if encoded as sparse matrix, will fit on disk but not memory.

Store a list of page IDs, the out-degree of the page, and the IDs of out-links from that page.

Assume the vector does fit in memory.

- Initialize all entries of $r_\text{new}$ to $(1 - \beta)/N$.
- For each page $i$:
  - For each out-link $j = 1, \dots, d_i$:
    - $r_\text{new}(\text{out-page}_j) \mathrel{{+}{=}}  \beta \cdot r_\text{old}(i)/d_i$

Lots of random writes.

#### Topic-Specific PageRank

Teleports only go to page relevant to a topic - this leads to a different vector $r_S$ for each teleport set $S$.

#### Spam

Issue 1: **term spam** - add relevant keywords to the page (visible only to the search engine), and/or copy text from top results.

Solution 1: statistical text analysis, duplicate page detection.

Solution 2: use text content of the in-links and surrounding text - trust what others say about you, know what you say.

Issue 1: the internet banding together for jokes.

Issue 2: **spam farms** - spammer link to target page from popular websites they have some access to (e.g. forums) and from sites they fully control (which the target page links to).

Solution 1: detecting and blacklisting spam farm-like structures.

Solution 2: **TrustRank** - topic-specific PageRank with a manually-selected set of trusted pages. Uses **approximate isolation** - trusted sites unlikely to link to untrustworthy sites.

## Recommendation Systems

Utility matrix - rows are users, columns are things they have 'rated' (e.g. movies).

Need to:

- Gather known ratings
- Extrapolate unknown ratings
- Evaluate performance

### Content-Based Recommendations

Recommend items similar to what the customer has previously liked.

### Collaborative Filtering

Find a set of users $N$ whose ratings are 'similar' to the target user $x$ and extrapolate $x$'s ratings based on those in $N$.

Issues:

- Cold start: need lots of users
- Sparsity: content catalog may be large and hence have few users that have rated the same items
- First rater: need ratings for the item before it can be recommended
- Popularity bias: tends to recommend popular items

### Community Detection

#### Girvan-Newman

**Edge betweenness**:

- Number of shortest paths going through an edge
- If two nodes have $n$ shortest paths, each is counted as $1/n$

Girvan-Newman decomposes undirected, unweighted networks into a hierarchical network using the **strength of weak ties** - if the edge betweenness is large, it is probably at the border between communities and hence should be removed. The order in which the network is split determines the hierarchy.

##### Part 1

Pick starting node $A$ and run BFS; compute number of shortest paths (number of hops) to every other node.

Parent nodes are nodes one hop closer to $A$ it has an edge with; the sum of the parents' values (number of shortest paths) is the node's value.

##### Part 2

Betweenness can be calculated by working up the tree from the leaf nodes:

- Each leaf has a node flow of $1$
- Each node splits its node flow among its parents - the edge betweenness:
  - Edge betweenness is proportional to the number of shortest paths the parent has
- Each non-leaf node has a flow of $1$ plus the sum of edge betweenness from edges to its children

This process has a complexity of $O(mn)$ ($m$ = edges, $n$ = nodes)

This can be repeated with every starting node, summing betweenness values and then dividing by $2$ (paths are counted from both ends).

A random subset of starting nodes can be used to get an approximation.

The edge with the greatest betweenness is removed, and the process is repeated until there are no edges left.

### Network Communities

Girvan-Newman decomposes the network into clusters, but how many clusters should there be?

Community: sets of tightly connected nodes.

#### Modularity

Modularity, $Q$, is a measure of how well the network is partitioned. Given a partitioning of the graph $G$ into groups $s \in S$:

$$
Q \propto \sum_{s \in S}{
  \text{number of edges in } s -
  \text{expected number of edges in } s}
$$

$$
Q(G, S) = \frac{1}{2m} \sum_{s\in S}{\sum_{i \in s}{\sum_{j\in s}{A_{ij} - \frac{k_i k_j}{2m}}}}
$$

Where $m$ is the number of edges, $k_i$ is the degree of node $i$, and $A_{ij} = 1$ if there is a edge $i \rightarrow j$, and $0$ otherwise.

$Q$ is normalized such that $-1 \lt Q \lt 1$.

A positive value means the number of edges in $s$ is greater than expected: around $0.3$ to $0.7$ means significant community structure.

In nice cases, the modularity will have a maxima.

### K-means

If there are no predefined or direct connections (e.g. helicopters can fly to anywhere) in some high-dimensional space, clustering can be done using some distance metric.

Instead of **hierarchical** clustering (like with Girvan-Newman which has a top-down/divisive approach) we can use **point assignment**; points belong to the nearest clusters.

Pick some number of clusters $k$ and pick a centroid for each cluster, preferably far away from each other.

For each element, place it in the cluster whose centroid it is nearest too, then update the centroid using the average point of all elements in the centroid.

Repeat until it converges.

## Online Algorithms

Algorithm given to input one piece at a time and must make irrevocable decisions.

### Bipartite Matching

Two sets of vertices (e.g. advertisements and queries), elements from one set can only be paired with a subset of the other, and elements can only be picked once.

Problem: match each element from one set to an eligible element from the other set.

Competitive ratio: worst performance over all possible inputs.

$$
\text{competitive ratio} = min_\text{all inputs}\frac
  {\left|M_\text{algorithm}\right|}
  {\left|M_\text{optimal}\right|}
$$

### AdWords

Performance-based advertising; charged only if ad clicked.

Use **expected revenue per click**: bid times the click-through rate.

Advertisers have a daily budget, and the CTR is calculated from historical data - **exploration vs exploitation**; show a new ad to estimate CTR or show ad with good known CTR?

Assume one ad/query, all advertisers have the same budget $B$ and ads have the same CTR and bid ($1$).

Greedy: $0.5$

BALANCE: pick advertiser with the largest unspent budget, breaking ties via some deterministic way. $0.75$ with two advertisers.

## Parallel Computing

Clock speeds haven't gone up significantly in years; better performance requires optimizations by the program.

### Types of Parallelism

Data Dependence Graph: directed acyclic graph, vertices being tasks and edges dependencies.

Critical path: slowest path.

If two tasks are independent of each other, they can be done in parallel.

**Data Parallelism**: same operation executed on different elements simultaneously (or out-of-order).

**Functional parallelism**: independent tasks can apply different operations to different data elements simultaneously (or out-of-order).

**Pipelining**: dividing process into stages to produce items simultaneously.

### Instruction-Level Parallelism

Dependencies: if two instructions data-dependent, they cannot be executed simultaneously.

Hazard and stall may or may not occur, depending on pipeline organization.

**Data forwarding**: store instruction in register if another instruction will use it soon.

Out-of-order execution complicated as some instructions take more clock cycles to complete (e.g. FP).

**Out-of-order pipeline**: pool up instructions, schedule them, execute them out-of-order, then commit in-order.

Approx. one order of magnitude improvement from these tricks.

**Flynn's Taxonomy**:

Instructions and data:

- SISD: standard programming
- SIMD: vector instructions, GPUs
- MISD: 😢 - none
- MIMD: multi-core processors

Memory hierarchy: registers, L1/L2/L3 cache, RAM, secondary/permanent storage. Trade-off between size and speed will always exist as it will be limited by physical distance to the CPU.

### Threads and Processes

**Memory Model**:

- Distributed memory model: each process has its own separate area of memory, explicit data transfer required
- Shared memory model: implicit data sharing, own private area

Multi-threaded process: **shared code + data**, kernel context, each thread has its own stack and context (registers etc.).

Concurrency can be simulated via **time slicing**. Multi-core processors can have true concurrency.

Two threads **logically concurrent** if their flows overlap in time - life of one thread (in terms of time) overlaps with another.

Threads and processes:

- Context switching requires register values to be swapped; ~1K cycles for both threads and processes
- Creating and destroying threads cheaper than with processes
- Sharing data (too) easy with threads

Memory consistency with threads: the only constraint is that instructions **within your own thread appear to run in-order** - no guarantee of sequential consistency with other threads.

Hyperthreading - replicates enough instruction-control hardware to process multiple instruction streams (but not the functional units - ALU etc.).

Vectorization: applying the same operation to multiple pieces of data

Roofline Model:

- Identifies if compute or memory/communication bound
- TODO how
- More communication = shared memory/threads
- More computation = distributed memory/processes, vectorized operations

### Python MPI

Multiple processes - distributed memory model.

#### Problem Decomposition

Large data sets split into small tasks; assume there needs to be communication between neighbouring regions.

Blocks: each task given vertical slice of height $n$. $2n$ items need to be communicated at each boundary.

Cyclic: each task given $m$ vertical slices of size $n$, $2mn$ items communicated per task. Benefit is that only one cycle worth of information has to be in memory at a time, allowing check-pointing. Also allows load-balancing as some areas may require less computation - the slicing is likely to split this expensive area across multiple tasks.

Partitioning can also be done in multiple dimensions (e.g. sliced vertically and horizontally).

Can also use **domain decomposition**: master task responsible for decomposition/assignment may decompose areas that are more expensive or require high accuracy further.

#### MPI Methods

```python
from mpi4py import MPI
import numpy

comm = MPI.COMM_WORLD
size = comm.Get_size() # number of processes connected to the world
rank = comm.Get_rank() # process identifier. Starts at 0

data_to_send = numpy.zeros(1) # data must map to a byte buffer 
var_to_overwrite = numpy.zeros(4) # receive buffer can be bigger

comm.Send(data_to_send    , dest=process_to_send_to)
comm.Recv(var_to_overwrite, dest=process_to_receive_to)

# Non-blocking
req = comm.Isend(data_to_send, dest=RANK)
req = comm.Irecv(var_to_overwrite, source=RANK)
req.Wait()

# Receiving from any source
# use `status.source` to get source process rank
status = MPI.Status()
comm.Recv(var_to_overwrite, source=MPI.ANY_SOURCE, status=status)

# Use probe to modify variable to write to depending on source rank
comm.Probe(source=MPI.ANY_SOURCE, status=status)


# Collective operations
# Force processes to wait until all processes reach this point
comm.Barrier()

# For each element of the array, process 0 gets max value out of any process
comm.Reduce(in_arr, out_arr, op=MPI.MAX, root=0)

# Sends message from root to every other process
comm.Bcast(arr, root=0)

# Distribute chunks of the array from root process to all processes
comm.Scatter(in_arr, out_arr, root=0)

# Get chunks of arrays from every process and sends them to root
comm.Gather(in_arr, out_arr, root=0)
```

#### Deadlocks

If a process is waiting for a message it will never receive, deadlock results.

e.g. if all processes need to send and receive data, send call will block as it is waiting for the receiver to make a receive call, but all are trying to send.

Can also be caused by memory buffer filling up, causing the send function to wait.

Solution: **paired send-and-receive**:

```python
if rank % 2:
  comm.Send(..., rank - 1)
  comm.Recv(..., rank - 1)

else:
  comm.Recv(..., rank + 1)
  comm.Send(..., rank + 1)
```

### CUDA

SM: Simultaneous Multi-processor.

The entire program is a **grid** made up **blocks**: independent subtasks that can run in any order.

**Global memory** can be accessed by any block and each block has a single control logic unit.

**Threads** within a block can access **shared memory** and run the same instructions on a different bit of data.

'**Local memory**' is private to a thread, and is actually global memory. If too many registers are used it swaps to local memory.

`syncthreads()` acts as a synchronization barrier for threads in a block.

#### Warps

Each block divided into 32-thread warps. At any one time, one warp (not per-block!) is running, with all threads running the instructions in lock-step (if statements etc. disable threads that do not meet the condition).

Block sizes should be chosen to result in many full warps (e.g. 128 is better than 32 is better than 1 thread) - having lots of warps to switch between allows memory access latency to be hidden.

Warps can be executing, waiting for data, or waiting to execute. The scheduler will interleave warp execution to minimize the amount of time spent waiting for data.

**Occupancy** - the number of warps running concurrently, is limited by hardware constraints as well as register/shared memory usage.

Switching between warps has zero overhead as each warp has its own set of registers - the occupancy will be reduced if there is not enough register space.

#### Locks

Data race - data accessed and manipulated by multiple processors.

Can use atomic operations to perform load-add-store operations in a single step.

Only works for specific processors and on individual instructions. Use **locks** to execute arbitrary regions of code. **Mutual exclusion** - only one process can have access to the data.

```c
volatile char lock = 0

while (true) {
  if (lock == 0) {
    lock = 1;
    // read-modify-write
    break;
  }
}

do_stuff();
lock = 0;
```

An atomic compare-and-exchange operation must be used to acquire the lock `CMPXCHG` in x86.

#### Numba Methods

```python
from numba import jit

@jit
def fn():
  return

from numba import cuda
def fn(in_out_arr):
  pos = cuda.grid(1) # coordinate of thread when split as a 1D array

  # Atomic operations
  old_val = cuda.atomic.add(arr, index, increment_by)

  # if arr[0] == old, set it to new and return the old value
  old_val = cuda.atomic.compare_and_swap(arr, old, new)

  # Synchronization point
  cuda.syncthreads()

arr = cuda.to_device(np.zeros(shape = 1, dtype=np.int32))

# Or make array directly on the GPU
global_arr = cuda.device_array(shape)
shared_arr = cuda.shared.array(shape, dtype)

# Max 1024 threads per blocks on most Nvidia GPUs
fn[blocks_per_grid, threads_per_block](arr)


main_mem_arr = global_arr.copy_to_host()
```

## Raft Consensus Algorithm

Election:

- After election timeout (random, ~10x network latency), become candidate; vote for self and send request vote
- Vote for candidate if:
  - Term is greater than current
  - Haven't yet voted for anyone in the new term
  - Their log is as or more up-to-date than you
  - Reset election timeout
- If majority of votes received, become leader
- If election timeout reached, increment term and try again

Log replication:

- Leader takes commands from client, appends to in-progress logs
- Leader sends heartbeats, possibly with entries to append
- Once command acknowledged by majority of followers, commit
- On next heartbeat, tell followers to commit previous command

If a leader gets a command from another leader with a greater term, step down and roll back uncommitted commands.
