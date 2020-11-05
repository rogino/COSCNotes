# Week 07: Local and Global Search

An optimization problem has:

- A set of variables and their domains
- An **objective function**

The assignment that optimizes (maximize/minimize) the value of the objective function must be found.

A **constrained optimization problem** adds a set of constraints which determines which assignments are allowed.

## Local Search

Use algorithms to **iteratively improve** a state.

A single **current state** is kept in memory and in each iteration, we move to one of its neighbours to improve it.

Most local search algorithms are greedy. Two such algorithms are **hill climbing** and **greedy descent**.

e.g. TSP: start with any complete tour, and perform pairwise exchanges (pick two edges, switch the vertex to one in the other edge). This type of approach can get close to the optimal solution quickly.

### Local Search for CSPs

CSP can be reduced to an optimization problem.

If each variable is assigned a value, a **conflict** is an unsatisfied constraint: the goal is to find an assignment with zero conflicts.

Hence, the heuristic function to to be minimized will be the number of conflicts.

#### Example: *n*-queens problem

Put *n* queens on an *n* by *n* board such that no two queens can attack each other.

Heuristic: number of pairs of queens that can attack each other.

One queen on each column, queens can move up and down only. For each state there will be $n(n-1)$ neighbours (each can move to $n-1$ locations).

### Variants of Greedy Descent

- Find the variable-value pair that minimises the number of conflicts at each step

- Select the variable that participates in the most number of conflicts, and find the value of that variable that minimizes this
- Select a variable that appears in any conflict and find the value of that variable that minimizes this

### Issues

Can get stuck in **local optima**/flat areas of the **landscape** - randomized greedy descent can sometimes help:

- Random **step**: move to a random neighbour
- Random **restart**: reassign random values to all variables

These two make the search global.

## Parallel Search

A total assignment is called an **individual**.

Maintain a population of *k* individuals instead of one and update each individual at every stage. If an individual is a solution, it can be reported (and the search can stop).

With local search, random restarts will occur when it reaches a non-zero local minimum and finish when a solution is found.

With parallel search, if a solution is found all individuals can be stopped.

## Simulated Annealing

- Pick a variable at random
  - Pick a value at random
- If it is an improvement, adopt it
- If not. adopt it with some probability

Given:

- The current assignment is $n$
- The proposed assignment $n'$
- The objective function $h$
- The current **temperature parameter** is $T$

The probability of adopting the new value is:

$$
e^{(h(n) - h(n'))/T}
$$

As temperature gets reduced, the probability of accepting a change decreases.

## Gradient Descent

Objective function must be (mostly) differentiable:

```python
def gradient_descent(f, initial_guess):
  # f = objective function
  x = initial_guess # x is a vector
  while magnitude(grad(f)(x)) > epsilon:
    # f is a multi-variable function, so \nabla f returns a vector
    x = x - step_size * grad(f)(x)
    # Steepest slope is along the vector, so walk along it
```

## Evolutionary Algorithms

Requires:

- Representation
- Evaluation function
- Selection of parents
- Reproduction operators
- Initialize procedures
- Parameter settings

### Flow

After initializing the population:

- Calculate fitness of individuals
  - Terminate if 'perfect' individual found, time limit reached etc.
- Select individuals (some randomness required)
- Crossover: select two or more candidate individuals and somehow combine them
- Mutation

### Evaluation/Fitness Function

A value relating to how 'good' an individual is.

Used for:

- Parent selection: which parents will reproduce
- Measure of convergence: when performance no longer increases significantly between generations
- Steady state: selecting which individuals will die

### Selection

Better individuals should have a higher chance of surviving and breeding.

#### Roulette wheel

Each individual is assigned to a part of the roulette wheel, with the 'angle' being proportional to its fitness, and it is spun *n* times to select *n* individuals.

- Sum the fitness of individuals to variable *T*
- Generate a random number *N* between *1* and *T*
- Return the first individual whose fitness added to the running total is equal to or larger than *N*

```python
def roulette_wheel_select(population, fitness, r):
  total_fitness = sum([fitness(individual) for individual in population])

  rolling_sum = 0

  for individual in population:
    rolling_sum += fitness(individual)
    if rolling_sum > total_fitness * r:
      return individual
```

#### Tournaments

*n* (size of the tournament) individuals chosen randomly: the fittest one is selected as a parent.

If *n* is one, it is equivalent to randomly selecting an individual.

If *n* is the population size, it is completely deterministic.

### Elitism

Keeps at least one copy of the fittest solution so far for the next generation - ensures the fitness will not decrease over generations.

### Reproduction Operators

#### Crossover

Two parents produce two offspring. 1, 2 or *n* **crossover points** are generated:

One point crossover: child has parent one's chromosomes up until the random cross over point; after that is the other parent's chromosomes.

*n* point crossover: at *n* separate points, it swaps from getting chromosomes from one parent to the other.

#### Mutation

Mutation gives a low probability of randomly changing the gene of a child.

Mutation brings in diversity as compared to combining candidates to (hopefully) produce better children.

### Randomly Generating Programs (Trees)

- Pick a non-terminal
- Pick children for that element, either a terminal or non-terminal
- Repeat

Mutation: pick a random node and replace the subtree with a randomly-generated subtree.

Crossover: pick a random node in each parent and exchange them.





