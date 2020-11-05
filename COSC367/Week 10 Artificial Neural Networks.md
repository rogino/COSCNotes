# Week 10: Artificial Neural Networks

## Perceptron

A neuron receives signals from multiple inputs (inputs are weighted), and if the overall signal is above a threshold, the neural fires. A perceptron models this with:

- Inputs $x_1, ..., x_n$
- Parameters (weights) $w_1, ..., w_n$, and $bias$
- Output (activation function): $g(a)$

$$
a = \sum_{i = 1}^{n}{w_i\cdot x_i} + bias
$$

Sometimes, bias is represented as another weight $w_0$ - in this case, there is a virtual input $x_0 = 1$ and hence:

$$
a = \sum_{i = 0}^{n}{w_i\cdot x_i}
$$

For this course, $g(a) = 1$ if $a \ge 0$ and $0$ otherwise; a Heaviside (step) function.

A perceptron can be seen as a predicate: given a vector $x$, $f(x) = 1$ if the predicate over $x$ is true, and 0 otherwise. Hence, it can be used in decision making and binary classification problems ($f(x) = 1$ if in the positive class).

The function partitions the input space into two sections: if there are two inputs, the **decision boundary** will be a straight line: $w_1$ and $w_2$ determine the gradient and $w_0$ determines the intercept. For a given value of these weights, the decision boundary can be found (e.g. points where $x_1$ or $x_2$ equal zero).

If there are three inputs, the decision boundary is a plane. For *n* dimensions, it will be a *hyperplane*.

The vector, $\underline{w}$ (without $w_0$), can be thought of as the normal to the line. The minimum distance between the origin and the decision boundary is $\frac{w_0}{||\underline{w}||}$.

$\underline{w}$ can be used to show which side of the hyper-plane will be classified as positive (the direction it points in will be positive).

### Learning

Given a data set - a collection of training vectors of the form $(x_1, ..., x_n, t)$ where $t$ is the target value:

- Randomly initialize the weights and bias

- While there are mis-classifications and the **number of iterations is less than the maximum number of epochs**:

  - For each training example, classify the example. If it is misclassified, then update the weights, where:
    - $\eta$ is the learning rate
    - $x_j$ is the value for input
    - $t$ is the actual output
    - $y$ is the current prediction (perceptron output):
  - Update the weights/bias using:
    - $w_j \leftarrow w_{j} + \eta \cdot x_j(t - y)$
    - $bias \leftarrow bias + \eta(t-y)$ (the same equation can be used for bias as above if it is represented as a virtual input)

If examples are linearly separable, the weights and bias will, in finite time, converge to values that produce a perfect separation.

 If $\eta$, the learning rate is too high, the boundary may oscillate back and never perfectly partition the values. If it is too small, it will take a long time to converge.

## Multi-Layer Perceptrons

### Motivation

```
y
^
|
| false    true
|
| true     false
|-----------------> x
```

A single perceptron cannot partition these four points into a decision boundary. However, this can be done with multi-layer perceptrons.

Define two perceptrons, $P_1$ and $P_2$ which receive the same vectors but have their own weights and biases. By some algorithm, $P_1$ could partition the input space so that the upper left is separated from the rest of the points, and $P_2$ the same for the the bottom right.

```
y          P_1            y   P_2
^                        ^
|          -----------   |
| false(0) | true(1)     | false(1)  true(1)
|----------              |         -----------
| true(1)    false(1)    | true(1) | false(0)
|-------------------> x  |--------------------> x
```

Now, pass the *output of the perceptrons as input to another perceptron* $P_3$:

```
P2        P_3
^
| --------
| (0, 1)  |  (1, 1) <- two points superimposed
|         ----------
|           (1, 0)  |
|---------------------> P1
```

Now, this perceptron can form a decision boundary that correctly partitions the input space.

### Description

The **feed-forward** networks we are dealing with arranges perceptrons into layers where:

- Adjacent layers are fully connected: all outputs from one layer are used as inputs for each perceptron in the next layer
- There are no backwards connections (DAG)
- Layers are not skipped

Some notes:

- The first layer contains only input nodes
  - Hence, the number of input nodes is the number of inputs in the problem domain
- The last layer is called the output layer
- A network with only one layer is an **identify function**
- Weights and biases are *between* layers
  - Between layer $i$ and $i+1$:
    - The number of weights is $nodesInLayer(i) \cdot nodesInLayer(i + 1)$
    - The number of biases is $nodesInLayer(i + 1)$.
- Layers between the input and output are called **hidden layers**

As more layers/neurons are added, the complexity of the boundary shape(s) can increase. If you have two dimensions:

- With 2 layers (one perceptron - the first layer contains the input nodes), a straight line can be formed
- With 3 layers, any polygon can be formed
  - The number of perceptrons in the hidden layer determines the number of sides of the polygon
  - If are two perceptrons, not a polygon but two intersecting lines
- With 4 layers, multiple polygons can be formed
  - Polygons within polygons etc.

### Multi-class Classification

This can be done by having multiple numeric outputs and picking the node with the largest value.

Outputting numeric values instead of a Boolean requires the **Sigmoid function**:$g(a) = \frac{1}{1 + e^{-a}}$. This function is differentiable at all points and handles uncertainty.

### Error Function

The mean squared error is typically used, where $t_i$ is the desired output (according to the training data), $y_i$ is the output of the network, and $n$ is the number of examples in the training set:

$$
E=\sum_{i=1}^{n}{(t_i - y_i)^2}
$$

The weights can be updated incrementally:

$$
W \leftarrow \textrm W - \eta \nabla E(W)
$$

$\nabla E(W)$ is the gradient of the error; a vector of partial derivatives (derivatives for each input scalar given all other inputs are fixed). The gradient in the output layer is easy to compute, but in the hidden layer neurons can influence multiple other neurons, so back-propagation is needed (not covered).

### Typical Architecture

The number of input nodes is determined by the number of attributes and the number of outputs is determined by the number of classes. A single hidden layer is enough for many classification tasks.

Guidelines:

- Use as few hidden layers/nodes as possible
  - Forces better generalization
  - Fewer weights need to be found, reducing training time and cost
  - Too many nodes may lead to overfitting
- For the hidden layer
  - Make a guess at how many nodes you need - a number between the number of input and output nodes
  - If unsuccessful, increase the number of nodes
  - Is successful, reduce the number of nodes to force better generalization