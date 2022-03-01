# Lab 01

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

### Thresholding

Binarization of images depending on brightness.

[OpenCV](https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html) has a few types of thresholding.

Simpe/basic thresholding uses a single, global threshold for binarization.

Adaptive thresholding uses the surrounding pixels to find some 'average' value of the neighboring pixels (some square centered around the target pixel), then subtracts some constant $c$ to calculate the threshold, which is then compared to the pixel value. The 'average' is either the mean or a Guassian-weighted sum.

### Morphology

[Basic operators](https://en.wikipedia.org/wiki/Mathematical_morphology#Basic_operators):

- Dilation:
  - Result: objects get larger
  - AND two matrices together
    - Values must be 0 or 1
    - If one is smaller than the other, treat the pixels outside them as being zero
  - Repeat for every possible translation
  - OR results: if the value of the pixel is one in any translation, set the value to one
- Erosion:
  - Result: objects get smaller
  - In the larger matrix, pick a pixel
  - For every translation of the smaller matrix which overlaps with the selected pixel, both matrices must have a value of one
- Opening
  - Result: smooths the images and narrows lines
  - Erode by the smaller matrix, then dilate the result by the smaller matrix
- Closing:
  - Result: fills gaps and holes
  - Dilate by the smaller matrix, then erode the result by the smaller matrix

### Misc.

- Contour tracing:
  - https://theailearner.com/2019/11/19/suzukis-contour-tracing-algorithm-opencv-python/
  - https://learnopencv.com/contour-detection-using-opencv-python-c/
- Frame difference:
  - With three frames (and hence additional latency): `(frame1 ^ frame2) & (frame2 ^ frame3)`
  - Three frames allows ghosting to be minimized
