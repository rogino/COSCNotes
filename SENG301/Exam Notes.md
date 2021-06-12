# Exam Notes

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

##### Process

Before SP:

- PO refines backlog, states priorities, theme/goal for the sprint

SP1:

- PO presents highest-priority stories
- Team estimates complexity, negotiates with PO and commits to stories

SP2:

- Break stories down into SMART tasks
  - Specific: team has understanding of task
  - Measurable: meets DoD, ACs
  - Achievable: can do it. Ask others for help if needed
  - Relevant: provides value
  - Time-boxed: rough estimate of task length

Metrics must be understood and have value to the team:

- Lean: execution time
- Kanban: task flow
- Scrum: delivering

Refactor: increases code quality; changes function without its behaviour. Should be low risk and done incrementally.

Re-engineering: fixing behavioural issues

Tracking:

- Sprint burn-down chart
- Alternative release burn-down chart
  - To predict number of sprints until release - bar chart with bar for each sprint.
  - Scope likely to increase each sprint.
  - Top of each bar = initial story points (for release) - story points completed towards release
  - Bottom of each bar = added scope
  - Release likely when lines connecting top and bottom of bars meet
- Interference: hours spent/sprint on admin (e.g. email, meetings) should not go up
- Velocity: story points/sprint. Scope changes should trend towards zero

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

- Independent: tasks can be done in any order
- Negotiable: with PO
- Valuable: serves purpose, adds value
- Estimable
- Small: big tasks hard to estimate
- Testable: ACs clear enough to write tests for

#### Kanban

More task-oriented than Scrum; less time required for initial startup

- Limit WiP items
- Queue: WiP items vs items in queue
- Throughput: work units processed per unit time
- Lead time: delta between customer demand and deployment
- Cycle time: WiP / throughput

Continuous flow and delivery, no notion of sprints; just tasks.

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



https://docs.google.com/document/d/1rQk0n1WkfACXvxLPkhN4qGVoCxaKivnxtAZhXiBxV50/edit?fbclid=IwAR3tdVjC7hZbJ2-WHHm58UfUTMcVZFpxz8JgCuG2iasEGDDxQUYXa_UXHNY

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
- Prevent misuse of methods (TODO contracts?):
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
  - Visibility: need-to-know principle
  - Capture exceptions to prevent system failures
  - Erring: avoiding or encapsulating dangerous constructs (e.g. untyped variables)
- Detection: testing and debugging, validation
  - Assert statements
- Fault tolerance
  - Protection systems that monitor the rest of the system
  - Multi-version programming:
    - Concurrent computation
    - Dissimilar hardware
    - Multiple dev teams
    - Voting systems
  - Recoverable milestones

4 Rs:

- Recognition of how resources may be attacked
- Resistance: strategies to resist threats
- Recovery: data, software, hardware recovery procedures
- Reinstatements: process of bringing the system back

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