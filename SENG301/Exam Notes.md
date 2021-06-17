# Exam Notes

[Past Papers Google Doc](https://docs.google.com/document/d/1rQk0n1WkfACXvxLPkhN4qGVoCxaKivnxtAZhXiBxV50/edit?fbclid=IwAR3tdVjC7hZbJ2-WHHm58UfUTMcVZFpxz8JgCuG2iasEGDDxQUYXa_UXHNY)

## Methodologies

### Waterfall: Build it Twice

- Requirements definition
- System/software design
- Implementation/unit testing
- Integration/system testing
- Ops/maintenance

### Spiral

- Determine objectives
- Evaluate alternatives, mitigate risks
- Implement/test
- Plan next iteration

### Agile

#### Core Values

- **Individuals and interactions** over processes and tools
- **Working software** over comprehensive documentation
- **Customer collaboration** over contract negotiation
- **Responding to change** over following a plan

#### Principles

1. Satisfy the customer: early and continuous delivery
2. Embrace changing requirements
3. Deliver working software frequently
4. Business + developers work together
5. Trust and support motivated individuals
6. Face-to-face is the best communication medium
7. Working software is the primary measure of progress
8. Sustainable development; a marathon, not a sprint
9. Continuous attention to technical excellence and design
10. Simplicity; maximizing the amount of work done
11. The best architecture, requirements and designs come from self-organizing teams
12. The team should regularly reflect on how to become more effective and then act on this

#### Scrum

Values:

- Openness to feedback and ideas
- Focus; avoid distractions
- Respect others, even when things go wrong
- Courage to take risks and fail
- Commitment to the team and project

Team:

- PO represents client, prioritizes backlog
- SM:
  - Coach: accessible, act fairly, confident, humble
  - Should not immediately jump into technical issues; trust the team
  - Buffer between team and management
- Dev team: self organized, cross-functional

Initial startup:

- Ask:
  - Who will use it
  - What it does
  - Why it does it
  - How it should do it
  - What the goal for the product is for a month, year etc.
- Discuss objectives with stakeholders
- Create backlog
- Agree on standards
  - Communication
  - 'ready' and 'done'

Backlog:

- Product
  - Prioritized, but order can change
  - No tasks
  - May have estimates
- Sprint
  - Ordered
  - Only high-priority items can modify the sprint backlog
  - Must have estimates, tasks

##### Process

Before SP:

- PO refines backlog, states priorities, theme/goal for the sprint

SP1:

- PO presents highest-priority stories
- Team estimates complexity, negotiates with PO and commits to stories

SP2:

- Break stories down into SMART tasks
  - Specific: everyone on has understanding of task
  - Measurable: meets DoD, ACs etc.
  - Achievable: can do it, or ask others for help if needed
  - Relevant: provides value to customer
  - Time-boxed: limited to some duration - ask for help, split into subtasks, change task owner etc.

Metrics must be understood and have value to the team:

- Lean: execution time
- Kanban: task flow
- Scrum: delivering

Refactor: increases code quality; changes function without its behaviour. Should be low risk and done incrementally.

Re-engineering: fixing behavioural issues

Tracking:

- Sprint burn-down chart
- Alternative release burn-down chart
  - To predict number of sprints until release - bar chart with bar for each sprint
  - Scope likely to increase each sprint
  - Height from origin to top of each bar = initial story points (for release) - story points completed towards release
  - Height from bottom of bar to origin = total added scope
  - Release likely when lines connecting top and bottom of bars meet
- Interference: hours spent/sprint on unplanned tasks - should not go up
- Remedial focus chart:
  - Velocity: story points completed/sprint
  - Scope changes should be in a different color
  - Scope changes should trend towards zero
  - Total height should not go down; likely means code quality is bad

Misc:

- PO should never be surprised; means poor communication
- Burn down chart: `sprint commitment = work done + work remaining` should be an invariant

Review:

- Demo outcomes to PO and stakeholders, gather feedback

Retro. Discuss:

- Communication: intra-, inter-team
- Processes
- Scope/product vision; ensure everyone is clear
- Quality
- Environment: ensure it's not toxic
- Skill: training/external expertise
- What are we doing well? What can we improve?
- Action items:
  - Bubble method: list issues alone, pair with team member, discuss, repeat
  - Circle method: list items, sorted good to bad. Group related items together
- SM decides on action items to take on in the next sprint
- Follow up on items frequently e.g. stand-ups

Smells:

- Long, un-time-boxed meetings with non-essential stakeholders
- Broken builds
- Bad tools
- Third parties; another point of failure
- Scope creep
- Unreliable POs and strategies to deal with them
- Taking over jobs, commanding others
- Blaming and shaming
- Siloing
- Poor code quality

##### User Stories

A promise of a conversation to be had with a hypothetical user. Should discussed between PO and dev team.

*As a `role`, I `action` so that `value`*

- One goal, one interaction
  - Conjunctions, multiple use cases? Epic
- Concrete and well-defined requirements, ACs
  - Vague terms, unknown data types/operations, hidden business rules? Epic
- Natural language

Users:

- From user interviews not imagination
- Persona: fictitious with clear behaviour patterns and goals: user archetype
- Profile: class of user defined by their background, physical/cognitive state, education, task experience

###### Use Case Scenarios

User stories are partial scenarios that focus on result; use cases scenarios are more detailed and focus on specifics.

Use case scenarios can be modelled as robustness diagrams:

```
  웃 ------ |-o  -----> ⥀ ----- o̲ ◆-----> o
actor    boundary   control   entity  property
```

- Boundary: interface
- Control: process/method of the interface

OR:

- Entity/boundary/control = MVC

###### INVEST

- Independent:
  - Tasks can be done in any order
  - No overlap between stories; features not implemented twice
  - Mock features if necessary
- Negotiable: with PO; high-level enough that dev team has freedom to discuss details with PO
- Valuable: to customer e.g. frame database-layer work in terms of value to the customer
- Estimable: good enough to allow PO to schedule/prioritize. Possibly have spike at start to estimate
- Small: big tasks hard to estimate
- Testable: ACs clear enough to write tests for
  - Alternative: feature is deterministic

#### Kanban

More task-oriented than Scrum; less time required for initial startup.

Kanban has continuous flow and delivery and no notion of sprints; just tasks.

Principles:

- Change management:
  - Kanban additional layer on top of existing processes, not an overhaul
  - Pursue incremental, evolutionary change not large, sweeping changes
  - Encourage acts of leadership at all levels
- Service delivery
  - Focus on customer needs and expectations
  - Manage the work: empower people to self-organize around the work, avoiding micro-management
  - Review network of services to improve service-oriented approach

Practices:

- Visualize the workflow in a Kanban board
- Limit WiP items in each stage; avoids overloading succeeding steps
- Manage flow: movement of work through process should be sustainable and predictable
- Make process policies explicit
- Strong feedback loops: daily team meetings and/or task-focused meetings
- Improve collaboratively: make hypotheses, prove them and apply results to the organization

Metrics:

- Queue: WiP items vs items in queue
- Throughput: work units processed per unit time
- Lead time: delta between customer demand and deployment
- Cycle time: WiP / throughput

#### Lean

1. Eliminate waste; no value to customer = waste
  e.g. partially done work, unnecessary code, bureaucracy, bad communication
2. Amplify learning: short feedback loops
  And create knowledge: document decisions and reasoning
3. Defer decisions; you will have more information in the future
4. Quality first, not as an afterthought
5. Respect people; value their opinions, communicate proactively and have some amount of conflict
6. Deliver fast; identify bottlenecks, create a MVP so the customer can give feedback
7. Optimize the whole; global, not local maxima

## Testing

Validation vs verification:

- Validation: check it meets requirements
- Verification: identify erroneous behaviours

Fit for purpose:

- User expectations
- Marketing: price, time-to-market etc.
- Purpose: safety-critical?

Agile Testing: automatic unit/acceptance tests, plus manual testing on RCs

### Traditional Testing

Unit testing:

- Test every feature
  - Identify edge cases, domain boundaries
- Code should be self-sufficient
- Prevent misuse of methods
  - Asserts
    - Incoming values
    - Invariants
  - Explicit verification of pre/post conditions in component boundaries

Component Testing:

- Test interfaces
  - Method calls
  - Message passing (e.g. HTTP)
  - Shared memory
- Make components fail - can you make it fail? How the rest of the system handles it
- Stress testing
- Switching up call orders - find hidden dependencies

System testing:

- Third-party systems
- Dedicated testers

Load testing: test behaviour/performance in normal/extreme loads to find bottlenecks

Stress testing: under unfavourable conditions

Capacity testing: if it can handle the expected amount of traffic

## Reliability and Resilience

Faults, errors, failures:

- Human error: bad input data
- System fault: bug that leads to an error
- System error: effects of the bug
- System failure: when system does not produce expected results

Availability vs reliability:

- Availability: P(can access the system)
- Reliability: P(failure-free operation)
  - Subjective: some subsystems may be worse or issues occur only for some users at some times

Working as designed: specifications may be wrong (not what the user wants) or erroneous (typo)

Improving reliability:

- Fault avoidance: good design, process, tools
  - **Visibility**: need-to-know principle
  - Capture exceptions to prevent system failures
  - Erring: avoiding or encapsulating dangerous constructs (e.g. untyped variables)
- Fault Detection: testing and debugging, **validation** (boundaries, input values)
  - Assert statements
- Fault tolerance
  - Protection systems that monitor the rest of the system
  - Multi-version programming:
    - Concurrent computation
    - Dissimilar hardware
    - Multiple dev teams
    - Voting systems
  - Recoverable milestones
  - Constants: clearer code, compile-time verification

4 Rs for Resilience Engineering:

- Recognition of how resources may be attacked
- Resistance: strategies to resist threats
- Recovery: data, software, hardware recovery procedures
- Reinstatement: process of bringing the system back

Security:

- Avoidance: avoid storing sensitive data in plain text
- Detection: monitor for possible system attacks
- Recovery: backup, deployment, insurance

## CI/CD

Make your builds disposable - updating to a new build should be so easy that it doesn't matter if you need to do it once or 20 times. Requires deployment and rollback scripts to be written

Deployment:

- Build once; one less variable
- Deploy the same way everywhere
- Smoke test; make a few simple requests
- Deploy into a copy of prod; firewall, network, OS etc.

Paperwork:

- Involve all parties in charge of environments
- Create pipeline plan, config management strategy
- Environment variables and how to transfer them
- Monitoring requirements
- When third party systems become part of the testing
- Disaster recovery plans
- SLA
- Archiving strategy

Reducing downtime:

- Off-peak time
- Modularize code, migrate one by one
- Roll-back processes

Blue-Green:

- Two identical environments for each piece with router to determine which environment is used

Canary:

- Deploy to subset of servers and subset of users
- Gradually increase over time

### UX

Honeycomb:

- Usable: easy to learn and use
- Useful: product serves a purpose to the user
- Findable: user can quickly navigate to where they want to go
- Credible: is the company and product trustworthy?
- Accessible: are accessibility features built into your product
- Desirable: does the UI look good and function well?

Misc:

- Whitespace is important; don't overload the interface
- Consistent design and behaviour
- Icons alone not enough - use text
- Feedback
  - Success/error messages
  - Loading bars
  - Modals for critical information only
- Content: avoid long pages, messy information, use visuals/interactive content

#### Stages of Design

Wireframes: low-fidelity sketch; flow between screens. Be extra careful who you engage with; if you show the wireframes, everyone will have different nitpicks and complaints.

Mock-ups: high-fidelity representations based off of the wireframes; no interactivity. Focus on the **visual identify**.

Prototype: limited functional implementation (e.g. mocking) but with a functioning workflow. Concentrate on visual behaviour, risky features.

## Weekly Readings

01. Basket of Options
    - Reduce dependencies: if the first fails, you want to be able to still take advantage of the second
    - Key Results: reduce sandbagging by expecting people to achieve only some of their goals, not all or none
02. Stand-ups
    - Goals
      - Shared understanding of goals
      - Coordination
      - Share problems/improvements
      - Team bonding
    - Who
      - Anyone involved in day-to-day operations, ensure they don't disrupt stand-up, may be more helpful for some to view burn-down charts etc.
      - Work items - story-focused stand-up. People speak for the work items. Not everyone needs to speak, hiding problems or shy people
    - What
      - 3 Q: accomplished yesterday, do today, obstacles. Order varies, may have additional questions e.g. code smells spotted
      - Improvement board: public chart identifying obstacles and their progress. Avoid putting down problems the team has no control over
    - Order
      - Last first: encourages punctuality but likely to be unprepared
      - Round robin: enforces notion of self-organizing team with no leader
      - Pass the token: randomness encourages people to focus as when their turn is unknown. Difficult with larger teams
      - Card: pass the token, but nothing to catch and no coffee to spill
      - Walk the board: work items, not people attend. Move through work items ordered by stage reversed (e.g. review, then in progress) and priority (highest first). Blockers, emergency items and stuck items should go first. Danger of reporting to leader
    - When/where
      - Where the work happens, or in front of the story wall
      - Same place/time; don't wait for stragglers
      - Start the day: difficult with flexible work hours. If not at the start of the day, trap of no work getting done until the stand-up
      - < 15 minutes
      - Signal ending
      - Move discussions outside of stand-up (procedures such as consistent 'take it offline' phrase, raising hand)
    - Autonomy; avoid having a leader: rotate facilitator, facilitator should avoid eye-contact to encourage speaker to talk to entire team
    - Focus on tasks, not people: trap of focusing on what they are doing and not if the work they do has value
    - Obstacles should be raised (forgetting, high 'pain' threshold, trust) and not just be raised in the stand-up, and take actions to remove them
03. Domain-Driven Design
    - Draw the business problem: pseudo-UML diagram, boxes and lines etc.
    - Code: model... models, go back and forth between the diagram and code. Notice but don't try too hard to avoid framework/plumbing stuff polluting the model
    - Co-design with domain experts. Note down the verbs and nouns they use; use it in your model
      - The expert is right, the model is wrong
        - Or the model is trying to solve multiple problems; split the model into two (there will be duplication), go through the process again
04. Test Principles
    - Fast: sub-second; long enough to lose focus, not long enough to start something
    - Deterministic: policy of deleting non-deterministic tests?
    - Sensitive to behavioural changes, insensitive to structural changes
    - Cheap to write, read, change
05. Code Reviews
    - Waiting for feedback is a pain
    - No one is a full-time reviewer
    - Not counted as 'actual' work
    - Not valuing good reviews
    - Reviewer new to codebase, not known if someone else is reviewing
    - Too big
    - Not understanding motivation for change
    - Bikeshedding - focusing on minor issues e.g. style and overlooking large ones
    - Face-to-face meetings to reach consensus
06. Communicating Architecture
    - Architects spend time on:
      - Internal work: deep work
      - Inwards communication: listening, reading, asking questions
      - Outwards communication: presenting, documenting, outputting information
    - 50:25:25 is good balance
    - Too much internal thinking - impractical even if structure is good
    - Too much communication - consultant, no solid thinking behind architecture
    - Async communication:
      - Writing scales well (video etc. not often used professionally)
      - Record - records decisions that were made
      - Avoid focusing too heavily on diagrams - requires textual explanation
    - Messaging: engineers need to understand architecture at a concrete level; failure of architect if this is not the case - i.e. *burden of communication is on the sender*
07. (Not) Self-Documenting Code
    - Self-explanatory names should tell you what is does or what it is
    - Comments should focus on why and how (implementation details) it does it
    - Comments are part of the code and should be updated in lock-step
08. YAGNI
    - When building something unnecessary for now, consider:
      - Cost of building: how much time will it take to add the extra extensibility
      - Cost of delay: how adding the feature will delay other features that would otherwise be ready and generating revenue
      - Cost of carry: the extension points will make the system harder to work with
      - Cost of repair: if the extension point was written wrong
      - Cost of refactoring: will it really be that much work to add it in the future?
09. TDD
    - TDD is the fastest, best way to build software i.e. cheaper
    - Rely on individual judgement
    - Internal quality and productivity directly correlated
    - Test a chain by its links: if each link works, then the whole chain must too
    - Testing should steer design; consider testability as a factor when designing systems
10. Code Coverage
    - Acts as a reasonable, objective and well-supported metric of test quality
    - Increased code coverage correlates with reduced defects - encouraging testability leads to better modularity etc.
    - High code coverage alone does not mean quality tests
    - ... but low code coverage does mean code is untested
    - Pick code coverage based on criticality of code, how often the code will be updated, how long the code is expected to be used for
      - Frequently changing code should be covered; per-commit coverage should be high to ensure project coverage increases over time
    - Aggregate full code coverage (unit, integration, system tests) to avoid thinking total coverage is higher than it actually is
    - Diminishing returns as code coverage increases
    - Legacy code base? Leave it cleaner than you found it
    - Code coverage too low? Don't deploy it. Ensure it can actually be met so that it doesn't become a rubber stamp
11. ACM Code of Ethics
    1. Act in the public interest
    2. Act in the best interests of the client/employer
    3. Product should meet highest professional standards
    4. Maintain integrity an independence in judgement
    5. Managers/leaders should promote ethical approaches to software development and management
    6. Act in the best interests (integrity/reputation) of the profession
    7. Be fair and supportive to colleagues
    8. Self lifelong learning, promote ethical approach
12. Gebru Google Departure
    - Wrote paper on unintended consequences of some NLP systems (including ones used in Google search) and environmental impacts
    - Rejected by internal review for ignoring relevant research
    - Gebru's concerns not addressed, threatened to resign
    - Sent internal memo criticizing, fired by Google
13. Gender Differences and Bias in Accepted Open Source Pull Requests
    - Women's pull requests accepted more often then men when not identified as women
      - Theories: survivorship bias, self-selection bias, women being held to higher standards
14. Git Flow Branching
    - Master
      - Always production-ready
    - Dev
    - Feature
      - Pull and push from/to dev
      - When merging use `--no-ff` (no fast-forward): makes it easier to revert features
    - Release
      - Branched off dev
      - Can get bug fixes
        - Pushed back to dev
      - Merge into master
    - Hotfix
      - Branched off master
      - Changes pushed to master and dev
15. Git Rebase
    - Reapplies all commits to the tip of another branch
    - Previous commits exist but aren't accessible
    - If remote branch exists, force push required
    - Never rebase a shared branch - requires a lot of merges and duplicated commits
16. Chaos Engineering
    - Partition the system into a control and experimental group
      - Yes, in production
      - Ensure the blast radius is minimized
    - In the experimental group, add variables simulating crashes, network disconnects, large traffic spikes etc.
      - Prioritize by impact and frequency
    - Look for a difference between the two groups (and hope the control group hasn't crashed)
17. Be Kind in Code Review
    - Assume good faith
      - Comment on code, not developer
      - Don't use 'obviously'/'clearly'
      - Be clear - assume low-context culture
    - If code needs to be explained by author, it probably needs to be rewritten to be more clear
    - Code reviewer has power. If abused, can lead to current contributors to become de-motivated and scares away new contributors. Leads to fewer, less diverse set of contributors and slower progress on the code front
18. Writing Pull Requests
    - Plan the change
      - Talk to others - gives them context and allows solutions to be brainstormed
    - Pick relevant reviewers. They should have:
      - Worked on it
      - Worked on something related to it
      - Understand what's being changed
    - Explain - summary and description of change
      - Give context (e.g. issue tracker link)
      - Long != good
      - Guide readers; where is the most important change? What is just method renaming?
    - Small:
      - Don't mix in unrelated changes
      - Isolate related into multiple merge requests if possible
    - Ready:
      - Ensure it meets DoD
      - Once feedback received, make a new merge request
19. Rubber Duck Debugging
    - Explain the code to the duck line by line
    - Realize the code wasn't actually doing what you thought it was doing
    - Thank the duck
20. Questions to Ask Bugs
    - What is the pattern?
      - Where else does it exist? Where are its siblings? Are there parallel paths that have the same pattern? Commit genocide
    - What is its impact?
      - Fallout to users
      - Cost in productivity
      - Follow-up with users, team, stakeholders
    - Preventing more bugs:
      - Why did it get through your existing process? What can be changed?
      - Can that class of bug be removed?

## Design Principles

Cohesion: data + behaviour together.

Coupling: information hiding, separation of concerns, independence between modules

Push and pull between keeping related data together and separation of concerns.

Biggest issue in software design: complexity. Solution: decomposition

Nucleus-centred (OO) design: decide what the critical core of the program is and build interfaces around it. The core should be constant while details that have competing solutions are behind interfaces.

Information Hiding:

- Encapsulation = programming feature to create boundary between
- Information hiding = hiding design decisions to prevent unintended coupling
  - e.g. list being returned - elements can be added or modified without knowledge of the owner, possibly causing invalid state

Tell, Don't Ask:

- If a decision is based entirely on the state of one object, it should be made in that object, not outsourced
- Avoid asking for information from an object in order to make decisions about it
- Encourages cohesion; related data and behaviour together

Composition over Inheritance:

- Avoid inheritance for:
  - 'is a role of': store role in a separate object (and maybe have a list of roles)
  - 'becomes'
    - Inheritance isn't dynamic; changing class when some trivial detail changes is not great
  - Changing the superclass contract
  - *If it can change, it ain't inheritance*
- Inheritance should be for 'is a' relationship
- Composition hides implementation details

Over-specialization: use the most general interface you can.

SOLID:

- Single responsibility principle
  - Every module/class should have responsibility over one part of the functionality (and should be fully encapsulated)
  - Bigger = more reasons to change, bigger blast radius when changes are made
- Open-closed: make your system open for extension, closed for modification
- Liskov-substitution principle: behaviour shouldn't change depending on subclass
- Interface-Segregation Principle: clients shouldn't need to depend on methods/interfaces they don't use
  - Split interfaces into smaller, more cohesive interfaces
  - e.g. class implementing interface having lots of `UnsupportedOperationException`s
- Dependency-inversion: big things should not rely on little things (and vice-versa) - depend on abstractions instead
  - New is glue

## Design Patterns

A **solution** to a **problem** in a **context**. They are:

- Distilled wisdom about a specific problem
- A reusable design micro-architecture

Defining a pattern:

- Empirical evidence
  - Rule of 3: at least three independent usages before calling it a pattern
- Comparison with other solutions
- Independent authorship
- Reviewed by pattern/domain experts

Documenting:

- Name
- Intent: a brief synopsis
- Motivation: context of the problem
- Applicability: circumstances under which the pattern applies
- Structure: class diagram of solution
- **Participants**: explanation of classes/objects and their roles
- Collaboration: explanation of how classes/objects cooperate
- Consequences: impact, benefits, liabilities
- Implementations: techniques, traps, language-dependent issues
- Sample code
- Known uses: well-known systems already using the pattern

Documenting instances:

- Map each participant in the GoF pattern to its corresponding element
- Interface/abstract
- Concrete
- Association
- Name
- Intent
