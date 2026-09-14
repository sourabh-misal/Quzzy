import json

questions = [
    # --- TOPIC 1: Primitive Types (1-16) ---
    {
        "question": "What is the output of typeof null in JavaScript, and what is the historical reason for it?",
        "options": [
            "\"null\" — It was designed to represent the absence of any object value.",
            "\"undefined\" — Null and undefined were originally the same type.",
            "\"object\" — A bug in the first JS implementation where the type tag for objects (000) matched null.",
            "\"symbol\" — Null was later redefined as a Symbol in ES6."
        ],
        "answer": "\"object\" — A bug in the first JS implementation where the type tag for objects (000) matched null.",
        "explanation": "typeof null returns \"object\" due to a legacy bug from the first version of JavaScript, where values were stored in 32-bit words with a type tag in the lowest bits. The type tag for objects was 0 (000), and since null was represented as the null pointer (all 0s), it was erroneously identified as an object."
    },
    {
        "question": "Why does \"hello\".toUpperCase() work even though strings are immutable primitives and not objects?",
        "options": [
            "Strings are secretly objects in the V8 engine heap at all times.",
            "JavaScript automatically wraps primitives in their corresponding object wrapper (autoboxing) temporarily to call methods.",
            "The string prototype methods are globally defined on the global window object.",
            "toUpperCase() is a compiler-macro that replaces the code at build-time."
        ],
        "answer": "JavaScript automatically wraps primitives in their corresponding object wrapper (autoboxing) temporarily to call methods.",
        "explanation": "This behavior is called autoboxing. When you access a property or method on a primitive, JavaScript temporarily wraps it in its corresponding object wrapper (e.g., String object for strings), executes the method, and then discards the wrapper object."
    },
    {
        "question": "Which of the following is NOT one of the 7 primitive types in JavaScript?",
        "options": [
            "Symbol",
            "BigInt",
            "Function",
            "Undefined"
        ],
        "answer": "Function",
        "explanation": "The 7 primitive types in JavaScript are: string, number, bigint, boolean, undefined, null, and symbol. Function is a subtype of Object, not a primitive."
    },
    {
        "question": "What is the output of typeof Symbol(\"id\") and typeof 9007199254740993n?",
        "options": [
            "\"symbol\" and \"bigint\"",
            "\"object\" and \"number\"",
            "\"symbol\" and \"number\"",
            "\"object\" and \"bigint\""
        ],
        "answer": "\"symbol\" and \"bigint\"",
        "explanation": "Symbol(\"id\") creates a primitive of type symbol, and 9007199254740993n (with the 'n' suffix) creates a primitive of type bigint. Their typeof outputs are \"symbol\" and \"bigint\" respectively."
    },
    {
        "question": "What happens when you try to mutate a primitive string like `let str = \"abc\"; str[0] = \"z\"; console.log(str);`?",
        "options": [
            "It prints \"zbc\".",
            "It throws a TypeError: Cannot assign to read only property.",
            "It prints \"abc\" (silently ignored in non-strict mode; throws TypeError in strict mode).",
            "It prints undefined."
        ],
        "answer": "It prints \"abc\" (silently ignored in non-strict mode; throws TypeError in strict mode).",
        "explanation": "Strings are immutable. Accessing a string character by index is read-only. In non-strict mode, assigning a new value to an index is silently ignored, and the string remains unchanged. In strict mode, it throws a TypeError."
    },
    {
        "question": "What is the difference between string.charAt(100) and string[100] when index is out of bounds?",
        "options": [
            "charAt returns \"\" (empty string); bracket notation returns undefined.",
            "charAt returns undefined; bracket notation returns \"\".",
            "Both return undefined.",
            "Both throw a RangeError."
        ],
        "answer": "charAt returns \"\" (empty string); bracket notation returns undefined.",
        "explanation": "For an out-of-bounds index, the charAt() method returns an empty string (\"\"), whereas index/bracket access evaluates to undefined since it treats the string as an array-like object with no property at index 100."
    },
    {
        "question": "Which of the following statements about null and undefined is correct?",
        "options": [
            "null represents a declared but uninitialized variable; undefined represents an intentional absence of value.",
            "undefined represents a declared but uninitialized variable; null represents an intentional absence of value.",
            "Both null and undefined are of the same primitive type.",
            "Both null and undefined are coerced to true in boolean contexts."
        ],
        "answer": "undefined represents a declared but uninitialized variable; null represents an intentional absence of value.",
        "explanation": "undefined is initialized by the engine to variables that have been declared but not assigned a value. null is an assignment value that represents the intentional absence of any object value."
    },
    {
        "question": "What is the result of Symbol(\"key\") === Symbol(\"key\")?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "false",
        "explanation": "Every call to Symbol() returns a completely unique symbol value, even if they share the same description string. Thus, Symbol(\"key\") === Symbol(\"key\") is false."
    },
    {
        "question": "What occurs when you call the valueOf method on a primitive wrapper object like `new Number(42).valueOf()`?",
        "options": [
            "It returns the primitive value 42.",
            "It returns a String representation \"42\".",
            "It returns the wrapper object instance itself.",
            "It throws a TypeError."
        ],
        "answer": "It returns the primitive value 42.",
        "explanation": "Wrapper objects inherit valueOf() from their prototypes, which returns the wrapped primitive value (e.g. 42 for a Number wrapper object)."
    },
    {
        "question": "What happens if you attempt to mix BigInt and Number values in a mathematical operation, such as `10n + 5`?",
        "options": [
            "It returns 15n.",
            "It returns 15.",
            "It throws a TypeError.",
            "It coerces 10n to 10 and returns 15."
        ],
        "answer": "It throws a TypeError.",
        "explanation": "JavaScript does not allow mixing BigInt and Number values in arithmetic operations to prevent silent precision loss (since BigInt has arbitrary precision and Number has floating-point precision). You must explicitly convert one type to the other."
    },
    {
        "question": "What is the output of typeof NaN in JavaScript?",
        "options": [
            "\"NaN\"",
            "\"undefined\"",
            "\"number\"",
            "\"null\""
        ],
        "answer": "\"number\"",
        "explanation": "NaN stands for Not-a-Number, but in the ECMAScript standard, it is a special value belonging to the double-precision 64-bit binary format IEEE 754 (i.e. Number type). Therefore, typeof NaN returns \"number\"."
    },
    {
        "question": "What is the value of Number.MAX_SAFE_INTEGER in JavaScript?",
        "options": [
            "2^53 - 1 (9007199254740991)",
            "2^31 - 1 (2147483647)",
            "2^64 - 1",
            "Infinity"
        ],
        "answer": "2^53 - 1 (9007199254740991)",
        "explanation": "Number.MAX_SAFE_INTEGER represents the maximum safe integer in JavaScript that can be precisely represented and compared using the standard double-precision float format. It is 2^53 - 1."
    },
    {
        "question": "What is the output of typeof undefined in JavaScript?",
        "options": [
            "\"undefined\"",
            "\"null\"",
            "\"object\"",
            "\"void\""
        ],
        "answer": "\"undefined\"",
        "explanation": "undefined is a primitive type containing exactly one value, which is undefined. Calling typeof on it returns the string \"undefined\"."
    },
    {
        "question": "What is the difference between `let x = \"test\";` and `let y = new String(\"test\");`?",
        "options": [
            "x is a primitive string; y is a wrapper object of type \"object\".",
            "x is a wrapper object; y is a primitive string.",
            "Both are primitive string values.",
            "Both are objects in memory."
        ],
        "answer": "x is a primitive string; y is a wrapper object of type \"object\".",
        "explanation": "Using a literal creates a primitive string value. Using the 'new String()' constructor creates an instance of the String wrapper object, whose typeof returns \"object\"."
    },
    {
        "question": "How are primitive values collected by the Garbage Collector compared to Objects?",
        "options": [
            "Primitives are never garbage collected.",
            "Primitives have no references to track; they are destroyed when their enclosing stack frame/scope is popped, whereas heap objects require tracing.",
            "Both are checked using the mark-and-sweep algorithm identically.",
            "Objects are garbage collected immediately; primitives wait for program shutdown."
        ],
        "answer": "Primitives have no references to track; they are destroyed when their enclosing stack frame/scope is popped, whereas heap objects require tracing.",
        "explanation": "Primitives stored inline or inside stack frames are automatically reclaimed when the execution context pops off the stack. Heap objects require V8's Garbage Collector (e.g. Scavenger or Mark-Sweep) to trace reference paths and reclaim unreferenced memory."
    },
    {
        "question": "What is the purpose of Symbol.for(key) in JavaScript?",
        "options": [
            "It searches the runtime global symbol registry and returns/creates a shared symbol for the given key.",
            "It generates a random symbol with no key description.",
            "It converts a symbol value back to a standard string.",
            "It converts a symbol into a public object wrapper."
        ],
        "answer": "It searches the runtime global symbol registry and returns/creates a shared symbol for the given key.",
        "explanation": "Unlike Symbol(), which always creates a unique symbol, Symbol.for() checks a global runtime symbol registry. If a symbol with that key already exists, it returns it; otherwise, it creates and registers a new one, allowing symbols to be shared across files or contexts."
    },

    # --- TOPIC 2: Primitives vs Objects (17-32) ---
    {
        "question": "What is the output of the following code?\nlet str1 = \"hello\";\nlet str2 = str1;\nstr2 = \"world\";\nconsole.log(str1);",
        "options": [
            "\"world\"",
            "\"hello\"",
            "ReferenceError",
            "undefined"
        ],
        "answer": "\"hello\"",
        "explanation": "Primitives are stored by value and are completely immutable. Assigning str2 = str1 copies the value. Subsequently reassigning str2 to \"world\" has no effect on str1."
    },
    {
        "question": "What is the output of the following code?\nconst obj1 = { name: \"Alice\" };\nconst obj2 = obj1;\nobj2.name = \"Bob\";\nconsole.log(obj1.name);",
        "options": [
            "\"Alice\"",
            "\"Bob\"",
            "TypeError: Assignment to constant variable",
            "undefined"
        ],
        "answer": "\"Bob\"",
        "explanation": "In JavaScript, objects are stored and passed by reference (call-by-sharing). obj2 copies the reference of obj1, pointing to the same object. Modifying a property of obj2 directly affects the shared object, so obj1.name is also \"Bob\"."
    },
    {
        "question": "What is the output of the following code?\nconst original = { details: { age: 25 } };\nconst copy = { ...original };\ncopy.details.age = 30;\nconsole.log(original.details.age);",
        "options": [
            "25",
            "30",
            "TypeError: Cannot assign to read only property",
            "undefined"
        ],
        "answer": "30",
        "explanation": "The spread operator (...) performs a shallow copy. While the root object is copied, nested objects (like 'details') are copied by reference. Modifying copy.details.age directly affects original.details.age."
    },
    {
        "question": "What is the difference between Object.freeze() and Object.seal()?",
        "options": [
            "freeze allows changing property values but prevents structure modification; seal prevents both.",
            "freeze prevents adding/removing properties and prevents changing values; seal prevents adding/removing but allows changing values.",
            "seal prevents adding properties; freeze allows adding but prevents modifications.",
            "There is no difference."
        ],
        "answer": "freeze prevents adding/removing properties and prevents changing values; seal prevents adding/removing but allows changing values.",
        "explanation": "Object.freeze() makes an object completely immutable: no new properties, no deleting properties, and no writing to existing properties. Object.seal() prevents adding or deleting properties, but existing writable properties can still be modified."
    },
    {
        "question": "What happens when you pass an object as a function parameter and reassign it inside, like: `function mutate(o) { o = { x: 2 }; } let myObj = { x: 1 }; mutate(myObj); console.log(myObj.x);`?",
        "options": [
            "It prints 1.",
            "It prints 2.",
            "It throws a ReferenceError.",
            "It prints undefined."
        ],
        "answer": "It prints 1.",
        "explanation": "JavaScript is 'call-by-sharing'. The parameter 'o' receives a copy of the reference pointing to myObj. When you reassign 'o' inside the function, you change the local reference copy to point to a new object, leaving the external myObj reference unchanged."
    },
    {
        "question": "How does V8 store Small Integers (Smis) in pointer fields compared to Heap Objects?",
        "options": [
            "Both are pointers pointing to heap addresses.",
            "Smis are stored inline directly inside the pointer variable by tagging the lowest bit (e.g. 0), bypassing heap allocation completely.",
            "Smis are stored in secondary cache registers.",
            "Heap objects are stored in the CPU registers."
        ],
        "answer": "Smis are stored inline directly inside the pointer variable by tagging the lowest bit (e.g. 0), bypassing heap allocation completely.",
        "explanation": "For optimization, V8 uses pointer tagging. A pointer variable can represent either a pointer address or a small integer (Smi). If the lowest bit is flagged as 0, the value is read directly as an inline integer, avoiding heap allocations."
    },
    {
        "question": "What is heap fragmentation and how does it relate to objects?",
        "options": [
            "It refers to stack variables overflowing memory.",
            "It is the division of memory into non-contiguous blocks over time due to objects of variable sizes being allocated and freed, requiring garbage collection compaction.",
            "It is an optimization to split files at build-time.",
            "It is the parsing of JSON data into multiple threads."
        ],
        "answer": "It is the division of memory into non-contiguous blocks over time due to objects of variable sizes being allocated and freed, requiring garbage collection compaction.",
        "explanation": "As objects of arbitrary sizes are allocated on the heap and freed by garbage collection, free space becomes fragmented into tiny non-contiguous blocks. Compacting garbage collectors periodically move objects in memory to consolidate free blocks."
    },
    {
        "question": "What is the output of `console.log({} === {})`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "false",
        "explanation": "In JavaScript, objects are compared by reference identity (their location in memory), not by their structural content. Two different literal object declarations `{}` occupy different addresses in memory, so they are not equal."
    },
    {
        "question": "Which of the following is correct regarding arrays in JavaScript?",
        "options": [
            "Arrays are a distinct primitive type in JavaScript.",
            "Arrays are specialized objects with auto-managed index keys and a special length property.",
            "Arrays are stored on the call stack at all times.",
            "typeof [] returns \"array\"."
        ],
        "answer": "Arrays are specialized objects with auto-managed index keys and a special length property.",
        "explanation": "JavaScript arrays are not a separate primitive type; typeof [] returns \"object\". They are specialized objects that map numeric string indices to values, and have prototype methods (Array.prototype) and a special length property."
    },
    {
        "question": "What is the difference between Object.assign(target, source) and the object spread operator `{ ...source }`?",
        "options": [
            "Object.assign mutates the target object; the spread operator returns a new object literal.",
            "Spread operator performs a deep copy; Object.assign performs a shallow copy.",
            "Object.assign compiles faster on V8.",
            "There are no semantic differences."
        ],
        "answer": "Object.assign mutates the target object; the spread operator returns a new object literal.",
        "explanation": "Object.assign(target, source) modifies the 'target' object in-place (mutating it) and returns it. The spread syntax `{ ...source }` creates a new shallow object literal directly in scope."
    },
    {
        "question": "What occurs when you attempt to change a property of an object declared with const, e.g. `const myObj = { val: 1 }; myObj.val = 2;`?",
        "options": [
            "It throws a TypeError because const variables cannot be changed.",
            "It mutates the object property successfully without errors.",
            "It creates a new copy of the object.",
            "It silently ignores the mutation."
        ],
        "answer": "It mutates the object property successfully without errors.",
        "explanation": "The 'const' keyword creates a read-only binding to a variable. It prevents reassigning the variable itself (e.g. myObj = {}), but it does not make the underlying object immutable. Object properties can still be modified freely."
    },
    {
        "question": "If you freeze an object `const user = { name: \"A\", address: { city: \"B\" } }` with `Object.freeze(user)`, can you modify the city property?",
        "options": [
            "No, the entire nested structure is frozen.",
            "Yes, because Object.freeze() is shallow and does not freeze nested objects.",
            "Yes, but only in non-strict mode.",
            "No, it throws a compile-time warning."
        ],
        "answer": "Yes, because Object.freeze() is shallow and does not freeze nested objects.",
        "explanation": "Object.freeze() performs a shallow freeze. It prevents mutations only on the immediate properties of the passed object. Nested objects like 'address' remain mutable unless frozen recursively."
    },
    {
        "question": "How does V8 optimize object property access using Hidden Classes (Shapes)?",
        "options": [
            "By converting all objects into arrays at runtime.",
            "By generating dynamic offsets for properties behind the scenes, creating a shared 'Shape' for objects with identical property structures.",
            "By caching files in local storage.",
            "By evaluating variables synchronously inside the CPU register."
        ],
        "answer": "By generating dynamic offsets for properties behind the scenes, creating a shared 'Shape' for objects with identical property structures.",
        "explanation": "V8 creates internal 'hidden classes' (or Shapes) that track property offsets. When multiple objects share the same properties in the same order, they share a Shape, allowing V8 to compile faster property lookups using fixed offsets."
    },
    {
        "question": "What is the output of `console.log(new String(\"a\") === new String(\"a\"))`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "false",
        "explanation": "The 'new String()' constructor creates a wrapper object instance. When comparing two objects with ===, JavaScript checks memory address identity. Since these are two separate wrapper object instances in memory, it returns false."
    },
    {
        "question": "What happens to objects when the prototype reference chain is mutated, e.g. via Object.setPrototypeOf()?",
        "options": [
            "It copies the inherited properties into the child object memory space.",
            "It mutates the dynamic lookup link (__proto__), which can severely degrade performance in V8 optimizations.",
            "It recompiles the JS file.",
            "It turns the object into a primitive."
        ],
        "answer": "It mutates the dynamic lookup link (__proto__), which can severely degrade performance in V8 optimizations.",
        "explanation": "Mutating an object's prototype link at runtime forces V8 to discard compiled assumptions about property offsets (hidden classes) for the object and its descendants, degrading execution speed. You should use Object.create() instead."
    },
    {
        "question": "What happens if you try to mutate a frozen object in strict mode?",
        "options": [
            "It silently ignores the change.",
            "It throws a TypeError: Cannot assign to read only property.",
            "It mutates the property anyway.",
            "It deletes the property."
        ],
        "answer": "It throws a TypeError: Cannot assign to read only property.",
        "explanation": "In non-strict mode, attempts to modify properties of a frozen object fail silently. In strict mode, any attempt to mutate, add, or delete properties on a frozen object throws a TypeError."
    },

    # --- TOPIC 3: Type Coercion (33-49) ---
    {
        "question": "What is the output of \"5\" + 3 and \"5\" - 3 in JavaScript?",
        "options": [
            "8 and 2",
            "\"53\" and 2",
            "\"53\" and \"5-3\"",
            "TypeError for both"
        ],
        "answer": "\"53\" and 2",
        "explanation": "The '+' operator triggers string concatenation if one of the operands is a string, coercing 3 to \"3\" and outputting \"53\". The '-' operator is only defined for numeric subtraction, so it coerces \"5\" to the number 5 and outputs 2."
    },
    {
        "question": "Which of the following contains ONLY falsy values in JavaScript?",
        "options": [
            "false, 0, \"\", null, undefined, NaN, 0n",
            "false, 0, [], {}, null, undefined",
            "false, -0, \"\", \"0\", null, undefined",
            "false, NaN, 0, -1, \"\", null"
        ],
        "answer": "false, 0, \"\", null, undefined, NaN, 0n",
        "explanation": "There are exactly 8 falsy values in modern JavaScript: false, 0, -0, 0n (BigInt zero), \"\" (empty string), null, undefined, and NaN. Empty objects {} and arrays [] are truthy."
    },
    {
        "question": "What is the result of [] + [] and [] + {}?",
        "options": [
            "\"\" (empty string) and \"[object Object]\"",
            "[] and \"[object Object]\"",
            "\"\" and NaN",
            "TypeError"
        ],
        "answer": "\"\" (empty string) and \"[object Object]\"",
        "explanation": "The '+' operator coerces operands to primitives via toString(). For an empty array, [].toString() yields \"\". Thus, [] + [] is \"\" + \"\" = \"\". For [] + {}, [].toString() is \"\" and {}.toString() is \"[object Object]\", resulting in \"[object Object]\"."
    },
    {
        "question": "What does Number(null) and Number(undefined) evaluate to?",
        "options": [
            "0 and NaN",
            "NaN and 0",
            "0 and 0",
            "NaN and NaN"
        ],
        "answer": "0 and NaN",
        "explanation": "Under numeric conversion, null is coerced to 0. undefined represents a completely missing value and cannot be converted to a meaningful number, so it results in NaN."
    },
    {
        "question": "What is the result of Boolean([]) and Boolean({})?",
        "options": [
            "true and true",
            "false and false",
            "true and false",
            "false and true"
        ],
        "answer": "true and true",
        "explanation": "In JavaScript, all objects (including empty arrays [] and empty objects {}) are truthy values. Only the 8 falsy values coerce to false."
    },
    {
        "question": "What is the output of the expression `+\"100\"` and `+\"abc\"`?",
        "options": [
            "100 and NaN",
            "\"100\" and \"abc\"",
            "100 and 0",
            "TypeError"
        ],
        "answer": "100 and NaN",
        "explanation": "The unary plus operator (+) triggers numeric coercion of its single operand. \"100\" converts to the number 100, while the non-numeric string \"abc\" cannot be parsed as a number, resulting in NaN."
    },
    {
        "question": "What does the double exclamation mark `!!val` do?",
        "options": [
            "Negates the value twice, returning the original value type.",
            "Coerces the value to its corresponding boolean primitive representation.",
            "Triggers a bitwise inversion.",
            "Throws a syntax error."
        ],
        "answer": "Coerces the value to its corresponding boolean primitive representation.",
        "explanation": "The first exclamation mark negates the value, converting it to a boolean opposite of its truthiness. The second exclamation mark negates it again, yielding its exact boolean primitive representation."
    },
    {
        "question": "What is the Symbol.toPrimitive method used for?",
        "options": [
            "To register symbols globally.",
            "To customize how an object is coerced into a primitive value when used in operators.",
            "To convert primitives into symbols.",
            "To clear wrapper object addresses."
        ],
        "answer": "To customize how an object is coerced into a primitive value when used in operators.",
        "explanation": "Symbol.toPrimitive is a built-in symbol property on objects. If defined, JavaScript calls this function to convert the object into a primitive, overriding default valueOf() and toString() coercion algorithms."
    },
    {
        "question": "In the ToPrimitive algorithm, what is the default lookup order for numeric coercion when Symbol.toPrimitive is absent?",
        "options": [
            "valueOf() then toString()",
            "toString() then valueOf()",
            "Only valueOf() is checked",
            "It immediately returns NaN"
        ],
        "answer": "valueOf() then toString()",
        "explanation": "For numeric coercion, ToPrimitive prefers valueOf() first. If valueOf() returns a primitive, it uses it. Otherwise, it calls toString(). If that also fails to return a primitive, it throws a TypeError."
    },
    {
        "question": "What happens if you attempt to convert a Symbol to a string explicitly via String(Symbol(\"a\")) vs implicitly via `\"\" + Symbol(\"a\")`?",
        "options": [
            "Both throw a TypeError.",
            "Explicit String() works; implicit coercion throws a TypeError.",
            "Implicit coercion works; explicit String() throws a TypeError.",
            "Both result in \"Symbol(a)\"."
        ],
        "answer": "Explicit String() works; implicit coercion throws a TypeError.",
        "explanation": "JavaScript allows explicit conversion of symbols to strings (e.g. String(Symbol(\"a\")) yields \"Symbol(a)\"). However, implicit coercion (like string concatenation with +) throws a TypeError to protect developers from silently using symbols as property keys."
    },
    {
        "question": "What is the output of `${Symbol(\"desc\")}` in a template literal string?",
        "options": [
            "\"Symbol(desc)\"",
            "TypeError: Cannot convert a Symbol value to a string",
            "\"desc\"",
            "\"\""
        ],
        "answer": "TypeError: Cannot convert a Symbol value to a string",
        "explanation": "Template literals execute implicit string coercion (equivalent to empty string addition). Because implicit conversion of symbols to strings is prohibited, it throws a TypeError."
    },
    {
        "question": "What is the output of the expression `null || \"default\"`?",
        "options": [
            "null",
            "\"default\"",
            "true",
            "false"
        ],
        "answer": "\"default\"",
        "explanation": "The logical OR (||) operator short-circuits. It evaluates the left operand. If it is truthy, it returns it; otherwise, it returns the right operand. Since null is falsy, it returns \"default\"."
    },
    {
        "question": "What is the output of the expression `\"hello\" && 0`?",
        "options": [
            "\"hello\"",
            "0",
            "true",
            "false"
        ],
        "answer": "0",
        "explanation": "The logical AND (&&) operator short-circuits. It evaluates the left operand. If it is falsy, it returns it; otherwise, it evaluates and returns the right operand. Since \"hello\" is truthy, it returns 0."
    },
    {
        "question": "What is the difference between logical OR `||` and nullish coalescing `??`?",
        "options": [
            "OR checks for falsy values; nullish coalescing checks only for null or undefined.",
            "OR checks only for null or undefined; nullish coalescing checks for falsy values.",
            "There is no difference.",
            "?? only works in strict mode."
        ],
        "answer": "OR checks for falsy values; nullish coalescing checks only for null or undefined.",
        "explanation": "The OR operator || returns the right-hand operand if the left-hand operand is any falsy value (such as 0, \"\", false). The nullish coalescing operator ?? returns the right-hand operand only if the left-hand operand is null or undefined."
    },
    {
        "question": "What is the output of `\"6\" * \"2\"`?",
        "options": [
            "\"62\"",
            "12",
            "NaN",
            "TypeError"
        ],
        "answer": 12,
        "explanation": "Multiplication (*) is not defined for strings, so both string operands are coerced to numbers (6 and 2). The arithmetic operation is performed, resulting in 12."
    },
    {
        "question": "What does division by zero evaluate to in JavaScript, e.g. `5 / 0` and `-5 / 0`?",
        "options": [
            "Infinity and -Infinity",
            "NaN and NaN",
            "Both throw a DivisionByZeroError",
            "0 and 0"
        ],
        "answer": "Infinity and -Infinity",
        "explanation": "Unlike many programming languages that throw exceptions, JavaScript represents division by zero using IEEE 754 float values Infinity (for positive numbers divided by zero) and -Infinity (for negative numbers)."
    },
    {
        "question": "What is the result of the comparison `\"10\" < \"2\"`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "true",
        "explanation": "When comparing two strings using comparison operators, JavaScript performs a lexicographical (alphabetical) comparison based on Unicode values. Since the character '1' comes before the character '2', \"10\" < \"2\" evaluates to true."
    },

    # --- TOPIC 4: Equality: == vs === (50-66) ---
    {
        "question": "Why does [] == ![] evaluate to true?",
        "options": [
            "Because arrays are always falsy values in JavaScript comparison checks.",
            "The negation operator ! coerces [] to false; then == compares the empty array to false, coercing both to 0.",
            "Because both sides are evaluated as empty array references.",
            "This is a syntax error and cannot execute."
        ],
        "answer": "The negation operator ! coerces [] to false; then == compares the empty array to false, coercing both to 0.",
        "explanation": "1. ![] evaluates to false because [] is truthy. The expression is now [] == false. 2. Under loose equality ==, false is coerced to 0, yielding [] == 0. 3. The array [] is coerced to a primitive string \"\", giving \"\" == 0. 4. The string \"\" is coerced to a number 0, resulting in 0 == 0, which is true."
    },
    {
        "question": "Which of the following comparisons evaluates to false?",
        "options": [
            "Object.is(NaN, NaN)",
            "NaN === NaN",
            "null == undefined",
            "1 == \"1\""
        ],
        "answer": "NaN === NaN",
        "explanation": "NaN is the only value in JavaScript that is not equal to itself, even under strict equality (===). Therefore, NaN === NaN evaluates to false. Object.is(NaN, NaN) returns true."
    },
    {
        "question": "How does Object.is(0, -0) differ from 0 === -0?",
        "options": [
            "Object.is(0, -0) is true; 0 === -0 is false",
            "Object.is(0, -0) is false; 0 === -0 is true",
            "Both evaluate to true",
            "Both evaluate to false"
        ],
        "answer": "Object.is(0, -0) is false; 0 === -0 is true",
        "explanation": "Strict equality treats positive and negative zero as equal. Object.is() uses a more precise definition of identity (SameValue algorithm) that distinguishes 0 from -0, returning false."
    },
    {
        "question": "What is the output of null === undefined and null == undefined?",
        "options": [
            "false and true",
            "true and true",
            "false and false",
            "true and false"
        ],
        "answer": "false and true",
        "explanation": "Strict equality (===) checks both type and value; since they are different types, it returns false. Loose equality (==) has a special rule stating null and undefined are loosely equal to each other and nothing else, returning true."
    },
    {
        "question": "What is the output of `[1, 2] == \"1,2\"`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "true",
        "explanation": "Under loose equality, when comparing an object (the array [1,2]) to a string, the object is coerced to a primitive using its toString() method. [1,2].toString() yields \"1,2\". Thus, \"1,2\" == \"1,2\" is true."
    },
    {
        "question": "What is the primary difference between loose equality == and strict equality ===?",
        "options": [
            "== compares references; === compares structural values.",
            "== attempts type coercion before comparison; === checks both type and value without coercion.",
            "=== is only supported in modern ES6 modules.",
            "== runs faster than ===."
        ],
        "answer": "== attempts type coercion before comparison; === checks both type and value without coercion.",
        "explanation": "Loose equality (==) uses the Abstract Equality Comparison Algorithm, which performs type coercion if the operands are of different types. Strict equality (===) does not perform type coercion; if types differ, it returns false immediately."
    },
    {
        "question": "What is the result of comparing two distinct objects with identical properties strictly, like `({ a: 1 } === { a: 1 })`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "false",
        "explanation": "Object comparisons (both == and ===) check for reference equality. Since the two object literals are created separately in memory, they point to different references, so the comparison yields false."
    },
    {
        "question": "What is the result of `new Number(5) == 5` and `new Number(5) === 5`?",
        "options": [
            "true and false",
            "false and true",
            "true and true",
            "false and false"
        ],
        "answer": "true and false",
        "explanation": "new Number(5) is an object wrapper. Under loose equality ==, the wrapper is coerced to its primitive value (5), matching 5 (true). Under strict equality ===, the object wrapper type (\"object\") does not match the primitive type (\"number\"), resulting in false."
    },
    {
        "question": "What does Object.is(NaN, NaN) evaluate to?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "true",
        "explanation": "Unlike === which treats NaN as not equal to itself, Object.is() defines NaN as identical to NaN, returning true."
    },
    {
        "question": "What is the result of `[] == 0`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "true",
        "explanation": "1. [].toString() yields \"\" during type coercion. 2. \"\" is coerced to a number, which is 0. 3. 0 == 0 evaluates to true."
    },
    {
        "question": "What is the result of `true == \"true\"` in JavaScript?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "false",
        "explanation": "Under loose equality, boolean true is coerced to the number 1. The string \"true\" is coerced to a number, which yields NaN. 1 == NaN evaluates to false."
    },
    {
        "question": "What is the result of `\"0\" == false`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "true",
        "explanation": "1. The boolean false is coerced to the number 0. 2. The string \"0\" is coerced to the number 0. 3. 0 == 0 evaluates to true."
    },
    {
        "question": "What is the result of `\"\" == false`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "true",
        "explanation": "1. The boolean false is coerced to the number 0. 2. The empty string \"\" is coerced to the number 0. 3. 0 == 0 evaluates to true."
    },
    {
        "question": "What is the output of `null == 0`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "false",
        "explanation": "null is only loosely equal to undefined or to itself. It does not perform numeric conversion in loose equality comparison with numbers, so null == 0 is false."
    },
    {
        "question": "What is the output of `undefined == 0`?",
        "options": [
            "true",
            "false",
            "TypeError",
            "undefined"
        ],
        "answer": "false",
        "explanation": "undefined is only loosely equal to null or itself. It does not coerce to 0 for loose equality comparison, so undefined == 0 is false."
    },
    {
        "question": "What is the output of `10n == 10` and `10n === 10`?",
        "options": [
            "true and false",
            "false and true",
            "true and true",
            "false and false"
        ],
        "answer": "true and false",
        "explanation": "BigInt 10n and Number 10 have the same numeric value, so they are loosely equal (true). However, they are of different primitive types (bigint vs number), so they are not strictly equal (false)."
    },
    {
        "question": "When should Object.is() be used over strict equality ===?",
        "options": [
            "For all general value comparisons, since it compiles faster.",
            "Only when you specifically need to distinguish signed zeroes (0 vs -0) or check NaN equality accurately.",
            "When comparing custom database records.",
            "Object.is() is deprecated and should not be used."
        ],
        "answer": "Only when you specifically need to distinguish signed zeroes (0 vs -0) or check NaN equality accurately.",
        "explanation": "For almost all practical code, === is preferred. Object.is() should be reserved for cases where distinguishing signed zeroes or identifying NaN is critical (e.g. in polyfills or mathematical computations)."
    },

    # --- TOPIC 5: Call Stack (67-83) ---
    {
        "question": "What is a \"stack frame\" in the JavaScript call stack?",
        "options": [
            "A HTML layout container for drawing canvas diagrams.",
            "A data structure representing a function call, storing its arguments, local variables, and return address.",
            "The visual layout of nested functions in the DevTools console.",
            "A compiled execution unit stored on the persistent hard disk."
        ],
        "answer": "A data structure representing a function call, storing its arguments, local variables, and return address.",
        "explanation": "Every time a function is invoked, a new stack frame is pushed onto the call stack. It encapsulates the function's execution context, including local variables, parameters, and the point to return to after execution completes."
    },
    {
        "question": "What causes a \"Maximum call stack size exceeded\" (Stack Overflow) error in JavaScript?",
        "options": [
            "Running out of memory on the V8 heap due to creating too many objects.",
            "Pushing too many functions onto the call stack, usually due to infinite recursion without a base case.",
            "Having too many async callbacks waiting in the microtask queue.",
            "Loading an external script file that exceeds 10MB in size."
        ],
        "answer": "Pushing too many functions onto the call stack, usually due to infinite recursion without a base case.",
        "explanation": "The call stack has a fixed limit. If a function calls itself recursively without a base case to stop it, new stack frames are pushed indefinitely until the limit is exceeded, throwing a Stack Overflow error."
    },
    {
        "question": "Which of the following best describes the order in which functions are executed and popped from the Call Stack?",
        "options": [
            "First-In, First-Out (FIFO)",
            "Last-In, First-Out (LIFO)",
            "Random allocation based on CPU thread availability",
            "Alphabetical order of function names"
        ],
        "answer": "Last-In, First-Out (LIFO)",
        "explanation": "The call stack is a LIFO (Last-In, First-Out) data structure. The last function pushed onto the stack is the first one that must finish execution and be popped off."
    },
    {
        "question": "When an asynchronous callback (like a setTimeout callback) is ready to execute, does it run immediately on the Call Stack?",
        "options": [
            "Yes, it interrupts any currently executing synchronous code on the call stack.",
            "No, it is placed in the callback queue and can only execute once the call stack is completely empty.",
            "Yes, but only if the callback is configured in strict mode.",
            "No, it runs in a background thread and never enters the call stack."
        ],
        "answer": "No, it is placed in the callback queue and can only execute once the call stack is completely empty.",
        "explanation": "JavaScript is single-threaded. Async callbacks are placed in the task/callback queue. The event loop checks the call stack, and only pushes the callback onto the stack when the stack is entirely empty."
    },
    {
        "question": "What is the main difference between stack allocation and heap allocation in memory?",
        "options": [
            "Stack is fast and automatically managed with LIFO lifetimes; Heap is dynamic, larger, and managed via garbage collection.",
            "Stack is larger; Heap is faster.",
            "Heap memory is restricted to primitive numbers.",
            "Stack memory stores object keys; Heap memory stores object values."
        ],
        "answer": "Stack is fast and automatically managed with LIFO lifetimes; Heap is dynamic, larger, and managed via garbage collection.",
        "explanation": "The stack stores function call frames and static-sized local variables, and is cleaned up automatically as functions return. The heap stores dynamically allocated elements (objects, arrays, closures), which require garbage collection to scan and clear."
    },
    {
        "question": "What has higher priority in execution: the microtask queue (e.g. promise resolve) or the macrotask/task queue (e.g. setTimeout)?",
        "options": [
            "Task queue",
            "Microtask queue",
            "They share equal priority",
            "It depends on the CPU cores"
        ],
        "answer": "Microtask queue",
        "explanation": "The event loop processes all pending microtasks in the microtask queue before moving on to render changes or execute the next task from the macrotask/task queue. Resolving promises executes before setTimeout callbacks."
    },
    {
        "question": "How can you view the current call stack state during debugging?",
        "options": [
            "By checking `window.stack` object.",
            "By capturing console.trace() or inspecting the stack trace pane in the browser's developer tools.",
            "By printing the process ID.",
            "The call stack cannot be inspected."
        ],
        "answer": "By capturing console.trace() or inspecting the stack trace pane in the browser's developer tools.",
        "explanation": "You can output the current execution path to the console using console.trace(), or set breakpoints in developer tools to visually inspect active stack frames."
    },
    {
        "question": "What is inline function optimization in V8?",
        "options": [
            "Removing comments from code blocks.",
            "V8 replacing a function call with the actual body of the function, eliminating call stack frame creation overhead.",
            "Converting all loops into recursion.",
            "Parsing functions into single-line formats."
        ],
        "answer": "V8 replacing a function call with the actual body of the function, eliminating call stack frame creation overhead.",
        "explanation": "V8 compiles code dynamically. If a small function is called frequently, V8's compiler optimization (like TurboFan) can replace the function call with the direct function body, removing the overhead of creating stack frames."
    },
    {
        "question": "Why is a base case essential in recursive functions?",
        "options": [
            "To speed up execution contexts.",
            "To provide a stopping condition that prevents infinite function calls and stack overflows.",
            "To register the function globally.",
            "To allocate variables on the heap."
        ],
        "answer": "To provide a stopping condition that prevents infinite function calls and stack overflows.",
        "explanation": "A base case specifies the condition under which the function should return a value instead of making another recursive call. Without it, the function calls itself indefinitely, exhausting call stack limits."
    },
    {
        "question": "What is Tail Call Optimization (TCO)?",
        "options": [
            "An optimization that reduces the size of files at build-time.",
            "A compiler behavior where a function call that is the last expression (tail call) of another function executes without allocating a new stack frame.",
            "Compressing array lengths during execution.",
            "Toggling event loop microtasks."
        ],
        "answer": "A compiler behavior where a function call that is the last expression (tail call) of another function executes without allocating a new stack frame.",
        "explanation": "TCO allows tail-recursive functions to execute in constant stack space, avoiding stack overflow. Although part of the ES6 standard, most engines (including V8/Chrome) did not implement it or disabled it due to debugging and security complexities."
    },
    {
        "question": "What happens to the browser UI when the call stack is blocked by a long-running synchronous loop?",
        "options": [
            "The browser delegates the loop to a background thread automatically.",
            "The browser UI freezes and becomes unresponsive because the single thread is blocked, preventing event loop updates.",
            "The browser closes the tab immediately.",
            "The loop is terminated automatically after 100ms."
        ],
        "answer": "The browser UI freezes and becomes unresponsive because the single thread is blocked, preventing event loop updates.",
        "explanation": "JavaScript uses a single main thread for executing code, handling layouts, and drawing UI. If a synchronous task runs infinitely, the Call Stack never clears, preventing the event loop from executing UI rendering updates or user clicks."
    },
    {
        "question": "How do thrown exceptions bubble up the Call Stack?",
        "options": [
            "Exceptions jump directly to the global window object.",
            "The exception propagates downwards, searching parent frames for try-catch blocks until it hits the global context and crashes the script if unhandled.",
            "V8 pauses execution and restarts the computer.",
            "Exceptions are ignored if they bubble past three frames."
        ],
        "answer": "The exception propagates downwards, searching parent frames for try-catch blocks until it hits the global context and crashes the script if unhandled.",
        "explanation": "When an error occurs, the JS runtime walks down the Call Stack, checking the current frame and parent frames for try-catch handlers. If no catches are found, the stack frame sequence is destroyed and the error is printed globally."
    },
    {
        "question": "How does an anonymous function display in stack traces?",
        "options": [
            "It displays as \"anonymous\" or \"(anonymous function)\", making debugging stack traces harder.",
            "V8 assigns it a random alphanumeric ID.",
            "It is completely hidden from stack traces.",
            "It prints the parent file name only."
        ],
        "answer": "It displays as \"anonymous\" or \"(anonymous function)\", making debugging stack traces harder.",
        "explanation": "Anonymous functions lack a name property, so they are identified in stack traces as \"(anonymous)\". Naming functions (even inside callbacks) is recommended to make stack traces more readable."
    },
    {
        "question": "What occurs when you run `setTimeout(myFunc, 0)` inside a function?",
        "options": [
            "myFunc is executed immediately before the next line of code.",
            "V8 yields execution of myFunc to the task queue, allowing current stack frames to complete and empty before myFunc runs.",
            "myFunc runs in a separate thread parallel to the main stack.",
            "It throws a TimeoutError."
        ],
        "answer": "V8 yields execution of myFunc to the task queue, allowing current stack frames to complete and empty before myFunc runs.",
        "explanation": "setTimeout puts the callback in the task queue. The event loop cannot push it to the Call Stack until the current synchronous code (and any microtasks) completes. Thus, it defers execution."
    },
    {
        "question": "How do generator functions interact with the Call Stack?",
        "options": [
            "They run entirely on background threads.",
            "They allow pausing their execution state (yielding) and leaving the call stack, restoring their stack frame context when next() is called.",
            "They bypass the call stack entirely.",
            "They cause immediate stack overflows."
        ],
        "answer": "They allow pausing their execution state (yielding) and leaving the call stack, restoring their stack frame context when next() is called.",
        "explanation": "Generators yield control back to the caller. When yielded, their execution frame is preserved in memory (on the heap) and removed from the active Call Stack. It is restored to the stack when next() is invoked."
    },
    {
        "question": "How does async/await interact with the call stack?",
        "options": [
            "It runs synchronously, blocking the stack.",
            "It pauses the function execution, popping it off the stack while the promise resolves in the background, and pushes it back as a microtask afterwards.",
            "It compiles the code into Web Workers.",
            "It ignores stack overflow protections."
        ],
        "answer": "It pauses the function execution, popping it off the stack while the promise resolves in the background, and pushes it back as a microtask afterwards.",
        "explanation": "An await expression suspends the async function, freeing the thread to run other tasks. The state is saved, and once the promise resolves, the remaining function body is scheduled to resume on the call stack via the microtask queue."
    },
    {
        "question": "What is the Global Execution Context (GEC)?",
        "options": [
            "The root container representing the HTML head tag.",
            "The base execution context created when the script starts, residing at the bottom of the call stack at all times.",
            "A memory cache for environment variables.",
            "An API for managing network requests."
        ],
        "answer": "The base execution context created when the script starts, residing at the bottom of the call stack at all times.",
        "explanation": "When JavaScript executes a script, it first creates the Global Execution Context and pushes it to the bottom of the call stack. It contains the global object (window/global) and global variables, remaining active until the application terminates."
    },

    # --- TOPIC 6: Scope & Closures (84-100) ---
    {
        "question": "What is the difference between var, let, and const regarding scope?",
        "options": [
            "var is block-scoped; let and const are function-scoped.",
            "var is function-scoped; let and const are block-scoped.",
            "var, let, and const are all block-scoped, but const cannot be reassigned.",
            "var is globally scoped only; let and const are block-scoped."
        ],
        "answer": "var is function-scoped; let and const are block-scoped.",
        "explanation": "var declarations are function-scoped (or globally scoped if declared outside a function). let and const are block-scoped, meaning their scope is restricted to the enclosing block, loop, or conditional (delimited by curly braces {})."
    },
    {
        "question": "What is the \"Temporal Dead Zone\" (TDZ) in JavaScript?",
        "options": [
            "The time between a page loading and the user interacting with the UI.",
            "The phase where V8 performs garbage collection on de-referenced variables.",
            "The period from entering a block scope until a let/const variable is declared, during which accessing it throws a ReferenceError.",
            "A region in memory where deleted variables are temporarily cached."
        ],
        "answer": "The period from entering a block scope until a let/const variable is declared, during which accessing it throws a ReferenceError.",
        "explanation": "Unlike var, let and const are hoisted but not initialized. The range from the beginning of the block scope to the variable declaration is the Temporal Dead Zone (TDZ). Accessing the variable in this zone throws a ReferenceError."
    },
    {
        "question": "What will be the output of the following code?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}",
        "options": [
            "0, 1, 2",
            "3, 3, 3",
            "undefined, undefined, undefined",
            "3, 2, 1"
        ],
        "answer": "3, 3, 3",
        "explanation": "Because var is function-scoped, there is only one single shared variable 'i' across all loop iterations. By the time the async setTimeout callbacks run, the loop has completed and the value of the shared 'i' is 3."
    },
    {
        "question": "How would you fix the previous loop to correctly print 0, 1, 2?",
        "options": [
            "Change var to let, which creates a new block-scoped variable i for each loop iteration.",
            "Wrap setTimeout in another setTimeout.",
            "Change var to const.",
            "Run the code in strict mode."
        ],
        "answer": "Change var to let, which creates a new block-scoped variable i for each loop iteration.",
        "explanation": "let is block-scoped. Changing var to let causes each iteration of the loop to bind a new 'i' variable, so each setTimeout callback closes over its own unique, immutable value of 'i'."
    },
    {
        "question": "What is a \"closure\" in JavaScript?",
        "options": [
            "A method to close browser tabs or terminate workers.",
            "The process of compilation that matches braces and brackets.",
            "A function bundled together with references to its surrounding state (lexical environment), allowing it to access outer variables even after the outer function returns.",
            "An encapsulation syntax using hash symbols (#) inside classes."
        ],
        "answer": "A function bundled together with references to its surrounding state (lexical environment), allowing it to access outer variables even after the outer function returns.",
        "explanation": "A closure is formed when an inner function retains access to the variables of its outer enclosing function's scope, even after the outer function has finished executing and popped off the call stack."
    },
    {
        "question": "What is \"lexical scope\" in JavaScript?",
        "options": [
            "Scope determined by where variables and blocks of scope are authored in the code (static scope).",
            "Scope determined at runtime based on the order of function invocations (dynamic scope).",
            "The scope restricted only to native modules.",
            "The scope of variables inside template literals."
        ],
        "answer": "Scope determined by where variables and blocks of scope are authored in the code (static scope).",
        "explanation": "Lexical scope (or static scope) means that the accessibility of variables is determined by their physical location in the source code at write-time. Inner functions can look up and access variables in outer nesting scopes."
    },
    {
        "question": "What is the output of the following code?\nconst x = 10;\nfunction foo() {\n  console.log(x);\n}\nfunction bar() {\n  const x = 20;\n  foo();\n}\nbar();",
        "options": [
            "20",
            "10",
            "ReferenceError",
            "undefined"
        ],
        "answer": "10",
        "explanation": "Due to lexical scope, foo() resolves the variable 'x' from its birth scope (the global scope), where x is 10, not from the scope where it is called (bar())."
    },
    {
        "question": "How do closures assist with data privacy in JavaScript?",
        "options": [
            "By automatically encrypting variable values stored in memory.",
            "By allowing you to define variables inside a function scope that cannot be accessed from the outside, but can be read/modified by returned inner functions.",
            "By running code in a secure sandbox thread.",
            "By preventing other scripts from loading in the page."
        ],
        "answer": "By allowing you to define variables inside a function scope that cannot be accessed from the outside, but can be read/modified by returned inner functions.",
        "explanation": "Variables declared inside a function are not accessible outside. By returning inner functions (methods) that close over these variables, we can define public APIs while keeping the underlying state private and protected from direct modification."
    },
    {
        "question": "Can closures cause memory leaks in JavaScript?",
        "options": [
            "No, the garbage collector cleans up all variables when their parent function returns.",
            "Yes, because variables captured in a closure cannot be garbage collected as long as the closure function itself is still reachable in code.",
            "Yes, but only if they are written in strict mode.",
            "No, V8 engine processes do not store closure scopes on the heap."
        ],
        "answer": "Yes, because variables captured in a closure cannot be garbage collected as long as the closure function itself is still reachable in code.",
        "explanation": "If a closure remains reachable, all variables in its lexical environment remain in memory. If the closure captures large variables (like arrays or DOM references) and is kept alive (e.g. via global variables or event listeners), it can lead to memory leaks."
    },
    {
        "question": "What will be the output of console.log(a) and console.log(b) in the following code?\nfunction test() {\n  console.log(a);\n  console.log(b);\n  var a = 1;\n  let b = 2;\n}\ntest();",
        "options": [
            "undefined and ReferenceError: Cannot access 'b' before initialization",
            "ReferenceError and ReferenceError",
            "1 and 2",
            "undefined and undefined"
        ],
        "answer": "undefined and ReferenceError: Cannot access 'b' before initialization",
        "explanation": "var declarations are hoisted and initialized as undefined. let declarations are hoisted but NOT initialized, remaining in the Temporal Dead Zone (TDZ). Thus, accessing 'a' yields undefined, whereas accessing 'b' throws a ReferenceError."
    },
    {
        "question": "What is variable shadowing in JavaScript?",
        "options": [
            "Deleting global references.",
            "When a variable declared in an inner scope has the exact same name as a variable in an outer scope, blocking access to the outer variable within the inner scope.",
            "Duplicating objects dynamically in the V8 heap.",
            "A security threat where variables are modified by external scripts."
        ],
        "answer": "When a variable declared in an inner scope has the exact same name as a variable in an outer scope, blocking access to the outer variable within the inner scope.",
        "explanation": "When an inner scope declares a variable with the same name as an outer scope variable, it shadows the outer one. The inner scope's value takes precedence, and lookup terminates early on the scope chain."
    },
    {
        "question": "What is the difference between Lexical Scope and Execution Context?",
        "options": [
            "Lexical scope is static and determined at write time; Execution Context is dynamic, created at runtime when a function runs.",
            "Lexical scope is dynamic; Execution Context is static.",
            "They are two terms for the same concept.",
            "Lexical scope is restricted to the browser; execution contexts exist only in Node.js."
        ],
        "answer": "Lexical scope is static and determined at write time; Execution Context is dynamic, created at runtime when a function runs.",
        "explanation": "Lexical Scope defines where variables are accessible structurally based on block nesting in code files. Execution Context manages active variables, arguments, 'this' bindings, and the call stack state at runtime during function invocation."
    },
    {
        "question": "What is an IIFE (Immediately Invoked Function Expression) primarily used for historically?",
        "options": [
            "To trigger database writes.",
            "To declare anonymous variables.",
            "To create a temporary, isolated variable scope that prevents polluting the global namespace.",
            "To speed up compilation times."
        ],
        "answer": "To create a temporary, isolated variable scope that prevents polluting the global namespace.",
        "explanation": "Before ES6 let/const block scope existed, var was function-scoped. IIFEs were used to wrap code in a function block and invoke it immediately, confining variables to the IIFE's local function scope and avoiding global scope contamination."
    },
    {
        "question": "What is the difference in hoisting behavior between a function declaration and a function expression?",
        "options": [
            "Function declarations are hoisted completely (body included); function expressions are hoisted according to their variable declaration type (e.g. var as undefined, let/const in TDZ).",
            "Function expressions are hoisted completely; declarations are not.",
            "Neither are hoisted in strict mode.",
            "Both are hoisted body-first."
        ],
        "answer": "Function declarations are hoisted completely (body included); function expressions are hoisted according to their variable declaration type (e.g. var as undefined, let/const in TDZ).",
        "explanation": "A function declaration `function foo() {}` is fully hoisted, allowing it to be called before definition in code. A function expression `const foo = function() {}` hoists only the variable 'foo' declaration, leaving the function assignment in place, which means calling it beforehand throws an error."
    },
    {
        "question": "How do closures work in event listeners, such as: `let count = 0; button.addEventListener('click', () => count++);`?",
        "options": [
            "They copy the initial value of count.",
            "The arrow function forms a closure that retains access to the variable 'count' in its lexical parent scope, modifying the original variable reference on clicks.",
            "The event listener moves count to the global window space.",
            "They create a new count variable on each click."
        ],
        "answer": "The arrow function forms a closure that retains access to the variable 'count' in its lexical parent scope, modifying the original variable reference on clicks.",
        "explanation": "The click callback function closes over the lexical parent scope containing 'count'. Each click executes the callback, which reads and increments the same persistent 'count' variable."
    },
    {
        "question": "What is an implicit global variable in JavaScript?",
        "options": [
            "A variable defined inside standard libraries.",
            "An undeclared variable that is assigned a value (e.g. `x = 5;` without var/let/const), which automatically creates a property on the global object (window/global) in non-strict mode.",
            "A variable created inside block braces.",
            "A parameter passed to IIFEs."
        ],
        "answer": "An undeclared variable that is assigned a value (e.g. `x = 5;` without var/let/const), which automatically creates a property on the global object (window/global) in non-strict mode.",
        "explanation": "Assigning to an undeclared variable implicitly creates it in the global scope. In strict mode, doing this is prohibited and throws a ReferenceError: 'x' is not defined."
    },
    {
        "question": "What is the scope chain?",
        "options": [
            "The sequence of function calls in the call stack.",
            "The hierarchy of nested scopes that JavaScript traverses sequentially from current scope to global scope to look up variable values.",
            "A linked list of objects in the V8 garbage collector.",
            "The series of prototype links in inheritance."
        ],
        "answer": "The hierarchy of nested scopes that JavaScript traverses sequentially from current scope to global scope to look up variable values.",
        "explanation": "When resolving a variable, JavaScript starts at the local scope. If not found, it checks the outer lexical scope parent, continuing up the chain until it reaches the global scope. If still not found, it throws a ReferenceError."
    },
    {
        "question": "How does V8 optimize closure scopes in memory?",
        "options": [
            "By saving all outer variables on the hard disk.",
            "By analyzing the inner functions and keeping only the captured variables in the heap context, garbage collecting uncaptured parent variables.",
            "By keeping all parent variables in memory indefinitely.",
            "V8 does not optimize closures."
        ],
        "answer": "By analyzing the inner functions and keeping only the captured variables in the heap context, garbage collecting uncaptured parent variables.",
        "explanation": "Modern engines like V8 statically analyze inner functions. Rather than storing the entire parent context on the heap, V8 compiles a context containing only the specific variables that the inner functions reference (close over), freeing the rest."
    },
    {
        "question": "What is currying in JavaScript and how does it relate to closures?",
        "options": [
            "A method to encrypt values inside arrays.",
            "A functional programming technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument, using closures to retain arguments of previous calls.",
            "Merging two prototype objects.",
            "Running callbacks inside loop conditions."
        ],
        "answer": "A functional programming technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument, using closures to retain arguments of previous calls.",
        "explanation": "Currying returns a series of nested functions. Each returned function closes over the arguments received by its parent function, retaining those values in memory until the final arguments are supplied and the computation completes."
    }
]

# Write outputs
with open('/home/sourabh/Desktop/Quzzy/js-fundamentals-quiz.json', 'w') as f:
    json.dump(questions, f, indent=2)

print(f"Successfully generated js-fundamentals-quiz.json with {len(questions)} questions.")
