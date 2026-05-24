---
name: audience-layering
description: 'Shape technical posts so hands-on implementers and solution-level readers get the context they need without splitting the draft into two competing tracks. Use when a post must explain both how something works and why the design choice matters.'
license: Forward Proprietary
compatibility: 'Markdown post authoring in src/content/posts/**'
---

# Audience Layering

Use this skill when a post or section needs to stay practical for implementers while still giving architects or technical decision-makers enough context to evaluate the pattern.

## Goal

Write one coherent post that serves two nearby audiences:

- Developers who need to build, debug, and understand the behavior.
- Architects or technical decision-makers who need to evaluate structure, tradeoffs, constraints, and long-term impact.

The post should not read like two documents stitched together.

## Default Audience Model

Before drafting or revising, decide these four points:

1. Primary audience: implementer, architect, or both.
2. Secondary audience: what they still need from the post.
3. Knowledge floor: what background can be assumed.
4. Decision depth: is this post mainly about implementation, design choices, or both.

If you cannot answer those four questions, the post scope is still too fuzzy.

## Layering Pattern

Use this sequence when both audiences matter:

1. Start with the practical problem or visible behavior.
2. Explain the implementation path in concrete terms.
3. Add the architectural implication, tradeoff, or boundary.
4. Return to what the reader should do with that understanding.

This keeps the post readable for implementers without starving broader technical readers of decision context.

## Practical Rules

- Keep one primary lane per section. Do not jump between code detail and design theory every paragraph.
- When a section is implementation-heavy, add a short architecture note instead of a full detour.
- When a section is architecture-heavy, ground it with one concrete example.
- State when guidance is a platform rule versus a design recommendation.
- Name the tradeoff instead of pretending the pattern is universally good.

## Good Section Signals

- An implementer can act on the explanation.
- A decision-maker can see why the pattern exists and where it stops scaling.
- The post does not repeat the same idea once in code language and again in vague strategy language.

## Example

Weak layered writing:

"Controllers are important because they handle requests, and from an architectural perspective they also matter for overall system design and maintainability in enterprise contexts."

Stronger layered writing:

"A controller handles the incoming request and decides what response to send back. The broader design point is that controller boundaries affect how storefront behavior, integrations, and cross-cartridge responsibilities stay separated over time."

## Audit Checklist

- Is the post's primary audience explicit in the opening or outline?
- Does each section stay in one main lane before adding a short secondary-audience note?
- Did I explain why the pattern matters, not only how it works?
- Did I avoid padding the post with abstract architecture language that does not change a decision?
- Would both a builder and a design reviewer find a reason to keep reading?

## When Not To Use

- Narrow posts aimed only at one audience with no architectural or implementation crossover.
- Sentence-level cleanup. Use `anti-ai-writing`.
- Fact verification before the underlying claim has been checked against primary sources.