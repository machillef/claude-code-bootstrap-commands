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

The installer does **not** modify `~/.codex/config.toml`.

## Available Skills

- `codex-quick-change`
- `codex-bootstrap-existing`
- `codex-bootstrap-new`
- `codex-continue-work`
- `codex-brainstorm-design`
- `codex-systematic-debugging`

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
