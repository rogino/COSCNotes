# Week 11: Games - Non-cooperative Multi-agent Systems

Many problems can be modelled as games: multiple agents with (possibly competing) interests. They can be described by:

- **Actions** available to each agent in various stages of a game
- **Utility** (payoff) functions; one for each agent. They assign a real number to every possible outcome of the game (typically terminal states)
  - If the utility functions are the same, the agents become cooperative
- **Strategy** functions; one for each function. They determine what action is taken in each state
  - Typically, goal is to find the strategy maximizes the utility for an agent or groups of agents

Example: papers scissors rock:

- *Simultaneous action game* instead of turn-based
- 9 possible outcomes
- One utility function for each player (`1` for win, `-1` for loss, `0` for tie)
  - The sum of the scores is a constant value

## Game Trees

In **perfect-information games**, a **game tree** is a finite tree where the nodes are states and the arcs correspond to actions by the agents.

- Each internal node is a labelled with an agent (or nature) - the agent *controls* the node
  - Each internal node labelled with **nature** has a **probability distribution** over its children
- Each arc coming out of a node with agent *i* corresponds to an action for *i*
- The **leaves represent final outcomes** and are labelled with **a utility function for each agent**

Hence:

- A complete game tree contains all possibilities
- **The root is the current state**
- A play-through is a path through the tree

### Perfect-information, Zero-sum, Turn-based games

Properties:

- Typically two agents
- Take turns to play
- No chance
- State of the game fully observable by all agents
- Utility values for each agents are the opposite of the other: **zero sum**
  - Hence, one player tries to **maximize** the utility and the other **minimize**
  - **Each level of the tree switches between a max and min node** as the players switch turns

These properties creates adversary

#### Optimal Strategy: Min-Max Function

Designed to find the best move at each stage:

1. Generate the whole game tree
2. Apply the utility function to each leaf
3. Back-up values from the leaves through branch nodes
   - A max node computes the max of its child values, and vice-versa for a min node
4. If a max node at the root, choose the move leading to the value with the largest value (and vice-versa if root is a min node)

This is optimal if both players are playing optimally.

```python
def min_max_decision(state, root_is_max = True):
  if root_is_max:
    return min([(min_value(child), child) for child in state.children()])[1]
  else:
    return max([(max_value(child), child) for child in state.children()])[1]

def max_value(state):
  if state.is_terminal:
    return state.calculate_utility()

  return max([(min_value(child), child) for child in state.children()])[1]

def min_value(state):
  if state.is_terminal:
    return state.calculate_utility()

  return min([(max_value(child), child) for child in state.children()])[1]
```

### Reducing Search Space

Game tree size:

- Tic-tac-toe
  - $b \approx 5$ legal actions per state
  - $d = 9$ moves total
  - $b^d \approx 5^9 \approx 2,000,000$: searching the entire tree reasonable
- Chess
  - $b \approx 35$ legal moves per state
  - $d \approx 100$ for a typical game
  - $b^d \approx 35^{100}$: searching the entire tree completely infeasible

Hence, the search space needs to be reduced:

- Pruning
- Heuristic evaluation of states (e.g. ML, number of pieces left in chess)
- Table lookup instead of search (e.g. for opening/closing situations)
- Monte-Carlo tree search: randomly sample tree

#### Alpha-Beta Pruning

If an option is bad compared to other available options, there is no point in expending search time to find out exactly how bad it is.

Example:

```
MAX           3
           /     \
          /       \
Min      3         ?
       / | \     /   \
Leaf  3  9  6   2     ?
```

We have computed that the value for the first child (min node) is 3 and that the first child of the second child has a value of 2. Hence, the second child has a maximum value of 2, so regardless of the true value of the second child, the outcome of the max will not change.

More generally:

```
(player)   MAX              (player)   MIN
           / \                         / \
min       m   ...            max     m    ...
               ...                         ...
                 \                           \
min               ?          max              ?
                /   \                       /   \
max    m > n   n     ?       min    m < n  n     ?
```

If *m > n*, the max node is guaranteed to get a utility of at least *m* - hence, the min node with utility *n* or less will never be reached. Thus, it does not need to be evaluated further. The opposite occurs for a min node.

The algorithm has:

- $\alpha$: highest-value choice found for a max node higher-up (parents) in the tree. Initially $-\infty$
- $\beta$: lowest-value choice found for a min node higher-up (parents) in the tree. Initially $ \infty$

These two values should be passed down to the child nodes during search. If the value returned by the child node is greater than $\alpha$ for a max node, then $\alpha$ should be updated, and vice versa if it is a min node. If $\alpha \geq \beta$, the node can be pruned.

```python
from math import inf

def alpha_beta_search(tree, is_max_node = True, alpha = -inf, beta = inf):
  # Input: nested array. Numbers are leaf nodes, arrays are inner nodes
  # Returns a tuple of the best utility and path that gets that utility (index numbers)
  # If path is none, pruning occurred or it is a leaf node
  best_path = None
  best_utility = -inf if is_max_node else inf

  if isinstance(tree, int):
    return (tree, None)

  for (i, child) in enumerate(tree):
    utility, path = alpha_beta_search(child, not is_max_node, alpha, beta)
    path = [i] if path is None else ([i] + path) # Append index of child to path received by child

    if is_max_node:
      if utility > best_utility:
        (best_utility, best_path) = (utility, path)

        if utility > alpha:
          # This child is now the largest child encountered by this max node or any parent max nodes
          alpha = utility
    else:
      if utility < best_utility:
        (best_utility, best_path) = (utility, path)

        if utility < beta:
          beta = utility

    if alpha >= beta:
      return (utility, None)
      # In the case that this is a max node:
      # The child node is min node and its value is larger than or equal to the smallest value
      # encountered so far by any parent min nodes. Hence, this (max) node pick this child or
      # a larger one, so this node's parent will reject it. Thus, this node can be pruned
      # Similar logic applies if it is a min node

  return (best_utility, best_path)
```

##### Effectiveness

- Pruning does not affect the final result
- An entire sub-tree can be pruned

Worst case: if branches are ordered, no pruning takes place

Best case: each player's best move is the left-most child/evaluated first

Good move ordering improves effectiveness. Examples:

- Sort moves by the remembered move values found last time
- Expand captures first, then treats, then forward moves etc.
- Run iterative deepening search, sort by value last iteration

Alpha-beta search often gives us $O(b^\frac{d}{2})$; an improvement over $O(b^d)$ (i.e. take the square root of the branching factor)

#### Static (Heuristic Evaluation) Function

Estimates how good the current board configuration (a non-terminal state) is for a player

A typical function could evaluate how good the state is for the player subtract the opponent's score. If the board evaluation is $X$ for one player, it is $-X$ for its opponent.

This can be used to perform a **cut-off search**: after a maximum depth is reached, use the heuristic evaluation instead of finding the actual utility.

Sidenote: three players. We now have two degrees of freedom; the utility is a tuple, not a scalar. Each player will attempt to maximize it's own dimensions.
