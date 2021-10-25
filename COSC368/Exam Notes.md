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
- $T = a + bH$ where $H = \sum_i^n{p_i log_2 \left(\frac{1}{p_i}\right)}
- For $n$ equally probable items, decision time is $O(log{n})$
