---
name: ubiquitous-language
description: "Extract a DDD-style ubiquitous language glossary from the current conversation. Scans for domain nouns, verbs, and concepts — flags ambiguities, picks canonical terms, and writes UBIQUITOUS_LANGUAGE.md."
---

# Ubiquitous Language Extraction

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

Skip generic programming terms (class, function, API, database) unless they have domain-specific meaning in this project.

### 2. Identify Problems

For each extracted term, check for:

| Problem | What to look for |
|---------|-----------------|
| **Ambiguity** | Same word used for different concepts (e.g., "account" meaning both user account and billing account) |
| **Synonyms** | Different words for the same concept (e.g., "customer", "client", "user" all meaning the same thing) |
| **Vague terms** | Words too generic to be useful (e.g., "item", "thing", "data") |
| **Overloaded terms** | Technical terms reused with domain meaning (e.g., "event" meaning both a domain event and a calendar event) |

### 3. Propose Canonical Glossary

For each concept, pick ONE canonical term. Be opinionated:
- Choose the term that is most precise and least ambiguous
- Choose the term domain experts actually use in conversation
- When in doubt, prefer the more specific word over the more general one
- List rejected alternatives as "Aliases to avoid"

Group terms into natural clusters when patterns emerge (e.g., "Order lifecycle", "User management", "Billing").

### 4. Check for Existing Glossary

Before writing, check if `UBIQUITOUS_LANGUAGE.md` already exists in the project root.

**If it exists (re-run):**
- Read the existing file completely
- Incorporate new terms from the current conversation
- Update definitions if understanding has evolved — mark these "(updated)"
- Mark new entries "(new)"
- Preserve existing entries that are still accurate
- Re-flag any new ambiguities introduced
- Rewrite the example dialogue to incorporate new terms

**If it does not exist:** Create it fresh.

### 5. Write UBIQUITOUS_LANGUAGE.md

Write the file to the project root using this structure:

```markdown
# Ubiquitous Language

> Canonical terms for this project. Use these consistently in code, docs, and conversation.
> Aliases listed are terms to AVOID — use the canonical term instead.

## <Cluster Name>

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **CanonicalTerm** | One sentence. What it IS, not what it does. | synonym1, synonym2 |

## <Another Cluster>

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **AnotherTerm** | One sentence definition. | alias1 |

## Relationships

- A **Customer** places one or more **Orders** (1:N)
- An **Order** contains one or more **LineItems** (1:N)
- A **Product** belongs to exactly one **Category** (N:1)

## Example Dialogue

> Shows these terms interacting naturally in a conversation between a developer and domain expert.

**Domain Expert:** When a **Customer** submits an **Order**, the system should validate each **LineItem** against current **Inventory**.

**Developer:** What happens if a **LineItem** references a **Product** that's out of stock?

**Domain Expert:** The **Order** moves to **PendingReview** state. We never reject it outright — a **Fulfillment Specialist** decides whether to back-order or substitute.

## Flagged Ambiguities

| Term | Problem | Recommendation |
|------|---------|---------------|
| "account" | Used for both user identity and billing entity | Use **UserAccount** for identity, **BillingAccount** for billing |
```

Rules for the content:
- **Definitions:** One sentence max. Define what it IS, not what it does.
- **Relationships:** Use bold terms and state cardinality explicitly (1:1, 1:N, N:N).
- **Example dialogue:** 3-5 exchanges. Show terms being used precisely in realistic conversation.
- **Flagged ambiguities:** Every unresolved or partially resolved conflict gets a row with a clear recommendation.
- **Multiple tables:** Group into clusters when natural groupings emerge. Don't force everything into one table.

### 6. Output Summary

After writing the file, output a brief inline summary:
- How many terms defined
- How many clusters
- Key ambiguities flagged
- Any terms that need user input to resolve

Then print this exact closing statement:

> I've written/updated `UBIQUITOUS_LANGUAGE.md`. From this point forward I will use these terms consistently. If I drift from this language or you notice a term that should be added, let me know.

## Rules

- Be opinionated. Pick the best term. Don't present options — make a choice and list the rest as aliases to avoid.
- Flag conflicts explicitly with a clear recommendation. Don't paper over ambiguity.
- Keep definitions tight. One sentence. Define what it IS.
- Only domain terms. Skip generic programming concepts unless they carry domain-specific meaning.
- Show relationships with bold terms and cardinality.
- Group into multiple tables when natural clusters emerge.
- The example dialogue must use the canonical terms correctly and show them interacting.
- On re-runs, mark changed entries "(updated)" and new entries "(new)".
- If arguments were provided to the command, treat them as focus areas — prioritize terms from those domain areas but still include other terms found in conversation.
