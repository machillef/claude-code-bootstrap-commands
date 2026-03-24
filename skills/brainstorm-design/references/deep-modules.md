# Deep Modules

From John Ousterhout's *A Philosophy of Software Design*.

## Core Concept

A **deep module** has a small, simple interface that hides significant implementation complexity. A **shallow module** has a large or complex interface relative to the functionality it provides. Deep modules are good; shallow modules are a design smell.

```
  Deep Module              Shallow Module
  +---------+              +-------------------------+
  | interface|              |        interface        |
  +---------+              +-------------------------+
  |         |              |     implementation      |
  |  impl   |              +-------------------------+
  |         |
  |         |
  +---------+
  Small surface,           Large surface,
  lots hidden              little hidden
```

## Design Questions

When designing a module, ask:

1. **Can I reduce the number of methods/entry points?** Fewer methods that each do more is usually better than many fine-grained methods.
2. **Can I simplify the parameters?** Every parameter is interface surface the caller must understand.
3. **Can I hide more complexity inside?** If the caller assembles multiple steps, the module boundary may be in the wrong place.
4. **Is the caller forced to understand implementation details?** If yes, the abstraction is leaking.

## Relevance to AI-Assisted Development

Modules with small interfaces are easier for LLMs to use correctly -- there is less surface area to get wrong, fewer parameter combinations to hallucinate, and less context needed to generate a correct call.
