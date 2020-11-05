# Week 8: Probabilistic Inference and Belief Networks

In the real world, there will be uncertainty and randomness due to several factors:

- Theoretical and modelling limitations
  - Coin toss: incomplete physics model
- Sensory and measurement limitations
  - Measurements not accurate enough
- Computational limitations
  - Computation too time consuming

Hence, using probabilities is often required.

## Random Variable

Some aspect of the world about which there is uncertainty.

RVs are denoted with a capital letter and have an associated domain.

Unobserved RVs have distributions; a table of probabilities of values. A probability is a single number e.g. $P(W = rain) = 0.1$. The probabilities sum to 1 and none are negative.

Joint distribution over a set of RVs: a map from assignments/outcomes/atomic events to reals; $P(X_1 = x_1, ..., X_n = x_n)$

Event: set *E* of assignments; $P(E) = \sum_{(x_1, ..., x_n \in E)}{P(x_1, ..., x_n)}$

Marginalization (summing out): projecting a joint distribution to a sub-distribution over subset of variables: $P(X_1 = x_1) = \sum_{x_2 \in domain(X_2)}{P(X_1 = x_1, X_2 = x_2)}$

Conditional probability: $P(a|b) = \frac{P(a, b)}{P(b)}$

Conditional distribution: probability distribution over some variables given fixed values of others. If $W$ and $T$ take binary values, $P(W, T)$ is a 2 by 2 table, $P(W|T)$ is two 2-row tables, each summing to 1.

To get the whole conditional distribution at once, select the joint probabilities matching the evidence and normalize the selection (make it sum to 1). Example:

$P(T|rain)$: select rows where $R=rain$, then divide the probabilities by the sum $P(warm, rain) + P(cold, rain)$.

$$
\begin{aligned}
P(x_1|x_2) &= \frac{P(x_1, x_2)}{P(x_2)} \\
&= \frac{P(x_1, x_2)}{\sum_{x_1 \in domain(X_1)}{P(x_1, x_2)}}
\end{aligned}
$$

**Product rule**: 
$$
\begin{aligned}
P(x|y) &= \frac{P(x, y)}{P(y)} \\
\therefore P(x, y) &= P(x|y) \cdot P(y)
\end{aligned}
$$

**Chain rule**: $P(x_1,  x_2, x_3) = P(x_1) \cdot P(x_2|x_1) \cdot P(x_3|x_1, x_2)$. More generally:
$$
P(x_1, ... x_n) = \prod_{i=1}^{n}{P(x_i|x_1, ..., x_{i-1})}
$$

## Probabilistic Inference

Computing a desired probability from other known probabilities.

$P(x, y) = P(x|y) \cdot P(y) = P(y|x) \cdot P(x)$. By dividing this by the marginal, we get Baye's rule:

$$
P(x|y) = \frac{P(y|x) \cdot P(x)}{P(y)}
$$

This allows us to invert a conditional distribution - often one conditional is simple but the other is tricky.
$$
\begin{aligned}
P(x,y|z) &= P(y,x|z) \\
\\
P(x,y|z) &= \frac{P(x,y,z)}{P(z)} \\
P(y|x,z) &= \frac{P(x,y,z)}{P(x,z)} \\
\therefore P(x,y,z) &= P(y|x,z) \cdot P(x,z) \\
\therefore P(x,y|z) &= \frac{P(y|x,z) \cdot P(x,z)}{P(z)} \\
&= P(y|x,z) \cdot P(x|z) \\
\\
\therefore P(x|y,z) &= \frac{P(y|x,z) \cdot P(x|z)}{P(y,z)} \\
\textrm{if z is implicit}: \\
P(x|y) &= \frac{P(y|x) \cdot P(x)}{P(y)} \textrm{ (Baye's rule)}
\end{aligned}
$$


### Inference by Enumeration

A more general procedure: $P(Y_1, ..., Y_m|e_1, ..., e_k)$ where:

- $(E_1, ..., E_k) = (e_1, ..., e_k)$ are evidence variables
- $Y_1, ..., Y_m$ are query variables
- $H_1, ..., H_r$ are hidden variables

These variables can be referred to as $X_1, ..., X_n$

First, select entries consistent with the evidence

Then, sum out $H$:

$$
P(Y_1, ..., Y_m, e_1, ..., e_k) = \sum_{h_1, ..., h_r}{P(Y_1, ..., Y_m, h_1, ..., h_r, e_1, ..., e_k)}
$$

Finally, normalize the remaining entries.

### Complexity of Models

Simple models are easier to build, explain, and usually lead to lower time complexity and space requirements.

To measure complexity, count the number of free parameters that must be specified; a joint distribution over *n* variables, each with a domain size of *d* requires $d^n$ entries in the table, and the number of free parameters will be $d^n - 1$ (the last one can be inferred as probabilities must sum to 1).

### Independence

Two variables are independent if:
$$
\begin{aligned}
P(X, Y) &= P(X) \cdot P(Y) \textrm{ or} \\
\forall x, y: P(x, y) &= P(X=x) \cdot P(Y=y)
\end{aligned}
$$
That is, their joint distribution **factors** into a product of two simpler distributions.

Absolute independence: $X{\perp\!\!\!\perp}Y$

Independence can be used as a modelling assumption; if all the variables are independent, instead of having $d^n - 1$ parameters in the joint model, we only need $nd - 1$ rows.

Absolute (unconditional) independence is vary rare; **conditional independence** is more robust. For a given value of $Z$, the probability of $X$ is independent of $Y$; $X{\perp\!\!\!\perp}Y|Z$ if:

$$
\begin{aligned}
&\forall x, y, z: P(x, y|z) = P(x|z) \cdot P(y|z) \textrm{ or}\\
&\forall x, y, z: P(x|z, y) = P(x|z)
\end{aligned}
$$

In this case:

$$
\begin{aligned}
P(X, Y, Z) &= P(X|Y, Z) \cdot P(Y, Z) \\
&= P(X|Y, Z) \cdot P(Y|Z) \cdot P(Z) \\
&= P(X|Z) \cdot P(Y|Z) \cdot P(Z)
\end{aligned}
$$

This can occur if $X$ and $Y$ are both dependent on $Z$ but are independent of each other; the value of $X$ modifies the probability of the parent, $Z$'s, value and thus modifies the probability of $Y$ in turn.

## Belief Networks

- A way to describe complex joint distributions
- Sometimes called Baye's nets or Bayesian networks
- Local interactions chain together to give global, indirect interactions

### Graphical Model Notation

Arcs:

- Allows dependence between variables
- Arcs don't force dependence
- Arrows may imply causation (but don't have to)

Nodes:

- One node per RV
  - Either assigned (observed) or unassigned (unobserved)
- Conditionally independent of its **non-descendants given its parents' state**
- Conditionally independent of **all other nodes** given its parents, children, and children's parents' state
  - Called a Markov blanket

Distributions:

- A collection of distributions (CPTs) over each node; one for each combination of the parents' values
  - $P(X|a_1, ..., a_n)$ for all combinations of $a$

D-separation can be used to decide if a set of nodes $X$ is independent of $Y$ given $Z$.

### Encoding

BNs implicitly encode joint distributions; this can be calculated as a product of local conditional distributions

Example:

$$
\begin{aligned}
A &\rightarrow B \\
A &\rightarrow C \\
B, C &\rightarrow D \\
C &\rightarrow E \\
\end{aligned}
$$

$$
\begin{aligned}
P(a, b, c, d, e) &= P(e|a, b, c, d) \cdot P(a, b, c, d) \quad\textrm{(by the product rule)} \\
&= P(e|c) \cdot P(a, b, c, d)          \quad\textrm{(e dependent on c but independent of all others)} \\
&= P(e|c) \cdot P(d|a, b, c) \cdot P(a, b, c) \\
&= P(e|c) \cdot P(d|b, c) \cdot P(a, b, c) \\ 
&= P(e|c) \cdot P(d|b, c) \cdot P(c|a, b) \cdot P(a, b) \\
&= P(e|c) \cdot P(d|b, c) \cdot P(c|a) \cdot P(b|a) \cdot P(a) \\
\end{aligned}
$$



More generally, if you have a full assignment, multiplying the relevant conditionals gives the probability:
$$
P(x_1, ..., x_n) = \prod_{i=1}^{n}{P(x_i | parents(X_i))}
$$

```python
product = 1
for i in range(1, n):
  product *= probability(x[i] | parents(i))
```

Thus, we can reconstruct any entry of the full joint. However, not every BN can represent every full joint.

### Inference Enumeration

Computing $P(Y | e)$. If $H$ are the hidden variables and $\alpha$ normalizes the values so the sum of the probabilities is 1:

$$
P(Y|e) = \alpha \cdot P(Y, e) = \alpha \sum_H{P(Y, e, H)}
$$

(NB: $\sum_H$ means $\sum_{H_1}{\sum_{H_2}{...}}$)

This has to be computed for every value in the domain of $Y$

Answering $P(Y)$: no evidence; all variables except the query are hidden

Answering $P(y|e)$: answer $P(Y|e)$, then pick result for $Y=y$

Answering $P(Y_1=y_1, Y_2=y_2 | e)$: $P(y_1|y_2, e) \cdot P(y_2|e)$