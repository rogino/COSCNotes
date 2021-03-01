# 03. Scalability, Programming, and Algorithms in Spark

A single node cannot process large data sets (e.g. just saving the internet to disk would take several months under the most ideal conditions). Hence, large-scale computing uses multiple nodes arranged in an hierarchical structure (e.g. binary tree).

The volumes of data are too large to store on a single node, so data is stored on a **distributed file system** where data is kept in contiguous chunks (16-64 MB) and **replicated** 2-3 times. One or more master nodes store metadata relating to the chunks.

The architecture **assumes nodes will fail** and can continue to function when this occurs.

Networking is slow and hence, the processing is done directly on the **chunk servers**.

## Map-Reduce

The Map-Reduce architecture takes care of:

- Partitioning input data
- Scheduling execution across a set of machines
- Handling machine failures
- Managing inter-machine communication

### Map

Input is a set of key-value pairs, where the key is a nominal value (e.g. boolean, number).

Hence unlike dictionaries, the Map-Reduce architecture **allows duplicate keys**.

When map is called, every key-value pair is passed to a map lambda which outputs some number of key-value pairs (e.g. `flatMap` returns an array). This is called a **transformation**.

### Reduce

(Likely already mapped) key-value pairs are given as input, and some reduction operation is performed:

- `groupByKey`: combines all key-value pairs with the same key into an array
- `reduceByKey` is used to summarize the values for a particular key

### Example: Word Counting

File (or a chunk of the file) given to each node. Then:

- Each individual node performs a map operation, reading the input file and converting it to a set of key-value pairs `(word, word_count = 1)`
- Reduce by key is used to collect all pairs with the same key and reduce it to the sum

The reduce step is then applied again with the sets from the other nodes until we are left with a single set.

## Spark

Spark is a very optimized implementation of MapReduce which attempts to reduce the amount of disk/network writes. The trade-off for this is that if a catastrophic failure occurs, more work is lost.

Spark lazily computes values: mapping, reducing etc. are methods of an RDD which return an RDD (allowing chaining), not the results themselves. Hence, intermediate results are not stored and the operations are done only when you actually call `collect()` or a similar method.

### RDD: Resilient Distributed Dataset

RDDs are a fault-tolerant collection of elements that can be operated in parallel.

They can be made by parallelizing an existing collection (e.g. list in Python) or by referencing a dataset in a external storage system (e.g. shared file system).

#### Action

Actions generate **a local data structure at the driver**:

- Operations that run on but do not mutate the RDD: `count`, `collect`, `reduce`, `max` etc.
- Mutations: `foreach` or similar operation which **modifies the RDD**

#### Transformation

Returns a **reference to a new RDD**:

- Single RDD as input: `map`, `flatMap`, `filter` etc.
- Joins; multiple RDDs as input: `union`, `difference` etc.

#### Coordination

The master node is responsible for coordination.

The node keeps track of task status; tasks can be idle (waiting for workers), in-progress or completed.

As workers become available, they get scheduled idle tasks.

When a map task is completed, the location and sizes of its intermediate files is sent to the master, which in turn sends this to workers doing reduction operations.

##### Failures

Master will periodically ping workers to detect failures.

If a map worker fails, in-progress/completed tasks reset to idle and must be reprocessed. Reduce workers are notified when the task is rescheduled to another map worker.

If a reduce worker fails, only in-progress tasks are reset to idle. The task is restarted on another worker.

If the master fails, the task is aborted and the client is notified.

### Some Spark methods and miscellaneous notes

- `first()`: returns the first element
- `take(n)`: returns the first `n` items
`first` and `take` should be applied on a sorted RDD, otherwise the results will be non-deterministic.

`takeOrdered(n, sortFunction)` may be used if it is not already sorted or if the RDD is already in a particular order. `takeOrdered` is much faster than running `sort()` and then `take()`.

`countByValue` returns the count of each key: see the word count example.

Reduction functions must be **associative/commutative**; otherwise, the results will be wrong and non-deterministic.

Some transformations:

- `map`: outputs exactly one key-value pair
- `flatMap`: returns a set of key-value pairs, with the contents of that array being spread to the outer set
- `mapPartition`: return a key-value pair given the elements in a partition (in the form of an iterator)
- `filter`: lambda returning true (remove)/false (keep)
