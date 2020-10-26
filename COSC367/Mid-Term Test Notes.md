Prune on insert/remove if the end node has been **expanded**

A*: `f(path) = cost(path) + h(path[-1])`

Admissible: estimate is always an underestimate

Monotone/consistent: 
`h(n) <= cost(n,n') + h(n')` for all neighbours `n'` of `n`

That is, the estimate from `n` is always less than the cost between `n` and `n'`, plus the estimate for `n'`:cost(n,n') + h(n')` never decreases along a path.

Fails if pruning + heuristic not monotone

Bidirectional: `2 * pow(b, d/2) << pow(b, d)`; saves time and space. BFS, LCFS, A*
Iterative deepening: bound incremented until solution found. DFS is `>= pow(b, k)`; iterative is `<= pow(b, k) * pow(b/(b-1), 2)`

`h <- b`: if `b` is true, `h` must be true

KB: set of definite clauses
Interpretation: assignment of truth value to each atom. Model: all clause true
Logical consequence: atoms that are true in every model of the KB

Given proof procedure, `KB |- g` means `g` can be derived (is a consequence) from KB
Sound if every consequence found is true (`KB |= g`)
Complete if all consequences found are true

Bottom-up/forward-chaining:
`h` is a consequence if `h <- b_1 \land ... \land b_m` if all `b`'s are consequences and `h` is not yet known to be a consequence. Initially, the set of consequences will be atomic clauses. Repeat until no more clauses can be selected
Fixed point: set of consequences generated. If `I` is the interpretation where every element of the fixed point is true and every other one is false, `I` is a model of the KB; the *minimal model*

Top-down procedure
Answer clause: `yes <- a_1 \land ... \land a_m`

SLD resolution of answer clause on `a_i`: replace `a_i` in the answer clause with a clause of `a_i`. Replace every atom with its clause until no more replacements can be made.

Until the answer clause is an answer (`yes <-`):

- Pick an atom `a_i`
- Choose a clause `a_i <- body`
- Replace `a_i` with its body
  - If it is just a definition (atomic clause like `a_i.`), the answer clause will shrink

Prolog search: DFS

`consult(filename).`
`make.`: reconsult all loaded
