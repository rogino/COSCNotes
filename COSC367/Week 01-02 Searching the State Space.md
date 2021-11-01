# Weeks 01-02: Searching the State Space

## State Space

State: object representing a possible configuration of the world (**agent and environment**).

State space: set of all possible states (cross product of all elements of the state).

## State Space Graphs

- Actions change the state of the world
- Each action may cause a change in the state
- Basically a FSM

## Directed Graph

Many problems can be abstracted into the problem of finding a path in a directed graphs.

- Node: state (vertices)
- Arc: action (edges)
- Path: sequence of $\langle n_0, n_1, \dots, n_k \rangle$ nodes (of length $k$ in this example). Implemented as a sequence of arcs in practice
- Arcs can have an associate cost: cost of path is sum of cost of arcs
- Solution: path from a start node to a goal node - multiple starting and goal nodes allowed

### Explicit Graphs

- Entire graph in memory, stored as adjacency list or matrix
- Complexity measured in terms of number of vertices/edges

### Implicit Graphs

- `outgoing_arcs` method returns a set of outgoing directed arcs for the given node
- Graph generating on the fly
- Complexity measured by **depth of goal node** (path length) and **average branching factor** (number of outgoing arcs at each node)

## Searching Graphs

### Generic algorithm

- Frontier: list of paths (starting from a start node) that have been explored
- Explore graph and update frontier until goal node encountered
- Way in which paths are added and removed: search strategy
  - e.g. pruning: store visited nodes to avoid cycles

```python
def search(graph, start_nodes, is_goal_node):
  frontier = [[s] for s in start_nodes]
  while len(frontier) != 0:
    path = frontier.pop()
    if is_goal_node[path[-1]]:
      return path

  for n in path[-1].neighbors():
    frontier.append(path + n)
```

- The value selected from the frontier at each stage defines the search strategy - above, the frontier object is passed to the search procedure using `pop`
- The `neighbors` function defines the graph - `outgoing_arcs` is used above
- The `goal` function defines solution that is used
  - **Finish after you remove from the frontier**. Otherwise, in graphs with costs, the lowest cost path may not be found
- If more than one answer is required, the search can continue - use the `yield` keyword

### DFS

- Pop last element from stack
- If algorithm continues, the paths that extend the popped element are pushed to the stack
- Thus, the algorithm expands the deepest path
- Does not guarantee it will find the solution with the fewest arcs
- Does not halt on every graph and is **not complete - is not guaranteed to find a solution if one exists**
  - No pruning, so it can get stuck in a cycle
- Time complexity as function of length of the selected path:
  - $O(b^d)$, where $b$ is the branching factor and $d$ is the depth
- Space complexity as a function of the length of the selected path:
  - $O(d)$ for a given depth - there can only be $d$ frontier paths (plus the branching of the current node that was explored)

### Explicit graphs

- Used in exercises
- Nodes are specified as a set - order does not matter
- Edges are in a list: (tail, head, cost?) - order does matter

Tracing the frontier:

- Each line starts with a plus or minus
  - `+` to indicate that this will be added to the frontier
  - `-` to indicate that something has been selected and returned from the frontier
  - List of nodes with no separator character
  - Optional `!` at the end - means pruning has occurred
    - When adding or removing from the frontier but the end node is already expanded

### BFS

- FIFO queue
- Pop from the start
- Check if goal node. If not
  - Enqueue paths that extend the node to the queue
- Shallowest path expanded first
- Guarantees the solution with fewest arcs will be found first
- Complete - if there is a solution it will find it
- Does not always halt - if there is no solution and there is a cycle
- Time complexity: $O(b^d)$
- Space complexity: $O(b^d)$

## Lowest-cost-first search (LCFS)

- Cost of path: sum of costs of arcs
- Frontier is **priority queue ordered by path cost**
- At each stage, select the path on the frontier with the lowest cost
- Finds the optimal solution: **least-cost path to goal node**

### Priority Queue

- Each element has priority
- Element with higher priority always selected/removed/dequeued before element with lower cost
- **Queue is stable: if two or more elements have the same priority, FIFO**
  - Does not affect the correctness of the algorithm, but makes it deterministic
- Python has `heapq`
  - Won't automatically be stable

## Pruning

Two problems: cycles - an infinite search tree, and when expanding multiple paths leads to the same node.

We need memory - the frontier should keep track of which nodes have been expanded/closed.

- Expansion happens when the frontier is removed from the path and you add new elements to it
- Store the expanded nodes as a set
  - The nodes must be hashable

Prune when:

- When **adding a path to a frontier** but the end node has **already been expanded**
- When the **frontier is asked for the path**, but the end node of that path has **already been expanded**

LCFS finds an optimal solution, but it explores options in **every direction**, and knows nothing about the goal location.

## Heuristics

Extra knowledge that can be used to guide a search:

- $h(n)$ is an *estimate* of the cost of the shortest path from a given node $n$ to a goal node
- **An underestimate (or equal)**: if there is no path to a goal node, any estimate it gives will be an underestimate
  - If so, the heuristic function is **admissible**
- Multiple goal nodes: one approach is to return the 'closest' goal node

## Best-first Search

- Select the path on the frontier with **minimal $h$-value**
- Priority queue ordered by $h$
- Explores more promising paths first - usually faster than LCFS
- **May NOT find the optimal solution**

## A* Search Strategy

- Not as wasteful as LCFS
- Not as greedy as best-first-search
- Avoid expanding paths that are already expensive

$f(p) = cost(p) + h(n)$ where:

- $p$ is a path and $n$ is the last node on $p$

- $cost(p)$ is the real cost from the starting node to $n$

- $h(n)$ is an estimate of the cost from $n$ to the closest goal node

- $f(p)$ is the estimated total cost of the path

- The frontier is a priority queue, ordered by $f$

- Should be admissible (underestimate) - makes it prefer less-explored (i.e. shallower) paths

- **Fails if there is pruning and the heuristic is not monotone**
  
  - An expensive path may be expanded before a cheaper one ending at the same node. If pruning occurs, the cheaper path cannot be used

### Monotonicity

A requirement that is stronger than admissibility. A function is **monotone/consistent** if, for any two nodes $n$ and $n'$ (which are reachable from $n$):

$$
h(n) \leq cost(n, n') + h(n')
$$

That is, the estimated cost from $n$ to the goal must be less than the estimated cost of going to the goal via $n'$. Where $s$ is the start node:

$$
\begin{aligned}
f(n') &= cost(s, n') + h(n') \\
&= cost(s, n) + cost(n, n') + h(n') \\

\therefore f(n') &\leq cost(s, n) + h(n) \\
\therefore f(n') &\leq f(n) \\
\end{aligned}
$$

Thus, **$f(n)$ is non-decreasing along any path**.

## Finding good heuristics

Solve a simpler version of the problem:

- Finding admissible heuristics is hard
  - Admissible heuristics are usually consistent. Yay!
- Inadmissible heuristics are often quite effective, although that sacrifices optimality
  - Multiplying by some constant is a hacky way of making it admissible

Sliding puzzle example:

- Number of misplaced tiles: admissible as only one tile can move at a time and if *n* tiles are in the wrong spot, it needs at least *n* steps
- Total Manhattan distance: closer to the actual value, so improves performance

### Dominance Relation

Dominance: for two heuristics, if $h_a > h_c$ if $\forall{n}: h_a(n) \geq h_c(n)$.

Heuristics form a semi-lattice: if neither are dominating, could use $max(h_a(n), h_c(n))$.

The bottom of the lattice is the zero heuristic - makes A* search just a LCFS.

## Bidirectional Search

- Search from both the start nodes and the goal nodes simultaneously
- Can be used with BFS, LCFS, or A*
- $2b^{\frac{d}{2}} \ll b^d$, thus exponential savings in time and space

## Bounded Depth-First Search

Takes a bound (cost or depth) and does not expand paths that exceed the bound:

- Explores part of the search tree
- Uses space linear in the depth of the search
- Kind of acts like BFS while using little memory

### Iterative-deepening Search

Uses less memory but more CPU when compared to BFS:

- Start with bound $b = 0$
- Do a bounded depth-first search with bound $b$
- While a solution is not found, increment $b$ and repeat
- Nothing is remembered between iterations; wasteful
- **This will find the same first solution as BFS**
- But linear in depth of goal node: $O(bd)$
- If there is no path to the goal: identical behavior to BFS. Infinite loop if not pruning

Complexity with solution at depth $k$ and branching factor $b$:

| Level | BFS                            | Iterative  Deepening          | Num. Nodes |
| ----- | ------------------------------ | ----------------------------- | ---------- |
| $1$   | $1$ (only looks at nodes once) | $k$ (repeat search $k$ times) | $b$        |
| $2$   | $1$                            | $k - 1$                       | $b^2$      |
| $k$   | $1$                            | $1$                           | $b^k$      |
| Total | $\geq b^k$                     | $\leq b^k(\frac{b}{b-1})^2$   |            |

As branching factor increases, complexity gets closer and closer to BFS - thus, it is not very wasteful.
