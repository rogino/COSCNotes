# Week 06: Constraint Satisfaction Problems

These problems are characterized by:

- A set of variables $V_1$, $V_2$, ..., $V_n$
- A set of domains for each variable: $D_{V_i}$ is the domain for $V_i$
- A set of constraints on various subsets which specify legal combinations of values for these variables (e.g. $V_1 \neq V_2$ )

A solution is a *n*-tuple of values for the variables that satisfies the constraints.

## Examples

Australian map colouring:

- Variables: $WA, NT, Q, NSW, V, SA, T$
- Domains: ${red, green, blue}$
- Constraints: $WA \neq NT, WA \neq SA, NA \neq Q, NT \neq SA, SA \neq Q, SA \neq NSW, SA \neq V, NSW \neq V$

Sudoku:

- Variables: unfilled values
- Domains: 1-9
- Constraints: sudoku rules

Eight queens puzzle:

- Variables: row in which queen is located
- Domains: 0-8
- Constraint: no two queens in the same row

## Basic Algorithms

### Generate-and-Test algorithm

Generate the assignment space $D = D_{v_1} \times \dots \times D_{v_n}$ (cartesian product), then test each assignment with the constraints.

It is exponential in the number of variables.

### Backtracking

Systematically explore *D* by instantiating variables one at a time, evaluating each constraint as all its variables are bound.

Thus, any partial assignment that doesn't satisfy the constraints can be pruned (e.g. if $A \neq B$, can prune these even if $C$, $D$ etc. have not been instantiated yet).

### CSP as graph search

A node is an assignment of values to some of the variables.

Search:

- Select a variable $Y$ that is not assigned to node $N$
- Generate the neighbour to $N$ where $Y$ has been assigned for all possible values of $Y$
- Prune if the assignment is not consistent with the constraints

The start node is the empty assignment, and the goal node is a total assignment that satisfies the constraints.

## CSP Algorithms

CSP is NP-hard. However, some instances of CSP can be solved more efficiently by exploiting certain properties.

### Constraint Networks

An instance of CSP can be represented as a network:

- **Oval** node for each **variable**
  - Each variable has a domain associated with it
- **Rectangle** node for each **constraint**
- Arcs from each variable to constraints that involve it

### Arc Consistency

An arc $\langle X, r(X, \overline{Y})\rangle$ is arc consistent if for **every** value of $X$, there **a** value of $\overline{Y}$ such that $r(x,\overline{y})$ is satisfied. $\overline{Y}$ may be a set of multiple variables (variables in the scope of the constraint, except $X$).

A network is arc consistent if all arcs are arc consistent.

If an constraint has only one variable in its scope and every value in the domain satisfies the constraint, then the arc is **domain consistent**.

If there is an arc that is not arc consistent, **remove values from $X$'s domain** to make it arc consistent.

Example:

- Variables $A, B, C$
- Domain $[1, 4]$ for all variables
- $A + B = C$

One arc would be $\langle{A, A+B=C}\rangle$:

- $\overline{Y} = domain(B) \times domain(C)$
- To make it arc consistent, $4$ must be removed from the domain of $A$

By repeating this with other nodes, the network can be made arc consistent.

#### Arc Consistency Algorithm

Arcs can be considered in series. An arc, $\langle X, r(X, \overline{Y})\rangle$, needs to be revisited if the domain of one of the $Y$'s is reduced.

```python
def GAC(variables, domains, constraints):
  # GAC: Generalized Arc Consistency algorithm
  return GAC2(variables, domains, constraints, [((X, C) for C in constraints if X in scope(C)) for X in variables].flatten())

def GAC2(variables, domains, constraints, todo):
  while not todo.isEmpty():
    X, constraint = todo.pop() # The variable is in the scope of the constraint (i.e. it is relevant)
    Y = scope(todo)
    Y.pop(X) # Need to remove the chosen from the set of constraints

    new_domain = [x for x in domain(X)
      # such that there exists a set (y_1,..., y_n) such that is_consistent(X=x, Y_1=y_1, ..., Y_n=y_n)
    ]

    if new_domain != domain(X):
      # need to re-check all variables that are involved with any constraints involving X
      todo += [(Z, C) for C in constraints if X in scope(C) and Z in scope(C) and X != Z]
      domain(X) = new_domain
```

There are three possible outcomes of this algorithm:

- One or more domains are empty: there is no solution
- Each domain has a single value: unique solution
- Some domains have multiple values:  there may or may not be a solution. More work must be done

### Domain Splitting

Split a problem into a number of disjoint cases and solve each case separately: the set of solutions is the union of all solutions to each case.

e.g. if $X \in {0,1}$, find all solutions where $X=0$, then where $X=1$.

#### Algorithm

Given a CSP instance:

- Select any variable $X$ that has more than one value in its domain
- Split $X$ into two disjoint, non-empty sets
- Create two new CSP instances with the new domain for $X$

```python
def CSPSolver(variables, domains, constraints, todo):
  if [domain for domain in domains if len(domain) == 0] is not empty:
    return False
  else if [domain[0] for domain in domains if len(domain) == 1] is the same length:
    # Every domain has one possible value
    return (domain[0] for domain in domains)

  X = [X for X in domains if domain(X) > 1][0]
  D1, D2 = split(domain(X))

  domains1 = domains.replace(X, D1)
  domains2 = domains.replace(X, D2)

  todo = [(Z, C) for C in constraints if X in scope(C) and Z in scope(C) and X != Z]
  # Domain of X has been split so need to recheck all variables that are involved with constraints involving X

  return CSPSolver(variables, domains1, constraints, todo) or CSPSolver(variables, domains2, constraints, todo)
```

### Variable Elimination

Eliminate variables one-by-one, passing constraints onto their neighbours.

Constraints can be thought of as a relation containing tuples for all possible valid values.

A join operation can be done on two constraints to capture both constraints, joining on the variable being eliminated. Then, this table can be projected with that column (variable being eliminated) removed.

#### Algorithm

- If there is only one variable, return the intersections of the constraints
- Select a variable $X$
- Join the constraints in which $X$ appears to form constraint $R_1$
- Project $R_1$ onto its variables other than $X$ to form $R2$
- Replace all constraints in which $X$ appears with $R2$
- Recursively solve

```python
def VE_CSP(variables, constraints):
  if len(variables) == 1:
    return join(...constraints)
  else:
    X = variables.pop() # select variable to eliminate and remove from variables
    constraints_X = [C for C in constraints if X in scope(C)]
    R = join(...constraints_X)
    R2 = project(all_variables_but_X)

    new_constraints = [C for C in constraints if X not in scope(C)] + R2
    recursed = VE_CSP(variables, new_constraints)
    return join(R, recursed)
```