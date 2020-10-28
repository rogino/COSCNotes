## Search

Prune on insert/remove if the end node has been **expanded**

A*: $f(path) = cost(path) + h(path[-1])$

- Admissible: estimate is always an underestimate

- Monotone/consistent:  $h(n) \leq cost(n,n') + h(n')$ for all neighbours $n'$ of $n$
  - That is, the estimate is always less than estimate from a neighbour plus the cost to go to the neighbour
- Fails if pruning + heuristic not monotone

Bidirectional search (BFS, LCFS, A\*): $2 * b^{d/2} \ll b^d$; saves time and space

Iterative deepening: max depth incremented until solution found. DFS is $\geq pow(b, k)$; iterative is $\leq b^k \cdot  \frac{b}{b-1}^2$

## Propositions and Inference

- $h \leftarrow b$: if $b$ is true, $h$ must be true. $b$ is an atom, the body  

- KB: set of definite clauses
- Interpretation: assignment of truth value to each atom. 
- Model: interpretation where all clauses are true
- Logical consequence: atoms that are true in every model of the KB

### Soundness and Completeness

- $KB \vdash g$ means $g$ can be derived (is a consequence) from the given proof procedure
- *Sound* if every consequence found is true (if $KB \vdash g$, $KB \models g$)
- *Complete* if all consequences found are true (if $KB \models g$, $KB \vdash g$)

### Bottom-up/forward-chaining
- Initialize the set of consequences to be the set of atomic clauses
- Find an atom $h$ that is not yet a consequence where $h \leftarrow b_1 \land ... \land b_m$ and all $b$'s are consequences; add it to the set
- Repeat until no more clauses can be selected

**Fixed point**: set of consequences generated

If $I$ is the interpretation where every element of the fixed point is true and every other one is false, $I$ is the **minimal model** of the KB

### Top-down procedure
Answer clause: $yes \leftarrow a_1 \land ... \land a_m$

Until the answer clause is an answer ($yes \leftarrow \textrm{}$), repeatedly run **SLD resolution**

- Pick an atom $a_i$
- Choose a clause $a_i \leftarrow body$
- Replace $a_i$ with its body
  - If it is just a definition (atomic clause like $a_i.$), the answer clause will shrink

## Prolog

- `consult(filename).` loads all knowledge bases

- `make.` reconsults all knowledge bases

- `,` is AND, `;` is OR

- `predicate(args) :- definition.`

- Search uses DFS: place non-recursive term first

- List is `[]` or `[Head_Element|Rest_Of_List]`

- `_` is anonymous variable

- ```prolog
  % append(list, list_to_append, result)
  append([], L, L).
  append([H|L1], L2, [H|L3]) :- append(L1, L2, L3).
  
  % accReverse(original, accumulator, reversed)
  accReverse([], L, L).
  accReverse([Head|Tail], Acc, Rev) :- accReverse(Tail, [Head|Acc], Rev).
  ```

- `!` supresses backtail; `fail` always fail; can be combined to invert result. Can also use `\+` to do the same

## Constraint Satisfaction Problems

A set of variables with domains for each, and set of constraints; a solution is an assignment that satisfies the constraints.

Constraint Network:

- Oval for variable; has associated domain
- Rectangle for constraint
- Arc from each variable to each constraint

### Arc Consistency

For a given constraint and variable $X$ in the scope of the constraint, the arc is arc consistent if, for each element in the domain of $X$, there is a valid assignment for all other variables in the constraint's scope.

Elements may need to be removed from the domain of $X$ to make it arc consistent.

Algorithm:

- Get all pairings of constraints and variables in their scope
- For each pairing and element, find values in the domain that allow for valid assignments
- If the domain has changed, need to recheck all variables involved with any constraints involving the variable

Empty domains: no solution; multiple values in domains: may or may not have a solution

### Domain Splitting

Halve the domain for some variable, create two instances of the problem with the new domain, and solve both, revisiting only constraints involving the split variable.

### Variable Elimination

Eliminate variables by passing constraints on to their neighbours

- Select a variable $X$
- For each constraint involving $X$, find all assignments that satisfy that constraint
  - If a variable is not involved in any of the constraints, it does not need to be assigned
- Join all constraints, then remove $X$ with a project operation
- Repeat

## Local and Global Search

- Optimization problem: finding the assignment that optimizes (min/max) the value of an objective function
- Local search
  - Each iteration, move to one of its neighbours
  - Use random restarts/steps (moving to random neighbours) to prevent getting stuck in local optima

- Constrained satisfaction problem
  - The objective function is the number of unsatisfied constraints
- Global search with parallel search
  - Get $k$ individuals/total assignments
  - At each iteration update all individuals - if any individual is a solution the search can stop
- Simulated Annealing
  - Pick a random variable and value, adopting it if it is an improvement
  - If it **is not an improvement**, adopt it with probability $exp(\frac{h(current\_assignment) - h(proposed\_assignment)}{Temperature})$. 
  - Decrease temperature over time
- Gradient descent
  - Walk along the gradient of the objective function to find a minima

Roulette wheel: return the first individual whose fitness added to the running total is larger than a random number between 1 and sum of the fitnesses.

## Probabilistic Inference and Belief Networks

$$
P(x|y,z) = \frac{P(y|z)}{P(x,y|z)}
$$



For a full assignment:
$$
P(x_1, ..., x_n) = \prod_{i=1}^{n}{P(x_i | parents(X_i))}
$$

## Basic Machine Learning

- Error = num incorrect / total
- Naïve Bayes model: assume features only dependent on class variable (thing being predicted)
- Laplace smoothing: add pseudo-count to reduce confidence
  - Add pseudo-count to counts for every tuple
- K-nearest neighbours
  - Non-parametric, instance-based learning: needs to store all examples
  - Uses k examples closest to one being retrieved and method to merge them

## Artificial Neural Networks

Prediction: $a = \sum_{i = 0}^{n}{w_i x_i}$, where $x_0 = 1$

Activation function: $g(a): bool = a \geq 0$

Learning:  $weight \leftarrow weight + \eta\_learning\_rate \cdot x(actual - prediction)$. Repeat for each training example and loop until no mis-classifications or limit reached.