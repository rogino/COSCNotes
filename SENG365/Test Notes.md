# Semester 1 Test Notes

- URI: Uniform Resource Identifier
- URL: Uniform Resource Locator; URI + access mechanism (e.g. HTTP)
- scheme://user:password@host:port/path?query#fragment

```
// REQUEST
{METHOD_NAME} {URL} HTTP/{VERSION}

//RESPONSE
HTTP/{VERSION} {STATUS_CODE} {STATUS_DESCRIPTION}

// HEADERS
{HEADER_NAME}: {HEADER_VALUE}
// EXAMPLE
Set-cookie: {NAME}={VALUE}; Expires={DATE}

{BODY}
```

- 1xx: info
- 2xx: success
  - 200: okay
  - 201: created
- 3xx: redirection
  - 301: permanent redirect
  - 307: temporary redirect
- 4xx: client error
  - 400: bad request
  - 401: unauthorized
  - 403: forbidden
  - 404: not found
- 5xx: server error

Body:

- Known length: `Content-Type` and `Content-Length` headers
- Unknown length (HTTP/1.1): `Transfer-Encoding: chunked` (data sent in chunks)

REST:

Identify resources by ID (integer/UUID).

Safe: read-only

Idempotent: calling method multiple times does not affect state

| HTTP Method | REST Type       | Safe | Idempotent |
| ----------- | --------------- | ---- | ---------- |
| `GET`       | Read            | Yes  | Yes        |
| `HEAD`      | N/A             | Yes  | Yes        |
| `PUT`       | Update/override | No   | Yes        |
| `DELETE`    | Delete          | No   | Yes        |
| `POST`      | Create          | No   | No         |
| `PATCH`     | Partial update  | No   | No         |

e.g. `PATCH` could request to increment the value of some property

HTTP/REST are stateless: request must include all parameters and response must return entire resource. Underfetching/overfetching increases latency and data transfer.

Naming: no server-side extensions, all lowercase, `/ /-/g`, consistent singular/plural naming

Versioning:

- For A/B testing, test/dev/prod separation, partitioning clients via type (business/consumer, region)
- Semantic versioning: incompatible changes/backwards-compatible features/backwards-compatible bug fixes
- Version in query parameter, URL or header
- Backwards compatible if client does not to be changed when the API updated
- Forwards compatible if client can be changed without the API updating

State:

- HTTP request: session parameter stored in URL (e.g. query parameter)
- Cookie:
  - May be `persistent` or be deleted when the `session` ends (browser closed)
  - `Secure`: HTTPS only
  - `HTTPOnly`: not accessible to JS
  - Identifies browser on a specific account on a specific device

JS:

```javascript
var variableName = function functionName() {}

// Immediately invoked function expressions
var IIFE = (function() { return val })(); // succeeds
// var IIFE = function() { return val }(); // functions cannot be immediately invoked
// Succeeds: converts it to a statement?

+function() { do_stuff }(); // + undefined equal to NaN
!function() { do_stuff }();

(() => {
  // var x; // Variable is hoisted to top of function
  if (true) {
    var x = 1;
    const y = 1;
  }
  console.log(x); // Succeeds
  console.log(y); // Fails
})();

// Closures: uses variables in-scope at time of the definition

this; // window in browser, global in node

"use strict"; // First statement inside a script or function
// this defaults to undefined
// variables must be declared
// errors thrown instead of tolerating some bad code
// `with` statements and octel notation rejected
// `eval` and other keywords cannot be assigned
// ES6 modules always in strict mode


// Call stack: stack of function calls
// Heap: allocated memory
// Queue: queue of events. One for each of DOM, network, timers
setTimeout(() => console.log(0), 0);
console.log(1);
// 1 prints first
// JS waits for call stack to clear before running the oldest event


// CommonJS; one specification for managing module dependencies. Used by node
// Use ONE OF:
exports.name = val;
module.exports.name = val;

const val = require("val");


// JSON: lightweight data interchange
// No versioning
```

ACID:

- Atomic: all or nothing
- Consistency: invariants preserved
- Isolation: effects of in-progress effects invisible to others
- Durability: committed transactions are persistent

CAP: choose two of:

- Consistency: always read newest value
- Availability: always get a response
- Partition tolerance: works with partitioned/offline network
  - Networks will fail so you will have to deal with this

BASE:

- Basic Availability
- Soft state: state can change over time
- Eventual consistency: wait long enough, then data will be consistent

BASE may split an ACID transaction into multiple 'transactions'; invariants may not be preserved.

KV Databases:

- Simple; fast; flexible; easy to scale; high availability possible
- No schema or validation; no invariants/consistency checks; no relationships; no aggregate operations; no search (apart from via PK)

Document Databases:

- Store bunch of files and metadata
  - Structured JSON, XMl
  - Binary PDFs
- Build index from content and metadata
- No schema migrations; schema is stored with the documents
  - Risk of inconsistent/obsolete document structures
- Redundant information stored

Graph DB:

- Nodes represent entities
- Edges can be uni- or bi- directional
  - Hypergraph: edge that joins multiple nodes
- Properties for nodes/values; usually stored as key-value set
  - Can use this to have nodes/edges of different types
- Semantic web (RDF): `subject-predicate-object` (nodes are nouns, edges are verbs, attributes are adjectives/adverbs respectively) (better information interchange)
- Labelled property graph: nodes/edges have internal structure (more efficient storage)
- Useful for centrality:
  - Degree: Number of incoming/outgoing connections
  - Closeness: average length of shortest paths
  - Betweeness: number of times a node is in the shortest paths
  - Eigenvector: influence of node on network
