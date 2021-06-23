# SENG365 Exam Notes

## GraphQL

REST: weakly-typed, multiple round-trips; bad especially in mobile networks.

Prevents over-/under-fetching by fetching exactly what data you need, all without having to update the backend and frontend in sync.

All responses return 200; errors returned in user-defined fields.

## Security

OWASP Top 10:

1. Injection: `eval`, SQL injection, log injection (e.g. newline in username)
2. Broken auth: MITM attack with session information exposed in plain-text, un-hashed/weak passwords, no rate limits, no session invalidation
3. Sensitive data exposure: plain text or weak encryption while in transit, passwords not encrypted, other flaw used to extract information after decryption
4. XML external entities: XML parser accessing local files etc.
5. Broken access control: roles/user permissions not validated
6. Security misconfiguration: insecure defaults, unnecessary features enabled, no hardening, default accounts/passwords used, unpatched, stack traces in error messages
7. XSS:
    - Persistent XSS: page with unsanitized user input viewed by victim
    - Reflected/DOM-based XSS: victim sent URL with attacker-controlled JS in query parameter
8. Insecure de-serialization: attacker modifies serialized data sent to server (e.g. changing own user permissions, directory path, replay attacks)
9. Vulnerable components: outdated/unpatched libraries, databases, OSes etc.
10. Insufficient logging

Authentication: establish claimed identity

Authorization: establish permission to act

HTTP stateless: authenticate and authorize every request.

## SPAs

SPAs: can redraw any part of the page without requiring a full reload.

Model-View-*

- Presentation: specific to UI
- Session state; data bound to the view
- Record state, source of truth, possibly server

Model-View-Controller:

- Model: responsible for data and business rules
  - Updates the view
- View: a representation of the modelA
  - Sends events to controller
- Controller: responds to user events
  - Updates the model
- Controller and view have mix of platform dependent/independent code

```
        model          user                event
Model ---------> View -------> Controller --------> Model
        update         event               handler
```

Model-View-Presenter:

- Three-tier: view and model completely isolated
- Presentation layer handles model updates and updates view if necessary

```
          model update 
Model <--> Presenter <---> View
           user event
```

Model-View-ViewModel:

- ViewModel is view of the model; model transformed if needed and containing only what the view needs
- Two way binding between view and view model
- Business logic and data in the model

Used by Vue.

```
         model update               two-way
Model <---------------> ViewModel <---------> View
        event handler               binding
```

## Communication

XMLHttpRequest (or JQuery's AJAX - async JS and XML):

```js
const req = new XMLHttpRequest();
req.addEventListener("load", (response) => ...
req.open("GET", "http://example.com");
req.send();
```

Asynchronous, via callbacks. JS's **concurrency** model uses event loops - it is single threaded so it can deal with multiple tasks at once, but is not **parallel** - it does not run multiple things simultaneously. When the call stack is empty, it grabs oldest finished item from the event loop which is finished and pushes it onto the call stack.

Fetch is a newer API which uses promises:

```js
fetch("http://example/com")
.then(res => res.json())
.then(obj => console.log(obj))
.catch(err => console.log(err));
```

### CORS

Browser disallows XHR requests to different origins (protocol + domain + port).

Server can optionally allow this. Browser sends an HTTP `OPTIONS` request before making any XHR request:

- `Access-Control-Allow-Origin`: origin that can request the resource. Can be `*`, although this disables cookies
- `Access-Control-Allow-Methods`: comma-separated list of allowed HTTP methods
- `Access-Control-Max-Age`: number of seconds the response of a preflight request can be cached
- `Access-Control-Allow-Credentials: true`: cookies sent if true

### WebSockets

Persistent two-way communication.

Client sends GET request to specific endpoint with a few headers (e.g. `Connection: Upgrade`, `Upgrade: websocket`, `Sec-WebSocket-Key`/`-Protocol`/`-Version`) to which the server response with a `101` (switching protocols) and a few more headers. After this handshake, it switches to using WebSocket.

```js
const WebSocket = require("ws");
const ws = new WebSocket("ws://example.com/path");

ws.on("open", () => ws.send("A"));
ws.on("message", msg => console.log(msg));
```

## Performance

Bundling: bundles code from multiple files into one, possibly minifying it.

Webpack: configured with app entry point; recursively follows imports, so only code that is used is outputted. Output file name contains hash.

Lazy loading: download only the chunks you need. Requires integration with framework.

Compression: `accept-encoding: gzip, ...` request header, server may respond with `content-encoding: gzip`.

### Caching

`expires`:

- Expires on specific date: `expires: DoW, DD MMM YYYY HH:MM:SS GMT`

`cache-control`:

- `no-store`: don't cache (unless already cached)
- `max-age=${time_in_seconds}`: expires after some duration
- `must-revalidate max-age=${time_in_seconds}`: revalidate with server after `max-age`, use cached version otherwise
- `no-cache`: cache, but always revalidate with server
  - Send `ETag: ${some_long_number}` on first request
  - Send `If-None-Match: ${etag}` for subsequent requests
    - If 304 Not Modified, use cached value
  - Alternatively, `Last-Modified` and `If-Unmodified-Since`

Weak caching requires round-trip but ensures all clients have the up-to-date version of the resource.

SPAs:

- `index.htmL`: probably an ETag
- All other files have hash in their name so use `cache-control: max-age=3153600` (one year)

### Modules

```js
// ES2015: ECMAScript Standard
export const bla = 10;
export default bla;

import defaultExport, { bla, bla as alias } from "lib";
import * as lib from "lib";

// CommonJS: used in many NodeJS libraries

exports.bla = 10;

const lib = require("./lib.js)
```

### Virtual DOM

Copy of the DOM in JS:

- Observable changes (or dirty checking - data structure polled)
- Compute diff
- Update portion of DOM that changed

## Web Storage

Cookies: ~4 kB max sent in headers on every request.

Local/session storage: ~5 MB max of key-value string pairs. Specific to origin.

IndexedDB:

- Indexed, NoSQL DB
- Multiple object stores
- Primary keys
- Async CRUD

CacheStorage:

- Cache pairs of request/response objects

### Progressive Web Apps

Web apps that appear to be 'installed' like native applications.

PWAs:

- Come from secure origin
- Load offline
- Reference a **web app manifest** in the HTML head

Service workers allow notifications and background sync (offline cache). Service workers:

- Act as proxy servers sitting between the app and the network
- Run on their own thread
- Are headless: cannot access the DOM
- Require HTTPS
- Associated with a specific server/website

## Testing

Automated tests of the backend server fails because interpretation and/or implementation of API by the server and tests differ:

- Bad assumptions
- Race conditions (manual vs automated timescales)
- Server environment different from dev

Test for both successful and failure cases; note that some tests may pass for the wrong reasons.

Tests should be independent where possible.

User pre- and post-conditions for set-up and tidy-up.

Chai-HTTP:

- Throws errors for 400/500 status codes

W3C WebDriver:

- Interface to manipulate DOM and control behaviour of the user agent
- Platform- and language-agnostic

Selenium-WebDriver:

- Supports automation of dynamic web pages (e.g. SPAs)
- Can be used without Selenium Server:
  - Browsers and tests run on the same machine
  - If server used:
    - Selenium-Grid distributes tests over multiple VMs
    - Can connect to machines with a particular browser version

```js

const webdriver = require("selenium-driver"),
  By = webdriver.By,
  key = webdriver.Key,
  until = webdriver.until
;

const driver = new webdriver.Builder().forBrowser("firefox").build();

driver.get("https://google.com")
  .then(() => 
    driver.findElement(By.name("q"))
    .sendKeys("reddit", Key,RETURN)
  ).then(() => {
    driver.wait(until.titleIs("reddit - Google Search"), 1000)
  }).then(() => driver.quit())
```

Vue test utils: arrange, act, assert
