# Security Terminology Content Structure

Quick reference for the content organization in SecurityTerminologyPage.tsx

## File Organization

```typescript
// src/docs/SecurityTerminologyPage.tsx
├── Interface: CodeExample
│   ├── title: string
│   ├── description: string
│   └── code: string
├── Interface: SectionContent
│   ├── title: string
│   ├── description: string
│   ├── content: string
│   ├── examples?: CodeExample[]
│   └── keyPoints?: string[]
├── Constants: sections (Record<string, SectionContent>)
└── Component: SecurityTerminologyPage
```

## Section Keys

Each section in the `sections` object is identified by a unique key used as the accordion value:

| Key | Page Title | Words | Examples | Key Points |
|-----|-----------|-------|----------|-----------|
| `prototypePollution` | What is Prototype Pollution? | 1,200+ | 2 | 5 |
| `exploitPrimitives` | Exploit Primitives | 1,000+ | 2 | 5 |
| `gadgets` | Gadgets and Gadget Chains | 1,100+ | 2 | 5 |
| `chains` | Chains (Package Combinations) | 900+ | 2 | 5 |
| `skeletonKeys` | Universal Skeleton Keys | 1,300+ | 3 | 6 |

## Content Flow

### Section: prototypePollution

**Description**: "A JavaScript vulnerability where attacker-controlled data modifies the shared prototype object"

**Main Content** (4 paragraphs):
1. Introduction to prototype pollution as JavaScript-specific
2. How prototype chain inheritance works
3. Cascade effect explanation
4. Why Node.js is more dangerous than browsers

**Key Points**:
- Exploits JavaScript's prototype chain inheritance model
- One pollution can affect thousands of objects
- Often comes from merging untrusted data
- Can escalate to RCE if combined with dangerous properties
- More dangerous in Node.js than browsers due to system access

**Examples**:
1. **Simple Prototype Pollution**
   - Shows unsafe recursive merge
   - Demonstrates Object.prototype modification
   - Shows impact on new objects created after pollution

2. **Prototype Pollution Impact**
   - Demonstrates spreading across unrelated code
   - Shows default value override
   - Real security bypass scenario

---

### Section: exploitPrimitives

**Description**: "Building blocks: sources (where pollution starts) and sinks (where it becomes dangerous)"

**Main Content** (4 paragraphs):
1. Definition of exploit primitives
2. Sources and sinks concept
3. Why both are necessary
4. Real-world examples in popular packages

**Key Points**:
- Primitives come in pairs: sources and sinks
- Sources are where untrusted data enters
- Sinks are where prototype properties are actually used
- A source alone is harmless without a sink
- Primitives are documented in catalogs

**Examples**:
1. **Source Primitive (lodash)**
   - Shows lodash.merge as pollution entry point
   - Demonstrates __proto__ input handling
   - Shows prototype pollution result

2. **Sink Primitive (child_process)**
   - Shows child_process.exec as property reader
   - Demonstrates property usage for execution
   - Explains how pollution leads to RCE

---

### Section: gadgets

**Description**: "Code patterns that can be exploited; gadget chains connect pollution sources to dangerous sinks"

**Main Content** (4 paragraphs):
1. Definition of gadgets as code patterns
2. Gadget chain concept (Rube Goldberg analogy)
3. Multi-step exploitation flow
4. Cross-package boundary exploitation

**Key Points**:
- One gadget is just a code pattern
- Needs a chain to be exploitable
- Chains connect sources to sinks
- Chains exist at package boundaries
- Different chains lead to different attacks
- Depaxiom finds chains other scanners miss

**Examples**:
1. **Gadget: Unsafe Merge**
   - Shows vulnerable merge implementation
   - Demonstrates __proto__ and constructor handling
   - Explains how it enables pollution

2. **Gadget Chain: Pollution → RCE**
   - Step 1: lodash merge (source gadget)
   - Step 2: child_process (sink gadget)
   - Shows complete exploitation flow

---

### Section: chains

**Description**: "How two packages create an exploitable path: source package pollutes, sink package executes"

**Main Content** (4 paragraphs):
1. Definition of chains as source + sink packages
2. Dangerous chain characteristics
3. Typical chain examples (lodash→handlebars, yaml→child_process)
4. Why both packages must be in dependency tree

**Key Points**:
- Chains require both source AND sink packages
- Source must be reachable from user input
- Sink must be executed after source runs
- Many chains are not obvious
- Traditional scanners only look at individual packages
- Missing chains is a major security gap

**Examples**:
1. **Real Chain Example: lodash → handlebars**
   - API endpoint receiving config
   - lodash.merge pollutes prototype
   - handlebars uses polluted properties
   - Attacker exploits through template engine

2. **Another Chain: yaml → child_process**
   - YAML parsing as source
   - child_process spawning as sink
   - Complete exploitation showing both packages

---

### Section: skeletonKeys

**Description**: "Properties that work across many packages, like magical keys opening multiple locks"

**Main Content** (4 paragraphs):
1. Definition of skeleton keys as universal properties
2. How they work across different packages
3. Examples: env, shell, constructor, code, helpers, encoding
4. Why they're particularly dangerous

**Key Points**:
- Skeleton keys are universal properties
- Found in 20+ different npm packages
- Properties like env, shell, constructor are universally checked
- One skeleton key pollution affects 100+ packages
- Harder to defend against
- Many packages still use dangerous patterns

**Examples**:
1. **env Skeleton Key**
   - Pollutes Object.prototype.env
   - Shows 3 packages reading polluted env
   - Demonstrates PATH manipulation attack

2. **shell Skeleton Key**
   - Pollutes Object.prototype.shell
   - Shows 3 packages affected:
     - child_process.exec
     - npm-run-all
     - git-commit-hook
   - Shows universal impact

3. **constructor Skeleton Key**
   - Pollutes Object.prototype.constructor
   - Shows security check bypass
   - Demonstrates role-based access control bypass

---

## Component Structure

```
SecurityTerminologyPage
│
├── Hero Section (lines 388-398)
│   ├── Heading: "Security Terminology Guide"
│   ├── Subheading: Concept explanation
│   └── Description: Target audience context
│
├── Quick Navigation (lines 400-415)
│   ├── Grid of 5 buttons (sm:grid-cols-2 lg:grid-cols-3)
│   ├── Each button toggles accordion section
│   ├── Visual feedback (border, background, text colors)
│   └── 200ms transitions
│
├── Accordion Sections (lines 417-508)
│   ├── For each section key:
│   │   ├── AccordionItem (collapsible container)
│   │   ├── AccordionTrigger (header with title + description)
│   │   └── AccordionContent
│   │       ├── Main content paragraphs
│   │       ├── Key Points box (if exists)
│   │       └── Examples cards (if exist)
│   └── Styling classes for open/closed states
│
└── Call-to-Action Footer (lines 510-527)
    ├── Section title: "Ready to Scan Your Dependencies?"
    ├── Description text
    ├── Two buttons:
    │   ├── "Start Scanning" → /demo-app
    │   └── "Read Full Docs" → https://docs.depaxiom.com
    └── Bottom spacing padding

```

## Tailwind Classes Reference

### Layout
- `mx-auto` - Center content horizontally
- `max-w-7xl` - Maximum width for main container
- `max-w-4xl` - Narrower width for content
- `px-6 lg:px-8` - Responsive horizontal padding
- `py-12 sm:py-16 lg:py-20` - Responsive vertical padding
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` - Responsive grid

### Text
- `text-foreground` - Main text color
- `text-muted-foreground` - Secondary text color
- `text-center` - Centered text
- `text-left` - Left-aligned text
- `text-4xl font-bold` - Large heading
- `text-lg` - Large body text
- `text-sm` - Small text
- `leading-8` - Line height for readability
- `tracking-tight` - Tight letter spacing

### Colors & Backgrounds
- `bg-background` - Main background
- `bg-muted/50` - Muted background with transparency
- `bg-primary/10` - Primary color with 10% opacity
- `border border-border` - Border styling
- `rounded-lg` - Border radius

### Interactive
- `hover:border-primary/50` - Hover border color
- `hover:text-primary` - Hover text color
- `hover:bg-muted/50` - Hover background
- `data-[state=open]:` - Open state styling
- `transition-all duration-200` - Smooth animations

### Spacing
- `gap-3` - Gap between grid items
- `gap-4` - Larger gap
- `space-y-4` - Vertical space between children
- `space-y-6` - Larger vertical space
- `mb-4` - Margin bottom
- `mt-6` - Margin top
- `mb-12` - Large margin bottom

## Code Example Format

Every code example follows this structure:

```typescript
{
  title: "Short descriptive title",
  description: "What this example demonstrates",
  code: `// Multi-line code with syntax highlighting
// Shows actual vulnerable patterns
const vulnerable = () => {
  // Problem illustrated
};
// Shows impact or exploitation`
}
```

### Code Example Guidelines

- **Length**: Keep under 20 lines when possible
- **Comments**: Add comments explaining the vulnerability
- **Syntax**: Use realistic JavaScript/Node.js patterns
- **Terminology**: Use consistent term names (attacker, pollution, gadget, etc.)
- **Output**: Show console.log or error output when relevant

## Styling Classes for Sections

### Accordion Item (closed)
```
border-border hover:bg-muted/20 rounded-lg border px-6 py-2 transition-all duration-200
```

### Accordion Item (open)
```
data-[state=open]:border-primary/30 data-[state=open]:bg-muted/20
```

### Key Points Box
```
mt-8 rounded-lg bg-muted/50 p-6
```

### Example Cards
```
border-border bg-muted/30 p-6
```

### Code Block
```
text-muted-foreground overflow-x-auto rounded-lg bg-background p-4 text-xs leading-relaxed
```

## Related Files

| File | Purpose | Editable |
|------|---------|----------|
| `SecurityTerminologyPage.tsx` | Main component and content | Yes |
| `README.md` | Developer documentation | Yes |
| `CONTENT_STRUCTURE.md` | This file (reference) | Yes |
| `main.wasp` | Route definition | Rarely |
| `NavBar/constants.ts` | Navigation menu | Rarely |

## Content Update Checklist

When updating content:

- [ ] Update section title if needed
- [ ] Update description (shows in quick nav)
- [ ] Update main content (paragraphs)
- [ ] Add/remove key points as needed
- [ ] Add/remove/update code examples
- [ ] Verify code examples are syntactically correct
- [ ] Check all links are still valid
- [ ] Test responsive design in browser
- [ ] Verify dark mode appearance
- [ ] Check keyboard navigation still works
- [ ] Update word count in this document
- [ ] Add to git commit message

## Key Statistics

| Metric | Value |
|--------|-------|
| Total Sections | 5 |
| Total Code Examples | 11 |
| Total Key Points | 26 |
| Total Words | 5,500+ |
| File Size | ~23 KB |
| Component Lines | 582 |
| TypeScript Types | 2 (CodeExample, SectionContent) |
| Tailwind Classes | 50+ unique |
| Responsive Breakpoints | 3 (sm, md, lg) |
