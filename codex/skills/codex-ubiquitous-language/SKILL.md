---
name: codex-ubiquitous-language
description: Extract a DDD-style ubiquitous language glossary from the current conversation. Flags ambiguities, picks canonical terms, writes UBIQUITOUS_LANGUAGE.md.
---

# Codex Ubiquitous Language

Build a shared vocabulary from the current conversation. Pick the best term for each concept, flag conflicts, and write a glossary that the team (and AI) can use consistently.

## When to Use

- After a brainstorm/design session that introduced domain-specific terms
- When you notice the same concept being called different things
- When a word is being used to mean two different things
- Periodically during long initiatives to keep terminology tight

## Procedure

### 1. Scan the Conversation

Read the full conversation history. Extract every domain-relevant:
- **Nouns** — entities, aggregates, value objects, roles, documents, states
- **Verbs** — actions, transitions, commands, events
- **Concepts** — rules, policies, constraints, relationships

Skip generic programming terms unless they carry domain-specific meaning.

### 2. Identify Problems

| Problem | What to look for |
|---------|-----------------|
| **Ambiguity** | Same word used for different concepts |
| **Synonyms** | Different words for the same concept |
| **Vague terms** | Words too generic to be useful |
| **Overloaded terms** | Technical terms reused with domain meaning |

### 3. Propose Canonical Glossary

For each concept, pick ONE canonical term. Be opinionated:
- Choose the most precise and least ambiguous term
- Choose the term domain experts actually use
- List rejected alternatives as "Aliases to avoid"
- Group terms into natural clusters when patterns emerge

### 4. Check for Existing Glossary

If `UBIQUITOUS_LANGUAGE.md` already exists:
- Read it completely
- Incorporate new terms, mark them "(new)"
- Update evolved definitions, mark them "(updated)"
- Preserve accurate existing entries
- Rewrite the example dialogue to incorporate new terms

### 5. Write UBIQUITOUS_LANGUAGE.md

Write to the project root:

```markdown
# Ubiquitous Language

> Canonical terms for this project. Use these consistently in code, docs, and conversation.
> Aliases listed are terms to AVOID — use the canonical term instead.

## <Cluster Name>

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **CanonicalTerm** | One sentence. What it IS, not what it does. | synonym1, synonym2 |

## Relationships

- A **Customer** places one or more **Orders** (1:N)

## Example Dialogue

**Domain Expert:** When a **Customer** submits an **Order**, the system should validate each **LineItem** against current **Inventory**.

**Developer:** What happens if a **LineItem** references a **Product** that's out of stock?

**Domain Expert:** The **Order** moves to **PendingReview** state. We never reject it outright.

## Flagged Ambiguities

| Term | Problem | Recommendation |
|------|---------|---------------|
| "account" | Used for both user identity and billing entity | Use **UserAccount** for identity, **BillingAccount** for billing |
```

### 6. Output Summary

After writing, summarize inline: terms defined, clusters, key ambiguities, terms needing user input.

Then state:

> I've written/updated `UBIQUITOUS_LANGUAGE.md`. From this point forward I will use these terms consistently. If I drift from this language or you notice a term that should be added, let me know.

## Rules

- Be opinionated. Pick the best term. Don't present options.
- Flag conflicts explicitly with a clear recommendation.
- Definitions: one sentence max. Define what it IS.
- Only domain terms. Skip generic programming concepts.
- Relationships: bold terms, explicit cardinality (1:1, 1:N, N:N).
- Example dialogue: 3-5 exchanges showing terms used precisely.
- On re-runs: "(updated)" for changed, "(new)" for added.
