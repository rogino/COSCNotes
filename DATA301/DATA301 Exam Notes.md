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

### TODO HEADING Distributed File Systems

Scale + durability + consistency.

Master node stores metadata.

Chunk servers store contiguous chunks of 16-64 MB that have been replicated onto a few different machines.

Computation done directly on chunk servers instead of dealing with network transfer.

## Map-Reduce

### Spark

Actions:

- RDD => local data structure (on the RDD): `count`, `max` etc.
- Mutations: RDD modified
  - TODO

Transformations:

- RDD => RDD
- Joins: multiple RDDs => RDD

Failures:

- Map worker: TODO
- Reduce worker: in-progress tasks reset, restarted on different worker
- Master: MapReduce task aborted, client notified

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

# fn(val_1, val_2) => val. Either input may be the output from fn
# [(key, val)] => [(key, combined_vals)]
rdd.reduceByKey(fn)

rdd.flatMap(fn)
rdd.map(fn)

# elements where `fn(el) is True` remain
rdd.filter(fn)



## SETS
# [a, b], [c, d] => [a, b, c, d]
rdd_1.union(rdd_2)
sc.union([rdd_1, rdd_2])

# Inner join
# [(key, val_1)], [(key, val_2)] => (key, (val_1, val_2))
rdd_1.join(rdd_2)
# TODO DUPLICATE KEYS

# Kinda-Union
# [(key, val_1), (key, val_2)], [(key, val_3)] => (key, ([val_1, val_2], [val_3])
rdd_1.cogroup(rdd_2)



# ACTION
# Return everything
rdd.collect()

# [(key, val)] => {key: val}
rdd.collectAsMap()

# Returns n values ordered non-deterministically
rdd.take(n)

# Returns first n values, sorted g
rdd.takeOrdered(n, sort_fn)
```
