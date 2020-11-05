# Prolog

## Prolog - *pro*gramming in *log*ic

### Intro

- Describe the situation of interest
- Ask a question
- Prolog logically deduces new facts, and gives deductions back as answers
- Prolog has an interactive interpreter
  - To exit, use `halt.`
  - Load a knowledge base using `consult(filename).`
  - Reload using `reconsult(filename).`
  - `make.` reloads all changed source files
  - Ask queries in interactive mode (`?:`)
  - Comments: `/**/` and `%`
  - `write(+Term)` always succeeds. It prints out stuff.
  - `trace/1`

### Basic Syntax

- Facts and rules are both clauses
  - The end of a clause is marked with a full stop
- `happy(yolanda).` is a fact
  - `happy` is a **predicate**; a **test** - it is 'true' (provably true) or 'false' (unknown) for the given argument; it is not a function call
- `listensToMusic(yolanda) :- happy(yolanda).` is a rule
  - If RHS (head) is true, then LHS (body) must be true
  - `:-` means $\leftarrow \textrm{}$
- `,` means conjunction ($\land$)
- `;` means disjunction ($\lor$). It can defined by having two rules; this is just syntactic sugar

### Variables

Variables start with an underscore or upper case letter, and may contain upper, lower, digits or underscores. `happy(X).` returns a term that replaces `X` such that the rule is met. Typing `j` tries to find another term that satisfies the rule.

Conjunction can also be used e.g. `happy(X), listensToMusic(X).`.

Variables can be in the knowledge base as well e.g. `jealous(X,Y) :- loves(X,Z), loves(Y,Z).`

### Atoms

A sequence of characters (upper, lower, digits, underscore) starting with a lowercase letter OR a sequence of special characters (`:`, `,`, `;`, `.`, `:-`). Atoms can be enclose in single quotes if it does not meet the naming requirements (e.g. `'Yolanda'`)

### Complex terms

Functor directly followed by a sequence of arguments - put in brackets, separated by commas. e.g. `listensToMusic(yolanda)`, `hide(X,father(father(father(butch))).`.

### Arity

The number of arguments a complex term has; predicates with the same functor but different arity can be defined.

### Unification

Two terms unify if they are the same term or contain variables that can be uniformly instantiated with terms in a way such that the resulting terms are equal.

e.g. `woman(mia) = woman(mia).` `woman(Z)` and `woman(mia)` will be unified, with `Z` taking the value of `mia`.

`horizontal(line(point(X,Y), point(X,Z))).`

`horizontal(line(point(1,2), point(X,3))).` will give `X=1`.

### Search Tree

```prolog
f(a).
f(b).
g(a).
g(b).
h(b).
k(X):-f(X),g(X),h(X).
```

Asking `?: k(Y).` will:

- Set `Y=X`
- Replace `k(Y).` with `f(X), g(X), h(X)
- Try `X=a`
- `f(a)` succeeds
- `g(a), h(a).`: dead end
- Try `X=b`
- ``f(b),g(b),h(b)` becomes `g(b), h(b)` becomes `h(b)` becomes empty; success
- Get `Y=B`

#### Recursion

For recursive predicates using conjunction, place the non-recursive term first - using DFS, so will run out of memory otherwise.

```prolog
numeral(0).
numeral(succ(X)):-numeral(X).
```

Where `succ(X)` returns `X + 1`: 3 could be defined as `numeral(succ(succ(succ(0)))).` `numeral(X).` will continue going on forever. Beware of running out of memory e.g. `p:-p.`

### Addition

`add(0,X,X).` is the base clause. No return values, so three arguments needed (the last is the return value).

`add(succ(X),Y,succ(Z)):-add(X,Y,Z).` is for the recursive case.

### `Dif` predicate

```prolog
mother(X, Y) :- parent(X, Y), female(X).
sister(X, Y) :- parent(Z, X), parent(Z, Y), female(X).
```

Any female is their own sister so the `dif` predicate is required: append `X \= Y` to the end of the sister body.

### Predicate description - argument mode indicator

Character prepended to argument when describing a functor:

- A `+` argument must be fully instantiated: must be input
- A `-` argument must be unbound: must be an variable
- A `?` argument can be either instantiated or unbound

### Logical quantification

Variables that appear in the head of a rule are universally quantified

Variables that appear only in the body are existentially quantified.

`path(X,Y) :- edge(X,Z), path(Z,Y).`: For **all** nodes `X` and `Y`, there exists a node `Z` such that there is an edge from `X` to `X` and a path from `X` to `Y`

## Lists

A finite sequence of elements e.g. `[[], dead(z), [2, [b, c]], Z, 3]`

Lists as implemented as linked lists. A non-empty list has two parts:

- The head: the first item in the list (type element)
- The tail: everything else (type list)
  - The last element will be a special empty list `[]` - it has neither a head or tail

The `|` operator decomposes a list into a head and tail:

- `[Head|Tail] = [a, b, c, d]` (or vice-versa) sets `Head` to `a` and `Tail` to `[b, c, d]`
- `[X,Y,Z] = [a, b, c, d]` also works, setting `Z` to `[c, d]`
- `[X|Y] = []` fails as the empty list has neither a head or tail.

### Anonymous variables

If you do not need the value of a variable, use `_` - the anonymous variable. Two instances of `_` may not be equal.

### Membership

Is an element a member of a list? Use `member/2`:

```prolog
member(X, [X|_]). % If element is the head, it is in the list
member(X, [_|T]) :- member(X, T). % Else, recurse through the list until it fails
```

`member(X, [a, b, c])` can unify to three separate values.

```prolog
% Exercise: a2b/2; first length all a's and second list all b's; both of the same length

a2b([], []).
a2b([a, L1], [b, L2]) :- a2b(L1, L2).
```

### Append

Append two lists together using `append/3`, where the third argument is the result of concatenating the lists together.

```prolog
append([], L, L).
append([H|L1], L2, [H|L3]) :- append(L1, L2, L3).
% If L3 is result, first elements of L1 and L3 must be the same. Hence, remove the first element from both L1 and L3 until L1 is empty.
```

Concatenating a list is done by traversing down one of the lists; hence, it is inefficient

#### Prefix and Suffix

`prefix(P, L) :- append(P, _, L).` with `prefix(X, [a, b, c])` generating all possible prefix lists of `[a, b, c]`.

`suffix(S, L) :- append(_, S, L)`. with `suffix(X, [a, b, c])` generating all possible suffix lists of `[a, b, c]`.

### Sublist

Sublists are prefixes of suffixes of the list:

`sublist(Sub, List) :- suffix(Suffix, List), prefix(Sub, Suffix).`

### Reversing a list

If given `[H|T]`, reverse the list by reversing `T` and appending the list to `H`.

```prolog
naiveReverse([], []):
naiveReverse([H|T], R) :- naiveReverse(T, RT), append(RT, [H], R).
```

This is inefficient: `append/3` is `O(n)` and this is done at each stage, so it is `O(n^2)`.

By using an *accumulator*, we can improve things:

- The accumulator is a list, initially empty
- Head of the list is prepended to the head of the accumulator
- Repeat until the list is empty

```prolog
% Third argument is an accumulator
accReverse([], L, L). % If list is empty, reversed array is the accumulator
accReverse([H|T], Acc, Rev) :- accReverse(T, [H|Acc], Rev).

reverse(L1, L2) :- accReversse(L1, [], L2).
% append/3 not used
```

```
List          Acc
[a, b, c, d]  []
[b, c, d]     [a]
[c, d]        [b, a]
[d]           [c, b, a]
[]            [d, c, b, a]

```


## Arithmetic and other operators

| C    | Prolog |
| ---- | ------ |
| `<`  | `<`    |
| `<=` | `=<`   |
| `==` | `=:=`  |
| `!=` | `=/=`  |
| `>=` | `>=`   |
| `>`  | `>`    |

These force the left and right hand arguments to be evaluated.

`=` is the unification predicate and `\=` is the negation. `==` is the identity predicate, which succeeds if the arguments are identical. 

`2+2 = 4.` is false as `+(2, 2)` does not unify to `4`. You must use `2+2 =:= 4`.

`!` is the cutback operator - it supresses backtracking. The `fail` predicate always fails. Using these two allows us to invert the result:

`neg(Goal) :- Goal, !, fail.`

If `Goal` unifies, it gets to `!` so can never backtrack. Then it gets to `fail` an fails. If the `!` was not there, it would attempt to evaluate `Goal` again.

As this is so common, there is a built in operator that does this: `\+`.
