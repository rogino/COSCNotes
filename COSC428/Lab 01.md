# Lab 01.md

## Algorithms

### [Canny Edge Detection](https://docs.opencv.org/3.4/da/d22/tutorial_py_canny.html):

Steps:

- Gaussian blur: reduce noise
- Use Sobel kernel to find gradient in x and y direction
- Find gradient magnitude and direction (rounded to 45 degree increments)
- Non-maximum suppression/edge thinning: zero if magnitude not a maximum compared to neighbours in the relevant direction
- Hysteresis thresholding:
  - Any pixel whose magnitude is larger  than some threshold is kept
  - Any pixel whose magnitude is smaller than some threshold is removed
  - Any pixel in between the thresholds is kept if it is connected to a remaining pixel

### [Hough Line Transform](https://docs.opencv.org/3.4/d9/db0/tutorial_hough_lines.html)

Finds straight lines from binary image (e.g. output of Canny algorithm).

Steps:

- Hough space: $x$-$y$ coordinate space to $r$-$\theta$ space:
  - $r$ is the shortest distance of the line to the origin
  - $\theta$ is the angle of the line
  - $y = mx + c$ transformed to $r = x \cos{\theta} + y \sin{\theta}$
- For each point (that is part of an edge) and for every angle, find $r$ and increment the value in the Hough space by one
- The points with the largest values are straight lines

Hough circle transform: same, except using the $x$-$y$-$r$ space.


