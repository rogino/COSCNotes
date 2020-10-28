# Week 9: Basic Machine Learning

Learning: improving behaviour based experience. This could be:

- The range of behaviours increasing
- The accuracy of its tasks increasing
- The speed at which it executes its tasks is faster

Components of a learning problem:

- Task: the behaviour/task being improved e.g. classification
- Data: experiences used to improve the performance of its tasks
- Measure of improvement: a way of measuring the performance/improvement e.g. accuracy of classification

Learning architecture:

- The **learner** is fed experiences/**data** and background knowledge/**bias**
- The model is what does the reasoning/prediction
- The reasoner is fed the problem/task, and outputs an answer/performance

## Supervised Learning

Given the following as input:

- A set of **input attributes**/features/random variables: $X_1, ..., X_n$
- A **target feature** $Y$ (discrete class value or continuous/real value) - what is being predicted
- A set of **training examples**/instances where the value of the input and target variables are given

This is fed to a learning algorithm to build a **predictive model** that takes a new **instance** and returns/predicts the value for the target feature.

For continuous target variables, regression is used

### Measuring performance

Common performance measures:

- $\textrm{error} = \frac{\textrm{number of incorrectly classified instances}}{\textrm{total number of instances}}$
- $\textrm{accuracy} = 1 - \textrm{error} = \frac{\textrm{number of correctly classified instances}}{\textrm{total number of instances}}$

In binary classification problems, one class is called *positive* (*p*) and the other *negative* (*n*).

Common performance measures for regression:

- Mean squared error (MSE): $\frac{1}{n} \cdot \sum_{i=1}^{n}{(Y_i - \hat{Y_i})^2}$
- Mean absolute error

### Training and Test Sets

A set (multi-set) of examples is divided into **training** and **test** examples; this is required as the model can **overfit** the training data, giving high performance on the training data but low performance on unseen data.

The more complex the model is, the lower the error on the *training* data.

A general pattern is that at a certain complexity, increasing the complexity of the model *increases* the error on the test data.

### Naïve Bayes Model

$$
P(C | X_1, ..., X_n) = \alpha \cdot \prod_{i=1}^n{P(X_i | C)} \cdot P(C)
$$

Where:

- Features $X$ are independent given the class variable $C$
- $P(C)$: prior distribution of $C$
- $P(X_i | C)$: likelihood conditional distributions
- $P(C | X_1, ..., X_n)$: posterior distribution

Conditional probabilities can be estimated from labelled data

Find $P(Class | an\_input\_vector)$ for different classes and **pick the class with the highest probability**

Problem: hard to learn $P(Class | Evidence)$ as there needs to be **examples for every possible assignment**. As the number of features increases, the number of assignments grows exponentially.

Thus, **assume input features are conditionally independent** given the class model.

### Example: Building a Classifier

Determine if the patient is susceptible to heart disease (y/n) given family history (t/f), fasting blood sugar level (l/h), BMI (l, n, h)

Model it as $Hist$, $BG$, $BMI$ all having $Class$ as a parent (not the opposite!)

$$
P(Class | Hist, BG, BMI) = \alpha \cdot P(Class) \cdot P(Hist | Class) \cdot P(BG | Class) \cdot P(BMI | Class)
$$

The class can take two values, so there are two tables per feature and two rows for $\frac{Hist}{BG}$ per table (three for $BMI$ as it has three values).

NB: in the quiz, you only store value for when class is true.

To calculate $\alpha$, calculate the sum of $P(Class | Hist, BG, BMI)$ for all values of $Class$, and then take the inverse.

### Laplace Smoothing

Zero counts in small data sets lead to zero probabilities - this is too strong a claim based on only a sample. 

To fix this, add a **non-negative pseudo-count** to the counts - this can **reduce the confidence**

$domain(A)$ is the set of values $A$ can take; $|domain(A)|$ is the number of values $A$ can take

$count(constraints)$ is the number of examples in the dataset that satisfy the given constraints:

- e.g. $count(A=a, B=b)$ is the number of examples in the dataset where $A=a$ and $B=b$
- $count()$ is the number of examples in the dataset

Given these:

$$
P(A=a | B=b) \approx \frac{count(A=a | B=b) + pseudo\_count}{\sum_{a' \in domain(A)}{ count(A=a', B=b) + pseudo\_count }}
$$

This is equivalent to:

$$
P(A=a | B=b) \approx \frac{count(A=a | B=b) + pseudo\_count}{count(B=b) + pseudo\_count \cdot |domain(A)|}
$$

The greater the pseudo-count is, the closer the probabilities will even out (closer to $\frac{1}{|domain(A)|}$)

### Parametric vs Non-Parametric Models

Parametric models described with a set of parameters; learning means finding the optimal values for these parameters.

Non-parametric models are not characterized by parameters - a family of this is called **instance-based learning**:

- Instance-based learning is based on **memorization** of the dataset
- The cost of learning is 0; all the cost is in the computation of the prediction
- It is called **lazy-learning**: learning is put off until it is required

#### *k*-Nearest Neighbours

An example of a instance-based learning algorithm is *k*-nearest neighbours:

- It uses the local neighbourhood to obtain a prediction - the *K* memorized examples most similar to the one being classified is retrieved
- A distance function is used to compare similarity (e.g. Euclidean or Manhattan distance)
- If the distance function is changed, how examples are classified changes

Training only requires storing all the examples

Prediction: $H(x_new)$:

- Let $x_1, ..., x_k$ be the *k* most similar examples to $x_new$
- $h(x_new) = combine\_predictions(x_1, ..., x_k)$; given the *k* nearest neighbours to $x_new$, calculate which value it should have

If *k* is too high, it will be under-fit.

Geometrically, each data point $x$ defines a 'cell' of space where any point within that space has $x$ as the closest point to it. As the target feature is discrete, decision boundaries can be made where the class is different on each side of the boundary.