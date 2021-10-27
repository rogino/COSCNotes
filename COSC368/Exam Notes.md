# COSC368 Exam Notes

Pillars of usability:

- Learnability: users rapidly attain some level of performance
- Efficiency: users can get a lot of work done per unit time
  - Often, more learnable = lower efficiency ceiling
- Subjective satisfaction: users enjoy using the software

HCI should aim for simplicity; aim to make the UI match the complexity of the domain.

Don Norman's Model of Interaction:

```
               constructs
   Designer/ -------------> System/system image
designer model                ^
                    Provides  | Provides input based on
                    feedback/ | their prediction of how
                     output   |  to achieve their goal 
                              v
                             User/
                          user model
```

Designer model:

- Conception of how the interface works
- May be fuzzy and not fully defined
- May be compromised in the actual system

User model:

- User's conception of how the system works
- Initially based on previous experiences with similar systems
- Grows with use and feedback from the system

System Image:

- How the system *appears* that it should be used to the user
- The system is the actual hardware or the software

Execute-Evaluate Cycle:

- Execute:
  - User has goal and forms an *intention* to complete the goal
  - Intention translated to multiple *actions* in the language of the user interface
  - The user *executes* the actions
  - Gulf of Execution: problems executing intention/action
- Evaluate:
  - User *perceives* response from the system
  - User *interprets* the response
  - User *evaluates* the response with respect to their goal and expectations
  - Gulf of Evaluation: problems assessing the system's state, determining its effect

UISO:

- Task is a low-level task (e.g. save file as PDF)
- Articulation: user task language -> system input language
- Performance: system acting on the user input
- Presentation: system updates it's state (and visible state)
- Observation: user views and interprets the new visible state

Mappings:

- **Affordances**:
  - How it looks and how it works are similar
  - e.g. door handles affords pulling, plate affords pushing
- **Over/Under-determined dialogues**:
  - Under-determined: gulf of execution (e.g. CLI)
  - Over-determined: forced through lengthy, unnatural or unnecessary steps (e.g. wizards)
- **Direct Manipulation**
  - Rapid, incremental, reversible actions
    - Encourage exploration
  - Syntactic correctness: disable illegal actions
  - Fast to learn but not always the most efficient
  - Requires more screen space and system resources

Humans Input:

- Eyes:
  - Sensitive to movement
  - Fixations: when eye stationary
  - Saccades: rapid eye movements; blind
  - Smooth-pursuit: tracking moving objects
  - Reading speed reduced by all caps
- Auditory:
  - 20 Hz to 15-20 kHz
  - Filtering (e.g. cocktail party effect)
- Haptics:
  - Proprioception: sense of limb location (mostly unconscious)
  - Kinaesthesia: sense of limb movement
  - Tactition: skin sensations

Human output:

- Response time: ~200 ms for visual, ~150 for auditory, ~700 for haptics
- Isotonic: muscle contractions that yield movements (e.g. moving mouse)
- Isometric: no movements (e.g. holding weight steady)

Fitt's Law

- $A$ is amplitude/distance of movement
- $W$ is width of target
- Index of Difficulty $\mathrm{ID} = log_2{A/W} + 1$
- Movement Time $\mathrm{MT} = a + b \cdot \mathrm{ID}$
  - $1/b$ called throughput/bandwidth

Steering Law:

- Steering a mouse cursor across a path/tunnel of width $W$ and length $A$
- $\mathrm{MT} = a + b \cdot \frac{A}{W}$

Hick/Hyman Law of Decision Time:

- Visual search time usually $T = a + bn$ ($O(n)$)
- Hick/Hyman models reaction time when **optimally prepared** (i.e. expert with a spatially stable UI)
- $T = a + bH$ where $H = \sum_i^n{p_i log_2 \left(\frac{1}{p_i}\right)}$
- For $n$ equally probable items, decision time is $O(log{n})$

Power Law of Practice:

- $\text{Trial}_n = \text{Trial}_0 \cdot n^{-\alpha}$
- $\alpha$ is learning curve
- Applies to both simple and complex tasks

Novice to Expert:

- Stagnation at some point:
  - Satisficing: good enough
    - And performance dip when switching to a new mode
  - Lack of mnemonics
  - Lack of visibility
- Supporting transitions:
  - Intra-modal: guidance to help user move towards the ceiling of performance within a mode
  - Inter-modal: make user aware of existence of different, faster modes
  - Vocab expansion: make user aware of most common commands
  - Task strategy: intelligent UIs that figure out what the user is trying to do and suggests more efficient strategies to achieve it

Human Memory:

- Short-term:
  - $7 \pm 2$ 'chunks'
  - Fast access: ~70 ms
  - Rapid decay: ~200 ms
    - Maintenance rehearsal: repeat chunk a few times to prevent decay
    - Displacement/interference decay
- Long-term:
  - Short-term -> long-term through elaborative rehearsal + extensive repetition
  - Slow access: > 100 ms
  - Good at recognition but non recall
  - Spatial processing

Slips:

- Mistake is a conscious decision; bad user model
- Slip is automatic behavior:
  - Capture error:
    - Two action sequences, user captured into wrong (more frequent) sequence
  - Description error:
    - Multiple objects allowing same/similar action
    - Right action, wrong object
  - Data-driven error:
    - Correct value kicked out of short-term memory by external data
    - Incorrect value entered
  - Loss-of-activation error:
    - Forget what you are doing mid-flow
  - Mode error:
    - Right action, wrong state
    - Make states highly visible and noticeable
    - Reduce states where possible
  - Motor slip:
    - Problem between brain and input device
  - Premature closure error:
    - 'Dangling' UI action after user's perceived goal completion

Human phenomena:

- Homeostasis; equilibrium
  - Make a task easier; people will attempt harder tasks with the system
- Satisficing
  - Making do; why improve?
  - e.g. hunt-and-peck typing, not bothering to learn keyboard shortcuts
- Hawthorne effect:
  - People like being involved in experiments; behavior here not reflective of behavior in real world
- Peak-end effects
  - Most intense or terminating moments of an experience have an excessive influence over people's memories of the experience
- Negativity bias:
  - Bad is stronger than good
- Communication convergence
  - Similarity in pace, gestures, phrases etc. enhances communication

## Design Process

Top-level process:

- Articulate
  - Who are the users and what are the key tasks?
  - Task-centered, participatory and/or user-centered design
  - Generate user and task descriptions, then evaluate
- Brainstorm
  - User involvement, representations/metaphors, the psychology of everyday things
  - Low-fidelity sketches:
    - Focus on high-level concepts
    - Fast to develop, change, little change resistance
    - Delays commmitment
    - Sequential sketches: shows state transitions and actions that trigger state change
    - Zipf's law: focus on 20% of most frequent interactions
  - Medium-fidelity, paper prototypes:
    - Fine-tune interface, screen design
    - Do heuristic evaluation and redesign
    - Walk-through evaluation:
      - User tasked to do some task
        - Is the story believable?
        - If so, ask how they will do it
      - Facilitator should prompt user for thoughts
      - State updates (e.g. changing paper sketch, PowerPoint slide) should be deterministic
  - Further evaluation:
    - Participatory interaction
    - Task scenario walk-through: to to X, A will press this button then...
- Refinement
  - Graphical screen design, interface guidelines and style guides
  - Generate high-fidelity, testable prototypes, then:
    - Usability testing
    - Heuristic evaluation
- Completion
  - Generate alpha/beta systems or a complete specification
  - Then do field testing

Iterative design: don't find a single idea and improve on that: leads to premature commitment, local maxima, and tunnel vision

Elaborative/reduction: first explore the full design space, then refine the design(s)

Task-Centered System Design (TCSD):

- User identification:
  - Talk to users
    - Difficult if the system/task is new
  - Learn about the task chain; what are the inputs, where do the outputs go?
  - What purpose does the task achieve?
- Task identification
  - What the user wants to do
    - Not a description of how they (will) do it
  - Identify users
    - Name individuals
  - Give each task a unique ID
  - Validate tasks: talk to relevant users to help spot issues
  - Determien what tasks and users will be covered; rank based on importance and task frequency
- Design
  - Iterative design, walk-through evaluations

User-Centered System Design (UCSD):

- Users know the 
