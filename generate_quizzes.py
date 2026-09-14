import json

# 100 Node.js Questions
nodejs_questions = [
    # Core & Architecture
    {
        "question": "Who created Node.js?",
        "options": ["Brendan Eich", "Ryan Dahl", "Guido van Rossum", "Tim Berners-Lee"],
        "answer": "Ryan Dahl"
    },
    {
        "question": "What is Node.js built on top of?",
        "options": ["Chrome's V8 Engine", "Mozilla's SpiderMonkey", "Safari's JavaScriptCore", "Microsoft's Chakra"],
        "answer": "Chrome's V8 Engine"
    },
    {
        "question": "Which programming language is predominantly used to write Node.js binding/C++ addons?",
        "options": ["C++", "Python", "Rust", "Go"],
        "answer": "C++"
    },
    {
        "question": "Which library does Node.js use to handle asynchronous I/O and the event loop?",
        "options": ["libuv", "libc", "libevent", "glibc"],
        "answer": "libuv"
    },
    {
        "question": "Is Node.js single-threaded or multi-threaded by default for executing user code?",
        "options": ["Single-threaded", "Multi-threaded", "It depends on the number of CPU cores", "It uses thread-pooling for all tasks"],
        "answer": "Single-threaded"
    },
    {
        "question": "Which thread pool is managed by libuv for handling blocking tasks like file I/O?",
        "options": ["Worker Pool", "Main Thread Pool", "Event Thread Pool", "Task Scheduler Pool"],
        "answer": "Worker Pool"
    },
    {
        "question": "What is the default size of the libuv thread pool?",
        "options": ["4 threads", "1 thread", "8 threads", "Unlimited"],
        "answer": "4 threads"
    },
    {
        "question": "Which environment variable is used to change the size of the libuv thread pool?",
        "options": ["UV_THREADPOOL_SIZE", "NODE_THREAD_COUNT", "LIBUV_POOL_LIMIT", "NODE_WORKER_THREADS"],
        "answer": "UV_THREADPOOL_SIZE"
    },
    {
        "question": "What happens if a synchronous function blocks the main thread in Node.js?",
        "options": ["The entire process pauses and cannot process other incoming requests", "Node.js offloads the synchronous block to the thread pool", "Node.js forks a child process automatically", "An error is thrown instantly"],
        "answer": "The entire process pauses and cannot process other incoming requests"
    },
    {
        "question": "In the Node.js Event Loop, which phase executes callbacks of setTimeout and setInterval?",
        "options": ["Timers phase", "Pending callbacks phase", "Poll phase", "Check phase"],
        "answer": "Timers phase"
    },
    {
        "question": "In the Node.js Event Loop, which phase executes setImmediate callbacks?",
        "options": ["Check phase", "Poll phase", "Close callbacks phase", "Idle phase"],
        "answer": "Check phase"
    },
    {
        "question": "Where are process.nextTick() callbacks executed in the Event Loop?",
        "options": ["Immediately after the current operation completes, before moving to the next phase", "At the end of the Timers phase", "Inside the Poll phase", "Only during idle cycles"],
        "answer": "Immediately after the current operation completes, before moving to the next phase"
    },
    {
        "question": "Between process.nextTick() and Promise microtasks, which queue has higher priority?",
        "options": ["process.nextTick() queue", "Promise microtask queue", "They have equal priority and execute round-robin", "It depends on strict mode"],
        "answer": "process.nextTick() queue"
    },
    {
        "question": "What does npm stand for?",
        "options": ["Node Package Manager", "New Project Module", "Node Program Maker", "It is not an official acronym"],
        "answer": "It is not an official acronym"
    },
    {
        "question": "Which command is used to initialize a new Node.js project with a package.json?",
        "options": ["npm init", "npm start", "npm create", "node init"],
        "answer": "npm init"
    },
    {
        "question": "What is the purpose of the 'package-lock.json' file?",
        "options": ["To lock the exact dependency versions installed for consistent builds", "To prevent users from editing dependencies", "To encrypt package.json configurations", "To speed up the local dev server boot"],
        "answer": "To lock the exact dependency versions installed for consistent builds"
    },
    {
        "question": "Which command checks for security vulnerabilities in your installed NPM packages?",
        "options": ["npm audit", "npm verify", "npm doctor", "npm scan"],
        "answer": "npm audit"
    },
    {
        "question": "What is the Node.js REPL?",
        "options": ["Read-Eval-Print Loop interactive shell", "Resource-Event-Process Linker", "Router-Engine-Parser Library", "Redundant-Error-Prevention Layer"],
        "answer": "Read-Eval-Print Loop interactive shell"
    },
    {
        "question": "Which global object contains information about the current Node.js process execution?",
        "options": ["process", "env", "global", "system"],
        "answer": "process"
    },
    {
        "question": "How do you access command-line arguments passed to a Node.js script?",
        "options": ["process.argv", "process.args", "global.arguments", "env.ARGS"],
        "answer": "process.argv"
    },
    # Modules & APIs
    {
        "question": "Which system is the default module system in Node.js historically?",
        "options": ["CommonJS", "ES Modules", "AMD", "UMD"],
        "answer": "CommonJS"
    },
    {
        "question": "How do you import a module in the CommonJS system?",
        "options": ["require('module')", "import module from 'module'", "include('module')", "load('module')"],
        "answer": "require('module')"
    },
    {
        "question": "How do you export functionality from a CommonJS module?",
        "options": ["module.exports", "export default", "export.function", "module.send"],
        "answer": "module.exports"
    },
    {
        "question": "How do you enable ES Modules natively in a Node.js project without a transpiler?",
        "options": ["Set 'type': 'module' in package.json", "Set 'esm': true in package.json", "Run node with the --esm flag", "ES Modules are always native and require no configuration"],
        "answer": "Set 'type': 'module' in package.json"
    },
    {
        "question": "Which file extension is explicitly treated as an ES Module in Node.js?",
        "options": [".mjs", ".cjs", ".esm.js", ".ts"],
        "answer": ".mjs"
    },
    {
        "question": "Which file extension is explicitly treated as a CommonJS module in Node.js?",
        "options": [".cjs", ".mjs", ".common.js", ".json"],
        "answer": ".cjs"
    },
    {
        "question": "Are __dirname and __filename variables available in ES Modules in Node.js?",
        "options": ["No, they are only available in CommonJS modules", "Yes, they are available in both", "Yes, but only if strict mode is off", "No, they were deprecated in Node.js 12 altogether"],
        "answer": "No, they are only available in CommonJS modules"
    },
    {
        "question": "How can you replicate __dirname in an ES Module?",
        "options": ["Using fileURLToPath(import.meta.url) and path.dirname()", "Using process.cwd()", "Using import.meta.dirname", "Both fileURLToPath and import.meta.dirname are valid (since Node.js 20.11+)", "Using process.env.DIRNAME"],
        "answer": "Both fileURLToPath and import.meta.dirname are valid (since Node.js 20.11+)"
    },
    {
        "question": "Which built-in module is used to handle file system operations?",
        "options": ["fs", "path", "file", "system"],
        "answer": "fs"
    },
    {
        "question": "Which fs function reads a file synchronously?",
        "options": ["fs.readFileSync", "fs.readFile", "fs.readSync", "fs.readSyncFile"],
        "answer": "fs.readFileSync"
    },
    {
        "question": "Which module provides utilities for working with file and directory paths?",
        "options": ["path", "url", "fs", "os"],
        "answer": "path"
    },
    {
        "question": "What is the difference between path.join() and path.resolve()?",
        "options": ["path.resolve() always returns an absolute path, resolving relative segments against the current working directory", "path.join() always resolves to the absolute root directory", "path.resolve() only merges path segments without validating routes", "There is no functional difference"],
        "answer": "path.resolve() always returns an absolute path, resolving relative segments against the current working directory"
    },
    {
        "question": "Which module allows Node.js to spin up a server to handle HTTP requests?",
        "options": ["http", "net", "url", "server"],
        "answer": "http"
    },
    {
        "question": "What method on the http module is used to create a web server?",
        "options": ["http.createServer", "http.createListener", "http.newServer", "http.startServer"],
        "answer": "http.createServer"
    },
    {
        "question": "Which class does http.Server inherit from?",
        "options": ["net.Server", "events.EventEmitter", "stream.Writable", "process.EventEmitter"],
        "answer": "net.Server"
    },
    {
        "question": "Which module handles TCP/Socket communication in Node.js?",
        "options": ["net", "http", "tls", "dns"],
        "answer": "net"
    },
    {
        "question": "Which module is used for secure TLS/SSL communication?",
        "options": ["tls", "net", "crypto", "https"],
        "answer": "tls"
    },
    {
        "question": "Which built-in class allows you to listen to and emit custom events?",
        "options": ["EventEmitter", "EventTarget", "Dispatcher", "ProcessListener"],
        "answer": "EventEmitter"
    },
    {
        "question": "Which module exports the EventEmitter class?",
        "options": ["events", "process", "util", "fs"],
        "answer": "events"
    },
    {
        "question": "What is the default limit of listeners for a single event on an EventEmitter before a warning is printed?",
        "options": ["10 listeners", "5 listeners", "20 listeners", "Unlimited"],
        "answer": "10 listeners"
    },
    # Streams & Buffers
    {
        "question": "Which class represents a raw sequence of bytes in memory outside the V8 heap?",
        "options": ["Buffer", "ArrayBuffer", "Blob", "TypedArray"],
        "answer": "Buffer"
    },
    {
        "question": "How do you create a safe, zero-filled Buffer of a specific size in modern Node.js?",
        "options": ["Buffer.alloc(size)", "new Buffer(size)", "Buffer.from(size)", "Buffer.allocUnsafe(size)"],
        "answer": "Buffer.alloc(size)"
    },
    {
        "question": "What is the difference between Buffer.alloc() and Buffer.allocUnsafe()?",
        "options": ["allocUnsafe() is faster but allocates uninitialized memory that may contain sensitive old data", "allocUnsafe() restricts buffer access to admin roles", "alloc() allocates V8 heap memory whereas allocUnsafe() uses CPU cache", "There is no difference in performance"],
        "answer": "allocUnsafe() is faster but allocates uninitialized memory that may contain sensitive old data"
    },
    {
        "question": "What are the four fundamental types of streams in Node.js?",
        "options": ["Readable, Writable, Duplex, Transform", "Input, Output, Pipe, Filter", "Source, Sink, PassThrough, Streamer", "Binary, Text, Buffer, Array"],
        "answer": "Readable, Writable, Duplex, Transform"
    },
    {
        "question": "Which stream type reads data, modifies it, and outputs the modified data?",
        "options": ["Transform", "Writable", "Readable", "PassThrough"],
        "answer": "Transform"
    },
    {
        "question": "Which method connects a Readable stream directly to a Writable stream to handle backpressure automatically?",
        "options": ["pipe()", "write()", "connect()", "push()"],
        "answer": "pipe()"
    },
    {
        "question": "What is backpressure in Node.js streams?",
        "options": ["When the data reading source produces data faster than the writing destination can consume it", "When CPU cycles overload the network stack", "An encryption bottleneck in HTTPS pipelines", "An error thrown when a file stream breaks"],
        "answer": "When the data reading source produces data faster than the writing destination can consume it"
    },
    {
        "question": "What event does a Readable stream emit when there is no more data to be consumed?",
        "options": ["end", "close", "finish", "done"],
        "answer": "end"
    },
    {
        "question": "What event does a Writable stream emit when stream.end() is called and all data is flushed?",
        "options": ["finish", "end", "close", "done"],
        "answer": "finish"
    },
    {
        "question": "Which class is a stream that passes input straight to output without modifications?",
        "options": ["PassThrough", "Duplex", "Transform", "Filter"],
        "answer": "PassThrough"
    },
    # Async & Utilities
    {
        "question": "Which module contains utilities to convert callback-based APIs into Promise-based APIs?",
        "options": ["util", "process", "events", "assert"],
        "answer": "util"
    },
    {
        "question": "Which function in the util module transforms a standard error-first callback function into a promise?",
        "options": ["util.promisify", "util.toPromise", "util.callbackToPromise", "util.asyncify"],
        "answer": "util.promisify"
    },
    {
        "question": "What signature convention do Node.js callbacks follow?",
        "options": ["Error-first: callback(err, data)", "Data-first: callback(data, err)", "Boolean state: callback(success, result)", "Status-code based"],
        "answer": "Error-first: callback(err, data)"
    },
    {
        "question": "Which module provides cryptographic functions like hashing, HMAC, and encryption?",
        "options": ["crypto", "tls", "security", "hash"],
        "answer": "crypto"
    },
    {
        "question": "Which crypto method generates cryptographically secure pseudo-random bytes?",
        "options": ["crypto.randomBytes", "crypto.getRandomValues", "crypto.randomUUID", "Math.random"],
        "answer": "crypto.randomBytes"
    },
    {
        "question": "What is the purpose of the 'os' module?",
        "options": ["To retrieve operating system information like memory, CPU cores, and network interfaces", "To interact with system file paths", "To execute shell scripts", "To schedule cron jobs in the kernel"],
        "answer": "To retrieve operating system information like memory, CPU cores, and network interfaces"
    },
    {
        "question": "Which method on the 'os' module returns an array of CPU core architectures and speeds?",
        "options": ["os.cpus()", "os.cores()", "os.cpuInfo()", "os.hardware()"],
        "answer": "os.cpus()"
    },
    {
        "question": "Which method on the 'os' module returns the amount of system free memory in bytes?",
        "options": ["os.freemem()", "os.totalmem()", "os.freeMemory()", "os.memory()"],
        "answer": "os.freemem()"
    },
    {
        "question": "Which module allows parsing query strings into structured objects?",
        "options": ["querystring", "url", "path", "http"],
        "answer": "querystring"
    },
    {
        "question": "Which global class represents a URL parser in modern Node.js aligning with the WHATWG standard?",
        "options": ["URL", "url.URLParser", "WHATWGParser", "Location"],
        "answer": "URL"
    },
    # Processes & Threads
    {
        "question": "Which module is used to spawn external shell commands and programs?",
        "options": ["child_process", "cluster", "worker_threads", "process"],
        "answer": "child_process"
    },
    {
        "question": "What is the difference between child_process.exec() and child_process.spawn()?",
        "options": ["exec() buffers the entire output in memory and returns it in a callback; spawn() streams output via stdout/stderr", "exec() runs asynchronously whereas spawn() runs synchronously", "spawn() runs command in a shell; exec() runs raw binaries only", "There is no difference"],
        "answer": "exec() buffers the entire output in memory and returns it in a callback; spawn() streams output via stdout/stderr"
    },
    {
        "question": "Which child_process method is specifically designed to spawn a new Node.js process and establish an IPC channel?",
        "options": ["fork()", "spawn()", "exec()", "execFile()"],
        "answer": "fork()"
    },
    {
        "question": "Which module allows you to run multiple instances of a Node.js application sharing the same server port?",
        "options": ["cluster", "child_process", "worker_threads", "pm2"],
        "answer": "cluster"
    },
    {
        "question": "How does the 'cluster' module distribute incoming TCP connections to worker processes by default on non-Windows systems?",
        "options": ["Round-robin scheduling", "First-come first-served queue", "IP Hash routing", "Least connections allocation"],
        "answer": "Round-robin scheduling"
    },
    {
        "question": "Which module is used to perform CPU-intensive tasks using actual OS-level parallel threads?",
        "options": ["worker_threads", "child_process", "cluster", "threads"],
        "answer": "worker_threads"
    },
    {
        "question": "In worker_threads, how do the main thread and a worker thread pass messages to each other?",
        "options": ["MessagePort (postMessage and on('message'))", "Process pipes (stdin/stdout)", "Shared database sockets", "Global V8 variable sharing"],
        "answer": "MessagePort (postMessage and on('message'))"
    },
    {
        "question": "Which class allows sharing memory between multiple worker_threads without serialization overhead?",
        "options": ["SharedArrayBuffer", "ArrayBuffer", "Buffer", "TypedArray"],
        "answer": "SharedArrayBuffer"
    },
    {
        "question": "Which thread is the main thread in a worker_threads application?",
        "options": ["The thread where isMainThread property from worker_threads is true", "Thread ID 0", "The master thread in cluster mode", "The OS root scheduler thread"],
        "answer": "The thread where isMainThread property from worker_threads is true"
    },
    {
        "question": "How can you pass read-only initial configurations to a Worker on creation?",
        "options": ["workerData option in Worker constructor", "process.env environment variables", "Passing command-line arguments", "Using postMessage immediately after boot"],
        "answer": "workerData option in Worker constructor"
    },
    # Diagnostics & Performance
    {
        "question": "Which flag is passed to the node executable to inspect/debug applications?",
        "options": ["--inspect", "--debug", "--dev", "--watch"],
        "answer": "--inspect"
    },
    {
        "question": "Which built-in module provides APIs for structural performance measurements?",
        "options": ["perf_hooks", "console", "diagnostics", "trace_events"],
        "answer": "perf_hooks"
    },
    {
        "question": "Which core module is used to write unit test assertions in Node.js?",
        "options": ["assert", "test", "mocha", "jest"],
        "answer": "assert"
    },
    {
        "question": "In what Node.js version was the native, built-in test runner ('node:test') introduced?",
        "options": ["Node.js 18", "Node.js 14", "Node.js 16", "Node.js 20"],
        "answer": "Node.js 18"
    },
    {
        "question": "What does the console.time() and console.timeEnd() methods do?",
        "options": ["Measure the duration of operations between the two matching labels", "Print timestamps in ISO format", "Print current CPU cycles", "Control system clock configurations"],
        "answer": "Measure the duration of operations between the two matching labels"
    },
    {
        "question": "How do you generate a memory heap dump to diagnose leaks in Node.js?",
        "options": ["v8.writeHeapSnapshot()", "process.dumpHeap()", "global.heapDump()", "console.snapshot()"],
        "answer": "v8.writeHeapSnapshot()"
    },
    {
        "question": "What is the purpose of the 'v8' module in Node.js?",
        "options": ["To access APIs specific to the V8 engine, like heap statistics and serialization", "To compile JavaScript manually", "To configure V8 thread priorities", "To interface with graphics hardware"],
        "answer": "To access APIs specific to the V8 engine, like heap statistics and serialization"
    },
    {
        "question": "Which method returns heap memory usage details of the current process?",
        "options": ["process.memoryUsage()", "os.freemem()", "v8.getHeapSpaceStatistics()", "process.heapUsage()"],
        "answer": "process.memoryUsage()"
    },
    {
        "question": "What is the purpose of 'AsyncLocalStorage' from AsyncHooks module?",
        "options": ["To store state across asynchronous execution lifetimes (like request-scoped context)", "To store data in browser localStorage from server", "An encrypted storage system for API tokens", "A key-value cache built into the OS kernel"],
        "answer": "To store state across asynchronous execution lifetimes (like request-scoped context)"
    },
    {
        "question": "Which command-line option automatically restarts the Node.js process when a file changes (native watcher introduced in Node.js 18/20)?",
        "options": ["--watch", "--nodemon", "--reload", "--live"],
        "answer": "--watch"
    },
    # Ecosystem & Express
    {
        "question": "What is Express.js?",
        "options": ["A minimal and flexible Node.js web application framework", "A database connector for Node.js", "A deployment tool for AWS", "A testing library for frontend UI"],
        "answer": "A minimal and flexible Node.js web application framework"
    },
    {
        "question": "In Express.js, what is middleware?",
        "options": ["Functions that have access to the request object, response object, and the next middleware function", "A database indexing protocol", "The layer that compiles JavaScript to machine code", "A CSS parser for express templates"],
        "answer": "Functions that have access to the request object, response object, and the next middleware function"
    },
    {
        "question": "Which method on an Express app registers route handlers for HTTP GET requests?",
        "options": ["app.get()", "app.post()", "app.route('get')", "app.handler()"],
        "answer": "app.get()"
    },
    {
        "question": "Which Express middleware is commonly used to parse JSON payloads?",
        "options": ["express.json()", "express.urlencoded()", "body-parser.json()", "Both express.json() and body-parser.json() are valid"],
        "answer": "Both express.json() and body-parser.json() are valid"
    },
    {
        "question": "How do you serve static files like images and CSS in Express?",
        "options": ["express.static() middleware", "fs.readFile() inside request handlers", "express.assets() module", "Using the http module fallback"],
        "answer": "express.static() middleware"
    },
    {
        "question": "In Express.js, how do you handle route parameters like '/users/:id'?",
        "options": ["req.params.id", "req.query.id", "req.body.id", "req.route.params(id)"],
        "answer": "req.params.id"
    },
    {
        "question": "In Express, what parameters does an error-handling middleware function accept?",
        "options": ["err, req, res, next", "req, res, next", "err, req, res", "err, next"],
        "answer": "err, req, res, next"
    },
    {
        "question": "Which node-based tool is popular for managing Node.js processes in production (providing reload and monitoring)?",
        "options": ["PM2", "Nodemon", "Forever", "Webpack"],
        "answer": "PM2"
    },
    {
        "question": "Which file in an NPM package specifies entrypoints, run scripts, metadata, and dependencies?",
        "options": ["package.json", "index.js", "npm.config", "package-lock.json"],
        "answer": "package.json"
    },
    {
        "question": "Which registry is the default host for npm packages?",
        "options": ["npmjs.com", "github.com", "node-modules.org", "deno.land"],
        "answer": "npmjs.com"
    },
    # General & Best Practices
    {
        "question": "How can you securely store sensitive keys and API passwords in a Node.js project?",
        "options": ["Using environment variables (.env files loaded via dotenv)", "Hardcoding them in a secondary utility file", "Saving them in the public git repository", "Storing them in a plain text package.json field"],
        "answer": "Using environment variables (.env files loaded via dotenv)"
    },
    {
        "question": "Which built-in module assists with deep object equality testing and type checking?",
        "options": ["util", "assert", "process", "console"],
        "answer": "util"
    },
    {
        "question": "What is the purpose of 'process.env.NODE_ENV'?",
        "options": ["To define the runtime environment state, commonly 'development' or 'production'", "To specify the Node.js engine version", "To declare OS details", "To control dependency installations"],
        "answer": "To define the runtime environment state, commonly 'development' or 'production'"
    },
    {
        "question": "What happens when an uncaught exception is thrown in Node.js?",
        "options": ["The process terminates immediately by default, printing a stack trace", "The event loop resets and ignores the error", "The current active request is aborted but the server continues", "The error is forwarded to standard output and logged in system logs"],
        "answer": "The process terminates immediately by default, printing a stack trace"
    },
    {
        "question": "How can you listen for exceptions that are not caught in any try-catch block?",
        "options": ["process.on('uncaughtException', callback)", "process.on('error', callback)", "global.onException(callback)", "console.onError(callback)"],
        "answer": "process.on('uncaughtException', callback)"
    },
    {
        "question": "What does a promise rejection that is not handled trigger?",
        "options": ["'unhandledRejection' event on process", "'error' event on process", "Process exit immediately with code 1", "An alert in V8 browser debugger"],
        "answer": "'unhandledRejection' event on process"
    },
    {
        "question": "Which module allows resolving DNS queries like looking up IP addresses of domains?",
        "options": ["dns", "net", "http", "url"],
        "answer": "dns"
    },
    {
        "question": "Which core module contains zlib compression algorithms?",
        "options": ["zlib", "crypto", "fs", "util"],
        "answer": "zlib"
    },
    {
        "question": "Which core module is responsible for reading credentials and opening HTTPS servers?",
        "options": ["https", "http", "tls", "net"],
        "answer": "https"
    },
    {
        "question": "What is the security risk associated with eval() in Node.js?",
        "options": ["Allows arbitrary command execution and code injection vulnerabilities", "Increases garbage collection cycles", "Restricts module imports", "Forces synchronous blocking threads"],
        "answer": "Allows arbitrary command execution and code injection vulnerabilities"
    }
]

# 200 React & Next.js Questions
react_next_questions = []

# Generate React Questions (1 to 100)
react_questions_pool = [
    # React Core & JSX
    {
        "question": "What is React?",
        "options": ["A JavaScript library for building user interfaces", "A full-blown server framework", "A database engine", "A stylesheet language compiler"],
        "answer": "A JavaScript library for building user interfaces"
    },
    {
        "question": "Who maintains React?",
        "options": ["Meta (Facebook) and community", "Google", "Microsoft", "Twitter"],
        "answer": "Meta (Facebook) and community"
    },
    {
        "question": "What is JSX?",
        "options": ["JavaScript XML, syntax extension to write HTML-like tags inside JavaScript", "Java Server Extension", "JavaScript compiler library", "JSON XML parser"],
        "answer": "JavaScript XML, syntax extension to write HTML-like tags inside JavaScript"
    },
    {
        "question": "Can browsers read JSX code natively?",
        "options": ["No, JSX must be transpiled into standard JavaScript (e.g., via Babel) first", "Yes, all modern engines compile JSX natively", "Yes, but only in strict mode", "No, browsers need Web Assembly to run JSX"],
        "answer": "No, JSX must be transpiled into standard JavaScript (e.g., via Babel) first"
    },
    {
        "question": "What is the Virtual DOM in React?",
        "options": ["A lightweight, in-memory representation of the real DOM used for reconciliation", "A browser extension to view layouts", "A secondary window for multi-display applications", "An administrative console to control components"],
        "answer": "A lightweight, in-memory representation of the real DOM used for reconciliation"
    },
    {
        "question": "What is the React reconciliation process?",
        "options": ["Diffing the Virtual DOM tree with the new states to update only changed nodes in the real DOM", "Resolving merge conflicts in Git repositories", "Connecting database queries to components", "Optimizing asset sizes"],
        "answer": "Diffing the Virtual DOM tree with the new states to update only changed nodes in the real DOM"
    },
    {
        "question": "Which method was traditionally used in React class components to render UI?",
        "options": ["render()", "draw()", "getUI()", "paint()"],
        "answer": "render()"
    },
    {
        "question": "In React, how do you pass data down from parent to child components?",
        "options": ["Props", "State", "Context", "Hooks"],
        "answer": "Props"
    },
    {
        "question": "Are props in React components read-only or mutable?",
        "options": ["Read-only (immutable)", "Mutable by the child component directly", "Mutable if declared in strict mode", "Immutable only in functional components"],
        "answer": "Read-only (immutable)"
    },
    {
        "question": "What is 'state' in a React component?",
        "options": ["An object that holds mutable data local to the component that may change over time", "A global styling flag", "A system variable that controls production deployments", "The current route URL location"],
        "answer": "An object that holds mutable data local to the component that may change over time"
    },
    {
        "question": "Which React hook is used to add local state to functional components?",
        "options": ["useState", "useEffect", "useContext", "useReducer"],
        "answer": "useState"
    },
    {
        "question": "What does the useState hook return?",
        "options": ["An array with the current state value and a setter function to update it", "A single state object", "An event listener mapping", "A promise resolving to the state"],
        "answer": "An array with the current state value and a setter function to update it"
    },
    {
        "question": "Can you directly mutate a state variable (e.g., state = 5) in React?",
        "options": ["No, you must always use the state setter function to trigger re-renders", "Yes, React watches state dynamically and detects all direct mutations", "Yes, but only inside useEffect blocks", "No, unless it is a primitive type"],
        "answer": "No, you must always use the state setter function to trigger re-renders"
    },
    {
        "question": "What is the purpose of the 'key' prop when rendering lists of components?",
        "options": ["To help React identify which items have changed, been added, or removed for efficient DOM diffing", "To encrypt list data for secure transport", "To bind inline CSS rules to specific rows", "To configure list sorting indexes"],
        "answer": "To help React identify which items have changed, been added, or removed for efficient DOM diffing"
    },
    {
        "question": "Is it recommended to use array indexes as keys in React lists?",
        "options": ["No, using index as key can cause visual bugs and performance issues when list items shift order", "Yes, index is the most efficient and recommended key always", "Yes, but only if the list has more than 100 elements", "Only if the items are strings"],
        "answer": "No, using index as key can cause visual bugs and performance issues when list items shift order"
    },
    {
        "question": "What is the children prop in React?",
        "options": ["A special prop that passes components nested inside parent tags to the parent component", "An array of child state listeners", "The component index in the DOM hierarchy", "A reserved database key"],
        "answer": "A special prop that passes components nested inside parent tags to the parent component"
    },
    {
        "question": "Which hook is used to handle side effects (data fetching, subscriptions, manual DOM changes) in functional components?",
        "options": ["useEffect", "useState", "useMemo", "useRef"],
        "answer": "useEffect"
    },
    {
        "question": "What happens if you pass an empty array ([]) as the dependency array to a useEffect hook?",
        "options": ["The effect runs only once after the component mounts", "The effect runs on every single render cycle", "The effect never runs at all", "The component throws a compilation warning"],
        "answer": "The effect runs only once after the component mounts"
    },
    {
        "question": "How do you clean up side effects (like clear intervals or unsubscribing) inside useEffect?",
        "options": ["Return a cleanup function from the effect callback", "Call useEffect.cleanup() manually", "Add a null dependency item in the list", "React handles all cleanup automatically with no code required"],
        "answer": "Return a cleanup function from the effect callback"
    },
    {
        "question": "What happens if you omit the dependency array in useEffect altogether?",
        "options": ["The effect runs on every single render cycle", "The effect runs only on mount", "The effect runs only when state changes", "An error is thrown"],
        "answer": "The effect runs on every single render cycle"
    },
    # React Hooks Deep-dive
    {
        "question": "Which hook is used to create direct references to DOM nodes or persist mutable values across renders without triggering a re-render?",
        "options": ["useRef", "useMemo", "useState", "useId"],
        "answer": "useRef"
    },
    {
        "question": "What property on a ref object returned by useRef holds the reference value?",
        "options": [".current", ".value", ".element", ".node"],
        "answer": ".current"
    },
    {
        "question": "Which hook is used to memoize expensive computations so they are only re-calculated when dependencies change?",
        "options": ["useMemo", "useCallback", "useRef", "useContext"],
        "answer": "useMemo"
    },
    {
        "question": "What is the difference between useMemo and useCallback?",
        "options": ["useMemo memoizes the returned value of a function; useCallback memoizes the function instance itself", "useMemo is synchronous whereas useCallback is asynchronous", "useCallback triggers state updates; useMemo does not", "There is no difference"],
        "answer": "useMemo memoizes the returned value of a function; useCallback memoizes the function instance itself"
    },
    {
        "question": "Which hook is used to share state/data globally across nested components without prop-drilling?",
        "options": ["useContext", "useReducer", "useStore", "useMemo"],
        "answer": "useContext"
    },
    {
        "question": "Which React API is used to create a Context object?",
        "options": ["React.createContext", "React.useContext", "React.defineContext", "React.newContext"],
        "answer": "React.createContext"
    },
    {
        "question": "Which hook is an alternative to useState, preferred for managing complex state objects and state transitions (often using a reducer function)?",
        "options": ["useReducer", "useCallback", "useStateful", "useReducerState"],
        "answer": "useReducer"
    },
    {
        "question": "What does a reducer function passed to useReducer receive as arguments?",
        "options": ["(state, action)", "(action, payload)", "(state, setter)", "(dispatch, action)"],
        "answer": "(state, action)"
    },
    {
        "question": "Which hook was introduced in React 18 to generate unique IDs for accessibility attributes that are stable across SSR?",
        "options": ["useId", "useAccessibilityId", "useUID", "useRefId"],
        "answer": "useId"
    },
    {
        "question": "Which hook is used to defer updating parts of the UI during heavy computations to keep the main thread responsive?",
        "options": ["useDeferredValue", "useTransition", "useDeferredState", "useLayoutEffect"],
        "answer": "useDeferredValue"
    },
    {
        "question": "What is the difference between useEffect and useLayoutEffect?",
        "options": ["useLayoutEffect runs synchronously after all DOM mutations but before the browser paints; useEffect runs asynchronously after browser paint", "useLayoutEffect runs on server and client; useEffect runs on client only", "useLayoutEffect is deprecated in modern React", "There is no difference in execution timing"],
        "answer": "useLayoutEffect runs synchronously after all DOM mutations but before the browser paints; useEffect runs asynchronously after browser paint"
    },
    {
        "question": "What are the rules of Hooks in React?",
        "options": ["Only call hooks at the top level (not inside loops or conditions) and only call them from React function components or custom hooks", "Only call hooks inside class render methods", "Only call hooks in development environments", "Hooks must always return array structures"],
        "answer": "Only call hooks at the top level (not inside loops or conditions) and only call them from React function components or custom hooks"
    },
    {
        "question": "Can you use React Hooks inside a standard JavaScript helper function that is not a component or custom hook?",
        "options": ["No, it violates the rules of hooks and will fail at runtime", "Yes, hooks can be used anywhere in JavaScript files", "Yes, if it is imported using ES module syntax", "Only if it is a promise resolver"],
        "answer": "No, it violates the rules of hooks and will fail at runtime"
    },
    {
        "question": "What prefix must custom hooks follow by convention?",
        "options": ["use", "get", "react", "make"],
        "answer": "use"
    },
    # Component Patterns & Advanced React
    {
        "question": "What is a React Fragment (<>...</> or <React.Fragment>)?",
        "options": ["A clean wrapper that groups multiple elements without adding an extra node to the real DOM", "A styling divider class", "A code splitting chunk generated by bundlers", "A component that catches runtime errors"],
        "answer": "A clean wrapper that groups multiple elements without adding an extra node to the real DOM"
    },
    {
        "question": "Which prop is NOT accepted by the short syntax (<>...</>) React Fragment wrapper?",
        "options": ["key", "id", "style", "className"],
        "answer": "key"
    },
    {
        "question": "What are Controlled Components in React?",
        "options": ["Components whose form element values are managed and updated by React state", "Components managed by Redux stores only", "Class components containing boundary limits", "Components with strict prop validation"],
        "answer": "Components whose form element values are managed and updated by React state"
    },
    {
        "question": "What are Uncontrolled Components in React?",
        "options": ["Components where the DOM handles form values directly, accessed using refs", "Components that run wild loop iterations", "Components without styling stylesheets", "API routing middlewares"],
        "answer": "Components where the DOM handles form values directly, accessed using refs"
    },
    {
        "question": "What is the purpose of React.memo?",
        "options": ["A higher-order component that skips rendering a component if its props have not changed", "A database system to store user inputs", "A memoization hook for functional computations", "A debug configuration for VSCode"],
        "answer": "A higher-order component that skips rendering a component if its props have not changed"
    },
    {
        "question": "What is a Portal in React (ReactDOM.createPortal)?",
        "options": ["A feature that renders children into a DOM node outside the parent component's DOM hierarchy", "A gateway routing protocol", "An entrypoint to fetch server data", "A bridge between Native Swift and web React code"],
        "answer": "A feature that renders children into a DOM node outside the parent component's DOM hierarchy"
    },
    {
        "question": "What is an Error Boundary in React?",
        "options": ["A class component that catches JavaScript errors anywhere in its child component tree and displays fallback UI", "A global try-catch statement wrapping index.js", "A Webpack plugin to report compilation failures", "An Express middleware routing module"],
        "answer": "A class component that catches JavaScript errors anywhere in its child component tree and displays fallback UI"
    },
    {
        "question": "Can functional components be Error Boundaries in modern React directly?",
        "options": ["No, error boundaries must implement lifecycle methods (componentDidCatch/getDerivedStateFromError) which are class-only", "Yes, using the useErrorBoundary hook", "Yes, functional components catch all parent errors by default", "Only if transpiled with Babel"],
        "answer": "No, error boundaries must implement lifecycle methods (componentDidCatch/getDerivedStateFromError) which are class-only"
    },
    {
        "question": "What is React StrictMode?",
        "options": ["A development-only tool for highlighting potential problems in an application (triggers double mounts to detect side effects)", "A production compiler setting for security", "A typescript configuration checker", "A system variable that bans console.log statements"],
        "answer": "A development-only tool for highlighting potential problems in an application (triggers double mounts to detect side effects)"
    },
    {
        "question": "Which React API allows dynamic importing of components for code splitting?",
        "options": ["React.lazy()", "React.split()", "React.import()", "React.dynamic()"],
        "answer": "React.lazy()"
    },
    {
        "question": "What component is required to wrap lazy-loaded components to show fallback UI while loading?",
        "options": ["Suspense", "ErrorBoundary", "Loader", "Fallback"],
        "answer": "Suspense"
    },
    {
        "question": "Which React Hook was introduced in React 18 to handle transactions and identify low-priority state transitions?",
        "options": ["useTransition", "useDeferredValue", "useSyncExternalStore", "useInsertionEffect"],
        "answer": "useTransition"
    },
    {
        "question": "Which hook allows subscribing to external data stores in a way that is compatible with React concurrent rendering features?",
        "options": ["useSyncExternalStore", "useExternalStore", "useStoreSubscription", "useSelector"],
        "answer": "useSyncExternalStore"
    },
    {
        "question": "What is prop drilling?",
        "options": ["Passing props through multiple nested child components down to a distant grandchild that actually needs the data", "Executing test suites on component properties", "Validating prop types using runtime frameworks", "Connecting API properties to React forms"],
        "answer": "Passing props through multiple nested child components down to a distant grandchild that actually needs the data"
    },
    {
        "question": "Which library was historically standard for enforcing type safety on props at runtime before TypeScript became popular?",
        "options": ["prop-types", "typescript-check", "prop-validator", "flow"],
        "answer": "prop-types"
    },
    {
        "question": "How do you define default values for props in React functional components natively?",
        "options": ["Using standard JavaScript ES6 destructuring default values in function arguments", "Using component.defaultProps = {} object configuration", "Declaring them inside a useEffect block", "Both ES6 destructuring and defaultProps are valid (though defaultProps is deprecated for functional components)"],
        "answer": "Both ES6 destructuring and defaultProps are valid (though defaultProps is deprecated for functional components)"
    },
    # State Management & Libraries
    {
        "question": "What is Redux?",
        "options": ["A predictable state container for JavaScript apps based on flux architecture", "A server template engine", "An API framework similar to GraphQL", "A unit testing assertion package"],
        "answer": "A predictable state container for JavaScript apps based on flux architecture"
    },
    {
        "question": "What is the role of an 'action' in Redux?",
        "options": ["A plain JavaScript object that describes what happened (must contain a type property)", "A database trigger event", "A transition animation class", "A script runner in package.json"],
        "answer": "A plain JavaScript object that describes what happened (must contain a type property)"
    },
    {
        "question": "What is a 'store' in Redux?",
        "options": ["The centralized object tree holding the entire application state", "The cloud hosting database", "An asset pipeline folder", "The npm registry account"],
        "answer": "The centralized object tree holding the entire application state"
    },
    {
        "question": "What is a 'reducer' in Redux?",
        "options": ["A pure function that takes the current state and an action, and returns the next state", "A compiler that minifies code bundles", "A system process that cleans dead threads", "A styling utility for SVG filters"],
        "answer": "A pure function that takes the current state and an action, and returns the next state"
    },
    {
        "question": "Which popular library provides a simplified toolkit to configure and write Redux boilerplate efficiently?",
        "options": ["Redux Toolkit (RTK)", "Redux Saga", "Redux Thunk", "Zustand"],
        "answer": "Redux Toolkit (RTK)"
    },
    {
        "question": "What hook from react-redux is used to access state from the Redux store in functional components?",
        "options": ["useSelector", "useStoreState", "useDispatch", "useRedux"],
        "answer": "useSelector"
    },
    {
        "question": "What hook from react-redux is used to dispatch actions to the Redux store?",
        "options": ["useDispatch", "useAction", "useSelector", "useStoreDispatch"],
        "answer": "useDispatch"
    },
    {
        "question": "Which minimal, fast, and unopinionated state management library uses a store creator and hook-based API (highly popular alternative to Redux)?",
        "options": ["Zustand", "MobX", "Recoil", "Jotai"],
        "answer": "Zustand"
    },
    {
        "question": "Which atomic-state management library for React defines state blocks as 'atoms' and 'selectors'?",
        "options": ["Recoil", "Redux", "Zustand", "Context"],
        "answer": "Recoil"
    },
    {
        "question": "What is the purpose of React Query (TanStack Query)?",
        "options": ["To fetch, cache, synchronize, and update server state in React applications", "To compile database query strings", "To manage UI client states like open modals", "To parse query parameters from the URL"],
        "answer": "To fetch, cache, synchronize, and update server state in React applications"
    }
]

# Add more React questions to reach 100 React questions
for idx, q in enumerate(react_questions_pool):
    react_next_questions.append({
        "question": f"({idx+1}/200 React) {q['question']}",
        "options": q["options"],
        "answer": q["answer"]
    })

# Add 40 additional React questions
extra_react_pool = [
    {
        "question": "What is the correct syntax to create a ref in a functional component?",
        "options": ["const myRef = useRef(null);", "const myRef = createRef();", "const myRef = React.ref();", "const myRef = useRef.create();"],
        "answer": "const myRef = useRef(null);"
    },
    {
        "question": "What React compiler optimization was introduced at React Conf 2024 to automate memoization?",
        "options": ["React Compiler (React Forget)", "React Memoizer", "TurboMemo", "V8 React Optimizer"],
        "answer": "React Compiler (React Forget)"
    },
    {
        "question": "In React 18, what is the default behavior of state update batching?",
        "options": ["Automatic batching: updates inside promises, timeouts, and native events are batched together", "Batching is only supported in class render cycles", "State updates are never batched unless wrapped in flushSync()", "Batching is only active in strict mode"],
        "answer": "Automatic batching: updates inside promises, timeouts, and native events are batched together"
    },
    {
        "question": "What is hydration in React?",
        "options": ["The client-side process of attaching event listeners to static HTML rendered by the server", "Pre-fetching API responses before component loads", "Clearing system caches after building bundles", "Compressing SVG styles for transmission"],
        "answer": "The client-side process of attaching event listeners to static HTML rendered by the server"
    },
    {
        "question": "Which utility from react-dom is used to render a React application root node in React 18?",
        "options": ["createRoot", "render", "hydrate", "createApp"],
        "answer": "createRoot"
    },
    {
        "question": "What is the purpose of the forwardRef API?",
        "options": ["To let a component forward a DOM ref it receives to a child component further down the tree", "To speed up state propagation in forms", "To trigger re-renders from nested lists", "To encrypt parent component coordinates"],
        "answer": "To let a component forward a DOM ref it receives to a child component further down the tree"
    },
    {
        "question": "Which lifecycle method in class components was called immediately after a component was updated in the DOM?",
        "options": ["componentDidUpdate", "componentDidMount", "shouldComponentUpdate", "componentWillUpdate"],
        "answer": "componentDidUpdate"
    },
    {
        "question": "Which class component lifecycle method returns a boolean to control whether React should render a component again?",
        "options": ["shouldComponentUpdate", "componentWillUpdate", "getDerivedStateFromProps", "render"],
        "answer": "shouldComponentUpdate"
    },
    {
        "question": "Which hook can be used to read contextual layout metrics like scroll positions before the browser paints?",
        "options": ["useLayoutEffect", "useEffect", "useInsertionEffect", "useDeferredValue"],
        "answer": "useLayoutEffect"
    },
    {
        "question": "Which hook is specifically reserved for CSS-in-JS library developers to insert style tags before DOM mutations?",
        "options": ["useInsertionEffect", "useLayoutEffect", "useStyleEffect", "useDeferredValue"],
        "answer": "useInsertionEffect"
    },
    {
        "question": "What is the primary architectural concept of React design regarding state?",
        "options": ["Lifting state up: sharing state by moving it to the closest common ancestor of components that need it", "Encapsulating state strictly inside individual leaf nodes", "Storing all parameters inside global environmental variables", "Using index signatures for component contexts"],
        "answer": "Lifting state up: sharing state by moving it to the closest common ancestor of components that need it"
    },
    {
        "question": "How do you set a class attribute on a DOM element in JSX?",
        "options": ["className", "class", "styleClass", "classList"],
        "answer": "className"
    },
    {
        "question": "How do you pass inline styles in React JSX?",
        "options": ["Using an object: style={{ color: 'red', fontSize: '12px' }}", "Using a string: style=\"color: red; font-size: 12px\"", "Using an array: style={['color: red', 'font-size: 12px']}", "Using variable functions only"],
        "answer": "Using an object: style={{ color: 'red', fontSize: '12px' }}"
    },
    {
        "question": "What attribute is used for rendering raw HTML safely (though dangerous) in JSX?",
        "options": ["dangerouslySetInnerHTML", "innerHtml", "htmlContent", "unsafeHTML"],
        "answer": "dangerouslySetInnerHTML"
    },
    {
        "question": "What tag is used in React to capture loading states at a granular level when routing asynchronously?",
        "options": ["Suspense", "Loader", "PromiseBoundary", "StateBoundary"],
        "answer": "Suspense"
    },
    {
        "question": "How does React handle cross-site scripting (XSS) protections in string expressions?",
        "options": ["React automatically escapes values before rendering them to the DOM", "React rejects all string values containing XML tags", "React runs a sandbox iframe", "No protections are present natively"],
        "answer": "React automatically escapes values before rendering them to the DOM"
    },
    {
        "question": "What is the default value of a boolean prop in JSX if only its name is written (e.g. <MyInput disabled />)?",
        "options": ["true", "false", "undefined", "null"],
        "answer": "true"
    },
    {
        "question": "What is a React Higher-Order Component (HOC)?",
        "options": ["A pure function that takes a component and returns a new enhanced component", "A component that has high priority in rendering", "A class component with many child elements", "An administrative server module"],
        "answer": "A pure function that takes a component and returns a new enhanced component"
    },
    {
        "question": "Which React hook returns a memoized callback function?",
        "options": ["useCallback", "useMemo", "useRef", "useTransition"],
        "answer": "useCallback"
    },
    {
        "question": "Which hook provides the state and action dispatcher in a Redux store natively?",
        "options": ["useDispatch", "useSelector", "useStore", "All of the above are valid Redux hooks"],
        "answer": "All of the above are valid Redux hooks"
    },
    {
        "question": "In React 18, what is concurrency?",
        "options": ["The ability of React to pause, yield, or resume rendering cycles to ensure UI responsiveness", "The ability to run multiple Node processes simultaneously", "An optimization to cache static files", "A feature that handles parallel database writing"],
        "answer": "The ability of React to pause, yield, or resume rendering cycles to ensure UI responsiveness"
    },
    {
        "question": "What error occurs if you call a React hook inside a standard conditional statement (if-else)?",
        "options": ["Violates hook calling order rule and breaks component state tracking at runtime", "A compilation warning only, no runtime impact", "Increases bundle size slightly", "Evaluates state only on truthy path"],
        "answer": "Violates hook calling order rule and breaks component state tracking at runtime"
    },
    {
        "question": "How can you trigger a re-render in a React component manually without changing state content?",
        "options": ["By updating a state variable to a new shallow copy or using a force-update trigger hook", "By calling window.location.reload()", "By updating a useRef value", "By calling React.render() again on the node"],
        "answer": "By updating a state variable to a new shallow copy or using a force-update trigger hook"
    },
    {
        "question": "What does ReactDOMServer.renderToString do?",
        "options": ["Renders a React component tree to its raw HTML string representation, used in SSR", "Translates JSX code into TypeScript classes", "Parses JSON files to HTML structures", "Generates public assets from React folders"],
        "answer": "Renders a React component tree to its raw HTML string representation, used in SSR"
    },
    {
        "question": "Which component allows rendering in child-independent root windows?",
        "options": ["ReactDOM.createPortal", "React.lazy", "React.Fragment", "React.StrictMode"],
        "answer": "ReactDOM.createPortal"
    },
    {
        "question": "Which package is used to build React native apps for iOS and Android?",
        "options": ["react-native", "react-dom", "react-mobile", "expo-core"],
        "answer": "react-native"
    },
    {
        "question": "What is the core state management system of React Context?",
        "options": ["A Provider-Consumer configuration mapping value distributions", "A Redux dispatcher engine", "A LocalStorage backup layer", "A memory heap pool managed by Chrome"],
        "answer": "A Provider-Consumer configuration mapping value distributions"
    },
    {
        "question": "Which hook can be used to retrieve accessibility IDs safely?",
        "options": ["useId", "useLayoutEffect", "useRef", "useDeferredValue"],
        "answer": "useId"
    },
    {
        "question": "What is code splitting?",
        "options": ["Dividing a codebase into smaller dynamic bundles that are loaded only when needed, optimizing load speeds", "Separating HTML tags from JavaScript syntax", "Writing tests in separate directories", "Refactoring files to contain less than 100 lines"],
        "answer": "Dividing a codebase into smaller dynamic bundles that are loaded only when needed, optimizing load speeds"
    },
    {
        "question": "In React, what are render props?",
        "options": ["A pattern where a component receives a function returning JSX as a prop, sharing code behavior", "Props specifically declared for canvas drawing", "System tokens containing dark/light mode configurations", "The process of compiling styles"],
        "answer": "A pattern where a component receives a function returning JSX as a prop, sharing code behavior"
    },
    {
        "question": "What is the purpose of the shouldComponentUpdate lifecycle method?",
        "options": ["To optimize performance by telling React if a component's output is not affected by state/prop changes", "To initialize state values", "To capture DOM errors", "To handle API request responses"],
        "answer": "To optimize performance by telling React if a component's output is not affected by state/prop changes"
    },
    {
        "question": "What occurs when the dependency array of a useEffect is completely missing?",
        "options": ["The effect callback runs after every single render of the component", "The hook is bypassed and never executes", "The application throws a syntax warning", "The compiler blocks build scripts"],
        "answer": "The effect callback runs after every single render of the component"
    },
    {
        "question": "What is a pure component in React?",
        "options": ["A component that renders the same output given the same props and state, without side effects", "A component that has no internal state variables", "A component written using only native HTML elements", "A class component that doesn't inherit from React.Component"],
        "answer": "A component that renders the same output given the same props and state, without side effects"
    },
    {
        "question": "Can custom hooks return values like arrays, objects, or functions?",
        "options": ["Yes, they can return any valid JavaScript values or hooks", "No, they must only return JSX tags", "No, they must only return boolean states", "Yes, but they cannot return other hook executors"],
        "answer": "Yes, they can return any valid JavaScript values or hooks"
    },
    {
        "question": "What does useReducer return?",
        "options": ["The current state and a dispatch function to trigger actions", "The initial state and a compiler configuration", "A state history array", "A promise resolving state objects"],
        "answer": "The current state and a dispatch function to trigger actions"
    },
    {
        "question": "What occurs during double mounts in React StrictMode development environments?",
        "options": ["Mounts, unmounts, and mounts components again to verify cleanup functions are correctly implemented", "Increases compilation speeds by 2x", "Triggers two database writing cycles", "Creates backup duplicates of components in memory"],
        "answer": "Mounts, unmounts, and mounts components again to verify cleanup functions are correctly implemented"
    },
    {
        "question": "What package must be used to perform test assertions on React components in a node container?",
        "options": ["@testing-library/react", "react-dom/server", "react-assert", "jest-react-core"],
        "answer": "@testing-library/react"
    },
    {
        "question": "What is the purpose of React.lazy?",
        "options": ["To lazily import dynamic components, enabling lazy loading of application pages", "To pause state updates during network requests", "To delay thread executions in Node.js", "To handle asynchronous loops in JSX"],
        "answer": "To lazily import dynamic components, enabling lazy loading of application pages"
    },
    {
        "question": "What occurs if you attempt to use React hooks inside a class component?",
        "options": ["It will throw a runtime syntax warning and fail to execute", "It works perfectly if wrapped in render methods", "It works in strict mode only", "It slows down rendering cycle rates"],
        "answer": "It will throw a runtime syntax warning and fail to execute"
    },
    {
        "question": "How are custom hook dependencies managed?",
        "options": ["The custom hook forwards dependencies to built-in hooks (like useEffect/useMemo) inside it", "They are declared in package.json files", "They are cached in system environment variables", "They are tracked by standard V8 engine loops"],
        "answer": "The custom hook forwards dependencies to built-in hooks (like useEffect/useMemo) inside it"
    }
]

for idx, q in enumerate(extra_react_pool):
    react_next_questions.append({
        "question": f"({idx+61}/200 React) {q['question']}",
        "options": q["options"],
        "answer": q["answer"]
    })

# Generate Next.js Questions (101 to 200)
nextjs_questions_pool = [
    # Next.js Foundations & Routing
    {
        "question": "What is Next.js?",
        "options": ["A React framework for production with SSR, static generation, and routing features", "A database engine for JavaScript", "A browser build bundler alternative to Webpack", "A testing framework for Node.js"],
        "answer": "A React framework for production with SSR, static generation, and routing features"
    },
    {
        "question": "Which company created and maintains Next.js?",
        "options": ["Vercel", "Netlify", "Meta", "Google"],
        "answer": "Vercel"
    },
    {
        "question": "What are the two major routing directories supported in modern Next.js applications?",
        "options": ["Pages Router (pages/) and App Router (app/)", "Source Router (src/) and Build Router (dist/)", "Static Router (static/) and Dynamic Router (dynamic/)", "Public Router (public/) and Server Router (server/)"],
        "answer": "Pages Router (pages/) and App Router (app/)"
    },
    {
        "question": "Which router is the modern standard introducing React Server Components in Next.js 13+?",
        "options": ["App Router", "Pages Router", "Core Router", "Dynamic Router"],
        "answer": "App Router"
    },
    {
        "question": "In the Pages Router, how are routes defined?",
        "options": ["File-system based: the filename inside the pages/ folder maps directly to the URL route", "Inside a central next.config.js routing map", "Using express app.get() methods inside API folders", "Inside router.ts config paths"],
        "answer": "File-system based: the filename inside the pages/ folder maps directly to the URL route"
    },
    {
        "question": "In the App Router, how are routes defined?",
        "options": ["Folder-based: folders define routes, and a page.js/page.tsx file inside a folder makes the route publicly accessible", "Using files like index.js directly", "Configured inside middleware.ts declarations", "Configured in package.json exports"],
        "answer": "Folder-based: folders define routes, and a page.js/page.tsx file inside a folder makes the route publicly accessible"
    },
    {
        "question": "What file defines the main UI layout shared across multiple pages in the App Router?",
        "options": ["layout.js / layout.tsx", "template.js / template.tsx", "page.js / page.tsx", "root.js / root.tsx"],
        "answer": "layout.js / layout.tsx"
    },
    {
        "question": "In the App Router, what is the file layout structure of a nested route '/blog/first-post'?",
        "options": ["app/blog/first-post/page.tsx", "app/blog/first-post.tsx", "app/blog-first-post/page.tsx", "pages/blog/first-post/page.tsx"],
        "answer": "app/blog/first-post/page.tsx"
    },
    {
        "question": "How do you create dynamic routes in the App Router (e.g. matching '/users/123' dynamically)?",
        "options": ["Place the folder name in square brackets: app/users/[id]/page.tsx", "Prefix the folder name with a colon: app/users/:id/page.tsx", "Declare a wildcard parameter: app/users/*/page.tsx", "Configure the matching dynamic regex in next.config.js"],
        "answer": "Place the folder name in square brackets: app/users/[id]/page.tsx"
    },
    {
        "question": "How do you create catch-all routes in Next.js (matching '/docs/topic1/subtopic2' dynamically)?",
        "options": ["Use double square brackets with ellipsis: app/docs/[[...slug]]/page.tsx", "Use ellipsis in square brackets: app/docs/[...slug]/page.tsx", "Use wildcard folder: app/docs/*/page.tsx", "Both catch-all [...slug] and optional catch-all [[...slug]] are valid patterns"],
        "answer": "Both catch-all [...slug] and optional catch-all [[...slug]] are valid patterns"
    },
    {
        "question": "What is the difference between [...slug] and [[...slug]] catch-all routes in Next.js?",
        "options": ["[[...slug]] is optional, matching the parent route ('/docs') without parameters; [...slug] requires at least one parameter", "[[...slug]] matches only index files; [...slug] matches nested layouts", "[[...slug]] is Pages router syntax; [...slug] is App router only", "There is no difference"],
        "answer": "[[...slug]] is optional, matching the parent route ('/docs') without parameters; [...slug] requires at least one parameter"
    },
    {
        "question": "How do you exclude folders from routing directories without creating public routes in the App Router?",
        "options": ["Prefix the folder with an underscore: _components/", "Wrap the folder in parentheses: (components)/", "Add a next.config.js exclude mapping rule", "Use lowercase directory names only"],
        "answer": "Prefix the folder with an underscore: _components/"
    },
    {
        "question": "What are Route Groups in Next.js (created by wrapping folders in parentheses, e.g. '(marketing)')?",
        "options": ["Organizational groups to structure layouts without affecting the URL route path", "Folders containing API endpoint groups", "Admin authentication route configurations", "Static file directories containing images"],
        "answer": "Organizational groups to structure layouts without affecting the URL route path"
    },
    {
        "question": "Which file in Next.js defines custom HTTP headers, redirects, and rewrites?",
        "options": ["next.config.js", "middleware.ts", "package.json", "tsconfig.json"],
        "answer": "next.config.js"
    },
    {
        "question": "Which Next.js file acts as a gatekeeper, running code before a request is completed to handle geo-routing, auth, or redirects?",
        "options": ["middleware.js / middleware.ts", "layout.js / layout.tsx", "route.js / route.ts", "next.config.js"],
        "answer": "middleware.js / middleware.ts"
    },
    # Rendering Methods (SSR, SSG, Server Components)
    {
        "question": "What is SSR in the context of Next.js?",
        "options": ["Server-Side Rendering: pages are rendered on the server for each incoming request", "Static Site Rendering: pages are compiled once at build time", "Server State Reconciliation: checking db entities", "System Security Rules: validation configs"],
        "answer": "Server-Side Rendering: pages are rendered on the server for each incoming request"
    },
    {
        "question": "What is SSG in Next.js?",
        "options": ["Static Site Generation: pages are generated at build time and served as static HTML", "Server-Side Generation: pages are updated periodically", "Single State Gateways: routing patterns", "System Styling Guidelines: CSS variables"],
        "answer": "Static Site Generation: pages are generated at build time and served as static HTML"
    },
    {
        "question": "What is ISR (Incremental Static Regeneration)?",
        "options": ["Updating static pages in the background after they have been built and deployed without rebuilding the entire site", "Incremental styling compiling in Webpack", "Securing databases using incremental replication keys", "A dynamic routing protocol for microservices"],
        "answer": "Updating static pages in the background after they have been built and deployed without rebuilding the entire site"
    },
    {
        "question": "In the Pages Router, which function is used to fetch data for Server-Side Rendering (SSR)?",
        "options": ["getServerSideProps", "getStaticProps", "getInitialProps", "fetchServerData"],
        "answer": "getServerSideProps"
    },
    {
        "question": "In the Pages Router, which function is used to fetch data for Static Site Generation (SSG)?",
        "options": ["getStaticProps", "getServerSideProps", "getStaticPaths", "getInitialProps"],
        "answer": "getStaticProps"
    },
    {
        "question": "What function is required alongside getStaticProps in dynamic routes to specify list of dynamic IDs to generate at build time?",
        "options": ["getStaticPaths", "getServerSidePaths", "getDynamicRoutes", "generateStaticParams"],
        "answer": "getStaticPaths"
    },
    {
        "question": "In the App Router, what is the default rendering type of components?",
        "options": ["React Server Components (RSC): rendered on the server with zero client-side JavaScript overhead", "React Client Components: rendered on the browser", "Static HTML files only", "Dynamic template tags"],
        "answer": "React Server Components (RSC): rendered on the server with zero client-side JavaScript overhead"
    },
    {
        "question": "How do you declare a component as a Client Component in the App Router?",
        "options": ["Add the directive 'use client' at the very top of the file", "Set 'type': 'client' in package.json", "Name the file with a '.client.tsx' extension", "Configure client components inside next.config.js"],
        "answer": "Add the directive 'use client' at the very top of the file"
    },
    {
        "question": "Can you use React hooks like useState or useEffect inside a React Server Component?",
        "options": ["No, Server Components do not support local state or client-side lifecycle effects; you must use a Client Component", "Yes, Server Components support all hooks natively", "Yes, but only if they are declared inside try-catch blocks", "Only if strict mode is disabled"],
        "answer": "No, Server Components do not support local state or client-side lifecycle effects; you must use a Client Component"
    },
    {
        "question": "How do you fetch data inside a React Server Component in the App Router?",
        "options": ["Simply use standard async/await with fetch() directly inside the component function definition", "Use getStaticProps in the same file", "Use the useFetch hook", "Data must be fetched on client and passed via context"],
        "answer": "Simply use standard async/await with fetch() directly inside the component function definition"
    },
    {
        "question": "Can you import a Server Component directly into a Client Component?",
        "options": ["No, you should pass the Server Component as children or props to the Client Component rather than importing it directly", "Yes, you can import and render it directly with no configurations", "Yes, but only if compiled with Turbopack", "No, they must reside in completely separate build folders"],
        "answer": "No, you should pass the Server Component as children or props to the Client Component rather than importing it directly"
    },
    {
        "question": "What is the equivalent of getStaticPaths in the App Router?",
        "options": ["generateStaticParams", "getStaticPaths", "getDynamicRoutes", "getServerSideParams"],
        "answer": "generateStaticParams"
    },
    {
        "question": "What Next.js component should be used to display images, providing automatic sizing, optimization, and lazy loading?",
        "options": ["Image (from 'next/image')", "img (standard HTML tag)", "NextImage (from 'next/core')", "AssetImage"],
        "answer": "Image (from 'next/image')"
    },
    {
        "question": "What Next.js component provides client-side prefetching and navigation between routes?",
        "options": ["Link (from 'next/link')", "Anchor (from 'next/anchor')", "a (standard HTML tag)", "RouterLink"],
        "answer": "Link (from 'next/link')"
    },
    {
        "question": "What module optimizes and self-hosts Google Fonts automatically at build time in Next.js?",
        "options": ["next/font/google", "next/google-fonts", "next/style/fonts", "next/assets/fonts"],
        "answer": "next/font/google"
    },
    # Server Actions & API Routing
    {
        "question": "What are Server Actions in Next.js?",
        "options": ["Asynchronous functions defined with 'use server' that execute on the server, commonly invoked from forms in client components", "Scripts that run during vercel deployment pipelines", "Server-side cron jobs", "Express routing endpoints"],
        "answer": "Asynchronous functions defined with 'use server' that execute on the server, commonly invoked from forms in client components"
    },
    {
        "question": "How do you define a Server Action in Next.js?",
        "options": ["Add the directive 'use server' at the top of the function or file containing the action", "Set 'action': 'server' in package.json", "Put it inside the next.config.js server actions map", "Use getStaticProps to return action configurations"],
        "answer": "Add the directive 'use server' at the top of the function or file containing the action"
    },
    {
        "question": "In the App Router, how do you create custom API endpoints (e.g. GET/POST routes)?",
        "options": ["Create a route.js / route.ts file defining HTTP methods like GET, POST inside the app/ directory", "Use api/ folder with getInitialProps configurations", "Configure custom server middleware pipelines", "Using the pages/api/ directory only (Page router style)"],
        "answer": "Create a route.js / route.ts file defining HTTP methods like GET, POST inside the app/ directory"
    },
    {
        "question": "Can you have both page.tsx and route.ts in the same folder path segment in Next.js?",
        "options": ["No, page.tsx and route.ts in the same path will conflict and cause a build error", "Yes, GET goes to page and POST goes to route automatically", "Yes, but only in development environments", "Only if route.ts is defined in TSConfig"],
        "answer": "No, page.tsx and route.ts in the same path will conflict and cause a build error"
    },
    {
        "question": "Which function is used to invalidate the cached data on a specific route path or tag (on demand revalidation)?",
        "options": ["revalidatePath or revalidateTag", "clearCache", "invalidateCache", "refreshRoute"],
        "answer": "revalidatePath or revalidateTag"
    },
    {
        "question": "How do you configure Next.js to deploy as a completely static site (generating static HTML/CSS/JS files)?",
        "options": ["Set output: 'export' in next.config.js", "Set target: 'static' in package.json", "Run next build with the --static flag", "Static is default, no config is needed"],
        "answer": "Set output: 'export' in next.config.js"
    },
    {
        "question": "Which file handles global styles and font bindings in the Pages Router?",
        "options": ["_app.js / _app.tsx", "_document.js / _document.tsx", "index.css", "next.config.js"],
        "answer": "_app.js / _app.tsx"
    },
    {
        "question": "Which file handles raw index HTML structures (like <html> and <body> tags customization) in the Pages Router?",
        "options": ["_document.js / _document.tsx", "_app.js / _app.tsx", "index.html", "layout.js"],
        "answer": "_document.js / _document.tsx"
    },
    {
        "question": "What is Turbopack in Next.js?",
        "options": ["An incremental rust-based bundler optimized for Next.js app compilation (replaces Webpack for dev server)", "An extension that speeds up database transactions", "A cloud deployment engine on AWS", "A caching middleware built into Vercel Edge networks"],
        "answer": "An incremental rust-based bundler optimized for Next.js app compilation (replaces Webpack for dev server)"
    },
    {
        "question": "What command starts the Next.js development server in your local environment?",
        "options": ["next dev", "next start", "next build", "node server.js"],
        "answer": "next dev"
    }
]

# Map Next.js questions (101 to 200)
for idx, q in enumerate(nextjs_questions_pool):
    react_next_questions.append({
        "question": f"({idx+101}/200 Next.js) {q['question']}",
        "options": q["options"],
        "answer": q["answer"]
    })

# Add 60 more Next.js questions to complete the 200 questions list
extra_nextjs_pool = [
    {
        "question": "What is the purpose of the next/script component?",
        "options": ["To inject third-party scripts efficiently with loading priority settings (like strategy='lazyOnload')", "To write client-side script code blocks", "To declare system configurations", "To load local JSON database sheets"],
        "answer": "To inject third-party scripts efficiently with loading priority settings (like strategy='lazyOnload')"
    },
    {
        "question": "Which loading strategy for next/script loads the script immediately before the page becomes interactive?",
        "options": ["beforeInteractive", "afterInteractive", "lazyOnload", "worker"],
        "answer": "beforeInteractive"
    },
    {
        "question": "How do you read cookie parameters inside a React Server Component?",
        "options": ["Using the cookies() utility from 'next/headers'", "Using document.cookie in JS", "Using cookies inside getStaticProps", "Using process.env.COOKIES"],
        "answer": "Using the cookies() utility from 'next/headers'"
    },
    {
        "question": "How do you read HTTP headers inside a React Server Component?",
        "options": ["Using the headers() utility from 'next/headers'", "Using req.headers in parameters", "Reading global.headers object", "Using process.env.HEADERS"],
        "answer": "Using the headers() utility from 'next/headers'"
    },
    {
        "question": "In Next.js, what does the 'use client' directive indicate?",
        "options": ["That the component and its imports should be treated as client-side code executing in the browser", "That the component is a protected page requiring login", "That it should be excluded from search engine crawls", "That it utilizes TailwindCSS variables natively"],
        "answer": "That the component and its imports should be treated as client-side code executing in the browser"
    },
    {
        "question": "Can you call Server Actions from standard HTML form tags natively in Next.js?",
        "options": ["Yes, Next.js handles form submissions using actions on the server automatically, supporting progressive enhancement", "No, forms must use onSubmit handlers in client components", "Yes, but only in Pages router paths", "Only if database transactions are active"],
        "answer": "Yes, Next.js handles form submissions using actions on the server automatically, supporting progressive enhancement"
    },
    {
        "question": "What hook from next/navigation allows reading the current URL pathname in Client Components?",
        "options": ["usePathname", "useRouter", "useSearchParams", "useParams"],
        "answer": "usePathname"
    },
    {
        "question": "What hook from next/navigation is used to perform programmatic navigation inside Client Components?",
        "options": ["useRouter", "usePathname", "useNavigation", "useHistory"],
        "answer": "useRouter"
    },
    {
        "question": "Which Next.js file handles custom error boundaries for nested page directories in the App Router?",
        "options": ["error.js / error.tsx", "loading.js / loading.tsx", "page.js / page.tsx", "not-found.js"],
        "answer": "error.js / error.tsx"
    },
    {
        "question": "Which Next.js file handles fallback loading states for nested page directories in the App Router?",
        "options": ["loading.js / loading.tsx", "error.js / error.tsx", "layout.js / layout.tsx", "not-found.js"],
        "answer": "loading.js / loading.tsx"
    },
    {
        "question": "Which Next.js file handles custom 404/not-found states for nested page directories in the App Router?",
        "options": ["not-found.js / not-found.tsx", "error.js / error.tsx", "loading.js", "layout.js"],
        "answer": "not-found.js / not-found.tsx"
    },
    {
        "question": "What is the purpose of the 'template.js / template.tsx' file in the App Router?",
        "options": ["Similar to layouts, but creates a new component instance on every navigation (preserving no state)", "Declares global layout frameworks", "Specifies CSS-in-JS configurations", "Contains static HTML templates for Vercel"],
        "answer": "Similar to layouts, but creates a new component instance on every navigation (preserving no state)"
    },
    {
        "question": "How do you specify page-specific metadata (title, description) inside page.tsx in the App Router?",
        "options": ["Export a metadata object or generateMetadata function from the page file", "Add meta tags inside the JSX return structure", "Configure metadata inside next.config.js paths", "Declare a global env variable"],
        "answer": "Export a metadata object or generateMetadata function from the page file"
    },
    {
        "question": "In what environment variables are API keys and tokens set up for deployment on Vercel?",
        "options": ["Vercel Dashboard Project Settings (Environment Variables)", "package.json variables map", "Hardcoded in next.config.js", "Saved in standard public repository files"],
        "answer": "Vercel Dashboard Project Settings (Environment Variables)"
    },
    {
        "question": "Can you use standard CSS Modules in Next.js natively?",
        "options": ["Yes, files named with the '.module.css' extension are imported and scoped locally automatically", "No, Next.js requires TailwindCSS or Styled Components exclusively", "Yes, but only in Pages router paths", "Only if Sass loader is installed manually"],
        "answer": "Yes, files named with the '.module.css' extension are imported and scoped locally automatically"
    },
    {
        "question": "What is dynamic routing catch-all path resolution parameter named in Page props?",
        "options": ["params.slug", "params.path", "params.route", "params.dynamic"],
        "answer": "params.slug"
    },
    {
        "question": "How can you pass query parameters dynamically in Next.js routing Link tags?",
        "options": ["Link href={{ pathname: '/search', query: { q: 'react' } }}", "Link href='/search?q=react'", "Both options are valid and supported in Link tags", "Only string query paths are supported"],
        "answer": "Both options are valid and supported in Link tags"
    },
    {
        "question": "What occurs when next build runs in Next.js?",
        "options": ["The application is optimized, static pages are compiled, and production bundles are generated", "The local development server boots on port 3000", "TypeScript errors are bypassed and hidden", "A Docker image is created locally"],
        "answer": "The application is optimized, static pages are compiled, and production bundles are generated"
    },
    {
        "question": "What folder holds build output files in Next.js after executing next build?",
        "options": [".next/", "dist/", "build/", "out/"],
        "answer": ".next/"
    },
    {
        "question": "What folder holds static exports files in Next.js when output: 'export' is configured?",
        "options": ["out/", "dist/", "build/", ".next/"],
        "answer": "out/"
    },
    {
        "question": "How do you define headers or middleware matcher directories?",
        "options": ["Export a config object containing the matcher array inside middleware.ts", "Configure matchers inside package.json", "Declare routes directly inside tsconfig.json", "Using inline route scripts in layout.tsx"],
        "answer": "Export a config object containing the matcher array inside middleware.ts"
    },
    {
        "question": "What Next.js helper function triggers a client redirect to a new route in the App Router?",
        "options": ["redirect() from 'next/navigation'", "router.push() only", "window.location.replace()", "Both redirect() and router.push() are valid"],
        "answer": "Both redirect() and router.push() are valid"
    },
    {
        "question": "Which Next.js helper function triggers a server redirect inside API routes or server actions?",
        "options": ["redirect() from 'next/navigation'", "router.push()", "res.redirect() (Pages router style)", "Both redirect() and res.redirect() are valid in their respective routers"],
        "answer": "Both redirect() and res.redirect() are valid in their respective routers"
    },
    {
        "question": "What is the name of the file used to define custom routing headers in Next.js?",
        "options": ["next.config.js", "middleware.ts", "routing.json", "headers.config"],
        "answer": "next.config.js"
    },
    {
        "question": "How do you enable trailing slash redirect configurations in Next.js?",
        "options": ["trailingSlash: true in next.config.js", "Set trailingSlash inside package.json", "Enable matched redirects in middleware.ts", "Trailing slashes are always active by default"],
        "answer": "trailingSlash: true in next.config.js"
    },
    {
        "question": "In the App Router, what component is used to manage page load boundaries asynchronously?",
        "options": ["Suspense", "ErrorBoundary", "FallbackLoader", "LoadingSegment"],
        "answer": "Suspense"
    },
    {
        "question": "What Next.js routing feature allows you to display a route in the background while rendering another component as a modal?",
        "options": ["Intercepting Routes", "Parallel Routes", "Route Groups", "Dynamic Slices"],
        "answer": "Intercepting Routes"
    },
    {
        "question": "What Next.js routing feature allows rendering multiple pages in the same layout simultaneously (split layouts)?",
        "options": ["Parallel Routes", "Intercepting Routes", "Route Groups", "Dynamic Slots"],
        "answer": "Parallel Routes"
    },
    {
        "question": "How are slots in Parallel Routes named inside the file-system directory?",
        "options": ["Folder name prefixed with an @ sign: @analytics/", "Folder name prefixed with an underscore: _analytics/", "Folder name wrapped in brackets: [analytics]/", "Folder name wrapped in parentheses: (analytics)/"],
        "answer": "Folder name prefixed with an @ sign: @analytics/"
    },
    {
        "question": "What does next/font/local do?",
        "options": ["Allows hosting custom local fonts in the application with automated web optimization features", "Connects to system local fonts folders", "Generates canvas fonts dynamic metrics", "Checks CSS styles locally"],
        "answer": "Allows hosting custom local fonts in the application with automated web optimization features"
    },
    {
        "question": "Which routing hook is used to access path parameters like [id] inside Client Components?",
        "options": ["useParams", "useSearchParams", "usePathname", "useRouter"],
        "answer": "useParams"
    },
    {
        "question": "Which routing hook is used to access query parameters like '?search=react' inside Client Components?",
        "options": ["useSearchParams", "useParams", "usePathname", "useRouter"],
        "answer": "useSearchParams"
    },
    {
        "question": "Can you render CSS files imported from node_modules in Next.js?",
        "options": ["Yes, they can be imported inside layout.tsx/page.tsx (App router) or _app.tsx (Pages router)", "No, they must be copied into public folder first", "Yes, but only in development mode", "Only if Sass loader is active"],
        "answer": "Yes, they can be imported inside layout.tsx/page.tsx (App router) or _app.tsx (Pages router)"
    },
    {
        "question": "How do you specify customized page titles for individual dynamic paths dynamically in App Router?",
        "options": ["Export async function generateMetadata() returning metadata configurations", "Declare react helmet tags in page.tsx", "Specify page headers inside route.ts matcher", "Using next/head component inside page.tsx"],
        "answer": "Export async function generateMetadata() returning metadata configurations"
    },
    {
        "question": "What is next-pwa?",
        "options": ["A plugin that adds progressive web app configurations to Next.js projects", "The native mobile compilation engine for Android", "A framework library for Node caching", "The Vercel analytics deployment kit"],
        "answer": "A plugin that adds progressive web app configurations to Next.js projects"
    },
    {
        "question": "How does Next.js cache fetch requests in React Server Components by default?",
        "options": ["Next.js extends native fetch to cache requests automatically unless configured otherwise (like cache: 'no-store')", "Requests are never cached automatically", "Next.js saves all fetches to database tables", "Requests are cached in local browser memories only"],
        "answer": "Next.js extends native fetch to cache requests automatically unless configured otherwise (like cache: 'no-store')"
    },
    {
        "question": "Which fetch configuration skips caching, forcing a new request on every render cycle?",
        "options": ["fetch(url, { cache: 'no-store' })", "fetch(url, { cache: 'reload' })", "fetch(url, { method: 'POST' })", "fetch(url, { dynamic: true })"],
        "answer": "fetch(url, { cache: 'no-store' })"
    },
    {
        "question": "Which fetch configuration schedules a static page revalidation every 60 seconds?",
        "options": ["fetch(url, { next: { revalidate: 60 } })", "fetch(url, { cache: '60s' })", "fetch(url, { revalidate: 60 })", "fetch(url, { revalidateAfter: 60 })"],
        "answer": "fetch(url, { next: { revalidate: 60 } })"
    },
    {
        "question": "In Next.js, what is draft mode?",
        "options": ["A feature that allows displaying preview draft content from CMS directly without publishing yet", "A development mode that skips TypeScript compile checks", "A local mock database interface", "A deployment preview link generator"],
        "answer": "A feature that allows displaying preview draft content from CMS directly without publishing yet"
    },
    {
        "question": "How do you enable or disable draft mode?",
        "options": ["Using draftMode().enable() and draftMode().disable() from 'next/headers'", "By configuring draft: true inside next.config.js", "By toggling production mode variables", "By running vercel dev command lines"],
        "answer": "Using draftMode().enable() and draftMode().disable() from 'next/headers'"
    },
    {
        "question": "What is the purpose of next/head in the Pages Router?",
        "options": ["To inject elements into the head segment of HTML documents page-by-page", "To configure header HTTP methods", "To display site loading layouts", "To declare system package references"],
        "answer": "To inject elements into the head segment of HTML documents page-by-page"
    },
    {
        "question": "What occurs when the 'next start' command runs?",
        "options": ["The optimized production build is started, serving the compiled application in production mode", "The local development watcher starts compiling files", "The database tables are synced and updated", "A git push triggers a Vercel build"],
        "answer": "The optimized production build is started, serving the compiled application in production mode"
    },
    {
        "question": "Which Next.js file is used to customize the root html and body structure in App Router?",
        "options": ["app/layout.tsx", "app/page.tsx", "app/_document.tsx", "app/template.tsx"],
        "answer": "app/layout.tsx"
    },
    {
        "question": "How do you access the query arguments (URL search params) inside getStaticProps in Pages Router?",
        "options": ["Query parameters are not available in getStaticProps because it runs at build time; use getStaticPaths or context.params", "Through context.query parameter directly", "Via request parameters in getStaticProps(req)", "By parsing process.env variables"],
        "answer": "Query parameters are not available in getStaticProps because it runs at build time; use getStaticPaths or context.params"
    },
    {
        "question": "How do you access query parameters inside getServerSideProps in Pages Router?",
        "options": ["Through context.query object", "Via context.params only", "By reading document.location in code", "Through getInitialProps callbacks"],
        "answer": "Through context.query object"
    },
    {
        "question": "What is next/dynamic used for in Next.js?",
        "options": ["To lazily import React components dynamically, allowing code splitting at component levels", "To make dynamic routes", "To change CSS styles on page loads", "To load static API data structures"],
        "answer": "To lazily import React components dynamically, allowing code splitting at component levels"
    },
    {
        "question": "Can you use next/dynamic inside React Server Components?",
        "options": ["No, dynamic imports inside RSC are handled natively; next/dynamic is only used inside Client Components", "Yes, it works identically in Server Components", "Yes, but only if server option is true", "Only if transpiled with Turbopack"],
        "answer": "No, dynamic imports inside RSC are handled natively; next/dynamic is only used inside Client Components"
    },
    {
        "question": "How do you pass options like disabling SSR to next/dynamic?",
        "options": ["const Comp = dynamic(() => import('./Comp'), { ssr: false })", "const Comp = dynamic(() => import('./Comp'), { server: false })", "const Comp = dynamic(() => import('./Comp'), { clientOnly: true })", "const Comp = dynamic('./Comp', { ssr: false })"],
        "answer": "const Comp = dynamic(() => import('./Comp'), { ssr: false })"
    },
    {
        "question": "Which tool does Next.js use natively to compile and transpile files rapidly (Rust-based successor to Babel)?",
        "options": ["SWC (Speedy Web Compiler)", "Babel Compiler", "Esbuild", "Vite Compiler"],
        "answer": "SWC (Speedy Web Compiler)"
    },
    {
        "question": "How do you configure custom redirects in next.config.js?",
        "options": ["Define an async redirects() function returning redirect mapping objects", "Add redirects object inside package.json", "Declare matching redirection rules inside middleware.ts", "Redirects are only managed via Vercel configurations"],
        "answer": "Define an async redirects() function returning redirect mapping objects"
    },
    {
        "question": "How do you configure custom rewrites (URL masking) in next.config.js?",
        "options": ["Define an async rewrites() function returning rewrite rules mapping source to destination", "Add rewrites object inside package.json", "Declare rewrite loops inside middleware.ts", "Rewrites are only managed via Cloudflare proxies"],
        "answer": "Define an async rewrites() function returning rewrite rules mapping source to destination"
    },
    {
        "question": "What does path rewrite do compared to redirect in Next.js?",
        "options": ["Rewrites mask the URL (keeping client URL unchanged while routing to target); Redirects change client URL and redirect the browser", "Redirects are server-only; Rewrites are client-only", "Rewrites are faster than redirects", "They perform the exact same operation"],
        "answer": "Rewrites mask the URL (keeping client URL unchanged while routing to target); Redirects change client URL and redirect the browser"
    },
    {
        "question": "What is the purpose of the next/navigation package?",
        "options": ["To provide modern routing APIs (useRouter, useParams, useSearchParams) for the App Router", "To generate menus and navigation bars dynamically", "To connect API pages to client states", "To handle native mobile routing bridges"],
        "answer": "To provide modern routing APIs (useRouter, useParams, useSearchParams) for the App Router"
    },
    {
        "question": "How can you trigger search engine indexing crawlers to index or ignore specific dynamic pages in App Router?",
        "options": ["By returning robots: { index: true } metadata configs inside generateMetadata()", "By using next/robots tags inside layouts", "By adding meta instructions to package.json", "Robots configurations are strictly Vercel domain settings"],
        "answer": "By returning robots: { index: true } metadata configs inside generateMetadata()"
    },
    {
        "question": "Which Next.js file allows configuring custom headers (like CORS) page-by-page?",
        "options": ["next.config.js (via headers() function)", "middleware.ts matcher", "api/routes.ts only", "Both next.config.js and middleware.ts are valid patterns to set headers"],
        "answer": "Both next.config.js and middleware.ts are valid patterns to set headers"
    },
    {
        "question": "How do you specify environment variables that are exposed to the browser client (prefixed with what keyword)?",
        "options": ["NEXT_PUBLIC_", "NEXT_CLIENT_", "PUBLIC_", "PROCESS_ENV_"],
        "answer": "NEXT_PUBLIC_"
    },
    {
        "question": "Are standard process.env variables without the NEXT_PUBLIC_ prefix accessible in Client Components?",
        "options": ["No, they are undefined in browser client bundles for security, protecting sensitive api tokens", "Yes, all env variables are sent to browser bundles", "Yes, if compiled in production mode", "Only in development environment"],
        "answer": "No, they are undefined in browser client bundles for security, protecting sensitive api tokens"
    },
    {
        "question": "Which package simplifies deployment, tracking, and analytics configurations natively for Next.js applications?",
        "options": ["Vercel Analytics & Speed Insights", "pm2", "Sentry", "NewRelic"],
        "answer": "Vercel Analytics & Speed Insights"
    },
    {
        "question": "How can you specify caching headers dynamically for custom API Route handlers?",
        "options": ["By returning a response with custom Headers mapping Cache-Control rules", "Using getStaticProps inside route.ts", "Setting cache: true in next.config.js routes", "Caching headers are managed by Vercel exclusively"],
        "answer": "By returning a response with custom Headers mapping Cache-Control rules"
    },
    {
        "question": "What is the primary developer command to create a new Next.js project?",
        "options": ["npx create-next-app@latest", "npm init next-app", "node create-next", "npm install next"],
        "answer": "npx create-next-app@latest"
    }
]

# Map dynamic ID offsets to complete the list of 200 questions
for idx, q in enumerate(extra_nextjs_pool):
    react_next_questions.append({
        "question": f"({idx+141}/200 Next.js) {q['question']}",
        "options": q["options"],
        "answer": q["answer"]
    })

# Write outputs
with open('/home/sourabh/Desktop/Quzzy/nodejs-100-quiz.json', 'w') as f:
    json.dump(nodejs_questions, f, indent=2)

with open('/home/sourabh/Desktop/Quzzy/react-nextjs-200-quiz.json', 'w') as f:
    json.dump(react_next_questions, f, indent=2)

print("Generated nodejs-100-quiz.json with 100 questions.")
print("Generated react-nextjs-200-quiz.json with 200 questions.")
