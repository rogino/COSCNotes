# Test Notes

## Intro

- Data Definition Language: `CREATE` etc.
- Data Manipulation Language: `SELECT` etc.
- View Definition Language: TODO
- Storage Definition Language: internal schema (DBMS specific commands)

- Internal: storage structures etc.
- Conceptual schema: relationships, tables etc.
- External schema: subset of conceptual; relevant content only

## ER Diagrams

Attributes:

- Multivalued: `{ attr_name }`
- Composite: `attr_name(prop_1, prop_2)`
- Derived: dotted
- Keys: underlined. Must be single-valued

Relationships:

- Degree: num. entity **types** - recursive relationships unary
- No key attributes
- Relationship type: intension; relationship set; extension
- Cardinality ratio: `{A} in {B cardinality} relationships with {B}`; structural constraints the opposite way around

Weak entities:

- One partial key, may be composite; unique for a given owner
- Can have multiple owners

EER:

- `{subclass_1 \subset, subclass_2 \subset} o|d (?:=|-)+ superclass`
- Subclasses can merge if they share a root superclass - structure called a lattice
  - `category \subset u {implementor_1, implementor_2}`

## Relational Data Model

Domain constraint: value must be in their domain.

Key constraint:

- Superkey: set such that no two attributes have the same value
- Key: minimal superkey
- Prime attributes: attributes in any candidate key

Referential integrity constraint: foreign key matches existing primary key of relation, or is null.

Semantic integrity constraint: domain-specific constraints.

### EER To Relation

1. Simple entity: new relation, pick any key as PK
2. Weak entity: new relation, PK is owner PK + partial key
3. 1:N relationship: FK on N side
4. 1:1 relationship: FK on side with total participation
5. M:N relationship: new relation with both FKs as PK
6. Multivalued attributes: new relation, PK is owner PK + attribute value
7. N-ary relationships: new relation with FKs as PKs
8. Specialization/generalization
   - Any specialization: superclass has its own relation; subclasses have their own relation with their attributes; PK is FK for the superclass
   - Total specialization: subclasses have their own relation, duplicating superclass attributes
   - Disjoint specialization: single relation with properties from every subclass, plus type attribute
   - Overlapping specialization: single relation with properties from every subclass, plus Boolean for each subclass indicating if the entity is a member of the subclass
9. Category: PK is artificial, auto-generated ID. All superclasses of the category have this as a FK

## Normalization

Guidelines:

- Each tuple represents a single entity: use only FKs to refer to other entities
- No update anomalies should be possible (e.g. reduce data duplication as much as possible)
- Reduce the number of null attributes
- Lossless join condition: when doing a natural join, all tuple should be meaningful (no spurious tuples)

### Functional Dependencies

- Closure of set of FDs $F$ is $F^+$: all FDs that can be inferred from $F$

- Closure of FD $X$ with respect to $F$ is $\{X\}_F^+$
  - The closure is initially elements in the RHS of $X$
  - While there are changes, loop through all FDs. If the LHS is a subset of the closure, add elements from the RHS to the closure

#### Armstrong's Inference Rules

1. Reflexivity:  $Y \subset X \implies X \rightarrow Y$
2. Augmentation: $X \rightarrow Y \implies XZ \rightarrow YZ$
3. Transitivity: $X \rightarrow Y \land Y \rightarrow Z \implies X \rightarrow Z$

From these, the following can be generated:

4. Decomposition: $X \rightarrow YZ \implies X \rightarrow Y \land X \rightarrow Z$
5. Union: $X \rightarrow Y \land X \rightarrow Z \implies X \rightarrow YZ$
6. Pseudo-transitivity: $X \rightarrow Y \land WY \rightarrow Z \implies WX \rightarrow Z$

#### Equivalence of Sets

$F$ covers $G$ if $G^+ \subseteq F^+$. Equivalent if $F$ covers $G$ and $G$ covers $F$.

To test if $F$ covers $G$, for each FD $X \rightarrow Y$ in $G$, check if $Y \subseteq \{X\}_F^+$.

#### Minimal Sets

Minimal if RHS of all FDs is a single element and:

- Removing any dependency OR
- Removing any element from the LHS

leads to a set that is not equivalent.

### Normal Forms

If elements can be removed from the RHS, then it is a **partial** FD. Otherwise, it is called a **full** FD.

If $X \rightarrow Y$ and $Y \rightarrow Z$, $X \rightarrow Z$ is a **transitive functional dependency**.

- 1NF: every attribute single and atomic
- 2NF: every non-prime attribute fully functionally dependent on every key
- 3NF: LHS superkey OR RHS prime attribute
- BCNF: LHS superkey

### Minimal Cover Algorithm

```python
G = {}
for fd in F:
  for el in fd.lhs
  	G.append(FD(el, fd.rhs)) # Decomposition

for i in range(len(G)):
  fd = G[i]
  for el in fd.lhs:
    J = G.copy()
    J.replace(fd, FD(fd.lhs - el, fd.rhs))
    # For each FD, see if any element can be removed from the LHS
    if cover(fd.lhs - el, G) == cover(fd.lhs - el, J):
        # Covers equal, so element can be removed
        G = J

for fd in G:
  if cover(fd.lhs, G - fd) == cover(fd.lhs, G):
    G.remove(fd)
```



## Physical Layer

- Disk divided into tracks, tracks divided into blocks/sectors.
- Records: seconds of fields
  - Unspanned/spanned
- File: sequence of records. May be fixed or variable length
- Blocking factor: records/block

### Hashing

- Files divided into buckets; function on hash key determines which bucket a record goes in
- Bucket has pointer to overflow buckets

RAID 0: striping data; 1: mirroring.

### Indexing

- Dense/sparse: 1:1 mapping
- Clustered index: determines order of records. One entry/distinct value of field
- Primary index: entry/block (pointer + value of first/last record in the block)
- Secondary index: dense indexes with pointers to each record
- Multi-level index: all entries fit in a single block

#### B-Trees

Structure with pointer to subtrees and (key value + pointer) pairs that divide the subtree (all left subtree values less than key value etc.): $k$ child nodes, $k-1$ key-pointer pairs. Nodes must be at least half full.

B+ tree: internal nodes store only key values. Leaf nodes have key value + pointer pairs, plus pointer to next leaf node in the tree.

## Transactions

- Lost update: multiple transactions updating the same items have operations interleaved
- Temporary update/dirty read: when transaction reads data being modified by another transaction before it is committed
- Incorrect summary: transaction running aggregate method while another transaction is updating records

ACID:

- Atomic: performed entirely or not at all. Recovery
- Consistent: move from one valid state to another. Recovery
- Isolated: changes not visible to others until committed. Concurrency
- Durable: once committed, system failures will not affect data

## Misc.

Materialized evaluation: result of temporary relation stored (e.g. comparing value to max value from nested operation). c.f. pipelined evaluation.
