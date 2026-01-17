import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../client/components/ui/accordion";
import { Card } from "../client/components/ui/card";

interface CodeExample {
  title: string;
  description: string;
  code: string;
}

interface SectionContent {
  title: string;
  description: string;
  content: string;
  examples?: CodeExample[];
  keyPoints?: string[];
}

const sections: Record<string, SectionContent> = {
  prototypePollution: {
    title: "What is Prototype Pollution?",
    description:
      "A JavaScript vulnerability where attacker-controlled data modifies the shared prototype object",
    content: `Prototype pollution is a unique JavaScript vulnerability that exploits how objects inherit properties through the prototype chain. When code unsafely merges or assigns user-controlled data to objects without proper validation, attackers can modify the Object.prototype—the root object all JavaScript objects inherit from.

Once the prototype is polluted, every object in the application inherits the malicious properties. This creates a cascade effect where a single pollution can affect hundreds of objects across the entire codebase.`,
    keyPoints: [
      "Exploits JavaScript's prototype chain inheritance model",
      "One pollution can affect thousands of objects",
      "Often comes from merging untrusted data (JSON from APIs, form inputs, query parameters)",
      "Can escalate to RCE if combined with dangerous properties",
      "More dangerous in Node.js than browsers due to access to system resources",
    ],
    examples: [
      {
        title: "Simple Prototype Pollution",
        description: "Modifying Object.prototype through unsafe assignment",
        code: `// Vulnerable code - unsafe recursive merge
function merge(target, source) {
  for (let key in source) {
    target[key] = source[key];  // No validation!
  }
  return target;
}

const config = {};
const userInput = { "__proto__": { isAdmin: true } };

merge(config, userInput);

// Now EVERY object in the app has isAdmin property
const newUser = {};
console.log(newUser.isAdmin);  // true! (should be undefined)

// This affects security checks throughout the app
if (newUser.isAdmin === true) {
  // Attacker bypassed authentication!
  grantAdminAccess(newUser);
}`,
      },
      {
        title: "Prototype Pollution Impact",
        description: "How pollution spreads across the application",
        code: `// After pollution, even unrelated code is affected
function createUser(userData) {
  const user = {
    name: userData.name,
    role: userData.role || "user"  // Expects "user" or "admin"
  };
  return user;
}

// Attacker pollutes Object.prototype.role
// { "__proto__": { "role": "admin" } }

const user = createUser({ name: "attacker" });
console.log(user.role);  // "admin" - inherited from polluted prototype!
// User is now admin without ever passing role in userData`,
      },
    ],
  },
  exploitPrimitives: {
    title: "Exploit Primitives",
    description:
      "Building blocks: sources (where pollution starts) and sinks (where it becomes dangerous)",
    content: `Exploit primitives are the fundamental building blocks of prototype pollution attacks. Think of them as an attacker's toolkit.

A "primitive" has three components:
1. **Package** - Which npm package contains this primitive
2. **Source** - Code that can be influenced by user input to pollute the prototype
3. **Sink** - Code that reads properties from the prototype in a dangerous way

Sources are usually in parsing or data merging functions. Sinks are usually in execution contexts where prototype properties are checked—like spawning processes or evaluating code.

The danger depends on where the property is read:
- Reading \`env\` on child_process = arbitrary environment variables (RCE)
- Reading \`shell\` on child_process = custom shell execution (RCE)
- Reading \`encoding\` on fs functions = file corruption or information disclosure
- Reading \`handlers\` in template engines = arbitrary code execution`,
    keyPoints: [
      "Primitives come in pairs: sources and sinks",
      "Sources are where untrusted data enters (JSON parsing, form merging, etc.)",
      "Sinks are where prototype properties are actually used (process spawning, template rendering)",
      "A source alone is harmless—must connect to a sink for exploitation",
      "Primitives are documented in catalogs for researchers and developers",
    ],
    examples: [
      {
        title: "Source Primitive (lodash)",
        description:
          "lodash.merge() can be a pollution source with __proto__ input",
        code: `const _ = require('lodash');

// This is a SOURCE primitive - untrusted data enters here
function mergeConfig(defaultConfig, userConfig) {
  return _.merge(defaultConfig, userConfig);
}

// Attacker sends this in a request body
const maliciousConfig = {
  "__proto__": {
    "shell": "/bin/sh -c"
  }
};

// lodash.merge processes it and pollutes Object.prototype
const config = mergeConfig({}, maliciousConfig);
// Now every object has shell property from prototype`,
      },
      {
        title: "Sink Primitive (child_process)",
        description:
          "child_process.exec() reads polluted env property from prototype",
        code: `const child_process = require('child_process');

// This is a SINK primitive - uses properties from prototype
function executeCommand(cmd, callback) {
  // exec() checks for env on options object
  // If polluted, it uses attacker-controlled environment!
  child_process.exec(cmd, callback);
}

// If Object.prototype.shell has been polluted:
// Every call to exec() will use the attacker's shell property
// This allows RCE by controlling which shell interpreter is used

// Attacker chain:
// 1. Send { "__proto__": { "shell": "/bin/sh" } } to lodash.merge (source)
// 2. Call executeCommand (sink) - child_process now runs with polluted shell
// 3. Arbitrary code execution`,
      },
    ],
  },
  gadgets: {
    title: "Gadgets and Gadget Chains",
    description:
      "Code patterns that can be exploited; gadget chains connect pollution sources to dangerous sinks",
    content: `A "gadget" is a piece of code in a package that can be exploited. A "gadget chain" connects multiple gadgets to turn prototype pollution into a real attack.

Think of it like a Rube Goldberg machine:
1. **First domino** (gadget 1): User input enters a parsing function
2. **Middle dominoes** (gadget 2, 3): Data flows through utility functions
3. **Final domino** (gadget 4): A dangerous function reads the polluted property and executes it

Each gadget is a single vulnerable code pattern. The chain is where multiple gadgets connect to create an exploit path.

For example:
- Package A has a gadget: unsafe merge function (can pollute prototype)
- Package B has a gadget: child_process.exec() that reads from prototype
- When both are in the same project, they form a gadget chain leading to RCE`,
    keyPoints: [
      "One gadget is just a code pattern—needs a chain to be exploitable",
      "Gadget chains connect sources (pollution entry) to sinks (dangerous usage)",
      "Chains exist at the package boundary—across two or more npm packages",
      "Different chains lead to different attacks (RCE, path traversal, template injection)",
      "Depaxiom finds chains that individual vulnerability scanners miss",
    ],
    examples: [
      {
        title: "Gadget: Unsafe Merge",
        description: "A gadget in lodash that can pollute prototypes",
        code: `// Inside lodash package (simplified)
// This gadget is a code pattern vulnerable to PP
function assignValue(object, path, value) {
  if (path === '__proto__' || path === 'constructor') {
    // Some versions don't properly validate these!
    object[path] = value;
  } else {
    object[path] = value;
  }
}

// Result: Calling this with attacker input pollutes prototype
// This gadget alone is just a vulnerability
// But it's dangerous when chained with a sink`,
      },
      {
        title: "Gadget Chain: Pollution → RCE",
        description:
          "How two gadgets in different packages create an exploit chain",
        code: `// STEP 1: Use gadget in Package A (lodash - pollution source)
const _ = require('lodash');
const userInput = JSON.parse(req.body);

// Gadget 1: unsafe merge
_.merge({}, userInput);  // Pollutes prototype if input has __proto__

// STEP 2: Later, different part of app uses gadget in Package B
const spawn = require('child_process').spawn;

// Gadget 2: exec without env validation
// If Object.prototype.shell is polluted, this uses attacker's value
spawn('ls', [], {
  shell: process.env.SHELL  // Reads from polluted prototype!
});

// Complete chain:
// Attacker input (lodash source) → Pollution → (child_process sink) → RCE
// This is a gadget CHAIN - two packages, two gadgets, one exploit`,
      },
    ],
  },
  chains: {
    title: "Chains (Package Combinations)",
    description:
      "How two packages create an exploitable path: source package pollutes, sink package executes",
    content: `A chain is a specific combination of two npm packages:
1. **Source Package**: Contains code that can pollute the prototype
2. **Sink Package**: Contains code that uses polluted properties dangerously

The most dangerous chains are those where:
- The source is commonly used (e.g., lodash, underscore)
- The source reaches the sink through normal application flow
- The sink connects to system resources (shell execution, file access)
- The exploit path is hard for developers to notice

For example, a typical chain looks like:
- lodash (parsing user input) → handlebars (template rendering)
- yaml (config parsing) → child_process (spawning commands)
- express-json-parser (body parsing) → ejs (template compilation)

When both packages exist in the same project's dependency tree, the chain is exploitable. Depaxiom finds these before they become CVEs.`,
    keyPoints: [
      "Chains require both source AND sink packages in dependency tree",
      "Source must be reachable from user-controlled input",
      "Sink must be executed after source runs",
      "Many chains are not obvious—sources and sinks live in different areas of code",
      "Traditional scanners only look at individual packages, missing chains",
    ],
    examples: [
      {
        title: "Real Chain Example: lodash → handlebars",
        description:
          "lodash merges config, handlebars uses polluted properties",
        code: `// User sends config via REST API
const express = require('express');
const _ = require('lodash');
const handlebars = require('handlebars');

app.post('/config', (req, res) => {
  // CHAIN SOURCE: lodash merges untrusted input
  const config = _.merge(defaultConfig, req.body);

  // Attacker can pollute here with:
  // { "__proto__": { "allowProtoProperties": true } }

  // Later: CHAIN SINK: handlebars uses prototype properties
  const template = handlebars.compile(config.template);

  // If handlebars checks for properties on prototype
  // it might allow execution of polluted values
  const output = template(config);
  res.send(output);
});

// Exploiting this chain:
// 1. Send { "__proto__": { "breakout": "malicious-template-code" } }
// 2. lodash pollutes prototype
// 3. handlebars reads breakout property
// 4. Attacker's code executes in template engine`,
      },
      {
        title: "Another Chain: yaml → child_process",
        description: "YAML parsing pollution leading to process spawning",
        code: `const yaml = require('js-yaml');
const spawn = require('child_process').spawn;

function loadConfig(yamlString) {
  // CHAIN SOURCE: YAML parser
  const config = yaml.load(yamlString);

  // Attacker's YAML has:
  // __proto__:
  //   shell: /bin/sh

  if (config.runCommand) {
    // CHAIN SINK: child_process reads polluted properties
    spawn(config.runCommand, [], {
      // Uses shell from prototype if not set in options
      shell: true
    });
  }
}

// Complete exploitation:
// YAML with PP payload → spawn with polluted shell → RCE`,
      },
    ],
  },
  skeletonKeys: {
    title: "Universal Skeleton Keys",
    description:
      "Properties that work across many packages, like magical keys opening multiple locks",
    content: `A skeleton key is a universal property that, when polluted, affects many packages the same way. They're called "skeleton keys" because they're like master keys—one key works on many locks.

Skeleton keys are properties that the JavaScript runtime checks frequently and universally:
- **env**: Environment variables available to spawned processes
- **shell**: Which shell interpreter spawns processes use
- **constructor**: The function that creates objects
- **prototype**: More prototype pollution
- **code**: Code strings for template engines
- **helpers**: Template helper functions
- **encoding**: File encoding for filesystem operations

These work across different packages because they're built into JavaScript patterns that many libraries follow. If you pollute \`env\`, any package spawning child processes inherits it. If you pollute \`shell\`, any process spawning sees it.

This is why skeleton key vulnerabilities are particularly dangerous: one pollution payload affects hundreds of packages simultaneously.`,
    keyPoints: [
      "Skeleton keys are universal properties affecting many packages",
      "Found in 20+ different npm packages, not limited to one library",
      "Properties like 'env', 'shell', 'constructor' are checked by JavaScript runtime patterns",
      "One skeleton key pollution can affect 100+ packages in dependency tree",
      "Harder to defend against because the vulnerability is in the pattern, not the package",
      "Many packages still use these dangerous patterns despite being well-known",
    ],
    examples: [
      {
        title: "env Skeleton Key",
        description:
          "Polluting 'env' affects all packages spawning processes",
        code: `// Attacker pollutes Object.prototype.env
Object.defineProperty(Object.prototype, 'env', {
  value: { NODE_ENV: 'production', PATH: '/attacker/bin' },
  enumerable: false
});

// Now ANY package spawning processes:

// Package 1: child_process
const spawn = require('child_process').spawn;
spawn('ls', []); // Sees polluted env!

// Package 2: execa
const execa = require('execa');
execa('ls'); // Sees polluted env!

// Package 3: cross-spawn
const crossSpawn = require('cross-spawn');
crossSpawn('ls'); // Sees polluted env!

// All these packages use the env skeleton key
// Single pollution affects all process spawning
// Attacker can manipulate PATH to execute their own 'ls' command`,
      },
      {
        title: "shell Skeleton Key",
        description:
          "Polluting 'shell' affects how processes are interpreted",
        code: `// Attacker pollutes Object.prototype.shell
Object.defineProperty(Object.prototype, 'shell', {
  value: '/bin/bash',
  enumerable: false
});

// Now many packages read this property:

// Package 1: child_process.exec
const exec = require('child_process').exec;
exec('echo hacked', (err, stdout) => {});
// Uses attacker's shell value

// Package 2: npm-run-all
// package.json: "test": "npm-run-all test:*"
// package.json: "test:unit": "jest"
// Uses polluted shell to run commands

// Package 3: git-commit-hook
// Runs pre-commit hooks using polluted shell
// All affected by single skeleton key pollution`,
      },
      {
        title: "constructor Skeleton Key",
        description:
          "Polluting 'constructor' can bypass security checks",
        code: `// Attacker pollutes Object.prototype.constructor
Object.defineProperty(Object.prototype, 'constructor', {
  value: {
    __proto__: { isAdmin: true }
  }
});

// Security check in application
function canAccessAdmin(user) {
  if (user.constructor.isAdmin) {  // Checks constructor
    return true;
  }
  return false;
}

const attacker = { name: 'attacker' };
console.log(canAccessAdmin(attacker)); // true! Bypassed!

// This affects any code checking constructor properties
// Framework security checks, role-based access, etc.`,
      },
    ],
  },
};

export default function SecurityTerminologyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "prototypePollution"
  );

  const sectionKeys = Object.keys(sections);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Security Terminology Guide
          </h1>
          <p className="text-muted-foreground mt-6 text-lg leading-8">
            Understand the concepts behind compositional vulnerability detection.
            Learn how Depaxiom finds security risks that other tools miss.
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sectionKeys.map((key) => (
            <button
              key={key}
              onClick={() => setExpandedSection(key)}
              className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                expandedSection === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-foreground hover:bg-muted/50"
              }`}
            >
              {sections[key].title}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-4xl px-6 pb-20 lg:px-8">
        <Accordion
          type="single"
          value={expandedSection || ""}
          onValueChange={setExpandedSection}
          collapsible
          className="w-full space-y-6"
        >
          {sectionKeys.map((key) => {
            const section = sections[key];
            return (
              <AccordionItem
                key={key}
                value={key}
                className="border-border data-[state=open]:border-primary/30 data-[state=open]:bg-muted/20 rounded-lg border transition-all duration-200"
              >
                <AccordionTrigger className="text-foreground hover:text-primary px-6 py-4 text-left text-xl font-semibold transition-colors duration-200">
                  <div>
                    <div>{section.title}</div>
                    <div className="text-muted-foreground mt-1 text-sm font-normal">
                      {section.description}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="space-y-6">
                    {/* Main Content */}
                    <div className="text-muted-foreground space-y-4 leading-7">
                      {section.content.split("\n\n").map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Key Points */}
                    {section.keyPoints && (
                      <div className="mt-8 rounded-lg bg-muted/50 p-6">
                        <h4 className="text-foreground mb-4 font-semibold">
                          Key Points:
                        </h4>
                        <ul className="text-muted-foreground space-y-2">
                          {section.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="text-primary mt-1 shrink-0">
                                ✓
                              </span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Code Examples */}
                    {section.examples && (
                      <div className="mt-8 space-y-6">
                        <h4 className="text-foreground font-semibold">
                          Examples:
                        </h4>
                        {section.examples.map((example, idx) => (
                          <Card
                            key={idx}
                            className="border-border bg-muted/30 p-6"
                          >
                            <h5 className="text-foreground mb-2 font-semibold">
                              {example.title}
                            </h5>
                            <p className="text-muted-foreground mb-4 text-sm">
                              {example.description}
                            </p>
                            <pre className="text-muted-foreground overflow-x-auto rounded-lg bg-background p-4 text-xs leading-relaxed">
                              <code>{example.code}</code>
                            </pre>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Call to Action */}
      <div className="bg-muted/30 mx-auto max-w-7xl rounded-xl border border-border px-6 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="text-center">
          <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
            Ready to Scan Your Dependencies?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Use Depaxiom to find compositional vulnerabilities across your
            package combinations.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/demo-app"
              className="bg-primary hover:bg-primary/90 rounded-lg px-6 py-3 font-semibold text-primary-foreground transition-colors duration-200"
            >
              Start Scanning
            </a>
            <a
              href="https://docs.depaxiom.com"
              className="border-border hover:bg-muted/50 rounded-lg border px-6 py-3 font-semibold transition-colors duration-200"
            >
              Read Full Docs
            </a>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="py-8 sm:py-12 lg:py-16" />
    </div>
  );
}
