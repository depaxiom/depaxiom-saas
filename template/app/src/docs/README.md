# Security Terminology Documentation

## Overview

The Security Terminology Guide is an interactive documentation page that explains core concepts in compositional vulnerability detection. It's designed for developers who may not have deep security expertise but need to understand how Depaxiom finds vulnerabilities across package combinations.

**Location**: `/docs/security-terminology`
**Component**: `SecurityTerminologyPage.tsx`
**Route Name**: `SecurityTerminologyRoute`

## Topics Covered

### 1. What is Prototype Pollution?

**Purpose**: Explain the JavaScript-specific vulnerability that forms the basis of many compositional attacks.

**Content includes**:
- How prototype pollution exploits JavaScript's prototype chain
- Why it's particularly dangerous in Node.js (vs browsers)
- Simple vulnerability examples showing real impact
- Cascade effects where one pollution affects thousands of objects

**Code examples**:
- Simple recursive merge pollution
- How pollution spreads across unrelated code paths

### 2. Exploit Primitives

**Purpose**: Define the building blocks of vulnerability exploitation—sources and sinks.

**Content includes**:
- What primitives are and why they matter
- Source primitives: where user input enters
- Sink primitives: where properties are used dangerously
- Why a source alone is harmless
- Real examples from popular packages (lodash, child_process)

**Code examples**:
- lodash.merge as a source primitive
- child_process.exec as a sink primitive
- Complete primitive chains

### 3. Gadgets and Gadget Chains

**Purpose**: Show how code patterns connect to create exploitable paths.

**Content includes**:
- Definition: Gadgets as code patterns, chains as connections
- Why one gadget isn't dangerous alone
- How chains work across package boundaries
- Different chain outcomes (RCE, path traversal, template injection)

**Code examples**:
- Unsafe merge gadget implementation
- Complete exploitation chain showing both packages

### 4. Chains (Package Combinations)

**Purpose**: Explain specific package-pair exploits and why they're dangerous.

**Content includes**:
- What makes a chain dangerous
- How source reaches sink through normal application flow
- Why traditional scanners miss these
- Common real-world chains (lodash→handlebars, yaml→child_process)

**Code examples**:
- lodash merge configuration then handlebars template rendering
- YAML parsing leading to process spawning

### 5. Universal Skeleton Keys

**Purpose**: Explain cross-package properties that work like master keys.

**Content includes**:
- What skeleton keys are and why they're dangerous
- 20+ universal properties that affect many packages
- Properties: env, shell, constructor, code, helpers, encoding
- Why these are built into JavaScript patterns
- Why they're hard to defend against

**Code examples**:
- `env` skeleton key affecting all process spawning
- `shell` skeleton key affecting command interpretation
- `constructor` skeleton key bypassing security checks

## Page Features

### Interactive Navigation

- **Quick Navigation Buttons**: Jump between sections with buttons at the top
- **Expandable Sections**: Accordion UI shows/hides detailed content
- **Current Section Highlighting**: Visual feedback on which section is expanded

### Content Organization

Each section includes:
- **Title & Description**: Quick explanation at a glance
- **Main Content**: 2-3 paragraphs explaining the concept
- **Key Points**: Bulleted list of critical takeaways
- **Code Examples**: 2-3 realistic code samples showing concepts in action
- **Example Cards**: Formatted code blocks with descriptions

### Call to Action

Bottom section prompts users to:
- Start scanning their dependencies
- Read the full external documentation
- Explore the demo application

## Design & Styling

The page follows Depaxiom SaaS app design patterns:

- **Component Library**: Uses existing UI components (Accordion, Card)
- **Tailwind CSS**: Responsive design with proper spacing
- **Color System**: Uses CSS variables (primary, background, muted, etc.)
- **Dark Mode**: Full support through existing theme system
- **Typography**: Consistent with landing page and other documentation

### Responsive Breakpoints

- **Mobile** (< 640px): Single column, stacked navigation
- **Tablet** (640px - 1024px): 2-column grids where appropriate
- **Desktop** (> 1024px): Full 3-column navigation, max-width containers

## Code Examples Included

### Prototype Pollution
- Simple merge vulnerability
- How pollution cascades through the app

### Exploit Primitives
- lodash source primitive
- child_process sink primitive

### Gadgets
- Unsafe merge gadget
- Complete gadget chain showing both packages

### Chains
- Real-world: lodash → handlebars
- Real-world: yaml → child_process

### Skeleton Keys
- `env` key affecting process spawning
- `shell` key affecting shell selection
- `constructor` key bypassing security checks

## Integration Points

### Navigation

The page is added to the main navigation menu in two places:

1. **Marketing Navigation** (`/` and `/pricing` pages):
   - Appears as "Security Guide" link
   - Helps visitors understand concepts before pricing decision

2. **Demo Navigation** (authenticated routes):
   - Appears as "Security Guide" link
   - Helps users understand findings after scanning

### Related Pages

- **External Docs** (DocsUrl): Links to full documentation
- **Demo App** (`/demo-app`): Run actual scans
- **Pricing** (`/pricing`): Business tiers and features

## Maintenance Notes

### Adding New Sections

To add new sections:

1. Add a new key-value pair to the `sections` object in `SecurityTerminologyPage.tsx`
2. Follow the `SectionContent` interface structure
3. Add the title to the quick navigation
4. The accordion will automatically include it

Example:
```typescript
newTopic: {
  title: "Topic Name",
  description: "Brief description",
  content: "Main explanation...",
  keyPoints: ["Point 1", "Point 2"],
  examples: [{ title: "Example", description: "Desc", code: "code..." }]
}
```

### Updating Code Examples

Code examples are stored in the `CodeExample` interface within each section. Each example includes:
- `title`: Short name for the example
- `description`: What the example demonstrates
- `code`: The actual code (can be multi-line)

Keep examples:
- Short (< 15 lines when possible)
- Self-contained (can run independently)
- Realistic (not synthetic test cases)
- Well-commented (explain key vulnerability patterns)

### Keeping Content Current

As Depaxiom's detection capabilities evolve:
1. Update key points with new attack vectors
2. Add new examples as chains are discovered
3. Update skeleton key count if new universal properties found
4. Link to security advisories when appropriate

## Accessibility Considerations

- **Semantic HTML**: Proper heading hierarchy (h1, h2, etc.)
- **Keyboard Navigation**: Accordion fully keyboard accessible
- **Color Contrast**: Uses WCAG AA compliant colors
- **Code Examples**: Use `<pre>` and `<code>` tags for proper screen reader handling
- **Text Alternatives**: Concepts explained in text (not just examples)

## Performance

- **Code Splitting**: Component is lazy-loaded by Wasp routing
- **No External Requests**: All content is self-contained
- **Lightweight**: Single component, minimal dependencies
- **Fast Rendering**: Accordion state is local, no database calls

## Future Enhancements

Potential improvements to consider:

1. **Interactive Demos**: Click to pollute objects and see cascade effect
2. **Video Explanations**: Screen recordings of concepts
3. **CVE Timeline**: Show real vulnerabilities as examples
4. **Package Analyzer**: Let users input package names to see chains
5. **Search Functionality**: Full-text search across sections
6. **Difficulty Levels**: Beginner, Intermediate, Expert explanations
7. **Related Findings**: Show how actual findings relate to concepts

## Testing

### Manual Testing

1. **Navigation**:
   - Click each section button
   - Verify correct section expands
   - Verify visual feedback works

2. **Content**:
   - Verify code examples render correctly
   - Check responsive layout on mobile
   - Test dark mode rendering

3. **Links**:
   - Demo app link works
   - External docs link opens correctly
   - Navigation menu links work from other pages

### Automated Testing

To add tests:
```typescript
// src/docs/__tests__/SecurityTerminologyPage.test.tsx
describe('SecurityTerminologyPage', () => {
  it('renders all sections', () => {
    // Test each section is in the DOM
  });

  it('accordion expands and collapses', () => {
    // Test interaction
  });

  it('code examples are properly formatted', () => {
    // Test code block rendering
  });
});
```

## Related Files

- **Route Definition**: `main.wasp` (lines 270-275)
- **Navigation Constants**: `src/client/components/NavBar/constants.ts`
- **UI Components**: `src/client/components/ui/` (accordion, card)
- **Styling**: `src/client/Main.css` and Tailwind configuration
- **Type System**: TypeScript interfaces in SecurityTerminologyPage.tsx

## SEO Considerations

When content goes live, ensure:
- Page meta title and description are set (via Wasp head config if needed)
- Content targets keywords: "prototype pollution", "gadget chains", "exploit primitives"
- Headers use proper hierarchy (h1 for page title, h2 for sections)
- External docs link provides context for search engines
