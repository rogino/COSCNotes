# 09 Graph Structures, PageRank and TrustRank

## Web as a Graph

Nodes: webpages; edges: hyperlinks

## Link Analysis Algorithms

Not all pages are equally important. We need to rank webpages; how? Rank pages by **link structure**.

Encode entire web as a sparse matrix (adjacency list - pages will only have a few links, so very wasteful to encode as an adjacency matrix).

### PageRank: 'Flow' Formulation

Links are votes; a page is more important if it has more **in-links**.

Links from more important pages count more (enter: recursion):

- If a page $j$ with importance $r_j$ has $n$ out-links, each link gets $r_j/n$ votes
- Page $j$'s importance is the sum of votes on its in-links

#### Flow

Start with a base model that uses the number of in-links. Then, iterate, increasing the importance of links from highly-ranked pages.

The rank of a webpage is given as:

$$
r_j = \sum_{i \rightarrow j}\frac{r_i}{d_i}
$$

Where $d_i$ is the out-degree of $i$ (number of outgoing links from $i$).

Hence, the rank of each page can be defined in terms of the (currently unknown) rank other links. This provides a set of simultaneous equations; if there are $n$ pages, there are $n$ equations and $n$ unknowns.

By making the sum of all ranks sum to $1$ (or any other arbitrary value), we can find a unique solution to the problem.

Gaussian elimination works for small sets ($n^2$ algorithm) but does not scale to large web-size graphs.

### Matrix Formulation

Stochastic Adjacency Matrix $M$:
$$
M_{ji} = \begin{cases}
\frac{1}{d_i} & i\rightarrow j,\\
0 & \textrm{otherwise}
\end{cases}
$$
$M$ is a column stochastic matrix - columns sum to 1.

The rank vector $r$ is a vector where $r_i$ is the importance of page $i$. Initially, set each value to $1/n$, where $n$ is the number of pages.

The flow equations can be written as
$$
r = M \cdot r
$$

#### Random Walk Interpretation

At time $t$, a surfer is on some page $i$. At time $t+1$, the surfer follows an out-link from $i$ at random. This process repeats indefinitely.

Let $p(t)$ be a vector whose $i$ coordinate is the probability that the surfer is on page $i$ at time $t$; hence, $p(t)$ is a probability distribution over time.

#### Stationary Distribution

At time $t$, the surfer will follow a link at random:
$$
p(t + 1) = M \cdot p(t)
$$
For graphs that satisfy certain conditions, the stationary distribution $p$ is unique, giving the same result regardless of the initial probability distribution at time $t=0$

#### Example

Graph:`⟳y <---> a ---> m`

if we let $r_0 = \begin{bmatrix} 1/3 \\ 1/3 \\ 1/3 \end{bmatrix} $, $r_1$ will equal:
$$
\begin{bmatrix}
1/2 & 1/2 & 0 \\
1/2 & 0   & 0 \\
0   & 1/2 & 1
\end{bmatrix}

\cdot

\begin{bmatrix}
1/3 \\
1/3 \\
1/3
\end{bmatrix}
=
\begin{bmatrix}
2/6 \\
1/6 \\
3/6
\end{bmatrix}
$$

#### Teleports

The importance of $m$ gets larger over time as it has no out-links; importance 'leaks' out.

Although not present in this graph, spider-traps are another issue; all out-links are within a group, so the walker gets stuck in a trap. Eventually, the trap absorbs all importance.

To solve this, simply teleport: with probability $1 - \beta$, teleport out to some random page. $\beta$ is usually somewhere around 0.8 and 0.9. Ensure the matrix is adjusted accordingly (e.g. treat $m$ as if it has out-links going to all three nodes in the graph).

### PageRank Equation

The equation:
$$
r_j = \sum_{i \rightarrow j}{\Beta \frac{r_i}{d_i}} + (1-\beta) \left[\frac{1}{N}\right]_{N \times N}
$$

Where $\left[\frac{1}{N}\right]_{N\times N}$ is a $N$ by $N$ matrix where all entries are $1/N$ - this represents the probability of a random teleport.

The matrix:
$$
A = \beta M + (1 - \beta)\left[\frac{1}{N}\right]_{N\times N}
$$

Where $\beta$ is $0.8$ to $0.9$.

The recursive problem:
$$
r = A \cdot r
$$
