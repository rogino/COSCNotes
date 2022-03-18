# Labs

## Lab 01

### Algorithms

#### Thresholding

Binarization of images depending on brightness.

[OpenCV](https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html) has a few types of thresholding.

Simper/basic thresholding uses a single, global threshold for binarization.

Adaptive thresholding uses the surrounding pixels to find some 'average' value of the neighboring pixels (some square centered around the target pixel), then subtracts some constant $c$ to calculate the threshold, which is then compared to the pixel value. The 'average' is either the mean or a Guassian-weighted sum.

#### Morphology

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

#### Misc.

- Contour tracing:
  - https://theailearner.com/2019/11/19/suzukis-contour-tracing-algorithm-opencv-python/
  - https://learnopencv.com/contour-detection-using-opencv-python-c/
- Frame difference:
  - With three frames (and hence additional latency): `(frame1 ^ frame2) & (frame2 ^ frame3)`
  - Called the *double-difference* algorithm; reduces ghosting compared to a standard difference
  - Three frames allows ghosting to be minimized
  - Foreground aperture: if object moving smaller, there will be overlap between two frames, leading to there being no difference in the center of the object
  - If you have absolute control of lighting, background subtraction will be much better

## Lab 02

Kalman filter:

- https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python
- Combine noisy measurements to get better estimate of real state
- Unscented Kalman filter: for highly non-linear state transitions

Blob detector:

- Threshold: binarize image with global threshold with values between min and max, incremented by some value
- Grouping: connected pixels grouped together within each image to form blobs
- Merging: centers of blobs computed, blobs between images merged together if closer than threshold
- Estimate final centers
- Filter blobs by:
  - Color: color of the blob
  - Area: blob area between min and max
  - Circularity: how 'circular' they are (ratio of area to perimeter squared). 1 means perfect circle
  - Convexity: ratio of area to the area of its convex hull. 1 means completely convex
  - Inertia ratio: think moment of inertia. Circle has smallest inertia for a given area (1), a line has the greatest (0)
between images

Lucas-Kanade Optical Flow:

- Detecting the velocity of features between frames
- Assumes that the pixel intensities of an object do not change between frames, and that neighboring pixels have similar motion. Falls apart when lighting (or background) changes.

https://docs.opencv.org/4.5.0/d4/dee/tutorial_optical_flow.html

## Lab 03

Tesseract OCR:

- From HP in the 80s and 90s, picked up by Google since open sourcing in 2005
- Can detect characters from multiple languages, or simply return bounding boxes of characters
- Requires clean, binarized image

Open3D:

- Point cloud visualization
- Point clouds noisy; to filter out outliers, find nearest n neighbors and eliminate points where the mean distance is greater than some threshold
- Segmentation:
  - Detect shapes within point clouds
  - Filter out points outside some range
  - Fit points to primitive shapes (e.g. planes, cylinders) using RANSAC (RANdom SAmple Consensus)
    - Randomly pick a few data points and create a model that matches the primitive (e.g. for plane, pick three points, generate equation for the plane)
    - Find what points are consistent with the model
      - Outliers are further away than some error threshold
    - Repeat until you get a model with few outliers
    - Using all non-outlier points, generate a new model
