## Computer Vision

Challenges:

- **Sensory gap**: limitations of the recording in capturing reality
- **Semantic gap**: lack of contextual knowledge about a scene

### 02. Perception and Color

Eye:

- 400-700 nm
- Very high dynamic range: approx. $10^8:1$
- Spatial resolution: approx. 1-3 cm at 20 m
- ~100 million rods: can be excited by a single photon
- ~170 degree FoV per eye
- ~6.4 million cones, mostly around fovea

Color spaces:

- CIE:
  - Perceptually uniform color space: any change of a given distance in the color space leads to the same perceptual difference in color, regardless of initial color

### 03. Cameras

Camera calibration:

- Intrinsic:
  - Scaling: pixel to world (defined by focal length and pixel size)
  - Translation: sensor center != lens center
  - Skew: X and Y axes not perpendicular (non-issue)
- Extrinsic:
  - World translation/rotation relative to optical center

### 04. Filters

- Convolution: filter where the output value of each pixel is linear combination of its neighbors multiplied by a *kernel*
  - Unsharp mask: `conv(img, [0, 2, 0]) - conv(img, [1/3, 1/3, 1/3])`
    - Overall magnitude remains the same
    - Second kernel acts as blur filter: low-pass filter
    - All frequencies magnified, then only low-frequency information subtracted
    - Approximates the Laplacian of Gaussian
- Fourier filters:
  - Fourier transform:
    - Brightness = magnitude of image frequency
    - Position = vertical/horizontal components of the frequency
      - At center of the image, frequency is 0
    - (Phase can be mostly ignored)
    - Input image is tiled to infinity:
     - This may cause discontinuities to occur at the edges
     - Can be reduced by fading the image to grey near the edges
   - Low-pass filter: apply circular mask to the Fourier transform (black outside the circle) then apply inverse Fourier transform
     - Invert the mask to get a high-pass filter

## 05. Edge Detection

Edge detection:

- Edge/edge point: points of sharp change (local maxima in 1st derivative: 2nd derivative = 0)
- Edgel: linear edge segments
- Edges occur from:
  - Surface-normal discontinuities e.g. from shading)
  - Depth discontinuities
  - Surface color discontinuities
  - Illumination discontinuities
- Image gradient: points in direction of greatest change
- Optimal edge detection algorithm:
  - Good detection: responds to edges, not noise
  - Good localization: detected edge is close to the true edge
  - Single edge: one edge detected per true edge
  - Optimal ~= derivative of Gaussian

Sobel:

- Approximation for gradient in discrete space
- See also: Robert's cross, Prewitt operators
- Two operators, each giving horizontal and vertical gradient
  - Must apply Gaussian filter before gradient operator to reduce noise
  - Can apply gradient operator *to the Gaussian kernel* for efficiency

Canny edge detection:

  - Gaussian blur
  - Sobel
    - Non-maximum suppression/edge thinning:
      - Zero the pixel value if magnitude is not a maximum compared to neighbors in the direction of the gradient
  - Hysteresis thresholding:
    - Always keep if above high threshold
    - Always remove if below low threshold
    - If between, keep if connected to a remaining pixel

Scale space:

- Resize image/apply Gaussian smoothing at multiple scales
- Join edges -- 1st derivative minima/maxima -- between scales
- Edge positions may shift
- Edges may merge as scale ($\sigma$, Gaussian radius) increases
  - Edges will never split with increasing scale

Hough line transform:

- Convert to $r-\theta$ space: $\theta$ is line angle, $r$ is closest distance to origin
- Each edge pixel votes for all lines it an be part of
- Points with the votes correspond to a high confidence in there being a straight line
- Hough circle: 3 parameters for center and radius

Harris corner detection:

- Create symmetric 2x2 matrix of derivatives summed over a small window
- $$
  M = \sum_{x, y} \begin{bmatrix}
  \left(I_x\right)^2  & I_xI_y \\
  I_xI_y              & \left(I_y\right)^2
  \end{bmatrix}
  $$
- Find eigenvalues: corners occur when both values are large

### 06. Local Features

Window matching:

- Stereo cameras: assumes cameras co-planar and aligned such that rows match up between cameras
- Correspondence:
  - Sum of squared difference (SSD): sum the squared difference between the left and right images for all pixels in a square window
    - Repeat for each center pixel and for varying horizontal offsets
  - Normalize: pixel brightness within each window
    - Even if the same model cameras are used, there are per-unit gain/sensitivity differences
  - Vectorization: convert the window from a 2D matrix window to a vector by joining rows together
    - Can use either angle or normalized SSD

Local features:

- Aperture problem: given 1D line, without being able to see end-points, cannot determine direction of motion
- Optical flow, brightness change constraint equation (BCCE):
  - $\nabla I \cdot \vec{U} = 0$, where $\nabla I$ are the partial derivatives for brightness for a given pixel in three dimensions ($x$, $y$, and $t$), and $\vec{U}$ is the velocity of the point being tracked
  - Assume that brightness for a given point does not change over time

Lucas-Kanade:

- Assumes the same velocity for all pixels within an image patch
- For each pixel in the patch, square the error, and then take the sum
- Use vector magic to determine the velocity of the patch that minimizes the error
- Good features:
  - Constant brightness
  - Sufficiently textured
  - Real (e.g. not a shadow)
  - Does not deform

Harris detector:

- Captures the structure of the local neighborhood
- Use eigenvalues of output matrix:
  - 2 strong eigenvalues: interesting point
  - 1 strong eigenvalue: contour
  - 0 eigenvalue: uniform regions
  - Scoring function: $\lambda_1 \lambda_2 - k(\lambda_1 - \lambda_2)^2$ where $k$ is some constant
- Shi-Tomasi:
  - Modifies scoring function to $\min(\lambda_1, \lambda_2)$

Feature distortion:

- Need to model distortion for detection to work in practice:
  - Affine transforms:
    - Parallel lines preserved
    - $u(x, y) = a_1 + a_2x + a_3y$
    - $v(x, y) = a_4 + a_5x + a_6y$
    - Six parameters, min. six pixels per window
    - Pass into BCCE and minimize error

Scale-invariant local features (SIFT):

- Invariant to translation, rotation, scale etc.
- Scale:
  - Gaussian pyramid
    - Blur then halve the dimensions (one octave)
    - Compute Difference of Gaussian (DoG): difference between neighboring Gaussian layers
      - Approximation of Laplacian of Gaussian
    - Compare pixel against 8 neighbors in same scale, plus against 9 neighbors in the DoG one octave above/below: use as keypoint if a minimum/maximum across all 26 neighbors
- Rotation:
  - Create histogram of local (i.e. neighbor pixel) gradient directions; each bin covers 10 degrees
  - Canonical orientation = peak of histogram
- Descriptor:
  - 16x16 region around keypoint
  - Rotate region to match canonical orientation
  - Create orientation histograms on 4x4 pixel neighborhoods; 8 bins/orientations each
  - Hence 16 neighborhoods with 8 bins each: 128 element vector

### 07: Morphology

Operations:

- Erosion:
  - Shrink object
  - Structuring element placed centered around every pixel: remove if any pixel of the structuring element overlaps with a non-object pixel
- Dilation:
  - Expand object
  - Keep any pixels covered by the structuring element when placed at at least one location
- Closing:
  - Fills gaps and holes while preserving the object size (for large objects)
  - Dilate, then erode
- Opening: 
  - Smooth images, narrows lines while preserving the object size (for large objects)
  - Erode, then dilate

### 08: Tracking

Kalman filter:

- Combine noisy measurements with predictions of state change
- Assumes linear dynamics + Gaussian noise
  - Unscented Kalman: non-linear dynamics
  - Gaussian distributions easy to represent: just need mean + covariance
- Smoothing:
  - Rauch–Tung–Striebe
  - Run one filter moving backwards in time
  - Treat filter prediction as measurement for the forwards filter
  - Batch mode: requires all data (at least within some interval) before processing can begin
  - TODO how does this work?
- Prediction: for each tick, estimate of next state must add noise
- Data association: create model from current input
- Correction: merge prediction with model from current state

Particle filter:

- Predicts multiple-positions
- Can work with multi-modal and non-Gaussian distributions
- Generate a bunch of particles representing the state of the system randomly
  - Tick: predict the next state of the particles given the model dynamics, adding noise
  - Measurement(s): update particle weights
    - How likely is it that the current observation was generated given the state represented by the particle?
    - Normalize: weights sum to 1
  - Resample: discard improbable particles and duplicate the likely ones

### 10. 3D Reconstruction

RANSAC/Structure from Motion (SfM):

- Homography $H$: relative pose of two cameras viewing planar scene (e.g. from airplane)
  - Could be one camera moving with images taken at two different points in time
- Essential matrix $E$: relative pose of two cameras viewing 3D scene
- Bundle adjustment (BA): for set of images of a scene, estimate a set of 3D points and camera positions that minimizes re-projection error

Steps:

- Camera calibration: normalize locations
- Feature matching
  - Find suitable features
    - Should be
      - Repeatable: visible in every image
      - Localizable: actual 3D point (e.g. not shadow, not intersection of two objects from PoV of camera)
    - Should be resistant to:
      - Rotation
        - Skew = rotation
      - Translation
        - Z translation = scale change
      - Illumination
      - Blur
      - Non-rigid deformations (e.g. radial distortion, stretching/warping)
      - Noise
      - Partial occlusion
      - Camera gain changes
  - Match points between two images
    - SIFT, SURF etc.
    - Will get many incorrect matches
- 2-view reconstruction
  - More parameters than stereo: translation not parallel to plane, angle can change etc.
  - Need at least 8 matched points to compute $E$
- Planar scenes:
  - Homography matrix can be represented by:
    - Relative camera orientation
    - Translation
    - Plane normal
    - Distance to plane
  - $Hx = x'$, where $x$ is the position of the point on the plane and $x'$ is the transform onto the camera plane
  - Estimate $H$ given a number of matched features
  - Can use $H$ to determine transform that warps one image to another; can also use this to determine error
- RANSAC:
  - Random sample consensus
    - Fits data contaminated with gross outliers to a model
  - Steps:
    - Randomly choose minimum number of points required to generate model
    - Compute model from the set
    - Test how many data points are inliers: repeat previous steps until there are enough
    - Generate a new model that fits all inliers
- N-view reconstruction
  - Requires bundle adjustment (BA)
  - For each point, determine reprojection error: delta between projected position (of 3D point) and measured position (on camera plane)
  - Find the set of positions and points that minimizes projection error
  - Non-linear gradient descent: determine gradient of total error for a given set of 3D points and camera positions, and adjust then to go downhill

### 11: Deep Learning

Neural networks:

- Attempts to minimize value of loss function (or maximize value of objective function)
- Fully-connected neural networks:
  - Image dimensionality too large: spatial information lost when flattening matrix into vector, and translating an image by a pixel leads large changes to input
  - A lot of data required: at high dimensions, data becomes sparse
- Exploit some properties to avoid this issue:
  - Invariance: transforming inputs without modifying output
  - Equivariance: transforming inputs leads to a predictable transform in output
  - Transforms (e.g. translating, scaling, rotating) usually do not change the semantics of the content (and hence their class label)
  - Can use convolutions (CNNs)
    - Mixture of:
      - Convolutional layers: kernels that convolve a small window of an image (but for all channels)
        - Local connectivity: neurons connections are local in space (image x-y axes, but not depth/image channels)
        - Parameter sharing: share parameters across all kernels in a layer - may not make sense for some applications e.g. face recognition
      - Pooling stage: down-sampling
        - Max-pooling: partition image into rectangles; for each sub-region, output the rectangle with the maximum value
      - Non-linear stage
        - ReLU: rectified linear unit
          - `max(0, x)`
          - Introduces non-linearity
        - May use other functions, but alternatives are often much more computationally inefficient
      - Fully-connected layer: standard neural network architecture at the end of the network

Visual recognition:

- Classification - if image belongs to class
- Segmentation (dense/semantic) - classifying each pixel
- Object detection: classification + localization (bounding box)
- Instance segmentation: classification + localization + segmentation (precise mask)
- Keypoint detection (e.g. joints in hand)
- Panoptic segmentation (both dense and instance segmentation) e.g. 'grass'

ML learning types:

- Supervised
  - Labeled data set
  - e.g. image classification
- Weakly-supervised
  - Labels are weak e.g. noisy, limited, imprecise
  - e.g. labels but no box bounds for an object detector
- Semi-supervised
  - Small amount of labeled data, but mostly unlabeled
  - YOLOv5 to get bounding box
  - For outlining:
    - Gaussian
    - Morphology: close
    - Morphology: gradient (difference of dilation and erosion)
    - Thresholding: Otsu
  - Train on labelled data
  - Use model to classify data - create *psuedo-labels*
  - Use the data with the most confidence in pseudo-labels as training data
  - Repeat
  - e.g. train on labeled, use model to asign labels, then re-train on all data
- Unsupervised:
  - Find patterns, differences, clusters etc.
- Self-supervised:
  - Solutions can be verified using known properties of the dataset: allows loss-function to be written and act as a supervisor
  - e.g. use auxiliary task like image completion to learn mapping from image to feature vector; then use as similarity metric to compare images
  - e.g. Dense stereo warps image from one camera onto the other; can be used to determine similarity and hence error
  - e.g. SLAM: geometric consistency; reduce number of badly matched keypoints
