## Knowledge

Multiple-choice

- Message-passing
- Threads
- Locks/atomics
- Work queues
- Scheduling

CUDA:

- Numba: jit/cuda.jit
- Kernel, block, thread, warp

Algorithms:

- Euclidean/L_2 norm distance
- Content recommendation systems
- Online algorithms: AdWords/balance
- RAFT leader election, consensus

Systems:

- SaaS/PaaS/IaaS
- Storage/network architecture
- VMs, management
- Job scheduling, cloud resources, heterogeneous processors
- Hardware parallelism
  - Functional units
  - Instruction-level parallelism
  - OoO execution
  - Dependencies
  - SIMD, GPU vector processor and trade-offs c.f. CPU

Data/Scaling:

- Gustafson's law
- Block/cyclic decomposition
- Replication, Distributed FS
- Roofline performance, arithmetic intensity

## Analysis

1-4 sentence short answer

MPI:

- Rank, send/recv, broadcast, reduce

Algorithms:

- Market-basket analysis
- Matrix-matrix multiplication
- Shingling/min-hashing
- N-body: GoL

PageRank:

- Random walk
- Recursive/iterative
- Traps and teleports

Clustering:

- Girvan Newman/betweenness
- Modularity

Systems:

- Memory hierarchy: shared/distributed memory

Data/Scaling:

- 5 Vs
- Amdahl's law
- Weak/strong scalability
- Elapsed communication cost

## Skill

Apply or implement algorithm

Map-Reduce:

- RDD:
  - `parallelize`, `textFile`, `reduceByKey`, `groupByKey`, `sortByKey`
  - `join`, `cogroup`, `cartesian`
  - `count`, `countByKey`

Algorithms:

- Divide and conquer: data/functional parallelism, pipelining
- Frequent item sets
- Jaccard/cosine distance
- Matrix-vector multiplication
