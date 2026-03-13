# Codex Reference Bundle

This folder is installed as a namespaced reference bundle. It is not applied
automatically.

## Purpose

The bundle adapts the most portable Codex-facing ideas from
`everything-claude-code` without assuming Claude plugins, hooks, or slash
commands.

## Contents

- `config.reference.toml`
  - sample project-local or global Codex config
  - leaves `model` and `model_provider` unset
  - shows optional multi-agent and MCP structure
- `agents/explorer.toml`
  - read-only evidence-gathering role
- `agents/reviewer.toml`
  - findings-first review role
- `agents/docs-researcher.toml`
  - primary-doc verification role

## How To Use

Use these files as merge inputs, not as a blind copy-over:

1. Compare your current `~/.codex/config.toml` against `config.reference.toml`.
2. Copy only the sections you actually want.
3. If you merge the sample `[agents.<name>]` entries into global
   `~/.codex/config.toml`, the bundled `config_file` paths assume the installer
   linked this folder to `~/.codex/bootstrap-reference/claude-code-bootstrap-commands/`.
4. If you prefer repo-local `.codex/config.toml`, rewrite those `config_file`
   paths so they resolve relative to that repository.
5. Keep your own auth, MCP credentials, and project settings intact.

## Why This Exists

Codex can mimic a meaningful subset of ECC:

- multi-agent roles
- research-first execution
- explicit review gates
- durable repo-state workflows

What it does not mimic directly:

- Claude slash commands
- Claude plugin hooks
- ECC hook-based enforcement
