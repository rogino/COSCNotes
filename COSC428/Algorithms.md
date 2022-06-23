Histogram of oriented gradients (HOG):

- Within each region, determine gradient directions for each pixel
  - Normalize gradient strength locally (between neighboring regions)
- Create histogram of gradients for each region
  - Pixel votes weighted by gradient magnitude
- Combine histograms from all regions together to create feature vector
- Somewhat lighting invariant, but not rotation invariant
- Useful in face detection

Support vector machine (SVM):

- Binary classifier
- Determines the hyperplane(s) that leads to the greatest separation between the two classes
  - Two parallel hyperplanes, each touching the closest element (the support vector) from one of the classes
- For non-linear classification, can transform data into a higher-dimensional feature space

Frame difference:

- Background subtraction: subtract clean plate from image
- Difference: use previous frame as 'clean' plate
- Double difference: take difference of the previous and current, then of the current and next: bitwise AND the two differences together
- Ghosting: artifact due to moving object being in clean plate
- Foreground aperture: hole appearing in moving object

Lucas-Kanade optical flow:

- Track motion of key points between two frames

Convolutional pose machine:

- Belief maps: belief that each pixel is a particular body joint
- One map for each joint, plus one background class
- NN gets belief maps from previous frame + image as input: each layer refines estimates for joint locations

Unscented Kalman filter:

- Use unscented transform so that it performs well with non-linear systems

Otsu's method:

- Binary thresholding which minimizes intra-class variance (globally)

MeanShift segmentation of depth image:

- Locates the centers of blobs in images
- Iterative algorithm: at each point, calculate mean within some window and move towards it
  - Can be weighted with Gaussian to reduce strength of points near the edge of the window

Suzuki(-Abe) contur detection algorithm:

- Contour tracing algorithm that outputs hierarchy (boxes in boxes)

Hu moment invariants:

- 7 values that are constant for a given shape; 6 invariant to translation/size/rotation
- Used in shape matching (e.g. for contours)

(Ramer-)Douglas-Peucker:

- Given curve made up of line segments, find a similar curve with fewer points
- Extract straight line from contour? Convert contour to rectangle?

Template matching:

- Match input against some template
- Just sum pixel differences, translating to find best match?
- Not rotation/scale invariant
- Normalized correlation coefficient?

Haar Cascade Classifier/Viola-Jones face detection:

- Use changes in brightness
  - Kernel with weights of 1 or -1, represented as black and white image made up of rectangles
  - Each feature: some kernel applied some specific coordinate in a window
- Use Adaboost to select best feature
- For efficiency, create cascade of classifiers:
  - If window fails one stage, do not run features in the subsequent stages
  - First few stages have few features
- Very fast facial recognition
- Prome to false-positives

CSRT (Channel and Spatial Reliability Tracking)

Shi-Tomasi:

- Variant of Harris corner detector; changes scoring function

Fitzgibbon ellipse fitting:

- Determines parameters for a best-fit (least squares) ellipse for a group of points

Segmentation with convolutional autoencoder (U-net)

Watershed:

- Segment images
- Some parameter is treated as height; watersheds separate basins
  - Could be brightness
  - Could be euclidean distance to background
- Add water to lowest points in image
- Slowly fill up basins; when two basins merge, build a barrier (i.e. segment objects)

Sharpen kernel

Intersection over union:

- Areas for ground truth and predicting bounding boxes

Moving average filter

Fast fourier transform to extract power spectral density

K-means/linear classifier

R-CNN:

- Object detection: outputs bounding boxes
- Region-based CNN
  - Extract region proposals: regions that may contain object
  - Resize proposed areas, pass to CNN to extract feature vector
  - Pass to linear SVMs (one per class)

Mask R-CNN:

- Instance segmentation: outputs precise mask

Maximally Stable Extremal Regions (MSER):

- Areas with almost uniform intensity, surrounding by a contrasting background
- Try multiple thresholds
  - Binary threshold by brightness?
  - MSER are those that show the least change in size across thresholds

Gaussian background subtraction/modeling

- Extract background from video
- Gaussian mixture modeling: weighted sum of two Gaussian to get multiple peaks
- Model intensity of pixels (over time) as mix of Gaussian
  - Take mean from the most-weighted distribution to get the background

Moore-Penrose pseudoinverse:

- Best fit (least squares) solution inverse matrix where one does not exist
- Has some properties of the inverse

Singular value decomposition (SVD):

- Decompose matrix into component matrices (e.g. for transform, decompose into position, rotation, translation)

Softmax activation
Catagorical cross-entropy
Adam optimizer

Contrast-Limited Adaptive Histogram Equalization (CLAHE):

- HE: use global histogram to transform pixels such that contrast is increased
- AHE: each pixel's transformation function derived from its neighborhood
  - Adds artifacts in smooth regions of an image
- CLAHE: limits contrast amplification by clipping histogram before computing transform function
  - Redistribute clipped area evenly across the entire brightness range

Illumination equalization:

- TODO

Histogram back-projection:

- Create histogram of some object
- On target image, transform each pixel to the probability of the pixel appearing in the histogram
- Threshold

ORB keypoint detection:

- SIFT, but not patented
- FAST:
  - Select center pixel
  - Sample 16 pixels forming circle centered around the circle
  - Point is corner is more than $n$ contiguous pixels in circle all brighter than center pixel + threshold
    - Or lighter
  - Non-maximum suppression:
    - If neighbors are also feature points
    - Compute score: sum of absolute difference between center and the sampled points
    - Discard feature point with the lowest score
  - No orientation/scale invariance
- Use Harris to find the best points returned by FAST
- Use image pyramid to get multiscale features
- BRIEF descriptor:
  - Converts keypoints into binary vector that represents an object
  - rBRIEF used for rotation invariance

FLANN keypoint matching:

- Hamming distance (1s left after XORing) used for BRIEF
- Distance ratio test: distance between two nearest matches of a keypoint
  - Close to 1 = almost identical distance => likely to be a false positive

Simultaneous localization and mapping (SLAM):

- Structure from Motion (SfM): usually not real-time
- Loop closure: once algorithm identifies it has returned to a point, must update the model with the information
  - e.g. Deforming points, with uncertainty and hence allowed deformation increasing over time

RANSAC 5-point: generate essential matrix

Contour filling: identify contours to determine board outline
Green's theorem



Template matching:

- Dead simple algorithm: slide some template image across the entire target image
- Sum difference in pixel intensities between template/target image
- Find the position that results in the lowest difference
- Not scale/rotation invariant

Region of interest
Gradient orientation pattern (eye tracking)


Ensemble of regression trees:

- Decision trees: prone to overfitting (leaf node for every data point in training set), greedy, do not work well with imbalanced classes
  - For each split, choose the one that leads to the greatest accuracy/least cost
- Regression tree: outputs continuous variable rather than class
- Ensemble: combine outputs of multiple algorithms to improve performance

Cross entropy loss function:

- Entropy for discrete probability distribution: $-\sum_{i=1}^{n}{P(x_i) \log{P(x_i)}}$
- Cross entropy: encoding data from distribution $P$ (underlying probability/ground truth) modeled with distribution $Q$ (estimate/model)
  - $-\sum_{i=1}^{n}{P(x_i) \log{Q(x_i)}}$
- Training set: probability of class labels known

Stochastic gradient descent:

- When calculating cost and hence gradient, only take a random sample rather than the entire data set

