# Codex Variant

This directory contains a Codex-native variant of the bootstrap workflow.

## Design Goals

- Reuse the durable `docs/ai/` initiative model from the Claude workflow
- Avoid Claude-specific slash commands and ECC plugin dependencies
- Install additively into `~/.codex/` without overwriting user-owned config
- Coexist with the Claude variant from the same repository

## What Gets Installed

- Namespaced skills under `~/.codex/skills/`
- A managed block inside `~/.codex/AGENTS.md` that advertises the workflow
- An optional reference bundle under `~/.codex/bootstrap-reference/claude-code-bootstrap-commands/`

The installer does **not** modify `~/.codex/config.toml`.

## Available Skills

- `codex-quick-change`
- `codex-bootstrap-existing`
- `codex-bootstrap-new`
- `codex-continue-work`
- `codex-fix-bugs`
- `codex-brainstorm-design`
- `codex-systematic-debugging`
- `codex-orchestrate`

## ECC-Inspired Compatibility Layer

This is not a direct port of `everything-claude-code`. Codex does not expose the
same plugin, slash-command, or hook model. Instead, this variant recreates the
portable parts of ECC in Codex-native form:

- durable initiative state in `docs/ai/`
- planner-style bootstrap before implementation
- research-first workflow before new code
- TDD-first execution for behavioral changes
- reviewer and security-review handoff discipline
- optional multi-agent role templates for exploration, review, and docs research
- orchestration patterns with explicit handoff documents

## Reference Bundle

The installer links a non-invasive reference bundle to:

`~/.codex/bootstrap-reference/claude-code-bootstrap-commands/`

That bundle includes:

- `config.reference.toml` — an ECC-inspired sample Codex config
- `agents/*.toml` — sample multi-agent role configs
- `README.md` — guidance on how to adopt the reference files manually

Nothing in the reference bundle is auto-applied. It exists so users can merge
the ideas into their existing Codex setup intentionally.

## How To Invoke

Codex does not use Claude-style slash commands. Ask for the skill directly:

```text
Use the codex-bootstrap-existing skill for initiative migrate-to-react.
```

```text
Use codex-continue-work for initiative migrate-to-react.
```

## Coexisting With Claude

The `docs/ai/` files are intentionally shared. Claude and Codex can both use
the same initiative ledger as long as they both treat those files as the source
of truth for active work.
