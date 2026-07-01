---
name: code-walkthrough-authoring
description: 'Write code examples and walkthroughs that teach one technical idea at a time and explain why each step matters. Use when authoring or revising code-heavy posts in src/content/posts/**.'
license: Forward Proprietary
compatibility: 'Markdown post authoring in src/content/posts/**'
---

# Code Walkthrough Authoring

Use this skill when a post needs runnable examples, code snippets, request-flow explanations, or guided walkthroughs.

## Goal

Turn code into a teaching tool rather than dumping implementation details on the page.

## Research Base

This skill is grounded in code-sample and procedure-writing guidance. See [the local reference guide](references/REFERENCE.md) for the repository-local walkthrough patterns and examples.

## Default Walkthrough Shape

Use this order unless the example has a strong reason to differ.

1. State what the example demonstrates.
2. Give the runtime or file context.
3. Show the smallest useful code sample.
4. Explain the blocks or lines that carry the teaching point.
5. State the expected result or visible behavior.
6. Call out the most likely beginner mistake.
7. Add the design implication only when it helps architects evaluate the pattern.

## Example Authoring Rules

- Start with one sentence that says why the snippet exists.
- Prefer one recommended path over multiple alternatives.
- Keep the sample small enough that the reader can hold it in working memory.
- Explain placeholders, outputs, and side effects near the code.
- If the code is partial, say what has been omitted and why.
- Walk through the code in the order the reader experiences it.
- If the walkthrough quotes documentation or leans on external platform behavior, verify the claim against the primary docs and cite the source in the draft or supporting notes.

## SFCC-Specific Guidance

- Name the file, controller, hook, ISML template, script, or Business Manager context before the code block.
- Clarify whether the reader is seeing storefront logic, Business Manager configuration, or supporting infrastructure.
- Distinguish between what the platform invokes automatically and what the developer calls directly.
- For request-flow examples, state where the request starts and where control moves next.
- When the example has architectural consequences, name the tradeoff in one or two sentences rather than drifting into a second tutorial.

## Example Patterns

### Pattern: Explain a Hook

1. Name when the hook runs.
2. Show the hook registration or implementation.
3. Explain the input and output that matter.
4. Describe the storefront or basket behavior the reader will notice.

### Pattern: Explain a Controller or Route

1. State what request reaches the route.
2. Show the important handler code.
3. Explain the key decision points.
4. State what template, JSON payload, or redirect comes out.

## Example

Weak setup:

"The following code shows how SFCC can powerfully handle basket validation."

Stronger setup:

"This hook validates the basket before checkout continues. The example shows where the validation runs and how it can stop the shopper before an invalid order is placed."

Weak explanation:

"This part processes the data and then returns the result."

Stronger explanation:

"This line reads the current basket and checks whether the shipment still has a valid shipping method. If the check fails, the hook returns an error object and checkout does not advance."

## Audit Checklist

- Does the reader know why the snippet exists before seeing it?
- Is the example the shortest version that still teaches the point?
- Are the lines explained in execution order?
- Did I explain the visible result, not just the internal mechanics?
- Did I avoid presenting several equivalent patterns without a reason?

## Best Practice References

- See [references/REFERENCE.md](references/REFERENCE.md) for repository-local guidance and examples.

## Local Examples

- See [examples/EXAMPLES.md](examples/EXAMPLES.md) for code walkthrough setup and explanation patterns.

## When Not To Use

- Pure conceptual posts with no code or process demonstration.
- Source verification or quote handling before the underlying claim has been checked against primary docs.
- Large post-outline restructuring before the teaching sequence is settled.